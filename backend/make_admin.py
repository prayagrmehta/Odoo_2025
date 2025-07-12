#!/usr/bin/env python
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'skillswap_backend.settings')
django.setup()

from users.models import User

try:
    # Find user 'neel'
    user = User.objects.get(username='neel')
    
    # Make them admin
    user.is_staff = True
    user.is_superuser = True
    user.save()
    
    print(f"✅ Success! User '{user.username}' is now an admin!")
    print(f"   - is_staff: {user.is_staff}")
    print(f"   - is_superuser: {user.is_superuser}")
    
except User.DoesNotExist:
    print("❌ User 'neel' not found!")
    print("Available users:")
    for u in User.objects.all():
        print(f"   - {u.username} ({u.email})")
except Exception as e:
    print(f"❌ Error: {e}") 