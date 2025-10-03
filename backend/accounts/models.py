from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.models import BaseUserManager


class User(AbstractUser):
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
        # if this user is being created as a superuser > role = Developer
        if not self.pk:  
            if self.is_superuser:
                self.role = self.Role.DEVELOPER
            else:
                self.role = self.base_role
        return super().save(*args, **kwargs)
    
class AgentProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='agent_profile')
    agent_id = models.CharField(max_length=100, unique=True)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    


    def __str__(self):
        return f"Agent Profile for {self.user.username}"
    
class AgentManager(BaseUserManager):
    def get_queryset(self):
        return super().get_queryset().filter(role=User.Role.AGENT)
    
class CallCenterManager(BaseUserManager):
    def get_queryset(self):
        return super().get_queryset().filter(role=User.Role.CALL_CENTER)

class DeliveryPersonManager(BaseUserManager):
    def get_queryset(self):
        return super().get_queryset().filter(role=User.Role.DELIVERY_PERSON)

class AdminManager(BaseUserManager):
    def get_queryset(self):
        return super().get_queryset().filter(role=User.Role.ADMIN)
    
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