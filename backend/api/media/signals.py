from django.db.models.signals import post_save  # pyre-ignore[21]
from django.dispatch import receiver  # pyre-ignore[21]
from django.db import models  # pyre-ignore[21]
from django.apps import apps  # pyre-ignore[21]
import os
from typing import Any

from api.media.models import MediaFile  # pyre-ignore[21]

def is_media_url(url_str: Any) -> bool:
    if not url_str or not isinstance(url_str, str) or not url_str.startswith('http'):
        return False
    return any(x in url_str.lower() for x in ['youtube.com', 'youtu.be', 'vimeo.com', '.mp4', '.mp3', '.jpg', '.png', '.pdf'])

@receiver(post_save)
def auto_sync_media(sender: Any, instance: Any, **kwargs: Any) -> None:
    # Ignore MediaFile to prevent recursion, and ignore migrations
    if sender == MediaFile or sender._meta.app_label == 'migrations':
        return

    try:
        # Get fields safely
        file_fields = [f for f in sender._meta.get_fields() if isinstance(f, (models.FileField, models.ImageField))]
        url_fields = [f for f in sender._meta.get_fields() if isinstance(f, models.URLField)]
        
        for field in file_fields:
            field_name: str = getattr(field, 'name', '')
            if not field_name:
                continue
            file_obj = getattr(instance, field_name, None)
            if file_obj and hasattr(file_obj, 'name') and file_obj.name:
                if not MediaFile.objects.filter(file=file_obj.name).exists():
                    MediaFile.objects.create(file=file_obj.name, title=os.path.basename(file_obj.name))
                    
        for field in url_fields:
            field_name = getattr(field, 'name', '')
            if not field_name:
                continue
            url_str: Any = getattr(instance, field_name, None)
            if is_media_url(url_str):
                url_value: str = str(url_str)
                if not MediaFile.objects.filter(external_url=url_value).exists():
                    name = os.path.basename(url_value.split('?')[0])
                    if not name: name = "External Link"
                    MediaFile.objects.create(external_url=url_value, title=name)
    except Exception as e:
        # Failsafe so saving a model doesn't crash if media sync fails
        pass

