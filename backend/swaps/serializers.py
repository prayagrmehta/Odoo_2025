from rest_framework import serializers
from .models import SwapRequest, Rating
from users.serializers import UserSerializer
from skills.serializers import SkillSerializer

class RatingSerializer(serializers.ModelSerializer):
    rater = UserSerializer(read_only=True)
    rated_user = UserSerializer(read_only=True)
    
    def validate_rating(self, value):
        if value is None or value < 1 or value > 5:
            raise serializers.ValidationError("Rating must be between 1 and 5")
        return value
    
    class Meta:
        model = Rating
        fields = ['id', 'swap_request', 'rater', 'rated_user', 'rating', 'comment', 'created_at']
        read_only_fields = ['swap_request', 'rater', 'rated_user', 'created_at']

class SwapRequestSerializer(serializers.ModelSerializer):
    from_user = UserSerializer(read_only=True)
    to_user = UserSerializer(read_only=True)
    skills_offered = SkillSerializer(many=True, read_only=True)
    skills_wanted = SkillSerializer(many=True, read_only=True)
    ratings = RatingSerializer(many=True, read_only=True)
    can_rate = serializers.SerializerMethodField()

    class Meta:
        model = SwapRequest
        fields = [
            'id', 'from_user', 'to_user', 'skills_offered', 'skills_wanted',
            'message', 'status', 'created_at', 'updated_at', 'ratings', 'can_rate'
        ]
        read_only_fields = ['from_user', 'status', 'created_at', 'updated_at']
    
    def get_can_rate(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        
        # Can rate if swap is completed and user hasn't rated the other person yet
        if obj.status != 'completed':
            return False
        
        user = request.user
        other_user = obj.to_user if user == obj.from_user else obj.from_user
        
        # Check if user has already rated the other person for this swap
        return not Rating.objects.filter(
            swap_request=obj,
            rater=user,
            rated_user=other_user
        ).exists()

class SwapRequestCreateSerializer(serializers.ModelSerializer):
    skills_offered = serializers.ListField(child=serializers.IntegerField(), write_only=True)
    skills_wanted = serializers.ListField(child=serializers.IntegerField(), write_only=True)
    to_user_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = SwapRequest
        fields = ['to_user_id', 'skills_offered', 'skills_wanted', 'message']

class SwapRequestUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = SwapRequest
        fields = ['status']
