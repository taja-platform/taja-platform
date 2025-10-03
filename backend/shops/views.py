# shops/views.py
from rest_framework import viewsets
from .models import Shop
from .serializers import ShopSerializer
from accounts.permissions import IsAgent
from rest_framework.permissions import IsAuthenticated

class ShopViewSet(viewsets.ModelViewSet):
    queryset = Shop.objects.all()
    serializer_class = ShopSerializer
    permission_classes = [IsAuthenticated, IsAgent]

    def perform_create(self, serializer):
        # link shop to the agent creating it
        serializer.save(owner=self.request.user.storeowner_profile)
