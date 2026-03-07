from django.db import models
from django.contrib.auth.models import User

SEXES = (
    ("H", "HOMME"),
    ("F", "FEMME"),
    ("N/A", "NON APPLICABLE")
)

class Account(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='account')
    is_active = models.BooleanField(default=True)
    
    photo = models.ImageField(upload_to='users_photos/', blank=True, null=True)
    
    phone_number = models.CharField(max_length=16, unique=True, null=True)
    otp_code = models.CharField(max_length=5, editable=False, null=True)
    otp_expire_at = models.DateTimeField(blank=True, null=True)   
    email_validated = models.BooleanField(default=False)

    created_at = models.DateField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user}"

    def complete(self):
        return (
            bool(self.phone_number) and
            bool(self.email_validated)
    )