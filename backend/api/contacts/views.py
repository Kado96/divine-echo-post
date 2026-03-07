from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from django.core.mail import send_mail
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

        # Récupérer l'email de contact depuis les paramètres du site
        try:
            site_settings = SiteSettings.get_settings()
            recipient_list = [site_settings.contact_email] if site_settings.contact_email else ['contact@shalomministry.org']
            site_name = site_settings.site_name
        except Exception:
            recipient_list = ['contact@shalomministry.org']
            site_name = "Shalom Ministry"

        # Envoyer l'email
        email_subject = f"Nouveau message de contact - {site_name}: {instance.subject}"
        email_message = f"Vous avez reçu un nouveau message depuis le formulaire de contact de {site_name}.\n\n"
        email_message += f"Nom: {instance.name}\n"
        email_message += f"Email: {instance.email}\n\n"
        email_message += f"Sujet: {instance.subject}\n"
        email_message += f"Message:\n{instance.message}\n"

        try:
            send_mail(
                email_subject,
                email_message,
                settings.DEFAULT_FROM_EMAIL if hasattr(settings, 'DEFAULT_FROM_EMAIL') else instance.email,
                recipient_list,
                fail_silently=True,
            )
        except Exception as e:
            # On log l'erreur mais on ne bloque pas la réponse API
            print(f"Erreur lors de l'envoi de l'email: {e}")
