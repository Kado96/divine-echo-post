# Generated migration to create default SiteSettings instance
from django.db import migrations


def create_default_settings(apps, schema_editor):
    """Créer l'instance SiteSettings par défaut si elle n'existe pas"""
    SiteSettings = apps.get_model('settings', 'SiteSettings')
    
    # Créer l'instance avec pk=1 si elle n'existe pas
    SiteSettings.objects.get_or_create(
        pk=1,
        defaults={
            'site_name': 'Shalom Ministry',
            'description': 'Plateforme de formation chrétienne en ligne',
            'contact_email': 'contact@shalomministry.org',
            'contact_phone': '+257 79 000 000',
            'contact_address': 'Bujumbura, Burundi',
            'hero_title': 'Grandissez dans la foi',
            'hero_subtitle': 'Découvrez nos émissions, enseignements et temps de méditation pour approfondir votre relation avec Dieu.',
            'about_content': 'Bienvenue sur Shalom Ministry, une plateforme dédiée à la croissance spirituelle.',
            'contact_content': 'Contactez-nous pour toute question ou demande.',
        }
    )


def reverse_create_default_settings(apps, schema_editor):
    """Supprimer l'instance SiteSettings par défaut (optionnel)"""
    SiteSettings = apps.get_model('settings', 'SiteSettings')
    SiteSettings.objects.filter(pk=1).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('settings', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(create_default_settings, reverse_create_default_settings),
    ]

