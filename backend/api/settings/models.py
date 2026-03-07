from django.db import models
from django.core.cache import cache


class TeamMember(models.Model):
    """Membres de l'équipe Shalom"""
    name = models.CharField(max_length=200)
    role_fr = models.CharField(max_length=200, blank=True, default="Membre de l'équipe")
    role_rn = models.CharField(max_length=200, blank=True, default="Uwizeye umurwi")
    role_en = models.CharField(max_length=200, blank=True, default="Team Member")
    role_sw = models.CharField(max_length=200, blank=True, default="Mwanachama wa timu")
    photo = models.ImageField(upload_to='team/', blank=True, null=True)
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Membre de l'équipe"
        verbose_name_plural = "Membres de l'équipe"
        ordering = ['order', 'created_at']

    def __str__(self):
        return self.name


class SiteSettings(models.Model):
    """Paramètres du site (singleton - une seule instance)"""
    
    # Informations générales
    site_name = models.CharField(max_length=200, default="Shalom Ministry")
    description = models.TextField(blank=True, default="Plateforme de formation chrétienne en ligne")
    
    # Logo & Hero
    logo = models.ImageField(upload_to='settings/', blank=True, null=True, help_text="Logo du site")
    logo_url = models.URLField(blank=True, help_text="OU URL du logo (si pas d'upload)")
    hero_image = models.ImageField(upload_to='settings/', blank=True, null=True, help_text="Image de fond de la section Héro")
    
    # Images des sections
    about_image = models.ImageField(upload_to='settings/', blank=True, null=True, help_text="Image de la section À Propos (ex: église)")
    team_image = models.ImageField(upload_to='settings/', blank=True, null=True, help_text="Photo de l'équipe")
    quote_author_image = models.ImageField(upload_to='settings/', blank=True, null=True, help_text="Photo du pasteur pour la citation")
    
    # Citation du pasteur (multilingue)
    # Français
    quote_text_fr = models.TextField(blank=True, default="La Parole de Dieu n'est pas seulement un récit, c'est une puissance qui recrée l'âme et aligne l'esprit.", help_text="Citation du pasteur")
    quote_author_name_fr = models.CharField(max_length=200, blank=True, default="Pasteur Principal")
    quote_author_subtitle_fr = models.CharField(max_length=200, blank=True, default="Shalom Ministry")
    # Kirundi
    quote_text_rn = models.TextField(blank=True, default="Ijambo ry'Imana si inkuru gusa, ni ububasha bwongera kubumba ubugingo bukagorora umutima.")
    quote_author_name_rn = models.CharField(max_length=200, blank=True, default="Umupasitori Mukuru")
    quote_author_subtitle_rn = models.CharField(max_length=200, blank=True, default="Shalom Ministry")
    # English
    quote_text_en = models.TextField(blank=True, default="The Word of God is not just a story, it is a power that recreates the soul and aligns the spirit.")
    quote_author_name_en = models.CharField(max_length=200, blank=True, default="Senior Pastor")
    quote_author_subtitle_en = models.CharField(max_length=200, blank=True, default="Shalom Ministry")
    # Swahili
    quote_text_sw = models.TextField(blank=True, default="Neno la Mungu si hadithi tu, ni nguvu inayoumba upya nafsi na kunyoosha roho.")
    quote_author_name_sw = models.CharField(max_length=200, blank=True, default="Mchungaji Mkuu")
    quote_author_subtitle_sw = models.CharField(max_length=200, blank=True, default="Shalom Ministry")
    
    # Section Équipe (multilingue)
    # Français
    team_title_fr = models.CharField(max_length=200, blank=True, default="Notre Équipe")
    team_description_fr = models.TextField(blank=True, default="Une équipe dévouée au service du Royaume pour vous accompagner dans votre parcours chrétien.")
    # Kirundi
    team_title_rn = models.CharField(max_length=200, blank=True, default="Umurwi wacu")
    team_description_rn = models.TextField(blank=True, default="Umurwi utizigira gukora igikorwa c'Ubwami kugira ngo ugufatanye mu rugendo rwawe rw'ubukirisu.")
    # English
    team_title_en = models.CharField(max_length=200, blank=True, default="Our Team")
    team_description_en = models.TextField(blank=True, default="A team dedicated to serving the Kingdom to accompany you in your Christian journey.")
    # Swahili
    team_title_sw = models.CharField(max_length=200, blank=True, default="Timu Yetu")
    team_description_sw = models.TextField(blank=True, default="Timu iliyojitolea kutumikia Ufalme ili kukufuatana katika safari yako ya Kikristo.")
    
    # Stats section À Propos
    stat_years_value = models.CharField(max_length=50, blank=True, default="10+", help_text="Nombre d'années de service")
    # Français
    stat_years_label_fr = models.CharField(max_length=100, blank=True, default="Années de service")
    # Kirundi
    stat_years_label_rn = models.CharField(max_length=100, blank=True, default="Imyaka y'umurimo")
    # English
    stat_years_label_en = models.CharField(max_length=100, blank=True, default="Years of Service")
    # Swahili
    stat_years_label_sw = models.CharField(max_length=100, blank=True, default="Miaka ya Huduma")
    
    # Titres des features About (multilingue)
    # Français
    about_feature1_fr = models.CharField(max_length=100, blank=True, default="Enseignement Biblique")
    about_feature2_fr = models.CharField(max_length=100, blank=True, default="Guérison du Cœur")
    about_feature3_fr = models.CharField(max_length=100, blank=True, default="Éveil Spirituel")
    about_feature4_fr = models.CharField(max_length=100, blank=True, default="Nos Engagements")
    # Kirundi
    about_feature1_rn = models.CharField(max_length=100, blank=True, default="Inyigisho za Bibiliya")
    about_feature2_rn = models.CharField(max_length=100, blank=True, default="Gukiza Umutima")
    about_feature3_rn = models.CharField(max_length=100, blank=True, default="Ikangura ry'Umutima")
    about_feature4_rn = models.CharField(max_length=100, blank=True, default="Ibikorwa vyacu")
    # English
    about_feature1_en = models.CharField(max_length=100, blank=True, default="Biblical Teaching")
    about_feature2_en = models.CharField(max_length=100, blank=True, default="Heart Healing")
    about_feature3_en = models.CharField(max_length=100, blank=True, default="Spiritual Awakening")
    about_feature4_en = models.CharField(max_length=100, blank=True, default="Our Commitments")
    # Swahili
    about_feature1_sw = models.CharField(max_length=100, blank=True, default="Mafundisho ya Biblia")
    about_feature2_sw = models.CharField(max_length=100, blank=True, default="Uponyaji wa Moyo")
    about_feature3_sw = models.CharField(max_length=100, blank=True, default="Uamsho wa Kiroho")
    about_feature4_sw = models.CharField(max_length=100, blank=True, default="Ahadi Zetu")
    
    # Contact
    contact_email = models.EmailField(blank=True, default="contact@shalomministry.org")
    contact_phone = models.CharField(max_length=50, blank=True, default="+257 79 000 000")
    contact_address = models.TextField(blank=True, default="Bujumbura, Burundi")
    
    # Réseaux sociaux
    facebook_url = models.URLField(blank=True)
    youtube_url = models.URLField(blank=True)
    instagram_url = models.URLField(blank=True)
    twitter_url = models.URLField(blank=True)
    whatsapp_url = models.URLField(blank=True)
    
    # Contenu pages (par langue)
    # Français
    hero_badge_fr = models.CharField(max_length=100, blank=True, default="✦ Shalom Ministry")
    hero_title_fr = models.CharField(max_length=200, blank=True, default="Grandissez dans la foi")
    hero_subtitle_fr = models.TextField(blank=True, default="Découvrez nos émissions, enseignements et temps de méditation pour approfondir votre relation avec Dieu.")
    hero_description_fr = models.TextField(blank=True, default="Une plateforme dédiée à la croissance spirituelle et à l'édification du corps du Christ.")
    about_content_fr = models.TextField(blank=True, default="Bienvenue sur Shalom Ministry, une plateforme dédiée à la croissance spirituelle.")
    about_title_fr = models.CharField(max_length=200, blank=True, default="Notre Histoire")
    about_title_accent_fr = models.CharField(max_length=200, blank=True, default="& Vision")
    about_badge_fr = models.CharField(max_length=100, blank=True, default="À Propos")
    contact_content_fr = models.TextField(blank=True, default="Contactez-nous pour toute question ou demande.")
    contact_badge_fr = models.CharField(max_length=100, blank=True, default="Contact")
    
    # Verset biblique - Français
    bible_verse_fr = models.TextField(blank=True, default="Que le Dieu de l'espérance vous remplisse de toute joie et de toute paix dans la foi, pour que vous abondiez en espérance par la puissance du Saint-Esprit !")
    bible_verse_ref_fr = models.CharField(max_length=50, blank=True, default="Romains 15:13")
    
    # Boutons - Français
    btn_emissions_fr = models.CharField(max_length=100, blank=True, default="Émissions")
    btn_teachings_fr = models.CharField(max_length=100, blank=True, default="Enseignements")
    btn_meditation_fr = models.CharField(max_length=100, blank=True, default="Paroles de méditation")
    
    # Stats - Valeurs (universelles)
    stat_emissions_value = models.CharField(max_length=50, blank=True, default="120+")
    stat_audience_value = models.CharField(max_length=50, blank=True, default="8K")
    stat_languages_value = models.CharField(max_length=50, blank=True, default="15")

    # Stats - Labels (multilingues)
    # Français
    stat_emissions_fr = models.CharField(max_length=50, blank=True, default="Émissions")
    stat_audience_fr = models.CharField(max_length=50, blank=True, default="Auditeurs")
    stat_languages_fr = models.CharField(max_length=50, blank=True, default="Thématiques")
    
    section_featured_fr = models.CharField(max_length=100, blank=True, default="Émissions en vedette")
    section_featured_badge_fr = models.CharField(max_length=100, blank=True, default="Nouveauté")
    section_featured_accent_fr = models.CharField(max_length=100, blank=True, default="Vidéos")
    section_featured_desc_fr = models.TextField(blank=True, default="Découvrez nos dernières productions")
    
    section_categories_fr = models.CharField(max_length=100, blank=True, default="Catégories")
    section_categories_accent_fr = models.CharField(max_length=100, blank=True, default="Emissions")
    section_categories_desc_fr = models.TextField(blank=True, default="Explorez nos différentes catégories d'émissions pour enrichir votre vie spirituelle")

    section_announcements_badge_fr = models.CharField(max_length=100, blank=True, default="Annonces")
    section_announcements_title_fr = models.CharField(max_length=200, blank=True, default="Infos & Événements")
    section_announcements_accent_fr = models.CharField(max_length=100, blank=True, default="")
    section_announcements_desc_fr = models.TextField(blank=True, default="Restez informé des activités de notre ministère")

    section_testimonials_badge_fr = models.CharField(max_length=100, blank=True, default="Témoignages")
    section_testimonials_title_fr = models.CharField(max_length=200, blank=True, default="Ce qu'ils disent")
    section_testimonials_accent_fr = models.CharField(max_length=100, blank=True, default="de nous")
    section_testimonials_desc_fr = models.TextField(blank=True, default="Découvrez comment Shalom Ministry transforme des vies")
    
    # Kirundi
    hero_badge_rn = models.CharField(max_length=100, blank=True, default="✦ Shalom Ministry")
    hero_title_rn = models.CharField(max_length=200, blank=True, default="Kurira mu kwizera")
    hero_subtitle_rn = models.TextField(blank=True, default="")
    hero_description_rn = models.TextField(blank=True, default="")
    about_content_rn = models.TextField(blank=True, default="")
    about_title_rn = models.CharField(max_length=200, blank=True, default="Amateka yacu")
    about_title_accent_rn = models.CharField(max_length=200, blank=True, default="& Vision")
    about_badge_rn = models.CharField(max_length=100, blank=True, default="Ibitwerekeye")
    contact_content_rn = models.TextField(blank=True, default="")
    contact_badge_rn = models.CharField(max_length=100, blank=True, default="Twandikire")
    
    bible_verse_rn = models.TextField(blank=True, default="Imana y'ihuze ikuzuze amarara yose n'amahoro mu kwizera, kugira ngo muhenuke mw'ihuze ku mbaraga z'Umupfumu Mutagatifu!")
    bible_verse_ref_rn = models.CharField(max_length=50, blank=True, default="Abaroma 15:13")
    
    btn_emissions_rn = models.CharField(max_length=100, blank=True, default="Imitangire")
    btn_teachings_rn = models.CharField(max_length=100, blank=True, default="Inyigisho")
    btn_meditation_rn = models.CharField(max_length=100, blank=True, default="Amagambo yo gutekereza")
    
    stat_emissions_rn = models.CharField(max_length=50, blank=True, default="Imitangire")
    stat_audience_rn = models.CharField(max_length=50, blank=True, default="Abatega")
    stat_languages_rn = models.CharField(max_length=50, blank=True, default="Indimi")
    
    section_featured_rn = models.CharField(max_length=100, blank=True, default="Imitangire ikomeye")
    section_featured_badge_rn = models.CharField(max_length=100, blank=True, default="Gishasha")
    section_featured_accent_rn = models.CharField(max_length=100, blank=True, default="Amavidewo")
    section_featured_desc_rn = models.TextField(blank=True, default="Andura ubutumwa n'inyigisho zacu nshasha kugira uheze ukure buri musi.")

    section_categories_rn = models.CharField(max_length=100, blank=True, default="Jamii")
    section_categories_accent_rn = models.CharField(max_length=100, blank=True, default="")
    section_categories_desc_rn = models.TextField(blank=True, default="Menya amoko yose yo kugira ngo urushirize ubuzima bwawe bw'umwuka")

    section_announcements_badge_rn = models.CharField(max_length=100, blank=True, default="Imitangire")
    section_announcements_title_rn = models.CharField(max_length=200, blank=True, default="Amakuru")
    section_announcements_accent_rn = models.CharField(max_length=100, blank=True, default="")
    section_announcements_desc_rn = models.TextField(blank=True, default="")

    section_testimonials_badge_rn = models.CharField(max_length=100, blank=True, default="Ivyerekeye")
    section_testimonials_title_rn = models.CharField(max_length=200, blank=True, default="Ico bavuga")
    section_testimonials_accent_rn = models.CharField(max_length=100, blank=True, default="yacu")
    section_testimonials_desc_rn = models.TextField(blank=True, default="Andura intahe z'abafashijwe n'ijambo ry'Imana.")
    
    # English
    hero_badge_en = models.CharField(max_length=100, blank=True, default="✦ Shalom Ministry")
    hero_title_en = models.CharField(max_length=200, blank=True, default="Grow in Faith")
    hero_subtitle_en = models.TextField(blank=True, default="")
    hero_description_en = models.TextField(blank=True, default="")
    about_content_en = models.TextField(blank=True, default="")
    about_title_en = models.CharField(max_length=200, blank=True, default="Our Story")
    about_title_accent_en = models.CharField(max_length=200, blank=True, default="& Vision")
    about_badge_en = models.CharField(max_length=100, blank=True, default="About Us")
    contact_content_en = models.TextField(blank=True, default="")
    contact_badge_en = models.CharField(max_length=100, blank=True, default="Contact")
    
    bible_verse_en = models.TextField(blank=True, default="May the God of hope fill you with all joy and peace as you trust in him, so that you may overflow with hope by the power of the Holy Spirit!")
    bible_verse_ref_en = models.CharField(max_length=50, blank=True, default="Romans 15:13")
    
    btn_emissions_en = models.CharField(max_length=100, blank=True, default="Broadcasts")
    btn_teachings_en = models.CharField(max_length=100, blank=True, default="Teachings")
    btn_meditation_en = models.CharField(max_length=100, blank=True, default="Words of Meditation")
    
    stat_emissions_en = models.CharField(max_length=50, blank=True, default="Broadcasts")
    stat_audience_en = models.CharField(max_length=50, blank=True, default="Listeners")
    stat_languages_en = models.CharField(max_length=50, blank=True, default="Languages")
    
    section_featured_en = models.CharField(max_length=100, blank=True, default="Featured Broadcasts")
    section_featured_badge_en = models.CharField(max_length=100, blank=True, default="New Content")
    section_featured_accent_en = models.CharField(max_length=100, blank=True, default="Videos")
    section_featured_desc_en = models.TextField(blank=True, default="Discover our latest productions")

    section_categories_en = models.CharField(max_length=100, blank=True, default="Categories")
    section_categories_accent_en = models.CharField(max_length=100, blank=True, default="Programs")
    section_categories_desc_en = models.TextField(blank=True, default="Explore our different broadcast categories to enrich your spiritual life")

    section_announcements_badge_en = models.CharField(max_length=100, blank=True, default="Announcements")
    section_announcements_title_en = models.CharField(max_length=200, blank=True, default="Info & Events")
    section_announcements_accent_en = models.CharField(max_length=100, blank=True, default="")
    section_announcements_desc_en = models.TextField(blank=True, default="Stay informed about our ministry activities")

    section_testimonials_badge_en = models.CharField(max_length=100, blank=True, default="Testimonials")
    section_testimonials_title_en = models.CharField(max_length=200, blank=True, default="What people say")
    section_testimonials_accent_en = models.CharField(max_length=100, blank=True, default="about us")
    section_testimonials_desc_en = models.TextField(blank=True, default="Discover how Shalom Ministry transforms lives")
    
    # Swahili
    hero_badge_sw = models.CharField(max_length=100, blank=True, default="✦ Shalom Ministry")
    hero_title_sw = models.CharField(max_length=200, blank=True, default="Kua katika Imani")
    hero_subtitle_sw = models.TextField(blank=True, default="")
    hero_description_sw = models.TextField(blank=True, default="")
    about_content_sw = models.TextField(blank=True, default="")
    about_title_sw = models.CharField(max_length=200, blank=True, default="Historia yetu")
    about_title_accent_sw = models.CharField(max_length=200, blank=True, default="& Maono")
    about_badge_sw = models.CharField(max_length=100, blank=True, default="Kuhusu Sisi")
    contact_content_sw = models.TextField(blank=True, default="")
    contact_badge_sw = models.CharField(max_length=100, blank=True, default="Wasiliana Nasi")
    
    bible_verse_sw = models.TextField(blank=True, default="Mungu wa matumaini na akujaze furaha yote na amani katika kuamini, ili upate wingi wa matumaini kwa nguvu ya Roho Mtakatifu!")
    bible_verse_ref_sw = models.CharField(max_length=50, blank=True, default="Warumi 15:13")
    
    btn_emissions_sw = models.CharField(max_length=100, blank=True, default="Matangazo")
    btn_teachings_sw = models.CharField(max_length=100, blank=True, default="Mafundisho")
    btn_meditation_sw = models.CharField(max_length=100, blank=True, default="Maneno ya Kutafakari")
    
    stat_emissions_sw = models.CharField(max_length=50, blank=True, default="Matangazo")
    stat_audience_sw = models.CharField(max_length=50, blank=True, default="Wasikilizaji")
    stat_languages_sw = models.CharField(max_length=50, blank=True, default="Lugha")
    
    section_featured_sw = models.CharField(max_length=100, blank=True, default="Matangazo Maalum")
    section_featured_badge_sw = models.CharField(max_length=100, blank=True, default="Mpya")
    section_featured_accent_sw = models.CharField(max_length=100, blank=True, default="Video")
    section_featured_desc_sw = models.TextField(blank=True, default="Gundua kazi zetu za hivi punde")

    section_categories_sw = models.CharField(max_length=100, blank=True, default="Jamii")
    section_categories_accent_sw = models.CharField(max_length=100, blank=True, default="Matangazo")
    section_categories_desc_sw = models.TextField(blank=True, default="Chunguza jamii zetu tofauti za matangazo ili kuimarisha maisha yako ya kiroho")

    section_announcements_badge_sw = models.CharField(max_length=100, blank=True, default="Matangazo")
    section_announcements_title_sw = models.CharField(max_length=200, blank=True, default="Habari na Matukio")
    section_announcements_accent_sw = models.CharField(max_length=100, blank=True, default="")
    section_announcements_desc_sw = models.TextField(blank=True, default="Pata habari kuhusu shughuli za huduma yetu")

    section_testimonials_badge_sw = models.CharField(max_length=100, blank=True, default="Ushuhuda")
    section_testimonials_title_sw = models.CharField(max_length=200, blank=True, default="Wanachosema")
    section_testimonials_accent_sw = models.CharField(max_length=100, blank=True, default="kuhusu sisi")
    section_testimonials_desc_sw = models.TextField(blank=True, default="Gundua jinsi Shalom Ministry inavyobadilisha maisha")
    
    # Champs legacy (pour compatibilité) - pointent vers français
    @property
    def hero_title(self):
        return self.hero_title_fr
    
    @property
    def hero_subtitle(self):
        return self.hero_subtitle_fr
    
    @property
    def about_content(self):
        return self.about_content_fr
    
    @property
    def contact_content(self):
        return self.contact_content_fr
    
    # Personnalisation Header (multilingue)
    # Français
    header_admin_btn_fr = models.CharField(max_length=50, blank=True, default="Connexion Admin", help_text="Texte du bouton admin")
    header_slogan_fr = models.CharField(max_length=200, blank=True, default="", help_text="Slogan dans le header")
    # Kirundi
    header_admin_btn_rn = models.CharField(max_length=50, blank=True, default="Injira Admin")
    header_slogan_rn = models.CharField(max_length=200, blank=True, default="")
    # English
    header_admin_btn_en = models.CharField(max_length=50, blank=True, default="Admin Login")
    header_slogan_en = models.CharField(max_length=200, blank=True, default="")
    # Swahili
    header_admin_btn_sw = models.CharField(max_length=50, blank=True, default="Ingia Admin")
    header_slogan_sw = models.CharField(max_length=200, blank=True, default="")
    
    # Options Header
    show_admin_button = models.BooleanField(default=True, help_text="Afficher le bouton admin dans le header")
    
    # Personnalisation Footer (multilingue)
    # Français
    footer_description_fr = models.TextField(blank=True, default="Un ministère chrétien centré sur la guérison intérieure, la méditation de la Parole de Dieu, l'enseignement biblique et la croissance personnelle.")
    footer_quick_links_title_fr = models.CharField(max_length=100, blank=True, default="Liens rapides")
    footer_contact_title_fr = models.CharField(max_length=100, blank=True, default="Contactez-nous")
    footer_social_title_fr = models.CharField(max_length=100, blank=True, default="Suivez-nous")
    footer_copyright_fr = models.CharField(max_length=200, blank=True, default="Tous droits réservés")
    # Kirundi
    footer_description_rn = models.TextField(blank=True, default="Umurimo w'amadini wo gukira mu mutima, gutekereza Ijambo ry'Imana, inyigisho za Bibiliya no gukura.")
    footer_quick_links_title_rn = models.CharField(max_length=100, blank=True, default="Amahuza")
    footer_contact_title_rn = models.CharField(max_length=100, blank=True, default="Twandikire")
    footer_social_title_rn = models.CharField(max_length=100, blank=True, default="Dukurikire")
    footer_copyright_rn = models.CharField(max_length=200, blank=True, default="Uburenganzira bwose")
    # English
    footer_description_en = models.TextField(blank=True, default="A Christian ministry focused on inner healing, meditation on God's Word, biblical teaching and personal growth.")
    footer_quick_links_title_en = models.CharField(max_length=100, blank=True, default="Quick Links")
    footer_contact_title_en = models.CharField(max_length=100, blank=True, default="Contact Us")
    footer_social_title_en = models.CharField(max_length=100, blank=True, default="Follow Us")
    footer_copyright_en = models.CharField(max_length=200, blank=True, default="All rights reserved")
    # Swahili
    footer_description_sw = models.TextField(blank=True, default="Huduma ya Kikristo inayolenga uponyaji wa ndani, kutafakari Neno la Mungu, mafundisho ya Biblia na ukuaji binafsi.")
    footer_quick_links_title_sw = models.CharField(max_length=100, blank=True, default="Viungo vya Haraka")
    footer_contact_title_sw = models.CharField(max_length=100, blank=True, default="Wasiliana Nasi")
    footer_social_title_sw = models.CharField(max_length=100, blank=True, default="Tufuate")
    footer_copyright_sw = models.CharField(max_length=200, blank=True, default="Haki zote zimehifadhiwa")
    
    # Personnalisation des titres de pages (multilingue)
    # Français
    page_courses_title_fr = models.CharField(max_length=200, blank=True, default="Toutes les émissions", help_text="Titre de la page des émissions")
    page_about_title_fr = models.CharField(max_length=200, blank=True, default="À propos", help_text="Titre de la page À propos")
    page_contact_title_fr = models.CharField(max_length=200, blank=True, default="Contactez-nous", help_text="Titre de la page Contact")
    # Kirundi
    page_courses_title_rn = models.CharField(max_length=200, blank=True, default="Imitangire yose")
    page_about_title_rn = models.CharField(max_length=200, blank=True, default="Ibyerekeye")
    page_contact_title_rn = models.CharField(max_length=200, blank=True, default="Twandikire")
    # English
    page_courses_title_en = models.CharField(max_length=200, blank=True, default="All Courses")
    page_about_title_en = models.CharField(max_length=200, blank=True, default="About")
    page_contact_title_en = models.CharField(max_length=200, blank=True, default="Contact Us")
    # Swahili
    page_courses_title_sw = models.CharField(max_length=200, blank=True, default="Matangazo Yote")
    page_about_title_sw = models.CharField(max_length=200, blank=True, default="Kuhusu")
    page_contact_title_sw = models.CharField(max_length=200, blank=True, default="Wasiliana Nasi")
    
    # Personnalisation des styles
    # Couleurs
    primary_color = models.CharField(max_length=7, blank=True, default="#3B82F6", help_text="Couleur principale (hex: #RRGGBB)")
    secondary_color = models.CharField(max_length=7, blank=True, default="#10B981", help_text="Couleur secondaire")
    text_color = models.CharField(max_length=7, blank=True, default="#1F2937", help_text="Couleur du texte principal")
    background_color = models.CharField(max_length=7, blank=True, default="#FFFFFF", help_text="Couleur de fond")
    accent_color = models.CharField(max_length=7, blank=True, default="#8B5CF6", help_text="Couleur d'accentuation")
    
    # Polices (fonts)
    heading_font = models.CharField(max_length=100, blank=True, default="Playfair Display", help_text="Police pour les titres")
    body_font = models.CharField(max_length=100, blank=True, default="Inter", help_text="Police pour le corps de texte")
    
    # Tailles de texte (en pixels ou rem)
    heading_size = models.CharField(max_length=10, blank=True, default="2.5rem", help_text="Taille des titres principaux")
    subheading_size = models.CharField(max_length=10, blank=True, default="1.5rem", help_text="Taille des sous-titres")
    body_size = models.CharField(max_length=10, blank=True, default="1rem", help_text="Taille du texte normal")
    small_size = models.CharField(max_length=10, blank=True, default="0.875rem", help_text="Taille du petit texte")
    
    # News Ticker (Défilement type France 24)
    ticker_enabled = models.BooleanField(default=True, help_text="Activer le bandeau défilant type France 24")
    ticker_speed = models.IntegerField(default=30, help_text="Vitesse de défilement (secondes pour un cycle complet)")
    ticker_refresh_interval = models.IntegerField(default=3600, help_text="Fréquence de mise à jour des annonces (secondes, ex: 3600 pour 1h)")
    ticker_bg_color = models.CharField(max_length=7, default="#e60000", help_text="Couleur de fond du bandeau (hex: #RRGGBB)")
    ticker_opacity = models.IntegerField(default=100, help_text="Opacité du bandeau (0 à 100)")
    
    # Métadonnées
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Paramètres du site"
        verbose_name_plural = "Paramètres du site"
        ordering = ['-updated_at']
    
    def __str__(self):
        return f"Paramètres - {self.site_name}"
    
    def save(self, *args, **kwargs):
        # Toujours une seule instance
        self.pk = 1
        super().save(*args, **kwargs)
        # Invalider le cache
        cache.delete('site_settings')
    
    @classmethod
    def get_settings(cls):
        """Récupère les paramètres (avec cache)"""
        try:
            settings = cache.get('site_settings')
            if settings is None:
                try:
                    settings, _ = cls.objects.get_or_create(pk=1)
                    cache.set('site_settings', settings, 3600)  # Cache 1 heure
                except Exception as e:
                    # Si get_or_create échoue, essayer de récupérer directement
                    try:
                        settings = cls.objects.get(pk=1)
                        cache.set('site_settings', settings, 3600)
                    except cls.DoesNotExist:
                        # Si l'instance n'existe pas, créer avec valeurs par défaut
                        settings = cls.objects.create(
                            pk=1,
                            site_name='Shalom Ministry',
                            description='Plateforme de formation chrétienne en ligne',
                            contact_email='contact@shalomministry.org',
                            contact_phone='+257 79 000 000',
                            contact_address='Bujumbura, Burundi',
                            hero_title='Grandissez dans la foi',
                            hero_subtitle='Découvrez nos émissions, enseignements et temps de méditation pour approfondir votre relation avec Dieu.',
                            about_content='Bienvenue sur Shalom Ministry, une plateforme dédiée à la croissance spirituelle.',
                            contact_content='Contactez-nous pour toute question ou demande.',
                        )
                        cache.set('site_settings', settings, 3600)
            return settings
        except Exception as e:
            # En cas d'erreur, essayer de récupérer ou créer sans cache
            try:
                return cls.objects.get(pk=1)
            except cls.DoesNotExist:
                return cls.objects.create(pk=1)

