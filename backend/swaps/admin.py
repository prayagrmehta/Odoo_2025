from django.contrib import admin
from .models import SwapRequest

@admin.register(SwapRequest)
class SwapRequestAdmin(admin.ModelAdmin):
    list_display = ['from_user', 'to_user', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['from_user__username', 'to_user__username', 'message']
    ordering = ['-created_at'] 