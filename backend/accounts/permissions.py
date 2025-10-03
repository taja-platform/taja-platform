from rest_framework.permissions import BasePermission

class IsAdminOrDeveloper(BasePermission):
    """
    Custom permission to only allow Admins or Developers to perform certain actions.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.role in [request.user.Role.ADMIN, request.user.Role.DEVELOPER]
        )
