from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Credentials, User, Request
from rest_framework import status
import jwt
from django.conf import settings
from datetime import datetime, timedelta
from django.db import models


@api_view(['POST'])
def signup(request):
    email = request.data.get('email')
    password = request.data.get('password')
    name = request.data.get('name')
    if not email or not password or not name:
        return Response({'error': 'Missing fields'}, status=status.HTTP_400_BAD_REQUEST)
    if Credentials.objects.filter(email=email).exists():
        return Response({'error': 'Email already exists'}, status=status.HTTP_400_BAD_REQUEST)
    cred = Credentials.objects.create(email=email, password=password, name=name)
    return Response({'message': 'Signup successful', 'user_id': cred.id}, status=status.HTTP_201_CREATED)

@api_view(['POST'])
def login(request):
    email = request.data.get('email')
    password = request.data.get('password')
    if not email or not password:
        return Response({'error': 'Missing fields'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        cred = Credentials.objects.get(email=email, password=password)
        # Generate JWT token
        payload = {
            'user_id': cred.id,
            'email': cred.email,
            'exp': datetime.utcnow() + timedelta(hours=24),
            'iat': datetime.utcnow(),
        }
        token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
        return Response({'message': 'Login successful', 'token': token})
    except Credentials.DoesNotExist:
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
def valid_user(request):
    token = request.data.get('token')
    if not token:
        return Response({'error': 'Token required'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        return Response({'valid': True, 'user_id': payload['user_id'], 'email': payload['email']})
    except jwt.ExpiredSignatureError:
        return Response({'valid': False, 'error': 'Token expired'}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.InvalidTokenError:
        return Response({'valid': False, 'error': 'Invalid token'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
def create_request(request):
    sender_id = request.data.get('sender_id')
    receiver_id = request.data.get('receiver_id')
    skills_offered = request.data.get('skills_offered', [])
    skills_required = request.data.get('skills_required', [])
    status_value = request.data.get('status', 'pending')

    # Validate sender and receiver
    try:
        sender = User.objects.get(id=sender_id)
    except User.DoesNotExist:
        return Response({'error': 'Sender does not exist'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        receiver = User.objects.get(id=receiver_id)
    except User.DoesNotExist:
        return Response({'error': 'Receiver does not exist'}, status=status.HTTP_400_BAD_REQUEST)

    # Validate skills_offered are in sender's skills_offered
    if not all(skill in sender.skills_offered for skill in skills_offered):
        return Response({'error': 'Invalid skills_offered for sender'}, status=status.HTTP_400_BAD_REQUEST)

    # Validate skills_required are in receiver's skills_wanted
    if not all(skill in receiver.skills_wanted for skill in skills_required):
        return Response({'error': 'Invalid skills_required for receiver'}, status=status.HTTP_400_BAD_REQUEST)

    # Validate status
    valid_statuses = [choice[0] if isinstance(choice, tuple) else choice for choice in Request.STATUS_CHOICES]
    if status_value not in valid_statuses:
        return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)

    req = Request.objects.create(
        sender=sender,
        receiver=receiver,
        skills_offered=skills_offered,
        skills_required=skills_required,
        status=status_value
    )
    return Response({'message': 'Request created', 'request_id': req.id}, status=status.HTTP_201_CREATED)

@api_view(['GET'])
def public_users(request):
    users = User.objects.filter(profile__iexact='public')
    data = []
    for user in users:
        data.append({
            'name': user.credentials.name,
            'location': user.location,
            'skills_offered': user.skills_offered,
            'skills_wanted': user.skills_wanted,
            'availability': user.availability,
            'rating': user.rating,
        })
    return Response(data)

@api_view(['GET'])
def pending_requests(request):
    token = request.headers.get('Authorization')
    if not token:
        return Response({'error': 'Authorization token required'}, status=status.HTTP_401_UNAUTHORIZED)
    try:
        if token.startswith('Bearer '):
            token = token.split(' ')[1]
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        receiver_id = payload.get('user_id')
    except jwt.ExpiredSignatureError:
        return Response({'error': 'Token expired'}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.InvalidTokenError:
        return Response({'error': 'Invalid token'}, status=status.HTTP_401_UNAUTHORIZED)

    try:
        receiver = User.objects.get(id=receiver_id)
    except User.DoesNotExist:
        return Response({'error': 'Receiver does not exist'}, status=status.HTTP_400_BAD_REQUEST)

    requests = Request.objects.filter(receiver=receiver, status='pending')
    data = []
    for req in requests:
        data.append({
            'id': req.id,
            'sender': req.sender.credentials.name,
            'skills_offered': req.skills_offered,
            'skills_required': req.skills_required,
            'status': req.status,
        })
    return Response(data)

@api_view(['GET'])
def handled_requests(request):
    token = request.headers.get('Authorization')
    if not token:
        return Response({'error': 'Authorization token required'}, status=status.HTTP_401_UNAUTHORIZED)
    try:
        if token.startswith('Bearer '):
            token = token.split(' ')[1]
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        user_id = payload.get('user_id')
    except jwt.ExpiredSignatureError:
        return Response({'error': 'Token expired'}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.InvalidTokenError:
        return Response({'error': 'Invalid token'}, status=status.HTTP_401_UNAUTHORIZED)

    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'error': 'User does not exist'}, status=status.HTTP_400_BAD_REQUEST)

    requests = Request.objects.filter(
        models.Q(sender=user) | models.Q(receiver=user),
        status__in=['accepted', 'rejected']
    )
    data = []
    for req in requests:
        data.append({
            'id': req.id,
            'sender': req.sender.credentials.name,
            'receiver': req.receiver.credentials.name,
            'skills_offered': req.skills_offered,
            'skills_required': req.skills_required,
            'status': req.status,
        })
    return Response(data)

@api_view(['GET'])
def pending_sent_requests(request):
    token = request.headers.get('Authorization')
    if not token:
        return Response({'error': 'Authorization token required'}, status=status.HTTP_401_UNAUTHORIZED)
    try:
        if token.startswith('Bearer '):
            token = token.split(' ')[1]
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        sender_id = payload.get('user_id')
    except jwt.ExpiredSignatureError:
        return Response({'error': 'Token expired'}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.InvalidTokenError:
        return Response({'error': 'Invalid token'}, status=status.HTTP_401_UNAUTHORIZED)

    try:
        sender = User.objects.get(id=sender_id)
    except User.DoesNotExist:
        return Response({'error': 'Sender does not exist'}, status=status.HTTP_400_BAD_REQUEST)

    requests = Request.objects.filter(sender=sender, status='pending')
    data = []
    for req in requests:
        data.append({
            'id': req.id,
            'receiver': req.receiver.credentials.name,
            'skills_offered': req.skills_offered,
            'skills_required': req.skills_required,
            'status': req.status,
        })
    return Response(data)

@api_view(['DELETE'])
def delete_pending_request(request, request_id):
    token = request.headers.get('Authorization')
    if not token:
        return Response({'error': 'Authorization token required'}, status=status.HTTP_401_UNAUTHORIZED)
    try:
        if token.startswith('Bearer '):
            token = token.split(' ')[1]
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        sender_id = payload.get('user_id')
    except jwt.ExpiredSignatureError:
        return Response({'error': 'Token expired'}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.InvalidTokenError:
        return Response({'error': 'Invalid token'}, status=status.HTTP_401_UNAUTHORIZED)

    try:
        req = Request.objects.get(id=request_id, sender__id=sender_id, status='pending')
    except Request.DoesNotExist:
        return Response({'error': 'Request not found or not allowed'}, status=status.HTTP_404_NOT_FOUND)

    req.delete()
    return Response({'message': 'Request deleted successfully'}, status=status.HTTP_200_OK)

@api_view(['PATCH'])
def update_profile(request):
    token = request.headers.get('Authorization')
    if not token:
        return Response({'error': 'Authorization token required'}, status=status.HTTP_401_UNAUTHORIZED)
    try:
        if token.startswith('Bearer '):
            token = token.split(' ')[1]
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        user_id = payload.get('user_id')
    except jwt.ExpiredSignatureError:
        return Response({'error': 'Token expired'}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.InvalidTokenError:
        return Response({'error': 'Invalid token'}, status=status.HTTP_401_UNAUTHORIZED)

    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'error': 'User does not exist'}, status=status.HTTP_400_BAD_REQUEST)

    # Update fields if provided
    profile = request.data.get('profile')
    availability = request.data.get('availability')
    location = request.data.get('location')
    skills_offered = request.data.get('skills_offered')
    skills_wanted = request.data.get('skills_wanted')

    if profile is not None:
        user.profile = profile
    if availability is not None:
        user.availability = availability
    if location is not None:
        user.location = location
    if skills_offered is not None:
        user.skills_offered = skills_offered
    if skills_wanted is not None:
        user.skills_wanted = skills_wanted

    user.save()
    return Response({'message': 'Profile updated successfully'}, status=status.HTTP_200_OK)

@api_view(['GET'])
def view_profile(request):
    token = request.headers.get('Authorization')
    if not token:
        return Response({'error': 'Authorization token required'}, status=status.HTTP_401_UNAUTHORIZED)
    try:
        if token.startswith('Bearer '):
            token = token.split(' ')[1]
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        user_id = payload.get('user_id')
    except jwt.ExpiredSignatureError:
        return Response({'error': 'Token expired'}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.InvalidTokenError:
        return Response({'error': 'Invalid token'}, status=status.HTTP_401_UNAUTHORIZED)

    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'error': 'User does not exist'}, status=status.HTTP_400_BAD_REQUEST)

    data = {
        'name': user.credentials.name,
        'location': user.location,
        'skills_offered': user.skills_offered,
        'skills_wanted': user.skills_wanted,
        'availability': user.availability,
        'profile': user.profile,
        'rating': user.rating,
    }
    return Response(data)

@api_view(['GET'])
def view_others_profile(request, username):
    try:
        user = User.objects.get(credentials__name=username)
    except User.DoesNotExist:
        return Response({'error': 'User does not exist'}, status=status.HTTP_404_NOT_FOUND)

    if user.profile.lower() != 'public':
        return Response({'error': 'Profile is private'}, status=status.HTTP_403_FORBIDDEN)

    data = {
        'name': user.credentials.name,
        'location': user.location,
        'skills_offered': user.skills_offered,
        'skills_wanted': user.skills_wanted,
        'availability': user.availability,
        'rating': user.rating,
    }
    return Response(data)

# Create your views here.
