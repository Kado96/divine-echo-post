import os
import django
import sys

# Ajouter le dossier backend au path
sys.path.append(os.path.abspath('backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'shalomministry.settings')
django.setup()

from api.settings.models import SiteSettings
from api.sermons.models import SermonCategory, Sermon
from django.utils.text import slugify

def create_defaults():
    # Settings
    if not SiteSettings.objects.exists():
        SiteSettings.objects.create(
            site_name="Shalom Ministry",
            hero_title="Nourrissez votre esprit, Approfondissez votre foi",
            hero_description="Découvrez nos émissions, podcasts et enseignements bibliques pour grandir dans la Parole de Dieu.",
            contact_email="contact@shalom.org",
            contact_phone="+257 79 901 864",
            address="Bujumbura, Burundi",
            stats_emissions="120+",
            stats_listeners="8K",
            stats_categories="15"
        )
        print("Default settings created.")

    # Categories
    cats = ["Prière", "Musique", "Famille", "Théologie", "Études bibliques"]
    for cat_name in cats:
        SermonCategory.objects.get_or_create(name=cat_name, slug=slugify(cat_name))
    print("Default categories created.")

    # Sermons
    if not Sermon.objects.exists():
        prieere = SermonCategory.objects.filter(name="Prière").first()
        if prieere:
            Sermon.objects.create(
                title="La puissance de la prière",
                preacher_name="Pasteur David",
                category=prieere,
                duration_minutes=45,
                description="Un message sur l'importance de la prière.",
                slug="puissance-priere"
            )
            print("Default sermons created.")

if __name__ == "__main__":
    create_defaults()
