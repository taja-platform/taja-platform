from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .permissions import IsAdminOrDeveloper
from .models import User, AgentProfile
from .serializers import AgentProfileSerializer, AgentCreateSerializer, UserSerializer
from rest_framework import generics, permissions

class AgentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Agents.
    Only Admins/Developers can access.
    """
    queryset = User.objects.filter(role=User.Role.AGENT)
    serializer_class = AgentProfileSerializer
    permission_classes = [IsAuthenticated, IsAdminOrDeveloper]

    def get_serializer_class(self):
        """
        Use different serializer for create vs. retrieve/list
        """
        if self.action in ["create"]:
            return AgentCreateSerializer
        return AgentProfileSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        profile = AgentProfile.objects.get(user=user)
        profile_data = AgentProfileSerializer(profile).data
        return Response(profile_data, status=status.HTTP_201_CREATED)




class MeView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
