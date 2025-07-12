from django.urls import path
from .views import SkillsListView, OfferedSkillsView, WantedSkillsView, AdminSkillsListView

urlpatterns = [
    path('', SkillsListView.as_view(), name='skills-list'),
    path('offered/', OfferedSkillsView.as_view(), name='offered-skills'),
    path('wanted/', WantedSkillsView.as_view(), name='wanted-skills'),
    path('admin/', AdminSkillsListView.as_view(), name='admin-skills'),
]
