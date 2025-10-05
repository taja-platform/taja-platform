# backend/accounts/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AgentViewSet, MeView

router = DefaultRouter()
router.register(r'agents', AgentViewSet, basename='agent')

urlpatterns = [
    path('', include(router.urls)),
    path('me/', MeView.as_view(), name='me'),
]
