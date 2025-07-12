from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from django.db.models import Q
from .models import Skill
from .serializers import SkillSerializer

class SkillsListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        search = request.query_params.get('name', '')
        if search:
            skills = Skill.objects.filter(name__icontains=search)
        else:
            skills = Skill.objects.all()
        return Response(SkillSerializer(skills, many=True).data)

    def post(self, request):
        serializer = SkillSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

class OfferedSkillsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Get skills that are offered by any user
        skills = Skill.objects.filter(is_offered=True)
        return Response(SkillSerializer(skills, many=True).data)

class WantedSkillsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Get skills that are wanted by any user
        skills = Skill.objects.filter(is_wanted=True)
        return Response(SkillSerializer(skills, many=True).data)

class AdminSkillsListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        search = request.query_params.get('search', '')
        skills = Skill.objects.all()
        if search:
            skills = skills.filter(
                Q(name__icontains=search) |
                Q(description__icontains=search)
            )
        return Response(SkillSerializer(skills, many=True).data)

    def delete(self, request):
        skill_id = request.data.get('id')
        if not skill_id:
            return Response({'error': 'Skill id required'}, status=400)
        try:
            skill = Skill.objects.get(id=skill_id)
            skill.delete()
            return Response({'message': 'Skill deleted'}, status=200)
        except Skill.DoesNotExist:
            return Response({'error': 'Skill not found'}, status=404)
