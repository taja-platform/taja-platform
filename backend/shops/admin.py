from django.contrib import admin
from .models import Shop, ShopPhoto


class ShopPhotoInline(admin.TabularInline):
    model = ShopPhoto
    extra = 3   # show 3 empty slots by default
    min_num = 3 # enforce minimum 3 photos
    max_num = 5 # enforce maximum 5 photos


@admin.register(Shop)
class ShopAdmin(admin.ModelAdmin):
    list_display = ("name", "owner", "created_by", "is_active", "date_created")
    search_fields = ("name", "owner__username", "created_by__username")
    list_filter = ("is_active", "date_created")
    inlines = [ShopPhotoInline]


@admin.register(ShopPhoto)
class ShopPhotoAdmin(admin.ModelAdmin):
    list_display = ("shop", "photo")
