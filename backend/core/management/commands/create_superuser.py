from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
import os

class Command(BaseCommand):
    help = "Create superuser automatically"

    def handle(self, *args, **options):
        User = get_user_model()
        username = os.environ.get("DJANGO_SUPERUSER_USERNAME")
        email = os.environ.get("DJANGO_SUPERUSER_EMAIL")
        password = os.environ.get("DJANGO_SUPERUSER_PASSWORD")

        if not username or not password:
            self.stdout.write("DJANGO_SUPERUSER environment variables not fully set. Skip creation/update.")
            return

        # On utilise get_or_create pour s'assurer qu'un utilisateur existe
        # et on le met à JOUR avec les valeurs des variables d'environnement.
        user, created = User.objects.get_or_create(username=username)
        
        # On force la mise à jour (Pratique pour restaurer l'accès après un sync SQL)
        user.set_password(password)
        if email:
            user.email = email
        user.is_superuser = True
        user.is_staff = True
        user.save()

        if created:
            self.stdout.write(f"CREATION-OK : Admin '{username}' cree avec succes.")
        else:
            self.stdout.write(f"UPDATE-OK   : Admin '{username}' repare (Mot de passe mis a jour).")

