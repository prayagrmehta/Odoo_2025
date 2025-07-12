from django.urls import path
from .views import (
    RegisterView, 
    ProfileView, 
    UserListView, 
    NotificationListView,
    MarkNotificationsReadView,
    UserSkillsOfferedView,
    UserSkillsWantedView,
    UserStatsView,
    AdminUserListView,
    AdminUserDetailView,
    PlatformMessagesView,
    ReportsView,
    GoogleLoginView
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('google-login/', GoogleLoginView.as_view(), name='google-login'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('list/', UserListView.as_view(), name='user-list'),
    path('notifications/', NotificationListView.as_view(), name='notifications'),
    path('notifications/mark-read/', MarkNotificationsReadView.as_view(), name='mark-notifications-read'),
    path('skills/offered/', UserSkillsOfferedView.as_view(), name='skills-offered'),
    path('skills/wanted/', UserSkillsWantedView.as_view(), name='skills-wanted'),
    path('stats/', UserStatsView.as_view(), name='user-stats'),
    # Admin endpoints
    path('admin/users/', AdminUserListView.as_view(), name='admin-user-list'),
    path('admin/users/<int:user_id>/', AdminUserDetailView.as_view(), name='admin-user-detail'),
    path('admin/messages/', PlatformMessagesView.as_view(), name='platform-messages'),
    path('admin/reports/', ReportsView.as_view(), name='reports'),
]
