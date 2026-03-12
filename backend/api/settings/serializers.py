from rest_framework import serializers
from django.conf import settings
from .models import SiteSettings, TeamMember


class TeamMemberSerializer(serializers.ModelSerializer):
    photo_display = serializers.SerializerMethodField()

    class Meta:
        model = TeamMember
        fields = ['id', 'name', 'role_fr', 'role_rn', 'role_en', 'role_sw', 'photo', 'photo_display', 'order']

    def get_photo_display(self, obj):
        if obj.photo:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.photo.url)
            return f"{settings.MEDIA_URL}{obj.photo}"
        return None


class SiteSettingsSerializer(serializers.ModelSerializer):
    logo_url_display = serializers.SerializerMethodField()
    hero_image_display = serializers.SerializerMethodField()
    about_image_display = serializers.SerializerMethodField()
    team_image_display = serializers.SerializerMethodField()
    quote_author_image_display = serializers.SerializerMethodField()
    
    class Meta:
        model = SiteSettings
        fields = [
            'id',
            'site_name',
            'description',
            'logo',
            'logo_url',
            'logo_url_display',
            'hero_image',
            'hero_image_display',
            # Images des sections
            'about_image',
            'about_image_display',
            'team_image',
            'team_image_display',
            'quote_author_image',
            'quote_author_image_display',
            # Citation du pasteur - Français
            'quote_text_fr', 'quote_author_name_fr', 'quote_author_subtitle_fr',
            # Citation du pasteur - Kirundi
            'quote_text_rn', 'quote_author_name_rn', 'quote_author_subtitle_rn',
            # Citation du pasteur - English
            'quote_text_en', 'quote_author_name_en', 'quote_author_subtitle_en',
            # Citation du pasteur - Swahili
            'quote_text_sw', 'quote_author_name_sw', 'quote_author_subtitle_sw',
            # Section Équipe
            'team_title_fr', 'team_description_fr',
            'team_title_rn', 'team_description_rn',
            'team_title_en', 'team_description_en',
            'team_title_sw', 'team_description_sw',
            # Stats Années
            'stat_years_value',
            'stat_years_label_fr', 'stat_years_label_rn', 'stat_years_label_en', 'stat_years_label_sw',
            # Features About
            'about_feature1_fr', 'about_feature2_fr', 'about_feature3_fr', 'about_feature4_fr',
            'about_feature1_rn', 'about_feature2_rn', 'about_feature3_rn', 'about_feature4_rn',
            'about_feature1_en', 'about_feature2_en', 'about_feature3_en', 'about_feature4_en',
            'about_feature1_sw', 'about_feature2_sw', 'about_feature3_sw', 'about_feature4_sw',
            # Contact
            'contact_email',
            'contact_phone',
            'contact_address',
            'facebook_url',
            'youtube_url',
            'instagram_url',
            'twitter_url',
            'whatsapp_url',
            'tiktok_url',
            # Contenu pages - Français
            'hero_badge_fr',
            'hero_title_fr',
            'hero_subtitle_fr',
            'hero_description_fr',
            'about_content_fr',
            'contact_content_fr',
            # UI Elements - Français
            'bible_verse_fr',
            'bible_verse_ref_fr',
            'btn_emissions_fr',
            'btn_teachings_fr',
            'btn_meditation_fr',
            'stat_emissions_value',
            'stat_audience_value',
            'stat_languages_value',
            'stat_emissions_fr',
            'stat_audience_fr',
            'stat_languages_fr',
            # Sections - Français
            'section_featured_fr',
            'section_featured_badge_fr',
            'section_featured_accent_fr',
            'section_featured_desc_fr',
            'section_categories_fr',
            'section_categories_accent_fr',
            'section_categories_desc_fr',
            'section_announcements_badge_fr',
            'section_announcements_title_fr',
            'section_announcements_accent_fr',
            'section_announcements_desc_fr',
            'section_testimonials_badge_fr',
            'section_testimonials_title_fr',
            'section_testimonials_accent_fr',
            'section_testimonials_desc_fr',
            'about_title_fr',
            'about_title_accent_fr',
            'about_badge_fr',
            'contact_badge_fr',
            'contact_hours_fr',
            'contact_address_fr',
            # Contenu pages - Kirundi
            'hero_badge_rn',
            'hero_title_rn',
            'hero_subtitle_rn',
            'hero_description_rn',
            'about_content_rn',
            'contact_content_rn',
            # UI Elements - Kirundi
            'bible_verse_rn',
            'bible_verse_ref_rn',
            'btn_emissions_rn',
            'btn_teachings_rn',
            'btn_meditation_rn',
            'stat_emissions_rn',
            'stat_audience_rn',
            'stat_languages_rn',
            'section_featured_rn',
            'section_featured_badge_rn',
            'section_featured_accent_rn',
            'section_featured_desc_rn',
            'section_categories_rn',
            'section_categories_accent_rn',
            'section_categories_desc_rn',
            'section_announcements_badge_rn',
            'section_announcements_title_rn',
            'section_announcements_accent_rn',
            'section_announcements_desc_rn',
            'section_testimonials_badge_rn',
            'section_testimonials_title_rn',
            'section_testimonials_accent_rn',
            'section_testimonials_desc_rn',
            'about_title_rn',
            'about_title_accent_rn',
            'about_badge_rn',
            'contact_badge_rn',
            'contact_hours_rn',
            'contact_address_rn',
            # Contenu pages - English
            'hero_badge_en',
            'hero_title_en',
            'hero_subtitle_en',
            'hero_description_en',
            'about_content_en',
            'contact_content_en',
            # UI Elements - English
            'bible_verse_en',
            'bible_verse_ref_en',
            'btn_emissions_en',
            'btn_teachings_en',
            'btn_meditation_en',
            'stat_emissions_en',
            'stat_audience_en',
            'stat_languages_en',
            'section_featured_en',
            'section_featured_badge_en',
            'section_featured_accent_en',
            'section_featured_desc_en',
            'section_categories_en',
            'section_categories_accent_en',
            'section_categories_desc_en',
            'section_announcements_badge_en',
            'section_announcements_title_en',
            'section_announcements_accent_en',
            'section_announcements_desc_en',
            'section_testimonials_badge_en',
            'section_testimonials_title_en',
            'section_testimonials_accent_en',
            'section_testimonials_desc_en',
            'about_title_en',
            'about_title_accent_en',
            'about_badge_en',
            'contact_badge_en',
            'contact_hours_en',
            'contact_address_en',
            # Contenu pages - Swahili
            'hero_badge_sw',
            'hero_title_sw',
            'hero_subtitle_sw',
            'hero_description_sw',
            'about_content_sw',
            'contact_content_sw',
            # UI Elements - Swahili
            'bible_verse_sw',
            'bible_verse_ref_sw',
            'btn_emissions_sw',
            'btn_teachings_sw',
            'btn_meditation_sw',
            'stat_emissions_sw',
            'stat_audience_sw',
            'stat_languages_sw',
            'section_featured_sw',
            'section_featured_badge_sw',
            'section_featured_accent_sw',
            'section_featured_desc_sw',
            'section_categories_sw',
            'section_categories_accent_sw',
            'section_categories_desc_sw',
            'section_announcements_badge_sw',
            'section_announcements_title_sw',
            'section_announcements_accent_sw',
            'section_announcements_desc_sw',
            'section_testimonials_badge_sw',
            'section_testimonials_title_sw',
            'section_testimonials_accent_sw',
            'section_testimonials_desc_sw',
            'about_title_sw',
            'about_title_accent_sw',
            'about_badge_sw',
            'contact_badge_sw',
            'contact_hours_sw',
            'contact_address_sw',
            # Header customization
            'header_admin_btn_fr', 'header_admin_btn_rn', 'header_admin_btn_en', 'header_admin_btn_sw',
            'header_slogan_fr', 'header_slogan_rn', 'header_slogan_en', 'header_slogan_sw',
            'show_admin_button',
            # Footer customization
            'footer_description_fr', 'footer_description_rn', 'footer_description_en', 'footer_description_sw',
            'footer_quick_links_title_fr', 'footer_quick_links_title_rn', 'footer_quick_links_title_en', 'footer_quick_links_title_sw',
            'footer_contact_title_fr', 'footer_contact_title_rn', 'footer_contact_title_en', 'footer_contact_title_sw',
            'footer_social_title_fr', 'footer_social_title_rn', 'footer_social_title_en', 'footer_social_title_sw',
            'footer_copyright_fr', 'footer_copyright_rn', 'footer_copyright_en', 'footer_copyright_sw',
            # Titres de pages (multilingue)
            'page_courses_title_fr', 'page_courses_title_rn', 'page_courses_title_en', 'page_courses_title_sw',
            'page_about_title_fr', 'page_about_title_rn', 'page_about_title_en', 'page_about_title_sw',
            'page_contact_title_fr', 'page_contact_title_rn', 'page_contact_title_en', 'page_contact_title_sw',
            # Personnalisation des styles
            'primary_color',
            'secondary_color',
            'text_color',
            'background_color',
            'accent_color',
            'heading_font',
            'body_font',
            'heading_size',
            'subheading_size',
            'body_size',
            'small_size',
            'ticker_enabled',
            'ticker_speed',
            'ticker_refresh_interval',
            'ticker_bg_color',
            'ticker_opacity',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def to_representation(self, instance):
        """S'assurer que tous les champs sont présents dans le JSON, même s'ils sont vides"""
        try:
            # Essayer la sérialisation normale
            data = super().to_representation(instance)
            
            # S'assurer que tous les champs sont présents avec des valeurs par défaut si None
            try:
                for field in self.Meta.fields:
                    if field not in data:
                        # Initialiser les champs manquants
                        if field in ['logo', 'logo_url', 'logo_url_display', 'hero_image', 'hero_image_display', 'facebook_url', 
                                    'youtube_url', 'instagram_url', 'twitter_url', 'whatsapp_url']:
                            data[field] = None
                        else:
                            # Pour les autres champs, essayer de récupérer la valeur depuis l'instance
                            try:
                                value = getattr(instance, field, None)
                                data[field] = value if value is not None else ''
                            except Exception:
                                data[field] = ''
            except Exception as field_error:
                # Si erreur lors de l'itération, continuer avec les données déjà sérialisées
                import logging
                logger = logging.getLogger(__name__)
                logger.warning(f"Erreur lors de l'initialisation des champs: {field_error}")
            
            return data
        except Exception as e:
            # En cas d'erreur, retourner les données de base
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Erreur dans to_representation: {str(e)}", exc_info=True)
            
            # Retourner un dictionnaire minimal pour éviter les erreurs 500
            try:
                minimal_data = {
                    'id': getattr(instance, 'id', 1),
                    'site_name': getattr(instance, 'site_name', 'Shalom Ministry'),
                    'description': getattr(instance, 'description', ''),
                    'logo': None,
                    'logo_url': getattr(instance, 'logo_url', '') or None,
                    'logo_url_display': None,
                    'contact_email': getattr(instance, 'contact_email', '') or '',
                    'contact_phone': getattr(instance, 'contact_phone', '') or '',
                    'contact_address': getattr(instance, 'contact_address', '') or '',
                    'facebook_url': getattr(instance, 'facebook_url', '') or None,
                    'youtube_url': getattr(instance, 'youtube_url', '') or None,
                    'instagram_url': getattr(instance, 'instagram_url', '') or None,
                    'twitter_url': getattr(instance, 'twitter_url', '') or None,
                    'whatsapp_url': getattr(instance, 'whatsapp_url', '') or None,
                }
                
                # Ajouter les champs multilingues de base (français)
                try:
                    minimal_data['hero_title_fr'] = getattr(instance, 'hero_title_fr', '') or ''
                    minimal_data['hero_subtitle_fr'] = getattr(instance, 'hero_subtitle_fr', '') or ''
                    minimal_data['about_content_fr'] = getattr(instance, 'about_content_fr', '') or ''
                    minimal_data['contact_content_fr'] = getattr(instance, 'contact_content_fr', '') or ''
                except Exception:
                    pass
                
                return minimal_data
            except Exception as minimal_error:
                logger.error(f"Erreur même lors de la création de la réponse minimale: {minimal_error}", exc_info=True)
                # Dernier recours : retourner un dictionnaire très basique
                return {
                    'id': 1,
                    'site_name': 'Shalom Ministry',
                    'description': 'Plateforme de formation chrétienne en ligne',
                    'error': 'serialization_error',
                    'message': f'Erreur de sérialisation: {str(e)}'
                }
    
    def get_logo_url_display(self, obj):
        """Retourne l'URL complète du logo (soit URL externe, soit fichier uploadé)"""
        if not obj:
            return None
        
        # Priorité 1: logo_url (URL externe)
        if hasattr(obj, 'logo_url') and obj.logo_url:
            return obj.logo_url
        
        # Priorité 2: logo (fichier uploadé)
        return self._get_image_url(obj, 'logo')

    def _get_image_url(self, obj, field_name):
        """Méthode utilitaire pour obtenir l'URL d'un champ image"""
        if not obj:
            return None
        image_field = getattr(obj, field_name, None)
        if not image_field or not hasattr(image_field, 'url'):
            return None
        try:
            url = image_field.url
            request = self.context.get('request')
            if request:
                # build_absolute_uri gère déjà correctement si le chemin commence par /
                return request.build_absolute_uri(url)
            return url
        except Exception:
            return None

    def get_hero_image_display(self, obj):
        """Retourne l'URL complète de l'image héro"""
        return self._get_image_url(obj, 'hero_image')

    def get_about_image_display(self, obj):
        """Retourne l'URL complète de l'image À Propos"""
        return self._get_image_url(obj, 'about_image')

    def get_team_image_display(self, obj):
        """Retourne l'URL complète de la photo d'équipe"""
        return self._get_image_url(obj, 'team_image')

    def get_quote_author_image_display(self, obj):
        """Retourne l'URL complète de la photo du pasteur (citation)"""
        return self._get_image_url(obj, 'quote_author_image')
