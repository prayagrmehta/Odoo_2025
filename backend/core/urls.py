from django.urls import path
from .views import (
    login,
    signup,
    valid_user,
    create_request,
    public_users,
    pending_requests,
    handled_requests,
    pending_sent_requests,
    delete_pending_request,
    update_profile,
    view_profile,
    view_others_profile,
)

urlpatterns = [
    path('login/', login, name='login'),
    path('signup/', signup, name='signup'),
    path('valid_user/', valid_user, name='valid_user'),
    path('create_request/', create_request, name='create_request'),
    path('public_users/', public_users, name='public_users'),
    path('pending_requests/', pending_requests, name='pending_requests'),
    path('handled_requests/', handled_requests, name='handled_requests'),
    path('pending_sent_requests/', pending_sent_requests, name='pending_sent_requests'),
    path('delete_pending_request/<int:request_id>/', delete_pending_request, name='delete_pending_request'),
    path('update_profile/', update_profile, name='update_profile'),
    path('view_profile/', view_profile, name='view_profile'),
    path('view_others_profile/<str:username>/', view_others_profile, name='view_others_profile'),
]
