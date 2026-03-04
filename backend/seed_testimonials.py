import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'shalomministry.settings')
django.setup()

from api.testimonials.models import Testimonial

def seed_testimonials():
    testimonials = [
        {
            "author": "Jean-Pierre Kabura",
            "content": "J'ai trouvé une paix profonde en écoutant les sermons sur la guérison intérieure. Ce ministère est une bénédiction pour ma famille.",
            "status": "Vérifié"
        },
        {
            "author": "Marie-Claire Niyonzima",
            "content": "La Parole de Dieu partagée ici m'a fortifiée pendant mes épreuves les plus difficiles. Merci au Pasteur pour ses enseignements.",
            "status": "Vérifié"
        },
        {
            "author": "Samuel Hakizimana",
            "content": "Une transformation réelle ! Mon engagement spirituel a grandi de manière incroyable depuis que je suis ce ministère.",
            "status": "Vérifié"
        }
    ]

    for t in testimonials:
        Testimonial.objects.get_or_create(
            author=t['author'],
            content=t['content'],
            defaults={'status': t['status']}
        )
    print("Testimonials seeded successfully!")

if __name__ == "__main__":
    seed_testimonials()
