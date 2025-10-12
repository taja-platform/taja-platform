# shops/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ShopViewSet, MyShopsView

router = DefaultRouter()
router.register("shops", ShopViewSet, basename="shops")

urlpatterns = [
    path("", include(router.urls)),
    path("my-shops/", MyShopsView.as_view(), name="my-shops"),
]
