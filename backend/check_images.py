import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'shalomministry.settings')
django.setup()

from api.sermons.models import Sermon

for s in Sermon.objects.all():
    print(f"ID={s.id} | language='{s.language}' | title={s.title[:40]} | is_active={s.is_active}")
