from rest_framework import serializers

from api.courses.models import LessonProgress


class LessonProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = LessonProgress
        fields = ["id", "enrollment", "lesson", "completed_at"]
        read_only_fields = ["id", "completed_at"]

