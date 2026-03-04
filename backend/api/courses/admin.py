"""
⚠️ IMPORTANT : Admin Django réservé à la gestion système uniquement

Pour toutes les opérations normales (CRUD), utilisez l'API REST :
- Frontend : /api/courses/courses/ (lecture)
- Administration : /api/courses/admin/courses/ (CRUD complet)

L'admin Django (/admin/) est uniquement pour :
- Gestion système avancée
- Débogage
- Super-admin uniquement

Toutes les opérations utilisateur doivent passer par l'API.
"""
from django.contrib import admin

from api.courses.models import Course, CourseCategory, Enrollment, Lesson, LessonProgress


@admin.register(CourseCategory)
class CourseCategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "created_at", "updated_at")
    search_fields = ("name", "slug")


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "language",
        "difficulty",
        "category",
        "featured",
        "is_active",
        "created_at",
    )
    list_filter = ("language", "difficulty", "featured", "is_active")
    search_fields = ("title", "description", "instructor_name", "slug")
    prepopulated_fields = {"slug": ("title",)}


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ("title", "course", "order", "duration_minutes", "created_at")
    list_filter = ("course",)
    search_fields = ("title", "course__title")
    ordering = ("course", "order")


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ("user", "course", "status", "progress", "created_at")
    list_filter = ("status",)
    search_fields = ("user__username", "course__title")


@admin.register(LessonProgress)
class LessonProgressAdmin(admin.ModelAdmin):
    list_display = ("enrollment", "lesson", "completed_at")
    search_fields = ("enrollment__user__username", "lesson__title")

