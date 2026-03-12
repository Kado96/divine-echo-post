import os
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from django.core.mail import EmailMessage
from django.conf import settings
from .models import ContactMessage
from .serializers import ContactMessageSerializer
from api.settings.models import SiteSettings

class ContactMessageViewSet(viewsets.ModelViewSet):
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        # Enregistrer le message dans la base de données
        instance = serializer.save()

        # Récupérer les paramètres du site
        try:
            site_settings = SiteSettings.get_settings()
            site_name = site_settings.site_name
            db_email = site_settings.contact_email
        except Exception:
            site_name = "Shalom Ministry"
            db_email = None

        # Déterminer le destinataire (Priorité: Env CONTACT_EMAIL > Paramètres Site > Env DJANGO_SUPERUSER_EMAIL > Env EMAIL_HOST_USER > Défaut)
        recipient_email = os.environ.get('CONTACT_EMAIL') or db_email or os.environ.get('DJANGO_SUPERUSER_EMAIL') or os.environ.get('EMAIL_HOST_USER') or 'contact@shalomministry.org'
        recipient_list = [recipient_email]

        # Préparer l'email
        email_subject = f"Nouveau message de contact - {site_name}: {instance.subject}"
        email_body = (
            f"Vous avez reçu un nouveau message depuis le formulaire de contact de {site_name}.\n\n"
            f"Nom: {instance.name}\n"
            f"Email: {instance.email}\n\n"
            f"Sujet: {instance.subject}\n"
            f"Message:\n{instance.message}\n"
        )

        # Utiliser EmailMessage pour une meilleure délivrabilité (Reply-To)
        # Le "From" doit être l'email authentifié (DEFAULT_FROM_EMAIL) pour éviter le spam
        # Le "Reply-To" permet de répondre directement à l'expéditeur
        try:
            from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', os.environ.get('EMAIL_HOST_USER'))
            
            email = EmailMessage(
                subject=email_subject,
                body=email_body,
                from_email=from_email,
                to=recipient_list,
                reply_to=[instance.email],
            )
            email.send(fail_silently=True)
        except Exception as e:
            print(f"Erreur lors de l'envoi de l'email: {e}")
