from django_filters import rest_framework as filters
from rest_framework import viewsets
from rest_framework.permissions import IsAdminUser, IsAuthenticatedOrReadOnly

from api.courses.models import Lesson
from api.courses.serializers import LessonSerializer


class LessonFilter(filters.FilterSet):
    course = filters.CharFilter(field_name="course__slug", lookup_expr="exact")
    course_id = filters.NumberFilter(field_name="course__id", lookup_expr="exact")

    class Meta:
        model = Lesson
        fields = ["course", "course_id"]


class LessonViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Lesson.objects.select_related("course")
    serializer_class = LessonSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [filters.DjangoFilterBackend]
    filterset_class = LessonFilter
    ordering = ["order"]


class AdminLessonViewSet(viewsets.ModelViewSet):
    queryset = Lesson.objects.select_related("course")
    serializer_class = LessonSerializer
    permission_classes = [IsAdminUser]
    filter_backends = [filters.DjangoFilterBackend]
    filterset_class = LessonFilter
    ordering = ["order"]

