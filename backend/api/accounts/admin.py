"""
⚠️ IMPORTANT : Admin Django réservé à la gestion système uniquement

Pour toutes les opérations normales (CRUD), utilisez l'API REST :
- Frontend : /api/accounts/accounts/ (lecture/modification de son propre compte)
- Administration : /api/accounts/users/, /api/accounts/accounts/ (CRUD complet)

L'admin Django (/admin/) est uniquement pour :
- Gestion système avancée
- Débogage
- Super-admin uniquement

Toutes les opérations utilisateur doivent passer par l'API.
"""
from django.contrib import admin
from simple_history.admin import SimpleHistoryAdmin
from .models import Account


@admin.register(Account)
class AccountAdmin(SimpleHistoryAdmin):
    list_display = ('user', 'role', 'is_active', 'is_banned', 'created_at')
    list_filter = ('role', 'is_active', 'is_banned')
    search_fields = ('user__username', 'user__email', 'phone_number')
    autocomplete_fields = ['user']
    
    fieldsets = (
        ("Utilisateur", {
            "fields": ("user", "role", "photo", "banner")
        }),
        ("Statut", {
            "fields": ("is_active", "is_banned", "deactivated_at")
        }),
        ("Contact & OTP", {
            "fields": ("phone_number", "email_validated", "otp_code", "otp_expire_at"),
            "classes": ("collapse",),
        }),
    )