# shops/views.py
from rest_framework import viewsets, status, views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, BasePermission
from .models import Shop, ActivityLog
from .serializers import ShopSerializer, ActivityLogSerializer
from accounts.permissions import IsAgent, IsAdminOrDeveloper 
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
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
        # 1. Get the old instance BEFORE saving
        instance = self.get_object()
        
        # 2. Track changes
        changes = {}
        # Compare specific fields you care about
        fields_to_check = ['name', 'phone_number', 'address', 'state', 'is_active', 'description']
        
        for field in fields_to_check:
            old_val = getattr(instance, field)
            new_val = serializer.validated_data.get(field, old_val)
            
            # Convert to string for comparison to avoid type issues
            if str(old_val) != str(new_val):
                changes[field] = {'old': str(old_val), 'new': str(new_val)}

        # 3. Save the update
        updated_shop = serializer.save()

        # 4. Log only if there were changes
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
        """
        Optionally filter the queryset for agents to only show their own shops.
        Admins/Developers see all shops.
        """
        user = self.request.user
        queryset = Shop.objects.all()

        if user.is_authenticated and user.role == user.Role.AGENT:
            queryset = queryset.filter(created_by=user)

        # Order by newest first
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
