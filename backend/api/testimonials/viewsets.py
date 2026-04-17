from rest_framework import viewsets, permissions
from .models import Testimonial
from .serializers import TestimonialSerializer
from api.accounts.permissions import IsSimpleUser

class TestimonialViewSet(viewsets.ModelViewSet):
    queryset = Testimonial.objects.all()
    serializer_class = TestimonialSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [IsSimpleUser()]
