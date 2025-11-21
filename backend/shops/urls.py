# shops/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ShopViewSet, MyShopsView, ActivityLogViewSet, DashboardStatsView

router = DefaultRouter()
router.register("logs", ActivityLogViewSet, basename="activity-logs")
router.register("", ShopViewSet, basename="shops")

urlpatterns = [
    path("stats/", DashboardStatsView.as_view(), name="dashboard-stats"),
    path("my-shops/", MyShopsView.as_view(), name="my-shops"),
    path("", include(router.urls)),
]
