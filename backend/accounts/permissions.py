# accounts/permissions.py
from rest_framework.permissions import BasePermission

class IsAdminOrDeveloper(BasePermission):
    """
    Allows access only to Admins or Developers.
    """
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated 
            and request.user.role in [request.user.Role.ADMIN, request.user.Role.DEVELOPER]
        )


class IsAgent(BasePermission):
    """
    Allows access only to Agents.
    """
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated 
            and request.user.role == request.user.Role.AGENT
        )
