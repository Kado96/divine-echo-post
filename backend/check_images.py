import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'shalomministry.settings')
django.setup()

from api.sermons.models import Sermon

sermon = Sermon.objects.filter(id=1).first()
if sermon:
    print(f"Sermon ID: {sermon.id}")
    print(f"Title: {sermon.title}")
    print(f"Image Field: {sermon.image}")
    if sermon.image:
        print(f"Image URL: {sermon.image.url}")
else:
    print("Sermon ID 1 not found")

all_sermons = Sermon.objects.all()
for s in all_sermons:
    print(f"ID: {s.id}, Title: {s.title}, Image: {s.image}")
