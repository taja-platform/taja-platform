# backend/shops/models.py
from django.db import models
from accounts.models import StoreOwner, Agent
from PIL import Image
from .validators import validate_image 
from cloudinary.models import CloudinaryField


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


    # System fields
    is_active = models.BooleanField(default=True)
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
    photo = CloudinaryField(
        "image",
        folder="shop_photos",
        validators=[validate_image]
    )


    def __str__(self):
        return f"Photo for {self.shop.name}"
