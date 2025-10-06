# backend/accounts/views.py
import logging # Add this import
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError # Add this import
from .permissions import IsAdminOrDeveloper
from .models import User, AgentProfile
from .serializers import AgentProfileSerializer, AgentCreateSerializer, UserSerializer, AgentSerializer
from rest_framework import generics

# Get an instance of a logger
logger = logging.getLogger(__name__)


class AgentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Agents.
    Only Admins/Developers can access.
    """
    queryset = AgentProfile.objects.select_related("user").all()
    # The serializer_class is set by get_serializer_class, but having a default is good practice
    serializer_class = AgentProfileSerializer
    lookup_field = "agent_id"
    permission_classes = [IsAuthenticated, IsAdminOrDeveloper]

    def get_serializer_class(self):
        if self.action == "create":
            return AgentCreateSerializer
        # For updates, we use the detailed AgentSerializer
        elif self.action in ["update", "partial_update"]:
            return AgentSerializer
        # For list and retrieve, we use the read-only profile serializer
        return AgentProfileSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        profile = AgentProfile.objects.get(user=user)
        profile_data = AgentProfileSerializer(profile).data
        return Response(profile_data, status=status.HTTP_201_CREATED)

    # ✅ OVERRIDE THIS METHOD TO ADD LOGGING
    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        try:
            serializer.is_valid(raise_exception=True)
        except ValidationError as e:
            # When validation fails, log the incoming data and the error details
            logger.error(f"--- VALIDATION FAILED FOR AGENT: {instance.agent_id} ---")
            logger.error(f"INCOMING DATA: {request.data}")
            logger.error(f"VALIDATION ERRORS: {e.detail}")
            logger.error("----------------------------------------------------")
            # Re-raise the exception to let DRF return the 400 response
            raise e
        
        # If valid, proceed with the update
        self.perform_update(serializer)
        return Response(serializer.data)


class MeView(generics.RetrieveUpdateAPIView):
    """
    Allows authenticated users to GET and UPDATE their own profile.
    Supports GET and PATCH requests.
    """
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        # Use AgentSerializer for agents, and UserSerializer for others.
        if self.request.user.role == self.request.user.Role.AGENT:
            return AgentSerializer 
        return UserSerializer

    def get_object(self):
        user = self.request.user
        if user.role == user.Role.AGENT:
            return user.agent_profile
        return user