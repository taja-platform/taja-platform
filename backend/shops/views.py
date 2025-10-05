# shops/views.py
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, BasePermission
from .models import Shop
from .serializers import ShopSerializer
from accounts.permissions import IsAgent, IsAdminOrDeveloper 



class ShopViewSet(viewsets.ModelViewSet):
    serializer_class = ShopSerializer
    
    # The queryset should be filtered to only show active shops 
    # to regular users, but all shops to Admins/Agents.
    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated:
            # Admins/Developers can see all shops (active or inactive)
            if user.role in [user.Role.ADMIN, user.Role.DEVELOPER]:
                return Shop.objects.all()
            
            # Agents can see shops they created or shops that are active
            if user.role == user.Role.AGENT:
                return Shop.objects.filter(is_active=True) | Shop.objects.filter(created_by=user)
            
            # Store Owners can only see the shops linked to their account
            if user.role == user.Role.STORE_OWNER:
                 # Assumes the user object is also a StoreOwner instance 
                 # or the StoreOwner model is directly linked to the user
                return Shop.objects.filter(owner=user)
                
        # Default: Unauthenticated users see nothing (though IsAuthenticated should catch this)
        return Shop.objects.none()


    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        user = self.request.user
        if self.action in ['list', 'retrieve']:
            # Read access: Authenticated is enough, but queryset filters what they see.
            permission_classes = [IsAuthenticated]
        
        elif self.action == 'create':
            # Only Agents can capture new shops.
            permission_classes = [IsAuthenticated, IsAgent]
            
        elif self.action in ['update', 'partial_update']:
            # Admins can update any shop. Agents can update shops they created.
            permission_classes = [IsAuthenticated, (IsAdminOrDeveloper | self.IsCreatorPermission)]
            
        elif self.action == 'destroy':
            # Only Admins/Developers can delete shops.
            permission_classes = [IsAuthenticated, IsAdminOrDeveloper]
            
        else:
            permission_classes = [IsAuthenticated] # Default safe fallback

        return [permission() for permission in permission_classes]

    def perform_create(self, serializer):
        # link shop to the agent creating it
        serializer.save(created_by=self.request.user)
        
    def perform_update(self, serializer):
        # Prevent agents from updating the 'is_active' status
        if self.request.user.role == self.request.user.Role.AGENT and 'is_active' in serializer.validated_data:
            # Only allow Admins to change activation status.
            del serializer.validated_data['is_active']
            
        serializer.save()

    class IsCreatorPermission(BasePermission):
        """
        Custom permission to only allow creators of a shop to edit it.
        """
        message = 'You must be the original agent who created this shop to edit it.'

        def has_object_permission(self, request, view, obj):
            # Write permissions are only allowed to the agent who created the shop.
            return obj.created_by == request.user