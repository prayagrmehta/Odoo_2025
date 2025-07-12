from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework import status
from django.contrib.auth import get_user_model, authenticate
from django.db.models import Avg, Count, Q
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Notification, UserProfile
from .serializers import (
    NotificationSerializer, 
    UserSerializer, 
    UserRegistrationSerializer,
    UserProfileSerializer,
    UserSkillsOfferedSerializer,
    UserSkillsWantedSerializer
)
from swaps.models import SwapRequest
from skills.models import Skill
from django.utils import timezone

User = get_user_model()

from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

class GoogleLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        token = request.data.get('token')
        if not token:
            return Response({'success': False, 'error': 'Token not provided'}, status=400)
        
        try:
            # Verify token
            idinfo = id_token.verify_oauth2_token(
                token, google_requests.Request(),
                "2025373519-hnh3g0684s3gbo9ma7h3m1ouqkiaies7.apps.googleusercontent.com"  # replace with actual client ID
            )
            email = idinfo['email']
            name = idinfo.get('name', '')
            picture = idinfo.get('picture', '')

            # Check if user already exists
            user, created = User.objects.get_or_create(email=email, defaults={
                'username': email.split('@')[0],
                'first_name': name.split()[0] if name else '',
                'last_name': name.split()[1] if len(name.split()) > 1 else '',
            })

            # Generate JWT
            refresh = RefreshToken.for_user(user)

            return Response({
                'success': True,
                'token': str(refresh.access_token),
                'refresh': str(refresh),
                'user': {
                    'email': user.email,
                    'name': user.get_full_name(),
                    'id': user.id,
                    'image': picture,
                }
            })

        except ValueError:
            return Response({'success': False, 'error': 'Invalid token'}, status=400)

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            
            # Automatically log the user in and return tokens
            refresh = RefreshToken.for_user(user)
            return Response({
                'message': 'User registered successfully',
                'user_id': user.id,
                'access': str(refresh.access_token),
                'refresh': str(refresh)
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Exclude the current user from the results
        users = User.objects.filter(is_active=True).exclude(id=request.user.id)
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)

class NotificationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        notifications = Notification.objects.filter(user=request.user).order_by('-created_at')[:10]
        serializer = NotificationSerializer(notifications, many=True)
        return Response(serializer.data)

class MarkNotificationsReadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Mark all notifications as read for the current user
        Notification.objects.filter(user=request.user, read=False).update(read=True)
        return Response({'message': 'Notifications marked as read'}, status=status.HTTP_200_OK)

    def patch(self, request):
        # Mark specific notification as read
        notification_id = request.data.get('notification_id')
        if notification_id:
            try:
                notification = Notification.objects.get(id=notification_id, user=request.user)
                notification.read = True
                notification.save()
                return Response({'message': 'Notification marked as read'}, status=status.HTTP_200_OK)
            except Notification.DoesNotExist:
                return Response({'error': 'Notification not found'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'error': 'notification_id is required'}, status=status.HTTP_400_BAD_REQUEST)

class UserSkillsOfferedView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        skills = request.user.skills_offered.all()
        serializer = UserSkillsOfferedSerializer(skills, many=True)
        return Response(serializer.data)

    def post(self, request):
        skill_name = request.data.get('name')
        skill_level = request.data.get('level', 'Beginner')
        skill_description = request.data.get('description', '')
        
        # Create or get the skill
        skill, created = Skill.objects.get_or_create(
            name=skill_name,
            defaults={'description': skill_description}
        )
        
        # Add to user's offered skills
        request.user.skills_offered.add(skill)
        
        return Response({
            'id': skill.id,
            'name': skill.name,
            'level': skill_level,
            'description': skill_description
        }, status=status.HTTP_201_CREATED)

class UserSkillsWantedView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        skills = request.user.skills_wanted.all()
        serializer = UserSkillsWantedSerializer(skills, many=True)
        return Response(serializer.data)

    def post(self, request):
        skill_name = request.data.get('name')
        skill_level = request.data.get('level', 'Beginner')
        skill_priority = request.data.get('priority', 'Medium')
        skill_description = request.data.get('description', '')
        
        # Create or get the skill
        skill, created = Skill.objects.get_or_create(
            name=skill_name,
            defaults={'description': skill_description}
        )
        
        # Add to user's wanted skills
        request.user.skills_wanted.add(skill)
        
        return Response({
            'id': skill.id,
            'name': skill.name,
            'level': skill_level,
            'priority': skill_priority,
            'description': skill_description
        }, status=status.HTTP_201_CREATED)

class UserStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Get user's swap statistics
        total_swaps = SwapRequest.objects.filter(
            requester=request.user
        ).count()
        
        completed_swaps = SwapRequest.objects.filter(
            requester=request.user,
            status='completed'
        ).count()
        
        pending_swaps = SwapRequest.objects.filter(
            requester=request.user,
            status='pending'
        ).count()
        
        # Calculate average rating (placeholder - you can implement rating system)
        average_rating = 4.5  # This would come from a rating model
        
        return Response({
            'total_swaps': total_swaps,
            'completed_swaps': completed_swaps,
            'pending_swaps': pending_swaps,
            'average_rating': average_rating
        })

class AdminUserListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        if not request.user.is_staff:
            return Response({'error': 'Unauthorized access'}, status=status.HTTP_403_FORBIDDEN)
        # Optional search by username/email
        search = request.GET.get('search', '')
        users = User.objects.all()
        if search:
            users = users.filter(
                Q(username__icontains=search) |
                Q(email__icontains=search) |
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search)
            )
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)

class AdminUserDetailView(APIView):
    permission_classes = [IsAdminUser]

    def patch(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)
        is_banned = request.data.get('is_banned')
        if is_banned is not None:
            user.is_active = not is_banned
            user.save()
        serializer = UserSerializer(user)
        return Response(serializer.data)

class PlatformMessagesView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request):
        """
        Send a platform-wide message to all users
        """
        title = request.data.get('title')
        message = request.data.get('message')
        
        if not title or not message:
            return Response({
                'error': 'Title and message are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            users = User.objects.filter(is_active=True)
            notifications = []
            for user in users:
                notification = Notification(
                    user=user,
                    message=message,
                    # Only include fields that exist in your Notification model
                )
                notifications.append(notification)
            Notification.objects.bulk_create(notifications)
            return Response({
                'message': f'Platform message sent to {len(users)} users successfully',
                'users_notified': len(users)
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            import traceback
            print(traceback.format_exc())
            return Response({
                'error': f'Failed to send platform message: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ReportsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        """
        Generate and return CSV reports
        """
        import csv
        import io
        from datetime import datetime
        from django.http import HttpResponse
        
        report_type = request.GET.get('type', 'users')
        
        if report_type == 'users':
            return self._generate_users_report()
        elif report_type == 'swaps':
            return self._generate_swaps_report()
        elif report_type == 'feedback':
            return self._generate_feedback_report()
        else:
            return Response({'error': 'Invalid report type'}, status=400)

    def _generate_users_report(self):
        """Generate users activity report"""
        import csv
        import io
        from django.http import HttpResponse
        from datetime import datetime
        
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="users_report_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv"'
        
        writer = csv.writer(response)
        writer.writerow([
            'User ID', 'Username', 'Email', 'First Name', 'Last Name', 
            'Date Joined', 'Last Login', 'Is Active', 'Skills Offered Count', 
            'Skills Wanted Count', 'Total Swaps', 'Completed Swaps'
        ])
        
        users = User.objects.all().prefetch_related('skills_offered', 'skills_wanted')
        
        for user in users:
            # Get swap statistics
            total_swaps = SwapRequest.objects.filter(
                Q(from_user=user) | Q(to_user=user)
            ).count()
            
            completed_swaps = SwapRequest.objects.filter(
                Q(from_user=user) | Q(to_user=user),
                status='completed'
            ).count()
            
            writer.writerow([
                user.id,
                user.username,
                user.email,
                user.first_name or '',
                user.last_name or '',
                user.date_joined.strftime('%Y-%m-%d %H:%M:%S') if user.date_joined else '',
                user.last_login.strftime('%Y-%m-%d %H:%M:%S') if user.last_login else '',
                'Yes' if user.is_active else 'No',
                user.skills_offered.count(),
                user.skills_wanted.count(),
                total_swaps,
                completed_swaps
            ])
        
        return response

    def _generate_swaps_report(self):
        """Generate swaps activity report"""
        import csv
        import io
        from django.http import HttpResponse
        from datetime import datetime
        
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="swaps_report_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv"'
        
        writer = csv.writer(response)
        writer.writerow([
            'Swap ID', 'From User', 'To User', 'Skills Offered', 'Skills Wanted',
            'Status', 'Created Date', 'Updated Date', 'Message'
        ])
        
        swaps = SwapRequest.objects.all().select_related('from_user', 'to_user').prefetch_related('skills_offered', 'skills_wanted')
        
        for swap in swaps:
            skills_offered = ', '.join([skill.name for skill in swap.skills_offered.all()])
            skills_wanted = ', '.join([skill.name for skill in swap.skills_wanted.all()])
            
            writer.writerow([
                swap.id,
                swap.from_user.username if swap.from_user else '',
                swap.to_user.username if swap.to_user else '',
                skills_offered,
                skills_wanted,
                swap.status,
                swap.created_at.strftime('%Y-%m-%d %H:%M:%S') if swap.created_at else '',
                swap.updated_at.strftime('%Y-%m-%d %H:%M:%S') if swap.updated_at else '',
                swap.message or ''
            ])
        
        return response

    def _generate_feedback_report(self):
        """Generate feedback/ratings report"""
        import csv
        import io
        from django.http import HttpResponse
        from datetime import datetime
        
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="feedback_report_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv"'
        
        writer = csv.writer(response)
        writer.writerow([
            'Rating ID', 'Swap ID', 'From User', 'To User', 'Rating', 
            'Comment', 'Created Date'
        ])
        
        # Get all ratings from swap requests
        ratings = []
        swaps = SwapRequest.objects.filter(status='completed').select_related('from_user', 'to_user')
        
        for swap in swaps:
            # This is a simplified version - you might have a separate Rating model
            # For now, we'll include completed swaps as feedback
            writer.writerow([
                f'SWAP_{swap.id}',
                swap.id,
                swap.from_user.username if swap.from_user else '',
                swap.to_user.username if swap.to_user else '',
                'Completed',  # Placeholder for actual rating
                swap.message or '',
                swap.updated_at.strftime('%Y-%m-%d %H:%M:%S') if swap.updated_at else ''
            ])
        
        return response

