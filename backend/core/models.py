from django.db import models

# Create your models here.

class Credentials(models.Model):
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=128)
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.email

class User(models.Model):
    PROFILE_CHOICES = [
        ('Private'),
        ('Public'),
    ]
    AVAILABILITY_CHOICES = [
        ('Weekends'),
        ('Daily'),
        ('Monday'),
        ('Tuesday'),
        ('Wednesday'),
        ('Thursday'),
        ('Friday'),
        ('Saturday'),
        ('Sunday'),
        # Add more as needed
    ]

    credentials = models.ForeignKey(Credentials, on_delete=models.CASCADE, related_name='users')
    # Remove the old name field and use credentials.name instead

    location = models.CharField(max_length=255)
    skills_offered = models.JSONField(default=list)  # List of skills
    skills_wanted = models.JSONField(default=list)   # List of skills
    availability = models.CharField(max_length=50, choices=AVAILABILITY_CHOICES)
    profile = models.CharField(max_length=7, choices=PROFILE_CHOICES, default='public')
    rating = models.FloatField(default=0.0)

    def __str__(self):
        return self.credentials.name

class Request(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
    ]

    sender = models.ForeignKey('User', on_delete=models.CASCADE, related_name='sent_requests')
    receiver = models.ForeignKey('User', on_delete=models.CASCADE, related_name='received_requests')
    skills_offered = models.JSONField(default=list)
    skills_required = models.JSONField(default=list)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')

    def __str__(self):
        return f"{self.sender} -> {self.receiver} ({self.status})"
