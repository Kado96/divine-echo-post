from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from .models import SermonCategory, Sermon
from .serializers import (
    SermonCategorySerializer,
    SermonListSerializer,
    SermonDetailSerializer,
    AdminSermonSerializer,
)


class SermonCategoryViewSet(viewsets.ModelViewSet):
    queryset = SermonCategory.objects.all()
    serializer_class = SermonCategorySerializer
    lookup_field = "slug"

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [AllowAny()]
        return [IsAuthenticated()]


class SermonViewSet(viewsets.ReadOnlyModelViewSet):
    """API publique pour les prédications"""
    queryset = Sermon.objects.filter(is_active=True).order_by("-sermon_date")
    serializer_class = SermonListSerializer
    lookup_field = "slug"
    permission_classes = [AllowAny]
    authentication_classes = []
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["category", "language", "featured"]
    search_fields = ["title", "description", "preacher_name"]
    ordering_fields = ["sermon_date", "created_at", "views_count"]

    def get_serializer_class(self):
        if self.action == "retrieve":
            return SermonDetailSerializer
        return SermonListSerializer

    @action(detail=True, methods=["post"], permission_classes=[AllowAny])
    def increment_views(self, request, slug=None):
        """Incrémenter le compteur de vues"""
        sermon = self.get_object()
        sermon.views_count += 1
        sermon.save(update_fields=["views_count"])
        return Response({"views_count": sermon.views_count})


class AdminSermonViewSet(viewsets.ModelViewSet):
    """API admin pour la gestion complète des prédications"""
    queryset = Sermon.objects.all()
    serializer_class = AdminSermonSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["category", "language", "featured", "is_active"]
    search_fields = ["title", "description", "preacher_name"]
    ordering_fields = ["sermon_date", "created_at", "views_count"]

    def perform_create(self, serializer):
        serializer.save()

    def perform_update(self, serializer):
        serializer.save()
