from rest_framework import serializers
from .models import Skill, Swap, Notification

class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = '__all__'

class SwapSerializer(serializers.ModelSerializer):
    class Meta:
        model = Swap
        fields = '__all__'

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'
