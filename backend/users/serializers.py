from rest_framework import serializers
from .models import User, UserProfile, Notification
from skills.serializers import SkillSerializer
from skills.models import Skill

class UserSerializer(serializers.ModelSerializer):
    skills_offered = SkillSerializer(many=True, read_only=True)
    skills_wanted = SkillSerializer(many=True, read_only=True)
    name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'name',
            'photo', 'bio', 'location', 'is_public', 'rating',
            'skills_offered', 'skills_wanted', 'availability',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'rating']
    
    def get_name(self, obj):
        if obj.first_name and obj.last_name:
            return f"{obj.first_name} {obj.last_name}"
        elif obj.first_name:
            return obj.first_name
        elif obj.last_name:
            return obj.last_name
        else:
            return obj.username

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'password_confirm',
            'first_name', 'last_name', 'bio', 'location'
        ]
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        return user

class UserProfileUpdateSerializer(serializers.ModelSerializer):
    skills_offered_ids = serializers.ListField(child=serializers.IntegerField(), write_only=True, required=False)
    skills_wanted_ids = serializers.ListField(child=serializers.IntegerField(), write_only=True, required=False)
    
    class Meta:
        model = User
        fields = [
            'first_name', 'last_name', 'photo', 'bio', 'location',
            'is_public', 'availability', 'skills_offered_ids', 'skills_wanted_ids'
        ]
    
    def update(self, instance, validated_data):
        skills_offered_ids = validated_data.pop('skills_offered_ids', None)
        skills_wanted_ids = validated_data.pop('skills_wanted_ids', None)
        
        # Update user fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update skills relationships
        if skills_offered_ids is not None:
            from skills.models import Skill
            instance.skills_offered.set(Skill.objects.filter(id__in=skills_offered_ids))
        
        if skills_wanted_ids is not None:
            from skills.models import Skill
            instance.skills_wanted.set(Skill.objects.filter(id__in=skills_wanted_ids))
        
        return instance

class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = UserProfile
        fields = [
            'id', 'user', 'bio', 'location', 'availability',
            'skills_offered', 'skills_wanted', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

class UserSkillsOfferedSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ['id', 'name', 'description']
    
    def to_representation(self, instance):
        return {
            'id': instance.id,
            'name': instance.name,
            'level': 'Intermediate',  # This could be stored in a separate model
            'description': instance.description or '',
            'rating': 4.5  # This could come from a rating system
        }

class UserSkillsWantedSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ['id', 'name', 'description']
    
    def to_representation(self, instance):
        return {
            'id': instance.id,
            'name': instance.name,
            'level': 'Beginner',  # This could be stored in a separate model
            'priority': 'Medium',  # This could be stored in a separate model
            'description': instance.description or ''
        }

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'message', 'read', 'created_at']
        read_only_fields = ['id', 'created_at']