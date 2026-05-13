from rest_framework import viewsets, permissions
from .models import Announcement, DailyVerse
from .serializers import AnnouncementSerializer, DailyVerseSerializer
from api.accounts.permissions import IsTeamMember

class AnnouncementViewSet(viewsets.ModelViewSet):
    queryset = Announcement.objects.filter(is_active=True)
    serializer_class = AnnouncementSerializer
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

class AdminAnnouncementViewSet(viewsets.ModelViewSet):
    queryset = Announcement.objects.all()
    serializer_class = AnnouncementSerializer
    permission_classes = [IsTeamMember]

class DailyVerseViewSet(viewsets.ReadOnlyModelViewSet):
    """Accès public au verset du jour le plus récent"""
    queryset = DailyVerse.objects.filter(is_active=True).order_by('-published_at')[:1]
    serializer_class = DailyVerseSerializer
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

class AdminDailyVerseViewSet(viewsets.ModelViewSet):
    """Gestion admin des versets"""
    queryset = DailyVerse.objects.all()
    serializer_class = DailyVerseSerializer
    permission_classes = [IsTeamMember]
