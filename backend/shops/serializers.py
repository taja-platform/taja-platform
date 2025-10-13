from rest_framework import serializers
from .models import Shop, ShopPhoto


class ShopPhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShopPhoto
        fields = ["id", "photo"]
        read_only_fields = ["id"]


class ShopSerializer(serializers.ModelSerializer):
    photos = ShopPhotoSerializer(many=True, required=False)  # nested
    uploaded_photos = serializers.ListField(
        child=serializers.ImageField(allow_empty_file=False, use_url=False),
        write_only=True,
        required=False  # Make it optional
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
            "owner",
            "created_by",
            "created_by_id",
            "photos",
            "uploaded_photos",
        ]
        read_only_fields = ["id", "date_created", "date_updated", "owner", "created_by", "created_by_id"]
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get('request', None)
        
        # Check if the user is an Admin/Developer and the request is a write operation
        if request and request.user.is_authenticated:
            user = request.user
            # Assuming you have access to the user's Role enum
            if user.role in [user.Role.ADMIN, user.Role.DEVELOPER] and request.method in ['PUT', 'PATCH']:
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
        uploaded_photos_data = validated_data.pop("uploaded_photos", None)

        # Update shop details as before
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # If new photos are provided, you might want to replace them
        # (or add to them, depending on requirements)
        if uploaded_photos_data is not None:
            # This deletes old photos. If you want to keep them, remove this line.
            instance.photos.all().delete() 
            for photo_file in uploaded_photos_data:
                ShopPhoto.objects.create(shop=instance, photo=photo_file)



        return instance
