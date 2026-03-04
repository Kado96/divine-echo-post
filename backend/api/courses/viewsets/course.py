from django_filters import rest_framework as filters
from rest_framework import viewsets
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.permissions import IsAdminUser, IsAuthenticatedOrReadOnly, AllowAny

from api.courses.models import Course
from api.courses.serializers import (
    CourseDetailSerializer,
    CourseSerializer,
    CourseWriteSerializer,
)


class CourseFilter(filters.FilterSet):
    category = filters.CharFilter(field_name="category__slug", lookup_expr="exact")
    featured = filters.BooleanFilter(field_name="featured", method='filter_featured')
    is_active = filters.BooleanFilter(field_name="is_active")

    class Meta:
        model = Course
        fields = {
            "language": ["exact"],
            "difficulty": ["exact"],
        }
    
    def filter_featured(self, queryset, name, value):
        """
        Filtre personnalisé pour featured qui gère les valeurs string "true"/"false"
        """
        if value is None:
            return queryset
        # Convertir string "true"/"false" en booléen si nécessaire
        if isinstance(value, str):
            value = value.lower() in ('true', '1', 'yes', 'on')
        return queryset.filter(featured=value)


class CourseViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Course.objects.filter(is_active=True).select_related("category")
    permission_classes = [AllowAny]  # Permettre l'accès public en lecture
    filter_backends = [
        filters.DjangoFilterBackend,
        SearchFilter,
        OrderingFilter,
    ]
    filterset_class = CourseFilter
    search_fields = ["title", "description", "instructor_name"]
    ordering_fields = ["created_at", "students_count", "lessons_count"]
    lookup_field = "slug"
    pagination_class = None  # Désactiver la pagination pour éviter les erreurs 400

    @property
    def paginator(self):
        """Désactiver complètement la pagination - retourner toujours None"""
        return None
    
    def paginate_queryset(self, queryset):
        """Désactiver complètement la pagination pour éviter les erreurs 400"""
        return None

    def get_serializer_class(self):
        if self.action == "retrieve":
            return CourseDetailSerializer
        return CourseSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    def list(self, request, *args, **kwargs):
        """Override list pour gérer les erreurs de sérialisation et pagination"""
        from rest_framework.response import Response
        from rest_framework import status
        import logging
        
        logger = logging.getLogger(__name__)
        
        try:
            # S'assurer que self.request est correctement défini
            self.request = request
            
            # Récupérer le queryset
            try:
                queryset = self.filter_queryset(self.get_queryset())
            except Exception as filter_error:
                logger.error(f"Erreur lors du filtrage: {filter_error}", exc_info=True)
                queryset = self.get_queryset()
            
            # Sérialiser manuellement pour éviter les erreurs de pagination
            try:
                serializer = self.get_serializer(queryset, many=True)
                return Response(serializer.data, status=status.HTTP_200_OK)
            except Exception as serialization_error:
                logger.error(f"Erreur de sérialisation: {serialization_error}", exc_info=True)
                return Response([], status=status.HTTP_200_OK)
                
        except Exception as e:
            logger.error(f"Erreur dans CourseViewSet.list: {e}", exc_info=True)
            return Response(
                [],
                status=status.HTTP_200_OK  # Retourner liste vide plutôt qu'erreur
            )
    
    def retrieve(self, request, *args, **kwargs):
        """Override retrieve pour gérer les erreurs de sérialisation"""
        from rest_framework.response import Response
        from rest_framework import status
        import logging
        
        logger = logging.getLogger(__name__)
        
        try:
            # S'assurer que self.request est correctement défini
            self.request = request
            
            # Récupérer l'instance
            instance = self.get_object()
            
            # Sérialiser manuellement
            serializer = self.get_serializer(instance)
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Erreur dans CourseViewSet.retrieve: {e}", exc_info=True)
            return Response(
                {
                    'detail': f'Erreur lors de la récupération du cours: {str(e)}',
                    'error': 'retrieve_error'
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class AdminCourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.select_related("category")
    permission_classes = [IsAdminUser]
    filter_backends = [
        filters.DjangoFilterBackend,
        SearchFilter,
        OrderingFilter,
    ]
    filterset_class = CourseFilter
    search_fields = ["title", "description", "instructor_name"]
    ordering_fields = ["created_at", "students_count", "lessons_count"]
    lookup_field = "id"  # Utiliser ID pour l'admin au lieu de slug

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return CourseWriteSerializer
        if self.action == "retrieve":
            return CourseDetailSerializer
        return CourseSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

