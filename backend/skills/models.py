from django.db import models
from django.conf import settings

class Skill(models.Model):
    name = models.CharField(max_length=100)
    level = models.CharField(max_length=50, blank=True, null=True)
    is_offered = models.BooleanField(default=False)
    is_wanted = models.BooleanField(default=False)
    rating = models.FloatField(default=0)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class Swap(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE)
    partner_name = models.CharField(max_length=100)
    type = models.CharField(max_length=10, choices=[('offered', 'Offered'), ('wanted', 'Wanted')])
    status = models.CharField(max_length=10, choices=[('completed', 'Completed'), ('pending', 'Pending'), ('cancelled', 'Cancelled')])
    date = models.DateField()
    rating = models.IntegerField(null=True, blank=True)

class Notification(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    message = models.CharField(max_length=255)
    type = models.CharField(max_length=50)
    time = models.CharField(max_length=50)
    read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
