"""
⚠️ IMPORTANT : Admin Django réservé à la gestion système uniquement

Pour toutes les opérations normales (CRUD), utilisez l'API REST :
- Frontend : /api/sermons/ (lecture)
- Administration : /api/admin/sermons/sermons/ (CRUD complet)

L'admin Django (/admin/) est uniquement pour :
- Gestion système avancée
- Débogage
- Super-admin uniquement

Toutes les opérations utilisateur doivent passer par l'API.
"""
from django.contrib import admin
from .models import SermonCategory, Sermon


@admin.register(SermonCategory)
class SermonCategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "created_at")
    prepopulated_fields = {"slug": ("name",)}
    search_fields = ("name",)


@admin.register(Sermon)
class SermonAdmin(admin.ModelAdmin):
    list_display = ("title", "preacher_name", "category", "language", "featured", "is_active", "sermon_date")
    list_filter = ("category", "language", "featured", "is_active", "sermon_date")
    search_fields = ("title", "preacher_name", "description")
    prepopulated_fields = {"slug": ("title",)}
    fieldsets = (
        ("Informations principales", {
            "fields": ("title", "slug", "description", "category")
        }),
        ("Contenu média", {
            "fields": ("image", "video_url", "video_file", "audio_url", "audio_file")
        }),
        ("Détails", {
            "fields": ("preacher_name", "language", "duration_minutes", "sermon_date")
        }),
        ("Gestion", {
            "fields": ("featured", "is_active", "views_count")
        }),
    )
