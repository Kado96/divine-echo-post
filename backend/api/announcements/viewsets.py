from rest_framework import viewsets, permissions
from .models import Announcement
from .serializers import AnnouncementSerializer
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
