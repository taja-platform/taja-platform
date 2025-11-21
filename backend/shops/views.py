# shops/views.py
from rest_framework import viewsets, status, views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, BasePermission
from .models import Shop, ActivityLog
from .serializers import ShopSerializer, ActivityLogSerializer
from accounts.permissions import IsAgent, IsAdminOrDeveloper 
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.db.models import Count, Q
from accounts.models import User
from django.utils import timezone


class IsAgentForOwnShops(BasePermission):
    """
    Custom permission to allow agents to edit/delete only shops they created.
    Admins/Developers can edit/delete any shop.
    """
    def has_object_permission(self, request, view, obj):
        if request.user.role in [request.user.Role.ADMIN, request.user.Role.DEVELOPER]:
            return True  # Admins/Developers can manage any shop
        if request.user.role == request.user.Role.AGENT:
            # Agents can only manage shops they created
            return obj.created_by == request.user
        return False


class ShopViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing shops.
    - Agents can create shops and manage (edit/delete) only their own shops.
    - Admins/Developers can manage all shops.
    """
    queryset = Shop.objects.all()
    serializer_class = ShopSerializer
    permission_classes = [IsAuthenticated, IsAgent | IsAdminOrDeveloper]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def _log_activity(self, action, shop_instance, changes=None):
        """Helper to create an activity log entry"""
        ActivityLog.objects.create(
            actor=self.request.user,
            action_type=action,
            shop=shop_instance,
            shop_name_snapshot=shop_instance.name,
            changes=changes or {}
        )


    def perform_create(self, serializer):
        """
        Set the created_by field to the authenticated agent when creating a shop.
        """
        # 1. Save the shop
        shop = serializer.save(created_by=self.request.user)
        
        # 2. Log the creation
        self._log_activity('CREATE', shop, changes={"msg": "Shop created"})

    def perform_update(self, serializer):
        instance = self.get_object()
        user = self.request.user
        
        # --- LOGIC START ---
        
        # Case A: Admin/Developer Updating
        if user.role in [user.Role.ADMIN, user.Role.DEVELOPER]:
            # If Admin is rejecting, force is_active=False
            new_status = serializer.validated_data.get('verification_status')
            if new_status == Shop.VerificationStatus.REJECTED:
                 serializer.validated_data['is_active'] = False
            
            # If Admin is verifying, force is_active=True
            elif new_status == Shop.VerificationStatus.VERIFIED:
                 serializer.validated_data['is_active'] = True
                 # Clear rejection reason if verified
                 serializer.validated_data['rejection_reason'] = ""

        # Case B: Agent Updating a Rejected Shop
        elif user.role == user.Role.AGENT:
            # If the shop was previously REJECTED, reset it to PENDING
            if instance.verification_status == Shop.VerificationStatus.REJECTED:
                serializer.validated_data['verification_status'] = Shop.VerificationStatus.PENDING
                serializer.validated_data['rejection_reason'] = "" # Clear the old reason
                # Note: is_active stays False until Admin reviews again

        # --- LOGIC END ---

        # Calculate changes for logs
        changes = {}
        fields_to_track = [
            'name', 'phone_number', 'address', 'state', 
            'local_government_area', 'description', 'is_active',
            'verification_status', 'rejection_reason' # Added these fields
        ]
        
        for field in fields_to_track:
            if field in serializer.validated_data:
                old_val = getattr(instance, field)
                new_val = serializer.validated_data[field]
                if str(old_val) != str(new_val):
                    changes[field] = {'old': str(old_val), 'new': str(new_val)}

        updated_shop = serializer.save()

        if changes:
            self._log_activity('UPDATE', updated_shop, changes=changes)


    def perform_destroy(self, instance):
        # Log before deletion so we have the ID
        self._log_activity('DELETE', instance, changes={"msg": "Shop deleted"})
        instance.delete()

    def get_permissions(self):
        """
        Override to apply custom object-level permissions for update/delete actions.
        """
        if self.action in ['update', 'partial_update', 'destroy']:
            # Apply object-level permission for agents to restrict to their own shops
            self.permission_classes = [IsAuthenticated, IsAgentForOwnShops]
        return super().get_permissions()

    def get_queryset(self):
        user = self.request.user
        queryset = Shop.objects.all()

        if user.is_authenticated and user.role == user.Role.AGENT:
            queryset = queryset.filter(created_by=user)
            
        # Optional: Filter by status via query params (e.g. /shops/?status=PENDING)
        status_param = self.request.query_params.get('verification_status')
        if status_param:
             queryset = queryset.filter(verification_status=status_param)

        return queryset.order_by('-date_created')
    
class MyShopsView(views.APIView):
    """
    Retrieve all shops created by the authenticated agent.
    """
    permission_classes = [IsAuthenticated, IsAgent]

    def get(self, request, *args, **kwargs):
        shops = Shop.objects.filter(created_by=request.user).order_by('-date_created')
        serializer = ShopSerializer(shops, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class ActivityLogViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Read-only endpoint for Admins to view history.
    """
    queryset = ActivityLog.objects.all()
    serializer_class = ActivityLogSerializer
    permission_classes = [IsAuthenticated, IsAdminOrDeveloper] # Only Admins see logs

    def get_queryset(self):
        queryset = super().get_queryset()
        shop_id = self.request.query_params.get('shop_id')
        agent_id = self.request.query_params.get('agent_id')

        if shop_id:
            queryset = queryset.filter(shop_id=shop_id)
        if agent_id:
             # Assuming Agent model is linked to User via OneToOne or similar, 
             # you might need to filter by actor__agent__agent_id or similar depending on your User setup.
             # For now, let's filter by the User ID associated with the agent
             queryset = queryset.filter(actor__id=agent_id) 
        
        return queryset
    

class DashboardStatsView(views.APIView):
    permission_classes = [IsAuthenticated, IsAdminOrDeveloper] 

    def get(self, request, *args, **kwargs):
        today = timezone.now().date()
        
        # --- 1. Global Shop Statistics ---
        shop_stats = Shop.objects.aggregate(
            total_shops=Count('id'),
            active_shops=Count('id', filter=Q(is_active=True)), # <--- NEW LINE
            pending_reviews=Count('id', filter=Q(verification_status=Shop.VerificationStatus.PENDING)),
            rejected_reviews=Count('id', filter=Q(verification_status=Shop.VerificationStatus.REJECTED)),
            verified_shops=Count('id', filter=Q(verification_status=Shop.VerificationStatus.VERIFIED)),
            captured_by_agents=Count('id', filter=Q(created_by__isnull=False)),
        )

        # --- 2. Agent Statistics ---
        total_agents = User.objects.filter(role=User.Role.AGENT).count()
        shops_captured_today_global = Shop.objects.filter(date_created__date=today).count()

        # --- 3. Agent Performance (Optional) ---
        agent_stats = None
        target_agent_id = request.query_params.get('agent_id')
        
        if target_agent_id:
            agent_stats = self._get_agent_stats(target_agent_id, today)
        elif request.user.role == User.Role.AGENT:
            agent_stats = self._get_agent_stats(request.user.id, today)

        data = {
            "global_overview": {
                "total_shops": shop_stats['total_shops'],
                "active_shops": shop_stats['active_shops'], 
                "total_agents": total_agents,
                "pending_reviews": shop_stats['pending_reviews'],
                "rejected_reviews": shop_stats['rejected_reviews'],
                "verified_shops": shop_stats['verified_shops'],
                "total_captured_by_agents": shop_stats['captured_by_agents'],
                "shops_captured_today": shops_captured_today_global,
            },
            "agent_performance": agent_stats
        }

        return Response(data, status=status.HTTP_200_OK)

    def _get_agent_stats(self, user_id, today):
        """Helper to aggregate stats for a single agent"""
        return Shop.objects.filter(created_by_id=user_id).aggregate(
            total_captured=Count('id'),
            captured_today=Count('id', filter=Q(date_created__date=today)),
            pending=Count('id', filter=Q(verification_status=Shop.VerificationStatus.PENDING)),
            rejected=Count('id', filter=Q(verification_status=Shop.VerificationStatus.REJECTED))
        )
