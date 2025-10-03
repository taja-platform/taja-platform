from rest_framework import serializers
from .models import Shop, ShopPhoto


class ShopPhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShopPhoto
        fields = ["id", "photo"]
        read_only_fields = ["id"]


class ShopSerializer(serializers.ModelSerializer):
    photos = ShopPhotoSerializer(many=True, required=False)  # nested
    owner = serializers.StringRelatedField(read_only=True)   # show owner username
    created_by = serializers.StringRelatedField(read_only=True)  # show agent username

    class Meta:
        model = Shop
        fields = [
            "id",
            "name",
            "phone_number",
            "address",
            "latitude",
            "longitude",
            "is_active",
            "date_created",
            "date_updated",
            "owner",
            "created_by",
            "photos",
        ]
        read_only_fields = ["id", "date_created", "date_updated", "owner", "created_by"]

    def create(self, validated_data):
        # Extract nested photos if present
        photos_data = validated_data.pop("photos", [])

        shop = Shop.objects.create(**validated_data)

        for photo_data in photos_data:
            ShopPhoto.objects.create(shop=shop, **photo_data)

        return shop

    def update(self, instance, validated_data):
        photos_data = validated_data.pop("photos", None)

        # Update shop details
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # If photos provided, replace them
        if photos_data is not None:
            instance.photos.all().delete()
            for photo_data in photos_data:
                ShopPhoto.objects.create(shop=instance, **photo_data)

        return instance
