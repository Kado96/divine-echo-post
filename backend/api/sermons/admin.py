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
from .models import SermonCategory, Sermon, SermonComment


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


@admin.register(SermonComment)
class SermonCommentAdmin(admin.ModelAdmin):
    list_display = ("author_name", "sermon", "is_approved", "created_at")
    list_filter = ("is_approved", "created_at")
    search_fields = ("author_name", "author_email", "content")
    actions = ["approve_comments"]

    def approve_comments(self, request, queryset):
        queryset.update(is_approved=True)
    approve_comments.short_description = "Approuver les commentaires sélectionnés"
