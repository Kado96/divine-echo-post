from django.urls import path, include
from rest_framework.routers import SimpleRouter
from .viewsets import (
    AnnouncementViewSet, AdminAnnouncementViewSet, 
    DailyVerseViewSet, AdminDailyVerseViewSet
)

router = SimpleRouter()
router.register(r'admin/verses', AdminDailyVerseViewSet, basename='admin-daily-verses')
router.register(r'admin', AdminAnnouncementViewSet, basename='admin-announcements')
router.register(r'verses', DailyVerseViewSet, basename='daily-verses')
router.register(r'', AnnouncementViewSet, basename='announcements')

urlpatterns = [
    path('', include(router.urls)),
]
