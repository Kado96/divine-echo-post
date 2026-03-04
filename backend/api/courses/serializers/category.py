from rest_framework import serializers

from api.courses.models import CourseCategory


class CourseCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseCategory
        fields = ["id", "name", "slug", "icon"]
    
    def to_representation(self, instance):
        """Override pour gérer les erreurs de sérialisation"""
        try:
            return super().to_representation(instance)
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Erreur lors de la sérialisation de CourseCategory: {e}", exc_info=True)
            # Retourner une représentation minimale en cas d'erreur
            return {
                'id': getattr(instance, 'id', None),
                'name': getattr(instance, 'name', ''),
                'slug': getattr(instance, 'slug', ''),
                'icon': getattr(instance, 'icon', None),
            }

