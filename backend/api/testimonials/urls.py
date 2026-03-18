from django.urls import path, include
from rest_framework.routers import SimpleRouter
from .viewsets import TestimonialViewSet

router = SimpleRouter()
router.register(r'', TestimonialViewSet, basename='testimonials')

urlpatterns = [
    path('', include(router.urls)),
]
