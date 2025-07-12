from django.urls import path
from .views import SwapRequestsView, SwapRequestDetailView, SwapStatsView, RecentSwapsView, RatingView, AdminSwapsListView

urlpatterns = [
    path('', SwapRequestsView.as_view(), name='swap-requests'),
    path('stats/', SwapStatsView.as_view(), name='swap-stats'),
    path('recent/', RecentSwapsView.as_view(), name='recent-swaps'),
    path('admin/', AdminSwapsListView.as_view(), name='admin-swaps'),
    path('<int:swap_id>/', SwapRequestDetailView.as_view(), name='swap-request-detail'),
    path('<int:swap_id>/rate/', RatingView.as_view(), name='rate-swap'),
]
