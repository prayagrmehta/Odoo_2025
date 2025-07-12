#!/usr/bin/env python
"""
Script to check and fix admin user permissions
"""
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'skillswap_backend.settings')
django.setup()

from users.models import User

def check_and_fix_admin():
    print("🔍 Checking admin users...")
    
    # List all users
    users = User.objects.all()
    print(f"\n📋 Found {users.count()} users:")
    
    for user in users:
        admin_status = "✅ Admin" if user.is_staff else "❌ Not Admin"
        print(f"  - {user.username} ({user.email}) - {admin_status}")
    
    # Check if any admin exists
    admin_users = User.objects.filter(is_staff=True)
    if admin_users.exists():
        print(f"\n✅ Found {admin_users.count()} admin user(s)")
        return True
    else:
        print("\n❌ No admin users found!")
        
        # Ask to make first user admin
        if users.exists():
            first_user = users.first()
            print(f"\n🤔 Make '{first_user.username}' an admin? (y/n): ", end="")
            response = input().lower().strip()
            
            if response == 'y':
                first_user.is_staff = True
                first_user.is_superuser = True
                first_user.save()
                print(f"✅ Made '{first_user.username}' an admin!")
                return True
            else:
                print("❌ No admin user created.")
                return False
        else:
            print("❌ No users found to make admin.")
            return False

if __name__ == "__main__":
    check_and_fix_admin() 