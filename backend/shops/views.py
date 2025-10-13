# shops/views.py
from rest_framework import viewsets, status, views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, BasePermission
from .models import Shop
from .serializers import ShopSerializer
from accounts.permissions import IsAgent, IsAdminOrDeveloper 
from rest_framework.parsers import MultiPartParser, FormParser

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
    parser_classes = [MultiPartParser, FormParser]

    def get_permissions(self):
        """
        Override to apply custom object-level permissions for update/delete actions.
        """
        if self.action in ['update', 'partial_update', 'destroy']:
            # Apply object-level permission for agents to restrict to their own shops
            self.permission_classes = [IsAuthenticated, IsAgentForOwnShops]
        return super().get_permissions()

    def perform_create(self, serializer):
        """
        Set the created_by field to the authenticated agent when creating a shop.
        """
        serializer.save(created_by=self.request.user)

    def get_queryset(self):
        """
        Optionally filter the queryset for agents to only show their own shops.
        Admins/Developers see all shops.
        """
        user = self.request.user
        if user.is_authenticated and user.role == user.Role.AGENT:
            return Shop.objects.filter(created_by=user)
        return Shop.objects.all()
    
class MyShopsView(views.APIView):
    """
    Retrieve all shops created by the authenticated agent.
    """
    permission_classes = [IsAuthenticated, IsAgent]

    def get(self, request, *args, **kwargs):
        # Filter shops where created_by is the authenticated agent
        shops = Shop.objects.filter(created_by=request.user)
        serializer = ShopSerializer(shops, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)