from django.urls import path, include
from rest_framework.routers import SimpleRouter
from .viewsets import AnnouncementViewSet, AdminAnnouncementViewSet

router = SimpleRouter()
router.register(r'admin', AdminAnnouncementViewSet, basename='admin-announcements')
router.register(r'', AnnouncementViewSet, basename='announcements')

urlpatterns = [
    path('', include(router.urls)),
]
