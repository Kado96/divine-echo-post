from django.db import models
from django.contrib.auth.models import User

SEXES = (
    ("H", "HOMME"),
    ("F", "FEMME"),
    ("N/A", "NON APPLICABLE")
)

ROLE_CHOICES = (
    ("team", "Éditeur"),
    ("admin", "Administrateur"),
)

class Account(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='account')
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default="team")
    is_active = models.BooleanField(default=True)
    
    photo = models.ImageField(upload_to='users_photos/', blank=True, null=True)
    banner = models.ImageField(upload_to='users_banners/', blank=True, null=True)
    
    phone_number = models.CharField(max_length=16, unique=True, null=True)
    otp_code = models.CharField(max_length=5, editable=False, null=True)
    otp_expire_at = models.DateTimeField(blank=True, null=True)   
    email_validated = models.BooleanField(default=False)
    
    is_banned = models.BooleanField(default=False)
    deactivated_at = models.DateTimeField(blank=True, null=True)

    created_at = models.DateField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    from simple_history.models import HistoricalRecords
    history = HistoricalRecords()

    def __str__(self):
        return f"{self.user}"

    def complete(self):
        return (
            bool(self.phone_number) and
            bool(self.email_validated)
    )