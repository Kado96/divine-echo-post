from django.urls import include, path
from rest_framework import routers

from api.courses.viewsets import (
    AdminCourseViewSet,
    AdminLessonViewSet,
    CourseCategoryViewSet,
    AdminCourseCategoryViewSet,
    CourseViewSet,
    EnrollmentViewSet,
    LessonViewSet,
)
from api.courses.viewsets.favorite import FavoriteViewSet

router = routers.DefaultRouter()
router.register(r"categories", CourseCategoryViewSet, basename="categories")
router.register(r"courses", CourseViewSet, basename="courses")
router.register(r"lessons", LessonViewSet, basename="lessons")
router.register(r"enrollments", EnrollmentViewSet, basename="enrollments")
router.register(r"favorites", FavoriteViewSet, basename="favorites")
router.register(r"admin/categories", AdminCourseCategoryViewSet, basename="admin-categories")
router.register(r"admin/courses", AdminCourseViewSet, basename="admin-courses")
router.register(r"admin/lessons", AdminLessonViewSet, basename="admin-lessons")

urlpatterns = [
    path("", include(router.urls)),
]

