from django.db import models
from django.utils.translation import gettext_lazy as _
import os

class MediaFile(models.Model):
    FILE_TYPE_CHOICES = (
        ('image', _('Image')),
        ('audio', _('Audio')),
        ('video', _('Video')),
        ('document', _('Document')),
        ('other', _('Other')),
    )

    file = models.FileField(upload_to='library/%Y/%m/', null=True, blank=True)
    external_url = models.URLField(max_length=1000, blank=True, null=True, help_text=_('URL of the external media'))
    title = models.CharField(max_length=255, blank=True)
    alt_text = models.CharField(max_length=255, blank=True)
    file_type = models.CharField(max_length=20, choices=FILE_TYPE_CHOICES, default='other')
    file_size = models.BigIntegerField(null=True, blank=True)
    mime_type = models.CharField(max_length=100, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = _('Media File')
        verbose_name_plural = _('Media Files')

    def save(self, *args, **kwargs):
        if self.file and not self.title:
            self.title = os.path.basename(self.file.name)
        elif self.external_url and not self.title:
            name = os.path.basename(self.external_url.split('?')[0])
            self.title = name if name else "External Media"

        if self.file:
            try:
                self.file_size = self.file.size
            except Exception:
                pass
            ext = os.path.splitext(self.file.name)[1].lower()
        elif self.external_url:
            ext = os.path.splitext(self.external_url.split('?')[0])[1].lower()
        else:
            ext = ''
            
        if ext:
            if ext in ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp']:
                self.file_type = 'image'
            elif ext in ['.mp3', '.wav', '.ogg', '.m4a']:
                self.file_type = 'audio'
            elif ext in ['.mp4', '.mov', '.avi', '.mkv', '.webm']:
                self.file_type = 'video'
            elif ext in ['.pdf', '.doc', '.docx', '.txt']:
                self.file_type = 'document'
            else:
                self.file_type = 'other'
        elif self.external_url and ('youtube.com' in self.external_url or 'youtu.be' in self.external_url or 'vimeo.com' in self.external_url):
            self.file_type = 'video'
                
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title or str(self.file) or str(self.external_url)
