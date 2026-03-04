from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .viewsets import TestimonialViewSet

router = DefaultRouter()
router.register(r'', TestimonialViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
