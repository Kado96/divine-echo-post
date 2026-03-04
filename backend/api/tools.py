# type: ignore[reportMissingImports]
from django.core.mail import send_mail  # pyright: ignore[reportMissingImports]
from django.template.loader import render_to_string  # pyright: ignore[reportMissingImports]
from django.utils.html import strip_tags  # pyright: ignore[reportMissingImports]

def send_custom_email(mail_data,template):
    # Charger le template et le rendre avec le contexte
    if template == "reset_password.html":
        context = {
            'password': mail_data['password'],
        }
    elif template == "account_creation_otp.html":
        context = {
            'otp': mail_data['otp'],
        }
    html_message = render_to_string(template, context)
    plain_message = strip_tags(html_message)
    to = mail_data['email']

    # Envoi du mail
    send_mail(
        subject='Shalom Ministry',
        message=plain_message,
        from_email=None,
        recipient_list=[to] if isinstance(to, str) else to,
        html_message=html_message, 
        fail_silently=False
    )
