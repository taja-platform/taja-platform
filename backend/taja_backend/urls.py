# backend/taja_backend/urls.py
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include
from rest_framework import permissions
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from accounts.views_auth import CustomTokenObtainPairView
from fancy.views import home
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

schema_view = get_schema_view(
    openapi.Info(
        title="API Documentation",
        default_version="v1",
        description="Auto generated API docs",
    ),
    public=True,
    permission_classes=[permissions.AllowAny],
)


urlpatterns = [
    path("", home, name="home"),
    path("admin/", admin.site.urls),

    # Swagger UI
    path("api/docs/", schema_view.with_ui("swagger", cache_timeout=0), name="swagger_ui"),
    path("api/redoc/", schema_view.with_ui("redoc", cache_timeout=0), name="redoc_ui"),

    path("api/accounts/", include("accounts.urls")),
    path("api/shops/", include("shops.urls")),

    # JWT authentication
    path("api/auth/login/", CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
