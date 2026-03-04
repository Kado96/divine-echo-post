from django.urls import path, include
from rest_framework import routers
from .viewsets import SiteSettingsViewSet, SiteSettingsCurrentView

router = routers.DefaultRouter()
router.register(r'', SiteSettingsViewSet, basename='settings')

urlpatterns = [
    path('current/', SiteSettingsCurrentView.as_view(), name='settings-current'),
    path('', include(router.urls)),
]

