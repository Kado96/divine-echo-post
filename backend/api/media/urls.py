from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .viewsets import MediaFileViewSet

router = DefaultRouter()
router.register(r'', MediaFileViewSet, basename='media')

urlpatterns = [
    path('', include(router.urls)),
]

admin_urlpatterns = [
    path('', include(router.urls)),
]
