
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'shalomministry.settings')
django.setup()

from api.sermons.models import Sermon

sermons = Sermon.objects.all().order_by('id')

updates = [
    ("Témoignages", "sermons/sermon_meditation.png"),
    ("Pourquoi", "sermons/sermon_preaching.png"),
    ("10 clés", "sermons/sermon_worship.png")
]

for sermon in sermons:
    for prefix, img_path in updates:
        if prefix.lower() in sermon.title.lower():
            sermon.image = img_path
            sermon.save()
            print(f"Updated {sermon.title} with {img_path}")
            break
