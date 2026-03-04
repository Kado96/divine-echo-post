from rest_framework import viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated
from api.courses.models import CourseCategory
from api.courses.serializers.category import CourseCategorySerializer


class CourseCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """API publique pour les catégories de cours"""
    queryset = CourseCategory.objects.all()
    serializer_class = CourseCategorySerializer
    lookup_field = "slug"
    permission_classes = [AllowAny]
    pagination_class = None  # Désactiver la pagination pour retourner toutes les catégories
    
    @property
    def paginator(self):
        """Désactiver complètement la pagination - retourner toujours None"""
        return None
    
    def paginate_queryset(self, queryset):
        """Désactiver complètement la pagination pour éviter les erreurs"""
        return None
    
    def get_queryset(self):
        """Override get_queryset pour gérer les erreurs de base de données"""
        try:
            return CourseCategory.objects.all()
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Erreur lors de la récupération du queryset: {e}", exc_info=True)
            # Retourner un queryset vide plutôt que de planter
            return CourseCategory.objects.none()
    
    def list(self, request, *args, **kwargs):
        """Override list pour gérer les erreurs de sérialisation"""
        from rest_framework.response import Response
        from rest_framework import status
        import logging
        
        logger = logging.getLogger(__name__)
        
        try:
            # S'assurer que self.request est correctement défini
            self.request = request
            
            # Essayer de récupérer le queryset
            try:
                queryset = self.get_queryset()
            except Exception as db_error:
                logger.error(f"Erreur de base de données dans CourseCategoryViewSet.list: {db_error}", exc_info=True)
                return Response(
                    [],
                    status=status.HTTP_200_OK  # Retourner 200 avec liste vide plutôt que 500
                )
            
            # Si le queryset est vide, retourner une liste vide
            try:
                if not queryset.exists():
                    return Response([], status=status.HTTP_200_OK)
            except Exception as exists_error:
                logger.warning(f"Erreur lors de la vérification exists(): {exists_error}")
                # Continuer même si exists() échoue
            
            # Essayer de sérialiser manuellement pour éviter les erreurs dans super().list()
            try:
                serializer = self.get_serializer(queryset, many=True)
                return Response(serializer.data, status=status.HTTP_200_OK)
            except Exception as serialization_error:
                logger.error(f"Erreur de sérialisation dans CourseCategoryViewSet.list: {serialization_error}", exc_info=True)
                # En cas d'erreur de sérialisation, retourner une liste vide
                return Response([], status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Erreur critique dans CourseCategoryViewSet.list: {e}", exc_info=True)
            # Dernier recours : retourner une liste vide avec 200 OK
            return Response([], status=status.HTTP_200_OK)
    
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
            try:
                instance = self.get_object()
            except Exception as get_error:
                logger.error(f"Erreur lors de la récupération de l'instance: {get_error}", exc_info=True)
                return Response(
                    {'detail': 'Catégorie non trouvée', 'error': 'not_found'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Sérialiser manuellement
            try:
                serializer = self.get_serializer(instance)
                return Response(serializer.data, status=status.HTTP_200_OK)
            except Exception as serialization_error:
                logger.error(f"Erreur de sérialisation: {serialization_error}", exc_info=True)
                return Response(
                    {'detail': 'Erreur de sérialisation', 'error': 'serialization_error'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
                
        except Exception as e:
            logger.error(f"Erreur critique dans CourseCategoryViewSet.retrieve: {e}", exc_info=True)
            return Response(
                {'detail': 'Erreur lors de la récupération de la catégorie', 'error': 'retrieve_error'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class AdminCourseCategoryViewSet(viewsets.ModelViewSet):
    """API admin pour gérer les catégories de cours"""
    queryset = CourseCategory.objects.all()
    serializer_class = CourseCategorySerializer
    permission_classes = [IsAuthenticated]
    lookup_field = "slug"
    pagination_class = None  # Désactiver la pagination pour retourner toutes les catégories
