"""
Script pour peupler les traductions UI dans la base de données
"""
import os
import sys
import django

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'shalomministry.settings')
django.setup()

from api.settings.models import SiteSettings

def populate_ui_translations():
    print("=" * 60)
    print("Peuplement des traductions UI")
    print("=" * 60)
    
    settings, created = SiteSettings.objects.get_or_create(pk=1)
    
    # Français
    settings.bible_verse_fr = "Que le Dieu de l'espérance vous remplisse de toute joie et de toute paix dans la foi, pour que vous abondiez en espérance par la puissance du Saint-Esprit !"
    settings.bible_verse_ref_fr = "Romains 15:13"
    settings.btn_emissions_fr = "Émissions"
    settings.btn_teachings_fr = "Enseignements"
    settings.btn_meditation_fr = "Paroles de méditation"
    settings.stat_emissions_fr = "Émissions"
    settings.stat_audience_fr = "Auditeurs"
    settings.stat_languages_fr = "Langues"
    settings.section_featured_fr = "Émissions en vedette"
    settings.section_categories_fr = "Catégories"
    settings.section_categories_desc_fr = "Explorez nos différentes catégories d'émissions pour enrichir votre vie spirituelle"
    
    # Kirundi
    settings.bible_verse_rn = "Imana y'ihuze ikuzuze amarara yose n'amahoro mu kwizera, kugira ngo muhenuke mw'ihuze ku mbaraga z'Umupfumu Mutagatifu!"
    settings.bible_verse_ref_rn = "Abaroma 15:13"
    settings.btn_emissions_rn = "Imitangire"
    settings.btn_teachings_rn = "Inyigisho"
    settings.btn_meditation_rn = "Amagambo yo gutekereza"
    settings.stat_emissions_rn = "Imitangire"
    settings.stat_audience_rn = "Abatega"
    settings.stat_languages_rn = "Indimi"
    settings.section_featured_rn = "Imitangire ikomeye"
    settings.section_categories_rn = "Jamii"
    settings.section_categories_desc_rn = "Menya amoko yose yo kugira ngo urushirize ubuzima bwawe bw'umwuka"
    
    # English
    settings.bible_verse_en = "May the God of hope fill you with all joy and peace as you trust in him, so that you may overflow with hope by the power of the Holy Spirit!"
    settings.bible_verse_ref_en = "Romans 15:13"
    settings.btn_emissions_en = "Broadcasts"
    settings.btn_teachings_en = "Teachings"
    settings.btn_meditation_en = "Words of Meditation"
    settings.stat_emissions_en = "Broadcasts"
    settings.stat_audience_en = "Listeners"
    settings.stat_languages_en = "Languages"
    settings.section_featured_en = "Featured Broadcasts"
    settings.section_categories_en = "Categories"
    settings.section_categories_desc_en = "Explore our different broadcast categories to enrich your spiritual life"
    
    # Swahili
    settings.bible_verse_sw = "Mungu wa matumaini na akujaze furaha yote na amani katika kuamini, ili upate wingi wa matumaini kwa nguvu ya Roho Mtakatifu!"
    settings.bible_verse_ref_sw = "Warumi 15:13"
    settings.btn_emissions_sw = "Matangazo"
    settings.btn_teachings_sw = "Mafundisho"
    settings.btn_meditation_sw = "Maneno ya Kutafakari"
    settings.stat_emissions_sw = "Matangazo"
    settings.stat_audience_sw = "Wasikilizaji"
    settings.stat_languages_sw = "Lugha"
    settings.section_featured_sw = "Matangazo Maalum"
    settings.section_categories_sw = "Jamii"
    settings.section_categories_desc_sw = "Chunguza jamii zetu tofauti za matangazo ili kuimarisha maisha yako ya kiroho"
    
    settings.save()
    
    print("\n✓ Traductions UI sauvegardées avec succès!")
    print("\nExemples de traductions:")
    print(f"\nVerset biblique:")
    print(f"  • FR: {settings.bible_verse_fr[:50]}...")
    print(f"  • RN: {settings.bible_verse_rn[:50]}...")
    print(f"  • EN: {settings.bible_verse_en[:50]}...")
    print(f"  • SW: {settings.bible_verse_sw[:50]}...")
    
    print(f"\nBoutons Émissions:")
    print(f"  • FR: {settings.btn_emissions_fr}")
    print(f"  • RN: {settings.btn_emissions_rn}")
    print(f"  • EN: {settings.btn_emissions_en}")
    print(f"  • SW: {settings.btn_emissions_sw}")
    
    print("\n" + "=" * 60)
    print("✓ Vous pouvez maintenant modifier ces traductions via l'API admin!")
    print("=" * 60)

if __name__ == '__main__':
    populate_ui_translations()

