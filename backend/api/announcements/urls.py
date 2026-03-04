from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .viewsets import AnnouncementViewSet, AdminAnnouncementViewSet

router = DefaultRouter()
router.register(r'admin', AdminAnnouncementViewSet, basename='admin-announcements')
router.register(r'', AnnouncementViewSet, basename='announcements')

urlpatterns = [
    path('', include(router.urls)),
]
