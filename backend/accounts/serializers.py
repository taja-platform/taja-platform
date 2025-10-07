# accounts/serializers.py
from rest_framework import serializers
from .models import User, AgentProfile

# No longer needs password or explicit email validation.
# This serializer will now primarily be used for reading/displaying user data.
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "email", "role", "first_name", "last_name"]
        read_only_fields = ["id", "role"]


class AgentProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    class Meta:
        model = AgentProfile
        fields = [
            "user", "agent_id", "phone_number", "address",
            "state", "is_active", "data_created", "data_updated",
        ]
        read_only_fields = ["agent_id", "data_created", "data_updated"]


class AgentCreateSerializer(serializers.ModelSerializer):
    # This serializer remains unchanged and works correctly for creating new agents.
    phone_number = serializers.CharField(write_only=True, required=False)
    address = serializers.CharField(write_only=True, required=False)
    state = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = [ "email", "password", "first_name", "last_name", "phone_number", "address", "state"]
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        phone_number = validated_data.pop("phone_number", None)
        address = validated_data.pop("address", None)
        state = validated_data.pop("state", None)
        user = User.objects.create_user(
            email=validated_data["email"],
            password=validated_data["password"],
            first_name=validated_data.get("first_name", ""),
            last_name=validated_data.get("last_name", ""),
            role=User.Role.AGENT,
        )
        AgentProfile.objects.create(
            user=user, phone_number=phone_number, address=address, state=state,
        )
        return user


class AgentSerializer(serializers.ModelSerializer):
    """
    Serializer for UPDATING an agent. It "flattens" user fields
    to handle validation correctly.
    """
    # 'user' is for reading the nested object in the response. It's not used for input.
    user = UserSerializer(read_only=True)

    # These fields are for WRITING data to the nested user model.
    # 'source' tells DRF to get/set the value on the 'user' related object.
    first_name = serializers.CharField(source='user.first_name', required=False)
    last_name = serializers.CharField(source='user.last_name', required=False)
    email = serializers.EmailField(source='user.email', required=False)
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = AgentProfile
        fields = [
            "agent_id",
            "user", # for reading
            # for writing:
            "first_name",
            "last_name",
            "email",
            "password",
            # AgentProfile's own fields:
            "phone_number",
            "address",
            "state",
            "is_active",
        ]
    
    # This custom validation method for the 'email' field is now instance-aware.
    def validate_email(self, value):
        # On updates, self.instance refers to the AgentProfile being updated.
        if self.instance:
            user = self.instance.user
            # Check if any OTHER user has this email.
            if User.objects.filter(email=value).exclude(pk=user.pk).exists():
                raise serializers.ValidationError("A user with this email already exists.")
        return value

    def update(self, instance, validated_data):
        # `instance` is the AgentProfile object.
        # `validated_data` contains all valid incoming data.

        # 1. Isolate User Data
        # Because of `source='user. ...'`, DRF groups these fields into a nested 'user' dict.
        user_data = validated_data.pop('user', {})

        # 2. Update the User Model
        # Get the actual User object from the AgentProfile instance.
        user_instance = instance.user
        
        # Loop through the user-specific data and update the user_instance
        for attr, value in user_data.items():
            setattr(user_instance, attr, value)
        
        # Save the changes to the User model in the database.
        user_instance.save()

        # 3. Update the AgentProfile Model
        # The `user_data` has been removed from `validated_data`.
        # What remains are the fields for AgentProfile (e.g., phone_number).
        # We call the original, default `update` method to handle these.
        return super().update(instance, validated_data)
