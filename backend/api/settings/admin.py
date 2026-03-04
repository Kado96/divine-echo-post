"""
⚠️ IMPORTANT : Admin Django réservé à la gestion système uniquement

Pour toutes les opérations normales (CRUD), utilisez l'API REST :
- Frontend : /api/settings/current/ (lecture)
- Administration : /api/settings/ (CRUD complet)

L'admin Django (/admin/) est uniquement pour :
- Gestion système avancée
- Débogage
- Super-admin uniquement

Toutes les opérations utilisateur doivent passer par l'API.
"""
from django.contrib import admin
from .models import SiteSettings


@admin.register(SiteSettings)
class SiteSettingsAdmin(admin.ModelAdmin):
    fieldsets = (
        ("Informations générales", {
            "fields": ("site_name", "description")
        }),
        ("Logo & Héro", {
            "fields": ("logo", "logo_url", "hero_image"),
            "description": "Vous pouvez uploader un logo OU mettre une URL. L'upload est prioritaire."
        }),
        ("Section À Propos - Image", {
            "fields": ("about_image",),
            "description": "Image principale de la section À Propos (ex: photo de l'église)."
        }),
        ("Section À Propos - Textes (FR)", {
            "fields": (
                "about_badge_fr", "about_title_fr", "about_title_accent_fr", "about_content_fr",
                "about_feature1_fr", "about_feature2_fr", "about_feature3_fr", "about_feature4_fr",
                "stat_years_value", "stat_years_label_fr",
            ),
            "classes": ("collapse",),
        }),
        ("Section À Propos - Textes (EN)", {
            "fields": (
                "about_badge_en", "about_title_en", "about_title_accent_en", "about_content_en",
                "about_feature1_en", "about_feature2_en", "about_feature3_en", "about_feature4_en",
                "stat_years_label_en",
            ),
            "classes": ("collapse",),
        }),
        ("Section À Propos - Textes (RN)", {
            "fields": (
                "about_badge_rn", "about_title_rn", "about_title_accent_rn", "about_content_rn",
                "about_feature1_rn", "about_feature2_rn", "about_feature3_rn", "about_feature4_rn",
                "stat_years_label_rn",
            ),
            "classes": ("collapse",),
        }),
        ("Section À Propos - Textes (SW)", {
            "fields": (
                "about_badge_sw", "about_title_sw", "about_title_accent_sw", "about_content_sw",
                "about_feature1_sw", "about_feature2_sw", "about_feature3_sw", "about_feature4_sw",
                "stat_years_label_sw",
            ),
            "classes": ("collapse",),
        }),
        ("Citation du Pasteur", {
            "fields": ("quote_author_image",),
            "description": "Photo du pasteur affichée à côté de la citation."
        }),
        ("Citation du Pasteur - Textes (FR)", {
            "fields": ("quote_text_fr", "quote_author_name_fr", "quote_author_subtitle_fr"),
            "classes": ("collapse",),
        }),
        ("Citation du Pasteur - Textes (EN)", {
            "fields": ("quote_text_en", "quote_author_name_en", "quote_author_subtitle_en"),
            "classes": ("collapse",),
        }),
        ("Citation du Pasteur - Textes (RN)", {
            "fields": ("quote_text_rn", "quote_author_name_rn", "quote_author_subtitle_rn"),
            "classes": ("collapse",),
        }),
        ("Citation du Pasteur - Textes (SW)", {
            "fields": ("quote_text_sw", "quote_author_name_sw", "quote_author_subtitle_sw"),
            "classes": ("collapse",),
        }),
        ("Section Équipe", {
            "fields": ("team_image",),
            "description": "Photo de l'équipe affichée dans la section Équipe."
        }),
        ("Section Équipe - Textes (FR)", {
            "fields": ("team_title_fr", "team_description_fr"),
            "classes": ("collapse",),
        }),
        ("Section Équipe - Textes (EN)", {
            "fields": ("team_title_en", "team_description_en"),
            "classes": ("collapse",),
        }),
        ("Section Équipe - Textes (RN)", {
            "fields": ("team_title_rn", "team_description_rn"),
            "classes": ("collapse",),
        }),
        ("Section Équipe - Textes (SW)", {
            "fields": ("team_title_sw", "team_description_sw"),
            "classes": ("collapse",),
        }),
        ("Contact", {
            "fields": ("contact_email", "contact_phone", "contact_address")
        }),
        ("Réseaux sociaux", {
            "fields": ("facebook_url", "youtube_url", "instagram_url", "twitter_url", "whatsapp_url")
        }),
    )
    
    def has_add_permission(self, request):
        # Une seule instance
        return not SiteSettings.objects.exists()
    
    def has_delete_permission(self, request, obj=None):
        # Ne pas permettre la suppression
        return False
