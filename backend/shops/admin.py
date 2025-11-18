from django.contrib import admin
from django.utils.html import mark_safe
from .models import Shop, ShopPhoto


class ShopPhotoInline(admin.TabularInline):
    model = ShopPhoto
    extra = 3
    min_num = 3 # enforce minimum 3 photos
    max_num = 5 # enforce maximum 5 photos
    # Add 'image_preview' to readonly_fields so it displays
    readonly_fields = ('image_preview',) 
    fields = ('photo', 'image_preview')

    def image_preview(self, obj):
        # Check if the object exists and has a photo
        if obj.photo:
            return mark_safe(f'<img src="{obj.photo.url}" width="150" height="150" style="object-fit: cover; border-radius: 5px;" />')
        return "No Image"

    image_preview.short_description = 'Image Preview'

@admin.register(Shop)
class ShopAdmin(admin.ModelAdmin):
    list_display = ('name', 'owner', 'created_by', 'is_active', 'date_created')
    search_fields = ('name', 'phone_number')
    list_filter = ('is_active', 'state')
    inlines = [ShopPhotoInline] # This adds the photos inside the Shop view

# Optional: If you want a separate view just for Photos
@admin.register(ShopPhoto)
class ShopPhotoAdmin(admin.ModelAdmin):
    list_display = ('shop', 'image_preview')
    readonly_fields = ('image_preview',)

    def image_preview(self, obj):
        if obj.photo:
            return mark_safe(f'<img src="{obj.photo.url}" width="100" style="border-radius: 5px;" />')
        return ""