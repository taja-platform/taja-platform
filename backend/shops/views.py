# shops/views.py
from rest_framework import viewsets, status, views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, BasePermission
from .models import Shop, ActivityLog 
from .serializers import ShopSerializer, ActivityLogSerializer
from accounts.permissions import IsAgent, IsAdminOrDeveloper 
# 1. Import JSONParser here
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

class IsAgentForOwnShops(BasePermission):
    """
    Custom permission to allow agents to edit/delete only shops they created.
    Admins/Developers can edit/delete any shop.
    """
    def has_object_permission(self, request, view, obj):
        if request.user.role in [request.user.Role.ADMIN, request.user.Role.DEVELOPER]:
            return True  
        if request.user.role == request.user.Role.AGENT:
            return obj.created_by == request.user
        return False


class ShopViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing shops.
    """
    queryset = Shop.objects.all()
    serializer_class = ShopSerializer
    permission_classes = [IsAuthenticated, IsAgent | IsAdminOrDeveloper]
    
    # 2. Add JSONParser to this list
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_permissions(self):
        if self.action in ['update', 'partial_update', 'destroy']:
            self.permission_classes = [IsAuthenticated, IsAgentForOwnShops]
        return super().get_permissions()

    # --- Helper to save log ---
    def _log_activity(self, action, shop_instance, changes=None):
        if not self.request.user.is_authenticated:
            return
            
        ActivityLog.objects.create(
            actor=self.request.user,
            action_type=action,
            shop=shop_instance,
            shop_name_snapshot=shop_instance.name,
            changes=changes or {}
        )

    def perform_create(self, serializer):
        shop = serializer.save(created_by=self.request.user)
        self._log_activity('CREATE', shop, changes={"msg": "Shop created"})

    def perform_update(self, serializer):
        instance = self.get_object()
        
        # Calculate changes for the log
        changes = {}
        fields_to_track = [
            'name', 'phone_number', 'address', 'state', 
            'local_government_area', 'description', 'is_active'
        ]
        
        for field in fields_to_track:
            # Handle cases where field might not be in validated_data (partial updates)
            if field in serializer.validated_data:
                old_val = getattr(instance, field)
                new_val = serializer.validated_data[field]
                
                if str(old_val) != str(new_val):
                    changes[field] = {'old': str(old_val), 'new': str(new_val)}

        updated_shop = serializer.save()

        if changes:
            self._log_activity('UPDATE', updated_shop, changes=changes)

    def perform_destroy(self, instance):
        self._log_activity('DELETE', instance, changes={"msg": "Shop deleted"})
        instance.delete()

    def get_queryset(self):
        user = self.request.user
        queryset = Shop.objects.all()

        if user.is_authenticated and user.role == user.Role.AGENT:
            queryset = queryset.filter(created_by=user)

        return queryset.order_by('-date_created')
    
class MyShopsView(views.APIView):
    permission_classes = [IsAuthenticated, IsAgent]

    def get(self, request, *args, **kwargs):
        shops = Shop.objects.filter(created_by=request.user).order_by('-date_created')
        serializer = ShopSerializer(shops, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

# --- NEW VIEWSET FOR LOGS ---
class ActivityLogViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Read-only endpoint for viewing history.
    """
    queryset = ActivityLog.objects.all()
    serializer_class = ActivityLogSerializer
    permission_classes = [IsAuthenticated, IsAdminOrDeveloper]

    def get_queryset(self):
        queryset = super().get_queryset()
        shop_id = self.request.query_params.get('shop_id')
        if shop_id:
            queryset = queryset.filter(shop_id=shop_id)
        return queryset