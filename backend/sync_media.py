import os
import django
from django.conf import settings
from django.apps import apps
from django.db import models

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'shalomministry.settings')
django.setup()

from api.media.models import MediaFile

def run_sync():
    print("Starting generic media sync...")
    existing_files = set(MediaFile.objects.exclude(file='').values_list('file', flat=True))
    existing_urls = set(MediaFile.objects.exclude(external_url__isnull=True).exclude(external_url='').values_list('external_url', flat=True))
    added_count = 0

    def add_file(file_obj):
        nonlocal added_count
        if file_obj and hasattr(file_obj, 'name') and file_obj.name:
            if file_obj.name not in existing_files:
                try:
                    MediaFile.objects.create(file=file_obj.name, title=os.path.basename(file_obj.name))
                    existing_files.add(file_obj.name)
                    added_count += 1
                except Exception as e:
                    print(f"Error adding file {file_obj.name}: {e}")

    def add_url(url_str):
        nonlocal added_count
        if url_str and isinstance(url_str, str) and url_str.startswith('http'):
            if any(x in url_str.lower() for x in ['youtube.com', 'youtu.be', 'vimeo.com', '.mp4', '.mp3', '.jpg', '.png', '.pdf']):
                if url_str not in existing_urls:
                    try:
                        name = os.path.basename(url_str.split('?')[0])
                        if not name: name = "External Link"
                        MediaFile.objects.create(external_url=url_str, title=name)
                        existing_urls.add(url_str)
                        added_count += 1
                    except Exception as e:
                        print(f"Error adding url {url_str}: {e}")

    for model in apps.get_models():
        if model == MediaFile:
            continue
            
        file_fields = [f for f in model._meta.get_fields() if isinstance(f, (models.FileField, models.ImageField))]
        url_fields = [f for f in model._meta.get_fields() if isinstance(f, models.URLField)]
        
        if not file_fields and not url_fields:
            continue
            
        print(f"Scanning {model._meta.label}...")
        for obj in model.objects.all():
            for f in file_fields:
                add_file(getattr(obj, f.name, None))
            for f in url_fields:
                add_url(getattr(obj, f.name, None))

    print("Scanning media folder globally...")
    if hasattr(settings, 'MEDIA_ROOT') and os.path.exists(settings.MEDIA_ROOT):
        media_root = settings.MEDIA_ROOT
        for root, dirs, files in os.walk(media_root):
            for filename in files:
                full_path = os.path.join(root, filename)
                rel_path = os.path.relpath(full_path, media_root).replace('\\', '/')
                if rel_path not in existing_files:
                    try:
                        MediaFile.objects.create(file=rel_path, title=filename)
                        existing_files.add(rel_path)
                        added_count += 1
                    except Exception as e:
                        pass
                        
    print(f"Sync complete. Added {added_count} new media entries.")

if __name__ == '__main__':
    run_sync()
