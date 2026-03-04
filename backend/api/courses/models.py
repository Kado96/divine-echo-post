from django.contrib.auth.models import User
from django.db import models
from django.utils.text import slugify


class CourseCategory(models.Model):
    id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=120, unique=True, blank=True)
    icon = models.CharField(max_length=10, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]
        verbose_name_plural = "Course categories"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Course(models.Model):
    LANGUAGE_CHOICES = (
        ("fr", "Français"),
        ("rn", "Kirundi"),
        ("en", "English"),
    )
    DIFFICULTY_CHOICES = (
        ("easy", "Débutant"),
        ("intermediate", "Intermédiaire"),
        ("advanced", "Avancé"),
    )

    id = models.BigAutoField(primary_key=True)
    category = models.ForeignKey(
        CourseCategory,
        on_delete=models.SET_NULL,
        null=True,
        related_name="courses",
    )
    title = models.CharField(max_length=150)
    slug = models.SlugField(max_length=160, unique=True, blank=True)
    description = models.TextField()
    language = models.CharField(max_length=2, choices=LANGUAGE_CHOICES)
    difficulty = models.CharField(max_length=12, choices=DIFFICULTY_CHOICES, blank=True, null=True)
    duration_display = models.CharField(max_length=50, blank=True)
    lessons_count = models.PositiveIntegerField(default=0)
    students_count = models.PositiveIntegerField(default=0)
    instructor_name = models.CharField(max_length=120)
    image = models.ImageField(upload_to="courses/", null=True, blank=True)
    audio_url = models.URLField(blank=True, null=True, help_text="Lien vers un fichier audio ou podcast")
    audio_file = models.FileField(upload_to="courses/audio/", null=True, blank=True, help_text="Ou télécharger un fichier audio")
    video_url = models.URLField(blank=True, null=True, help_text="Lien YouTube ou vidéo externe")
    video_file = models.FileField(upload_to="courses/videos/", null=True, blank=True, help_text="Ou télécharger un fichier vidéo")
    youtube_url = models.URLField(blank=True, null=True, help_text="Lien YouTube spécifique (embed)")
    featured = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class Lesson(models.Model):
    id = models.BigAutoField(primary_key=True)
    course = models.ForeignKey(
        Course, on_delete=models.CASCADE, related_name="lessons"
    )
    title = models.CharField(max_length=150)
    order = models.PositiveIntegerField(default=1)
    duration_minutes = models.PositiveIntegerField(null=True, blank=True)
    video_url = models.URLField(blank=True, help_text="URL YouTube ou lien direct")
    video_file = models.FileField(upload_to="lessons/videos/", null=True, blank=True, help_text="Ou télécharger un fichier vidéo")
    content = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["order", "id"]
        unique_together = ("course", "order")

    def __str__(self):
        return f"{self.course.title} - {self.title}"


class Enrollment(models.Model):
    STATUS_CHOICES = (
        ("active", "Active"),
        ("completed", "Terminé"),
    )
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="enrollments"
    )
    course = models.ForeignKey(
        Course, on_delete=models.CASCADE, related_name="enrollments"
    )
    status = models.CharField(
        max_length=12, choices=STATUS_CHOICES, default="active"
    )
    progress = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        unique_together = ("user", "course")

    def __str__(self):
        return f"{self.user} -> {self.course}"


class LessonProgress(models.Model):
    id = models.BigAutoField(primary_key=True)
    enrollment = models.ForeignKey(
        Enrollment, on_delete=models.CASCADE, related_name="lesson_progress"
    )
    lesson = models.ForeignKey(
        Lesson, on_delete=models.CASCADE, related_name="progress_entries"
    )
    completed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("enrollment", "lesson")

    def __str__(self):
        return f"{self.enrollment} - {self.lesson}"


class Favorite(models.Model):
    """Modèle pour les favoris (émissions et prédications)"""
    CONTENT_TYPE_CHOICES = (
        ('course', 'Émission'),
        ('sermon', 'Prédication'),
    )
    
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="favorites"
    )
    content_type = models.CharField(max_length=10, choices=CONTENT_TYPE_CHOICES)
    content_id = models.PositiveIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        unique_together = ("user", "content_type", "content_id")
        indexes = [
            models.Index(fields=["user", "content_type", "content_id"]),
        ]

    def __str__(self):
        return f"{self.user} - {self.content_type} #{self.content_id}"