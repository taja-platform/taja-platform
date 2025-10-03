# accounts/serializers.py
from rest_framework import serializers
from .models import User, AgentProfile


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "role", "first_name", "last_name"]
        read_only_fields = ["id", "role"]


class AgentProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = AgentProfile
        fields = [
            "user",
            "agent_id",
            "phone_number",
            "address",
            "assigned_region",
            "is_active",
            "data_created",
            "data_updated",
        ]
        read_only_fields = ["agent_id", "data_created", "data_updated"]
        
class AgentCreateSerializer(serializers.ModelSerializer):
    phone_number = serializers.CharField(write_only=True, required=False)
    address = serializers.CharField(write_only=True, required=False)
    assigned_region = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ["username", "email", "password", "first_name", "last_name",
                  "phone_number", "address", "assigned_region"]

        extra_kwargs = {
            "password": {"write_only": True},
        }

    def create(self, validated_data):
        phone_number = validated_data.pop("phone_number", None)
        address = validated_data.pop("address", None)
        assigned_region = validated_data.pop("assigned_region", None)

        # Create user as agent
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
            first_name=validated_data.get("first_name", ""),
            last_name=validated_data.get("last_name", ""),
            role=User.Role.AGENT,
        )

        # Create profile
        AgentProfile.objects.create(
            user=user,
            phone_number=phone_number,
            address=address,
            assigned_region=assigned_region,
        )

        return user
