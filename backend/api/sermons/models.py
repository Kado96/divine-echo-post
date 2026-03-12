from django.contrib.auth.models import User
from django.db import models
from django.utils.text import slugify


class SermonCategory(models.Model):
    id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=100)
    name_fr = models.CharField(max_length=100, null=True, blank=True)
    name_en = models.CharField(max_length=100, null=True, blank=True)
    name_rn = models.CharField(max_length=100, null=True, blank=True)
    name_sw = models.CharField(max_length=100, null=True, blank=True)
    
    slug = models.SlugField(max_length=120, unique=True, blank=True)
    
    description = models.TextField(blank=True)
    description_fr = models.TextField(blank=True, null=True)
    description_en = models.TextField(blank=True, null=True)
    description_rn = models.TextField(blank=True, null=True)
    description_sw = models.TextField(blank=True, null=True)
    icon = models.CharField(max_length=10, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]
        verbose_name_plural = "Sermon categories"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Sermon(models.Model):
    LANGUAGE_CHOICES = (
        ("fr", "Français"),
        ("rn", "Kirundi"),
        ("en", "English"),
        ("sw", "Kiswahili"),
    )

    CONTENT_TYPE_CHOICES = (
        ("video", "Vidéo"),
        ("audio", "Audio"),
        ("youtube", "YouTube"),
    )

    id = models.BigAutoField(primary_key=True)
    category = models.ForeignKey(
        SermonCategory,
        on_delete=models.SET_NULL,
        null=True,
        related_name="sermons",
    )
    content_type = models.CharField(
        max_length=10, choices=CONTENT_TYPE_CHOICES, default="video"
    )
    
    # Multilingual Title
    title = models.CharField(max_length=200, blank=True)
    title_fr = models.CharField(max_length=200, null=True, blank=True)
    title_en = models.CharField(max_length=200, null=True, blank=True)
    title_rn = models.CharField(max_length=200, null=True, blank=True)
    title_sw = models.CharField(max_length=200, null=True, blank=True)
    
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    
    # Multilingual Description
    description = models.TextField(blank=True)
    description_fr = models.TextField(null=True, blank=True)
    description_en = models.TextField(null=True, blank=True)
    description_rn = models.TextField(null=True, blank=True)
    description_sw = models.TextField(null=True, blank=True)
    preacher_name = models.CharField(max_length=120)
    language = models.CharField(max_length=2, choices=LANGUAGE_CHOICES, default="fr")
    duration_minutes = models.PositiveIntegerField(null=True, blank=True)
    video_url = models.URLField(blank=True, help_text="URL YouTube ou lien direct")
    video_file = models.FileField(
        upload_to="sermons/videos/",
        null=True,
        blank=True,
        help_text="Ou télécharger un fichier vidéo",
    )
    audio_url = models.URLField(blank=True, help_text="URL audio")
    audio_file = models.FileField(
        upload_to="sermons/audio/",
        null=True,
        blank=True,
        help_text="Ou télécharger un fichier audio",
    )
    image = models.ImageField(upload_to="sermons/", null=True, blank=True)
    featured = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    sermon_date = models.DateField(auto_now=False, null=True, blank=True)
    views_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-sermon_date", "-created_at"]

    def save(self, *args, **kwargs):
        if self.title_fr and not self.title:
            self.title = self.title_fr
        elif self.title and not self.title_fr:
            self.title_fr = self.title
            
        if not self.slug:
            self.slug = slugify(self.title or self.title_fr or "sermon")
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title
