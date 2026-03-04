from django.db import models

class Testimonial(models.Model):
    STATUS_CHOICES = (
        ('Nouveau', 'Nouveau'),
        ('Vérifié', 'Vérifié'),
    )
    
    LANGUAGE_CHOICES = (
        ("fr", "Français"),
        ("rn", "Kirundi"),
        ("en", "English"),
        ("sw", "Kiswahili"),
    )

    author = models.CharField(max_length=255)
    content = models.TextField()
    rating = models.IntegerField(default=5)
    language = models.CharField(max_length=2, choices=LANGUAGE_CHOICES, default="fr")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Nouveau')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Témoignage de {self.author}"

    class Meta:
        ordering = ['-created_at']
