from django.contrib import admin
from .models import Credentials, User, Request

admin.site.register(Credentials)
admin.site.register(User)
admin.site.register(Request)
