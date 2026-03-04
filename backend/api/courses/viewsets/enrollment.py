from django_filters import rest_framework as filters
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from api.courses.models import Enrollment, Lesson, LessonProgress
from api.courses.serializers import (
    EnrollmentSerializer,
    LessonProgressSerializer,
)


class EnrollmentViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet,
):
    serializer_class = EnrollmentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.DjangoFilterBackend]
    filterset_fields = {"course": ["exact"]}

    def get_queryset(self):
        return (
            Enrollment.objects.filter(user=self.request.user)
            .select_related("course", "course__category")
        )

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(methods=["POST"], detail=True, url_path="complete-lesson")
    def complete_lesson(self, request, pk=None):
        enrollment = self.get_object()
        lesson_id = request.data.get("lesson")
        if not lesson_id:
            return Response(
                {"detail": "Le champ 'lesson' est requis."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        lesson = Lesson.objects.filter(id=lesson_id, course=enrollment.course).first()
        if not lesson:
            return Response(
                {"detail": "Leçon introuvable pour ce cours."},
                status=status.HTTP_404_NOT_FOUND,
            )

        progress, _ = LessonProgress.objects.get_or_create(
            enrollment=enrollment, lesson=lesson
        )
        serializer = LessonProgressSerializer(progress)
        return Response(serializer.data, status=status.HTTP_200_OK)

