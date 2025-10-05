from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from django.utils.translation import gettext_lazy as _



class CustomUserManager(BaseUserManager):
    """Custom user manager using email instead of username."""

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Users must have an email address")

        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)  # no username here
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("role", "developer")
        return self.create_user(email, password, **extra_fields)



class User(AbstractUser):
    username = None  # remove username
    email = models.EmailField(_("email address"), unique=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []  # no username required

    objects = CustomUserManager()
    class Role(models.TextChoices):
        DEVELOPER = "developer", "Developer"   # superuser
        ADMIN = "admin", "Admin"               # platform admin
        AGENT = "agent", "Agent"
        CALL_CENTER = "call_center", "Call Center"
        DELIVERY_PERSON = "delivery_person", "Delivery Person"
        STORE_OWNER = "store_owner", "Store Owner"

    # default role for normal users
    base_role = Role.ADMIN

    role = models.CharField(
        max_length=50, choices=Role.choices, default=base_role
    )

    def save(self, *args, **kwargs):
        # Assign Developer if superuser, otherwise default to base_role
        if not self.pk:  
            if self.is_superuser:
                self.role = self.Role.DEVELOPER
            else:
                self.role = self.base_role
        return super().save(*args, **kwargs)



# Profile Models
class AgentProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='agent_profile')
    agent_id = models.CharField(max_length=100, unique=True)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    assigned_region = models.CharField(max_length=100, blank=True, null=True, help_text="Geographical region or LGA assigned to the agent")
    is_active = models.BooleanField(default=True)
    data_created = models.DateTimeField(auto_now_add=True)
    data_updated = models.DateTimeField(auto_now=True)


    def save(self, *args, **kwargs):
        if not self.agent_id:
            last_agent = AgentProfile.objects.all().order_by('id').last()
            if last_agent:
                last_id = int(last_agent.agent_id.split('AGT')[-1])
                new_id = last_id + 1
            else:
                new_id = 1
            self.agent_id = f"AGT{new_id:04d}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Agent Profile for {self.user.username}"

class StoreOwnerProfile(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="store_owner_profile",
        limit_choices_to={"role": User.Role.STORE_OWNER},
    )
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    business_name = models.CharField(max_length=150)
    address = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.business_name} ({self.user.username})"

# Role Managers
class BaseRoleManager(BaseUserManager):
    role = None  # override in child classes

    def get_queryset(self):
        return super().get_queryset().filter(role=self.role)

    def create_user(self, email=None, password=None, **extra_fields):
        if not email:
            raise ValueError(f"{self.role.title()} must have an email address")
        extra_fields.setdefault("role", self.role)
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user



class AdminManager(BaseRoleManager):
    role = User.Role.ADMIN


class AgentManager(BaseRoleManager):
    role = User.Role.AGENT


class CallCenterManager(BaseRoleManager):
    role = User.Role.CALL_CENTER


class DeliveryPersonManager(BaseRoleManager):
    role = User.Role.DELIVERY_PERSON


class StoreOwnerManager(BaseRoleManager):
    role = User.Role.STORE_OWNER



# Proxy Models
class Admin(User):
    base_role = User.Role.ADMIN
    objects = AdminManager()

    class Meta:
        proxy = True


class Agent(User):
    base_role = User.Role.AGENT
    objects = AgentManager()

    class Meta:
        proxy = True


class CallCenter(User):
    base_role = User.Role.CALL_CENTER
    objects = CallCenterManager()

    class Meta:
        proxy = True


class DeliveryPerson(User):
    base_role = User.Role.DELIVERY_PERSON
    objects = DeliveryPersonManager()

    class Meta:
        proxy = True


class StoreOwner(User):
    base_role = User.Role.STORE_OWNER
    objects = StoreOwnerManager()

    class Meta:
        proxy = True

@receiver(post_save, sender=Agent)
def create_agent_profile(sender, instance, created, **kwargs):
    if created and instance.role == instance.Role.AGENT:
        AgentProfile.objects.create(user=instance)

@receiver(post_save, sender=StoreOwner)
def create_agent_profile(sender, instance, created, **kwargs):
    if created and instance.role == instance.Role.STORE_OWNER:
        StoreOwnerProfile.objects.create(user=instance)