from django.contrib import admin
from .models import User, AgentProfile, StoreOwnerProfile

# Register your models here.
admin.site.register(User)
admin.site.register(AgentProfile)
admin.site.register(StoreOwnerProfile)