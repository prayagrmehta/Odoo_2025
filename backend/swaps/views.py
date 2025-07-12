from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework import status
from .models import SwapRequest, Rating
from .serializers import SwapRequestSerializer, SwapRequestCreateSerializer, SwapRequestUpdateSerializer, RatingSerializer
from django.db.models import Avg
from users.models import User, Notification
from skills.models import Skill
from django.db import models

class SwapRequestsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Get both sent and received swap requests
        sent_swaps = SwapRequest.objects.filter(from_user=request.user)
        received_swaps = SwapRequest.objects.filter(to_user=request.user)
        
        # Combine and serialize
        all_swaps = list(sent_swaps) + list(received_swaps)
        return Response(SwapRequestSerializer(all_swaps, many=True, context={'request': request}).data)

    def post(self, request):
        serializer = SwapRequestCreateSerializer(data=request.data)
        if serializer.is_valid():
            # Get the to_user
            to_user_id = serializer.validated_data['to_user_id']
            
            # Prevent users from sending swap requests to themselves
            if to_user_id == request.user.id:
                return Response({'error': 'You cannot send a swap request to yourself'}, status=status.HTTP_400_BAD_REQUEST)
            
            try:
                to_user = User.objects.get(id=to_user_id)
            except User.DoesNotExist:
                return Response({'error': 'Target user not found'}, status=status.HTTP_404_NOT_FOUND)
            
            # Create the swap request
            swap_request = SwapRequest.objects.create(
                from_user=request.user,
                to_user=to_user,
                message=serializer.validated_data.get('message', '')
            )
            
            # Add skills relationships
            if 'skills_offered' in serializer.validated_data:
                skills_offered = Skill.objects.filter(id__in=serializer.validated_data['skills_offered'])
                swap_request.skills_offered.set(skills_offered)
            
            if 'skills_wanted' in serializer.validated_data:
                skills_wanted = Skill.objects.filter(id__in=serializer.validated_data['skills_wanted'])
                swap_request.skills_wanted.set(skills_wanted)
            
            # Create notification for the recipient
            Notification.objects.create(
                user=to_user,
                message=f"{request.user.first_name or request.user.username} sent you a skill swap request!"
            )
            
            return Response(SwapRequestSerializer(swap_request, context={'request': request}).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class SwapRequestDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, swap_id):
        try:
            swap_request = SwapRequest.objects.get(id=swap_id, to_user=request.user)
        except SwapRequest.DoesNotExist:
            return Response({'error': 'Swap request not found'}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = SwapRequestUpdateSerializer(swap_request, data=request.data, partial=True)
        if serializer.is_valid():
            new_status = serializer.validated_data.get('status')
            
            # Update the swap request status
            swap_request.status = new_status
            swap_request.save()
            
            # Create notification for the sender
            if new_status == 'accepted':
                message = f"{request.user.first_name or request.user.username} accepted your skill swap request!"
            elif new_status == 'rejected':
                message = f"{request.user.first_name or request.user.username} rejected your skill swap request."
            elif new_status == 'completed':
                message = f"{request.user.first_name or request.user.username} marked your skill swap as completed!"
            else:
                message = f"Your skill swap request status was updated to {new_status}."
            
            Notification.objects.create(
                user=swap_request.from_user,
                message=message
            )
            
            return Response(SwapRequestSerializer(swap_request, context={'request': request}).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class RatingView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, swap_id):
        try:
            swap_request = SwapRequest.objects.get(id=swap_id)
        except SwapRequest.DoesNotExist:
            return Response({'error': 'Swap request not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Check if user is part of this swap
        if request.user not in [swap_request.from_user, swap_request.to_user]:
            return Response({'error': 'You can only rate swaps you participated in'}, status=status.HTTP_403_FORBIDDEN)
        
        # Check if swap is completed
        if swap_request.status != 'completed':
            return Response({'error': 'You can only rate completed swaps'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Determine who to rate (the other person in the swap)
        rated_user = swap_request.to_user if request.user == swap_request.from_user else swap_request.from_user
        
        # Check if user has already rated the other person for this swap
        if Rating.objects.filter(swap_request=swap_request, rater=request.user, rated_user=rated_user).exists():
            return Response({'error': 'You have already rated this user for this swap'}, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = RatingSerializer(data=request.data)
        if serializer.is_valid():
            rating = serializer.save(
                swap_request=swap_request,
                rater=request.user,
                rated_user=rated_user
            )
            
            # Update the rated user's average rating
            avg_rating = Rating.objects.filter(rated_user=rated_user).aggregate(Avg('rating'))['rating__avg']
            rated_user.rating = round(avg_rating, 2) if avg_rating else 0.00
            rated_user.save()
            
            # Create notification for the rated user
            Notification.objects.create(
                user=rated_user,
                message=f"{request.user.first_name or request.user.username} gave you a {rating.rating}-star rating!"
            )
            
            return Response(RatingSerializer(rating).data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class SwapStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        swaps = SwapRequest.objects.filter(
            (models.Q(from_user=request.user) | models.Q(to_user=request.user))
        )
        return Response({
            "total_swaps": swaps.count(),
            "completed_swaps": swaps.filter(status='completed').count(),
            "pending_swaps": swaps.filter(status='pending').count(),
            "average_rating": request.user.rating,
        })

class RecentSwapsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        swaps = SwapRequest.objects.filter(from_user=request.user).order_by('-created_at')[:5]
        return Response(SwapRequestSerializer(swaps, many=True, context={'request': request}).data)

class AdminSwapsListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        status_filter = request.query_params.get('status', '')
        swaps = SwapRequest.objects.all()
        if status_filter:
            swaps = swaps.filter(status=status_filter)
        return Response(SwapRequestSerializer(swaps, many=True, context={'request': request}).data)
