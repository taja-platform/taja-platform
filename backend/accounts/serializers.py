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
    Serializer for UPDATING an agent. User fields are virtual (flat input),
    mapped manually in update() to avoid read-only nesting issues.
    """
    # 'user' is for reading the nested object in the response. It's not used for input.
    user = UserSerializer(read_only=True)

    # Virtual fields for User (flat input—no source= anymore)
    first_name = serializers.CharField(required=False, allow_blank=True)  # Validates as string
    last_name = serializers.CharField(required=False, allow_blank=True)
    email = serializers.EmailField(required=False)  # Validates as email
    password = serializers.CharField(write_only=True, required=False, allow_blank=True, style={'input_type': 'password'})
    current_password = serializers.CharField(write_only=True, required=False, style={'input_type': 'password'})  # NEW: For verification

    class Meta:
        model = AgentProfile
        fields = [
            "agent_id",
            "user",  # for reading
            # Virtual user fields (flat input):
            "first_name",
            "last_name",
            "email",
            "password",
            "current_password",  # NEW
            # AgentProfile's own fields:
            "phone_number",
            "address",
            "state",
            "is_active",
        ]
        read_only_fields = ["agent_id"]  # Removed is_active as read_only for simplicity; adjust if needed

    # Custom validation for email (now on the virtual field)
    def validate_email(self, value):
        if value:  # Only if provided
            if self.instance:
                user = self.instance.user
                if User.objects.filter(email=value).exclude(pk=user.pk).exists():
                    raise serializers.ValidationError("A user with this email already exists.")
        return value

    # NEW: Whole-object validation for password change
    def validate(self, data):
        """
        Verify current_password if password (new) is provided.
        """
        if 'password' in data:
            if 'current_password' not in data:
                raise serializers.ValidationError({"current_password": "This field is required when changing password."})
            # Verify against the actual user's stored password
            if not self.instance.user.check_password(data['current_password']):
                raise serializers.ValidationError({"current_password": "Incorrect current password."})
            # Optional: Add strength checks for new password (e.g., length)
            if len(data['password']) < 8:
                raise serializers.ValidationError({"password": "New password must be at least 8 characters."})
        # If current_password sent without new password, ignore or error (your choice)
        elif 'current_password' in data:
            raise serializers.ValidationError({"current_password": "This field is only needed when changing password."})
        return data

    def update(self, instance, validated_data):
        # Manually extract user fields from validated_data (they're now flat here!)
        user_data = {
            'first_name': validated_data.pop('first_name', None),
            'last_name': validated_data.pop('last_name', None),
            'email': validated_data.pop('email', None),
        }
        password = validated_data.pop('password', None)  # New password (if any)
        current_password = validated_data.pop('current_password', None)  # Already verified; pop to remove from profile update

        # Update the related user object
        user_instance = instance.user
        updates_made = False
        for attr, value in user_data.items():
            if value is not None:  # Only set if provided (partial update)
                setattr(user_instance, attr, value)
                updates_made = True

        # Set and hash new password if provided (validation already checked current)
        if password:
            user_instance.set_password(password)
            updates_made = True

        # Save User ONLY if we have changes (optimization)
        if updates_made:
            user_instance.save()  # Applies updates to User

        # Update the AgentProfile object with the remaining data (profile fields)
        return super().update(instance, validated_data)