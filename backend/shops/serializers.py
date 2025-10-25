from rest_framework import serializers
from .models import Shop, ShopPhoto
from accounts.models import StoreOwner # Import needed for Role check


class ShopPhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShopPhoto
        fields = ["id", "photo"]
        read_only_fields = ["id"]


class ShopSerializer(serializers.ModelSerializer):
    photos = ShopPhotoSerializer(many=True, required=False)  # nested
    
    # Field for new photo uploads
    uploaded_photos = serializers.ListField(
        child=serializers.ImageField(allow_empty_file=False, use_url=False),
        write_only=True,
        required=False
    )
    
    # NEW FIELD for managing existing photos to be deleted
    photos_to_delete_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )
    
    owner = serializers.StringRelatedField(read_only=True)   # show owner username
    created_by = serializers.StringRelatedField(read_only=True)  # show agent username

    created_by_id = serializers.ReadOnlyField(source='created_by.id')
    
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
            "state",
            "local_government_area",
            "description", # Added description here from models.py
            "owner",
            "created_by",
            "created_by_id",
            "photos",
            "uploaded_photos",
            "photos_to_delete_ids", # Include new field for write operations
        ]
        read_only_fields = ["id", "date_created", "date_updated", "owner", "created_by", "created_by_id"]
        
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Conditional read_only for is_active field based on user role
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            user = request.user
            # Assuming Role is an enum on the User model
            if user.role in [StoreOwner.Role.ADMIN, StoreOwner.Role.DEVELOPER] and request.method in ['PUT', 'PATCH']:
                # Allow Admin/Developer to update is_active status
                self.fields['is_active'].read_only = False 

    def create(self, validated_data):
        # Pop the uploaded photos data, it's not a direct Shop model field
        uploaded_photos_data = validated_data.pop("uploaded_photos", [])
        
        # Create the shop instance first
        shop = Shop.objects.create(**validated_data)

        # Create ShopPhoto objects for each uploaded file
        for photo_file in uploaded_photos_data:
            ShopPhoto.objects.create(shop=shop, photo=photo_file)

        return shop


    def update(self, instance, validated_data):
        # 1. Handle new photo uploads
        uploaded_photos_data = validated_data.pop("uploaded_photos", None)
        
        # 2. Handle photos to delete (CRITICAL CHANGE HERE)
        # Pop and delete photos specified by the frontend
        photos_to_delete_ids = validated_data.pop("photos_to_delete_ids", [])

        # Delete specified photos
        if photos_to_delete_ids:
            # Filter the shop's photos by the IDs provided and delete them
            # This ensures only photos belonging to this instance are targeted
            ShopPhoto.objects.filter(shop=instance, id__in=photos_to_delete_ids).delete()


        # 3. Update shop details as before
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # 4. Create new photos
        if uploaded_photos_data:
            for photo_file in uploaded_photos_data:
                ShopPhoto.objects.create(shop=instance, photo=photo_file)
        
        return instance