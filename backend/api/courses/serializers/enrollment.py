from rest_framework import serializers

from api.courses.models import Course, Enrollment
from .course import CourseSerializer


class EnrollmentSerializer(serializers.ModelSerializer):
    course = CourseSerializer(read_only=True)
    course_id = serializers.PrimaryKeyRelatedField(
        queryset=Course.objects.filter(is_active=True),
        write_only=True,
        source="course",
    )
    course_title = serializers.CharField(source="course.title", read_only=True)
    course_slug = serializers.CharField(source="course.slug", read_only=True)
    course_image = serializers.SerializerMethodField()

    class Meta:
        model = Enrollment
        fields = [
            "id",
            "course",
            "course_id",
            "course_title",
            "course_slug",
            "course_image",
            "status",
            "progress",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def get_course_image(self, obj):
        """Retourner l'URL complète de l'image du cours"""
        if obj.course and obj.course.image:
            request = self.context.get('request')
            if request:
                try:
                    return request.build_absolute_uri(obj.course.image.url)
                except:
                    pass
            return obj.course.image.url
        return None

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user
        return super().create(validated_data)

