from rest_framework import serializers
from django.conf import settings

from api.courses.models import Course
from .category import CourseCategorySerializer
from .episode import EpisodeSerializer


class CourseSerializer(serializers.ModelSerializer):
    category = CourseCategorySerializer(read_only=True)
    image = serializers.SerializerMethodField()
    audio_file = serializers.SerializerMethodField()
    video_file = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = [
            "id",
            "title",
            "slug",
            "description",
            "category",
            "language",
            "difficulty",
            "duration_display",
            "lessons_count",
            "students_count",
            "instructor_name",
            "image",
            "audio_url",
            "audio_file",
            "video_url",
            "video_file",
            "youtube_url",
            "featured",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def get_image(self, obj):
        """Retourne l'URL de l'image avec gestion d'erreur robuste"""
        if not obj.image:
            return None
        
        try:
            # Vérifier si l'objet image a un attribut url
            if not hasattr(obj.image, 'url'):
                return None
            
            # Essayer d'accéder à l'URL
            try:
                image_url = obj.image.url
            except (ValueError, AttributeError, Exception):
                # Si l'accès à l'URL échoue, retourner None
                return None
            
            if not image_url:
                return None
            
            # Construire l'URL complète
            request = self.context.get('request')
            if request:
                try:
                    return request.build_absolute_uri(image_url)
                except (ValueError, AttributeError, Exception):
                    # Si build_absolute_uri échoue, utiliser MEDIA_URL
                    if not image_url.startswith('http'):
                        return f"{settings.MEDIA_URL}{image_url}" if settings.MEDIA_URL else image_url
                    return image_url
            else:
                # Pas de request, utiliser MEDIA_URL
                if not image_url.startswith('http'):
                    return f"{settings.MEDIA_URL}{image_url}" if settings.MEDIA_URL else image_url
                return image_url
        except Exception:
            # En cas d'erreur quelconque, retourner None pour éviter de casser la sérialisation
            return None

    def get_audio_file(self, obj):
        """Retourne l'URL complète du fichier audio avec gestion d'erreur robuste"""
        if not obj.audio_file:
            return None
        
        try:
            if not hasattr(obj.audio_file, 'url'):
                return None
            
            try:
                audio_url = obj.audio_file.url
            except (ValueError, AttributeError, Exception):
                return None
            
            if not audio_url:
                return None
            
            request = self.context.get('request')
            if request:
                try:
                    return request.build_absolute_uri(audio_url)
                except (ValueError, AttributeError, Exception):
                    if not audio_url.startswith('http'):
                        return f"{settings.MEDIA_URL}{audio_url}" if settings.MEDIA_URL else audio_url
                    return audio_url
            else:
                if not audio_url.startswith('http'):
                    return f"{settings.MEDIA_URL}{audio_url}" if settings.MEDIA_URL else audio_url
                return audio_url
        except Exception:
            return None

    def get_video_file(self, obj):
        """Retourne l'URL complète du fichier vidéo avec gestion d'erreur robuste"""
        if not obj.video_file:
            return None
        
        try:
            if not hasattr(obj.video_file, 'url'):
                return None
            
            try:
                video_url = obj.video_file.url
            except (ValueError, AttributeError, Exception):
                return None
            
            if not video_url:
                return None
            
            request = self.context.get('request')
            if request:
                try:
                    return request.build_absolute_uri(video_url)
                except (ValueError, AttributeError, Exception):
                    if not video_url.startswith('http'):
                        return f"{settings.MEDIA_URL}{video_url}" if settings.MEDIA_URL else video_url
                    return video_url
            else:
                if not video_url.startswith('http'):
                    return f"{settings.MEDIA_URL}{video_url}" if settings.MEDIA_URL else video_url
                return video_url
        except Exception:
            return None


class CourseDetailSerializer(CourseSerializer):
    episodes = EpisodeSerializer(source="lessons", many=True, read_only=True)

    class Meta(CourseSerializer.Meta):
        fields = CourseSerializer.Meta.fields + ["episodes"]


class CourseWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = [
            "id",
            "title",
            "slug",
            "description",
            "category",
            "language",
            "difficulty",
            "duration_display",
            "lessons_count",
            "students_count",
            "instructor_name",
            "image",
            "audio_url",
            "audio_file",
            "video_url",
            "video_file",
            "youtube_url",
            "featured",
            "is_active",
        ]

