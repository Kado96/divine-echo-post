from django.db import models

class Announcement(models.Model):
    PRIORITY_CHOICES = [
        ('basse', 'Basse'),
        ('normale', 'Normale'),
        ('haute', 'Haute'),
    ]

    # Multilingual fields
    title_fr = models.CharField(max_length=255, blank=True, null=True, verbose_name="Titre (FR)")
    title_en = models.CharField(max_length=255, blank=True, null=True, verbose_name="Titre (EN)")
    title_rn = models.CharField(max_length=255, blank=True, null=True, verbose_name="Titre (RN)")
    title_sw = models.CharField(max_length=255, blank=True, null=True, verbose_name="Titre (SW)")
    
    content_fr = models.TextField(blank=True, null=True, verbose_name="Contenu (FR)")
    content_en = models.TextField(blank=True, null=True, verbose_name="Contenu (EN)")
    content_rn = models.TextField(blank=True, null=True, verbose_name="Contenu (RN)")
    content_sw = models.TextField(blank=True, null=True, verbose_name="Contenu (SW)")

    # Keep original fields for backward compatibility or as defaults
    title = models.CharField(max_length=255, blank=True)
    content = models.TextField(blank=True)

    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='normale')
    event_date = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        # Sync old fields with new ones
        if self.title_fr:
            self.title = self.title_fr
        elif self.title:
            self.title_fr = self.title
            
        if self.content_fr:
            self.content = self.content_fr
        elif self.content:
            self.content_fr = self.content
            
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title or self.title_fr or "Annonce sans titre"
