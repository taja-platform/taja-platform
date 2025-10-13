# shops/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ShopViewSet, MyShopsView

router = DefaultRouter()
router.register("", ShopViewSet, basename="shops")

urlpatterns = [
    path("my-shops/", MyShopsView.as_view(), name="my-shops"),
    path("", include(router.urls)),
]
