from rest_framework import serializers

from api.courses.models import Lesson


class EpisodeSerializer(serializers.ModelSerializer):
    """
    Serializer pour les épisodes (alias de Lesson pour les émissions).
    """
    class Meta:
        model = Lesson
        fields = [
            "id",
            "title",
            "order",
            "duration_minutes",
            "video_url",
            "content",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

