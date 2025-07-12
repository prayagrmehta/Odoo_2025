from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ['username', 'email', 'first_name', 'last_name', 'is_public', 'rating', 'created_at']
    list_filter = ['is_public', 'is_staff', 'is_superuser', 'created_at']
    search_fields = ['username', 'email', 'first_name', 'last_name']
    ordering = ['-created_at']
    
    fieldsets = UserAdmin.fieldsets + (
        ('Profile Info', {
            'fields': ('photo', 'bio', 'location', 'is_public', 'rating', 'availability')
        }),
    )
    
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Profile Info', {
            'fields': ('photo', 'bio', 'location', 'is_public', 'availability')
        }),
    )
