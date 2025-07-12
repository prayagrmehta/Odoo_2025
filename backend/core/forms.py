from django import forms
from .models import Credentials, User, Request

class CredentialsForm(forms.ModelForm):
    class Meta:
        model = Credentials
        fields = ['email', 'password', 'name']

class UserForm(forms.ModelForm):
    class Meta:
        model = User
        fields = [
            'credentials',
            'location',
            'skills_offered',
            'skills_wanted',
            'availability',
            'profile',
            'rating',
        ]

class RequestForm(forms.ModelForm):
    class Meta:
        model = Request
        fields = [
            'sender',
            'receiver',
            'skills_offered',
            'skills_required',
            'status',
        ]
