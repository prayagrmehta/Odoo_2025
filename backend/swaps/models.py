from django.db import models
from django.conf import settings
from skills.models import Skill

class SwapRequest(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
        ('completed', 'Completed'),
    )
    
    from_user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='sent_swaps', on_delete=models.CASCADE)
    to_user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='received_swaps', on_delete=models.CASCADE)
    skills_offered = models.ManyToManyField(Skill, related_name='offered_in_swaps')
    skills_wanted = models.ManyToManyField(Skill, related_name='wanted_in_swaps')
    message = models.TextField(blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Swap request from {self.from_user.username} to {self.to_user.username}"

    class Meta:
        ordering = ['-created_at']

class Rating(models.Model):
    swap_request = models.ForeignKey(SwapRequest, on_delete=models.CASCADE, related_name='ratings')
    rater = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='ratings_given')
    rated_user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='ratings_received')
    rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)])  # 1-5 stars
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['swap_request', 'rater', 'rated_user']
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.rater.username} rated {self.rated_user.username} {self.rating}/5" 