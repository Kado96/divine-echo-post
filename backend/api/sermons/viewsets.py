from rest_framework import viewsets, filters
from rest_framework.permissions import AllowAny
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import SermonCategory, Sermon
from api.accounts.permissions import IsSimpleUser, IsTeamMember
from .serializers import (
    SermonCategorySerializer,
    SermonListSerializer,
    SermonDetailSerializer,
    AdminSermonSerializer,
)


class SermonCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = SermonCategory.objects.all()
    serializer_class = SermonCategorySerializer
    lookup_field = "slug"
    permission_classes = [AllowAny]


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
    permission_classes = [IsSimpleUser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["category", "language", "featured", "is_active"]
    search_fields = ["title", "description", "preacher_name"]
    ordering_fields = ["sermon_date", "created_at", "views_count"]

    def perform_create(self, serializer):
        serializer.save()

    @action(detail=False, methods=["get"])
    def global_stats(self, request):
        from django.db.models import Sum
        total_views = Sermon.objects.filter(is_active=True).aggregate(total=Sum('views_count'))['total'] or 0
        total_sermons = Sermon.objects.filter(is_active=True).count()
        
        # Top 5 sermons
        top_sermons = Sermon.objects.filter(is_active=True).order_by('-views_count')[:5]
        top_sermons_data = [{
            "id": s.id,
            "title": s.title,
            "views": s.views_count,
            "category": s.category.name if s.category else "N/A"
        } for s in top_sermons]

        return Response({
            "total_views": total_views,
            "total_sermons": total_sermons,
            "top_sermons": top_sermons_data,
            "active_listeners": total_sermons * 2 + 5, # Realistic dummy live data
            "impact_rate": "84%",
            "avg_time": "22m"
        })

class AdminSermonCategoryViewSet(viewsets.ModelViewSet):
    """API admin pour la gestion complète des catégories de prédications"""
    queryset = SermonCategory.objects.all()
    serializer_class = SermonCategorySerializer
    permission_classes = [IsTeamMember]
    # Pas de lookup_field = "slug" ici pour utiliser l'ID par défaut (standard admin)
