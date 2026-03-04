"""
Script pour peupler la base avec du contenu multilingue
"""
import os
import sys
import django

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'shalomministry.settings')
django.setup()

from api.settings.models import SiteSettings

def populate_content():
    print("=" * 60)
    print("Peuplement du contenu multilingue")
    print("=" * 60)
    
    settings, created = SiteSettings.objects.get_or_create(pk=1)
    
    # Français
    settings.hero_title_fr = "Grandissez dans la foi"
    settings.hero_subtitle_fr = "Découvrez nos émissions, enseignements et temps de méditation pour approfondir votre relation avec Dieu."
    settings.about_content_fr = """Bienvenue sur Shalom Ministry, une plateforme dédiée à la croissance spirituelle.

Notre Vision
Nous croyons que chaque croyant a le potentiel de grandir dans sa connaissance de Dieu et de servir efficacement dans l'église locale. Notre vision est de créer une communauté mondiale d'apprenants qui s'encouragent mutuellement dans la foi.

Nos Valeurs
• Fidélité à la Parole - Tous nos enseignements sont ancrés dans les Saintes Écritures
• Accessibilité - Émissions disponibles en français, kirundi, swahili et anglais
• Communauté - Apprendre ensemble et grandir en communion fraternelle"""
    settings.contact_content_fr = "Contactez-nous pour toute question ou demande. Nous sommes là pour vous accompagner dans votre croissance spirituelle."
    
    # Kirundi
    settings.hero_title_rn = "Kura mu Kwizera"
    settings.hero_subtitle_rn = "Vugurura imitangire yacu, amashusho n'igihe co gusengera kugira ngo wongerezeko umubano wawe n'Imana."
    settings.about_content_rn = """Murakaza neza kuri Shalom Ministry, urubuga rweguriwe ikura ry'umwuka.

Icyo Tubona
Twizera ko buri muzera afite ubushobozi bwo gukura mu kumenyera Imana no gukorera neza mu rusengero rw'aho ava. Icyo tubona ni ukuremera umuryango w'isi yose w'abiga bazirikirana mu kwizera.

Indangagaciro Zacu
• Ukwizerana ku Jambo - Amashusho yacu yose ashingiye ku Wandiko Yera
• Kuboneka - Imitangire iraboneka mu gifaransa, ikirundi, igiswahili n'icyongereza
• Umuryango - Kwiga hamwe no gukura mu ishyirahamwe ry'ubwanditsi"""
    settings.contact_content_rn = "Duhamagare ku gibazo icyo ari co cyose canke icyifuzo. Turi hano kugira ngo tuguherekeze mu kura kwawe k'umwuka."
    
    # English
    settings.hero_title_en = "Grow in Faith"
    settings.hero_subtitle_en = "Discover our broadcasts, teachings and meditation times to deepen your relationship with God."
    settings.about_content_en = """Welcome to Shalom Ministry, a platform dedicated to spiritual growth.

Our Vision
We believe that every believer has the potential to grow in their knowledge of God and serve effectively in the local church. Our vision is to create a global community of learners who encourage one another in faith.

Our Values
• Faithfulness to the Word - All our teachings are rooted in the Holy Scriptures
• Accessibility - Broadcasts available in French, Kirundi, Swahili and English
• Community - Learning together and growing in brotherly communion"""
    settings.contact_content_en = "Contact us for any questions or requests. We are here to support you in your spiritual growth."
    
    # Swahili
    settings.hero_title_sw = "Kua katika Imani"
    settings.hero_subtitle_sw = "Gundua matangazo yetu, mafundisho na nyakati za kutafakari ili kuimarisha uhusiano wako na Mungu."
    settings.about_content_sw = """Karibu Shalom Ministry, jukwaa lililojitolea kukuza kiroho.

Maono Yetu
Tunaamini kuwa kila muumini ana uwezo wa kukua katika maarifa yake ya Mungu na kutumika kwa ufanisi katika kanisa la ndani. Maono yetu ni kuunda jumuiya ya kimataifa ya wanafunzi wanaojitia moyo kwa imani.

Maadili Yetu
• Uaminifu kwa Neno - Mafundisho yetu yote yamezikwa katika Maandiko Matakatifu
• Upatikanaji - Matangazo yanapatikana kwa Kifaransa, Kirundi, Kiswahili na Kiingereza
• Jumuiya - Kujifunza pamoja na kukua katika ushirika wa ndugu"""
    settings.contact_content_sw = "Wasiliana nasi kwa maswali yoyote au maombi. Tuko hapa kukusaidia katika ukuaji wako wa kiroho."
    
    settings.save()
    
    print("\n✓ Contenu multilingue sauvegardé avec succès!")
    print("\nRésumé:")
    print(f"  • Français: {settings.hero_title_fr}")
    print(f"  • Kirundi: {settings.hero_title_rn}")
    print(f"  • English: {settings.hero_title_en}")
    print(f"  • Swahili: {settings.hero_title_sw}")
    print("\n" + "=" * 60)

if __name__ == '__main__':
    populate_content()

