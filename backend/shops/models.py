# backend/shops/models.py
from django.db import models
from accounts.models import StoreOwner, Agent
from PIL import Image
from .validators import validate_image 
from cloudinary_storage.storage import MediaCloudinaryStorage
from django.conf import settings


class Shop(models.Model):
    owner = models.ForeignKey(
        StoreOwner,
        on_delete=models.CASCADE,
        related_name="shops",
        null=True,
        blank=True,
    )
    created_by = models.ForeignKey(
        Agent,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="captured_shops",
    )

    name = models.CharField(max_length=200)
    phone_number = models.CharField(max_length=15, blank=True, null=True)

    # Location
    address = models.TextField(blank=True, null=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)

    state = models.CharField(max_length=100, blank=True, null=True)
    local_government_area = models.CharField(max_length=100, blank=True, null=True)
    description = models.TextField(blank=True, null=True)


    class VerificationStatus(models.TextChoices):
        PENDING = 'PENDING', 'Pending Review'
        VERIFIED = 'VERIFIED', 'Verified'
        REJECTED = 'REJECTED', 'Rejected'

    verification_status = models.CharField(
        max_length=10,
        choices=VerificationStatus.choices,
        default=VerificationStatus.PENDING
    )
    
    rejection_reason = models.TextField(blank=True, null=True)

    # System fields
    is_active = models.BooleanField(default=False)
    date_created = models.DateTimeField(auto_now_add=True)
    date_updated = models.DateTimeField(auto_now=True)



    def __str__(self):
        return f"{self.name} ({self.owner.username if self.owner else 'Unassigned'})"


class ShopPhoto(models.Model):
    shop = models.ForeignKey(
        Shop,
        on_delete=models.CASCADE,
        related_name="photos"
    )
    photo = models.ImageField(
        upload_to="shop_photos", 
        validators=[validate_image],
        storage=MediaCloudinaryStorage() # Forces Cloudinary upload
    )


    def __str__(self):
        return f"Photo for {self.shop.name}"


class ActivityLog(models.Model):
    ACTION_TYPES = (
        ('CREATE', 'Create'),
        ('UPDATE', 'Update'),
        ('DELETE', 'Delete'),
    )

    # Who did it?
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='shop_activities')
    action_type = models.CharField(max_length=10, choices=ACTION_TYPES)
    
    # Which shop? (Nullable in case shop is deleted)
    shop = models.ForeignKey(Shop, on_delete=models.SET_NULL, null=True, blank=True, related_name='logs')
    
    # Snapshot of the name (so we know what it was even if shop is deleted)
    shop_name_snapshot = models.CharField(max_length=200)
    
    # Stores details like: {"phone_number": {"old": "111", "new": "222"}}
    changes = models.JSONField(default=dict, blank=True) 
    
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.actor} {self.action_type} {self.shop_name_snapshot}"