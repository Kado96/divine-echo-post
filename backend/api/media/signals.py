from django.db.models.signals import post_save
from django.dispatch import receiver
from django.db import models
from django.apps import apps
import os

from api.media.models import MediaFile

def is_media_url(url_str):
    if not url_str or not isinstance(url_str, str) or not url_str.startswith('http'):
        return False
    return any(x in url_str.lower() for x in ['youtube.com', 'youtu.be', 'vimeo.com', '.mp4', '.mp3', '.jpg', '.png', '.pdf'])

@receiver(post_save)
def auto_sync_media(sender, instance, **kwargs):
    # Ignore MediaFile to prevent recursion, and ignore migrations
    if sender == MediaFile or sender._meta.app_label == 'migrations':
        return

    try:
        # Get fields safely
        file_fields = [f for f in sender._meta.get_fields() if isinstance(f, (models.FileField, models.ImageField))]
        url_fields = [f for f in sender._meta.get_fields() if isinstance(f, models.URLField)]
        
        for field in file_fields:
            file_obj = getattr(instance, field.name, None)
            if file_obj and hasattr(file_obj, 'name') and file_obj.name:
                if not MediaFile.objects.filter(file=file_obj.name).exists():
                    MediaFile.objects.create(file=file_obj.name, title=os.path.basename(file_obj.name))
                    
        for field in url_fields:
            url_str = getattr(instance, field.name, None)
            if is_media_url(url_str):
                if not MediaFile.objects.filter(external_url=url_str).exists():
                    name = os.path.basename(url_str.split('?')[0])
                    if not name: name = "External Link"
                    MediaFile.objects.create(external_url=url_str, title=name)
    except Exception as e:
        # Failsafe so saving a model doesn't crash if media sync fails
        pass
