from rest_framework import viewsets, parsers, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import MediaFile
from .serializers import MediaFileSerializer
from rest_framework.permissions import IsAuthenticated

class MediaFileViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing media files in the library.
    """
    queryset = MediaFile.objects.all()
    serializer_class = MediaFileSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = (parsers.MultiPartParser, parsers.FormParser)
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['file_type']
    search_fields = ['title', 'alt_text']
    ordering_fields = ['created_at', 'file_size']
    ordering = ['-created_at']

    def perform_create(self, serializer):
        serializer.save()
