# pyre-ignore-all-errors
"""
Commande Django pour synchroniser les fichiers physiques du dossier media/
vers la table MediaFile de la médiathèque.

Usage :
    python manage.py sync_media          # Synchronise tout
    python manage.py sync_media --dry-run  # Affiche ce qui serait créé sans rien modifier
"""
import os
import mimetypes

from django.core.management.base import BaseCommand
from django.conf import settings

from api.media.models import MediaFile


# Extensions supportées et leur type correspondant
EXTENSION_TYPE_MAP = {
    # Images
    '.jpg': 'image', '.jpeg': 'image', '.png': 'image',
    '.gif': 'image', '.svg': 'image', '.webp': 'image',
    '.bmp': 'image', '.ico': 'image',
    # Audio
    '.mp3': 'audio', '.wav': 'audio', '.ogg': 'audio',
    '.m4a': 'audio', '.flac': 'audio', '.aac': 'audio',
    # Video
    '.mp4': 'video', '.mov': 'video', '.avi': 'video',
    '.mkv': 'video', '.webm': 'video', '.wmv': 'video',
    # Documents
    '.pdf': 'document', '.doc': 'document', '.docx': 'document',
    '.txt': 'document', '.xls': 'document', '.xlsx': 'document',
    '.ppt': 'document', '.pptx': 'document', '.csv': 'document',
}

# Dossiers à ignorer lors du scan
IGNORED_DIRS = {'__pycache__', '.git', 'node_modules', '.thumbs'}


class Command(BaseCommand):
    help = (
        "Scanne le dossier MEDIA_ROOT et crée les entrées MediaFile "
        "manquantes pour chaque fichier trouvé."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            dest='dry_run',
            help="Affiche les fichiers qui seraient importés sans modifier la base.",
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        media_root = settings.MEDIA_ROOT

        if not os.path.isdir(media_root):
            self.stderr.write(self.style.ERROR(
                f"Le dossier MEDIA_ROOT n'existe pas : {media_root}"
            ))
            return

        self.stdout.write(self.style.HTTP_INFO(
            f"📂 Scan du dossier : {media_root}"
        ))
        if dry_run:
            self.stdout.write(self.style.WARNING("⚠️  Mode DRY-RUN activé — aucune modification ne sera effectuée.\n"))

        created_count = 0
        skipped_count = 0
        ignored_count = 0

        for dirpath, dirnames, filenames in os.walk(media_root):
            # Filtrer les dossiers ignorés
            dirnames[:] = [d for d in dirnames if d not in IGNORED_DIRS]

            for filename in filenames:
                full_path = os.path.join(dirpath, filename)
                # Chemin relatif par rapport à MEDIA_ROOT (c'est ce que Django stocke)
                relative_path = os.path.relpath(full_path, media_root).replace('\\', '/')

                # Déterminer le type de fichier
                ext = os.path.splitext(filename)[1].lower()
                file_type = EXTENSION_TYPE_MAP.get(ext)

                if file_type is None:
                    ignored_count += 1
                    self.stdout.write(
                        f"  ⏭️  Ignoré (extension non supportée) : {relative_path}"
                    )
                    continue

                # Vérifier si le fichier existe déjà en base
                if MediaFile.objects.filter(file=relative_path).exists():
                    skipped_count += 1
                    self.stdout.write(
                        f"  ✔️  Déjà en base : {relative_path}"
                    )
                    continue

                # Récupérer la taille et le type MIME
                try:
                    file_size = os.path.getsize(full_path)
                except OSError:
                    file_size = None

                mime_type, _ = mimetypes.guess_type(full_path)
                if not mime_type:
                    mime_type = 'application/octet-stream'

                if dry_run:
                    self.stdout.write(self.style.SUCCESS(
                        f"  🆕 [DRY-RUN] Serait créé : {relative_path} "
                        f"(type={file_type}, taille={self._format_size(file_size)})"
                    ))
                    created_count += 1
                else:
                    MediaFile.objects.create(
                        file=relative_path,
                        title=filename,
                        file_type=file_type,
                        file_size=file_size,
                        mime_type=mime_type or '',
                    )
                    created_count += 1
                    self.stdout.write(self.style.SUCCESS(
                        f"  ✅ Créé : {relative_path} "
                        f"(type={file_type}, taille={self._format_size(file_size)})"
                    ))

        # Résumé
        self.stdout.write("")
        self.stdout.write(self.style.HTTP_INFO("═" * 50))
        self.stdout.write(self.style.HTTP_INFO("📊 RÉSUMÉ DE LA SYNCHRONISATION"))
        self.stdout.write(self.style.HTTP_INFO("═" * 50))
        action = "seraient créés" if dry_run else "créés"
        self.stdout.write(self.style.SUCCESS(f"  🆕 Fichiers {action} : {created_count}"))
        self.stdout.write(f"  ✔️  Fichiers déjà en base : {skipped_count}")
        self.stdout.write(f"  ⏭️  Fichiers ignorés : {ignored_count}")
        self.stdout.write(self.style.HTTP_INFO("═" * 50))

        if dry_run and created_count > 0:
            self.stdout.write(self.style.WARNING(
                "\n💡 Relancez sans --dry-run pour effectuer l'import."
            ))

    @staticmethod
    def _format_size(size_bytes):
        """Formate une taille en octets en format lisible."""
        if size_bytes is None:
            return "?"
        for unit in ['o', 'Ko', 'Mo', 'Go']:
            if abs(size_bytes) < 1024.0:
                return f"{size_bytes:.1f} {unit}"
            size_bytes /= 1024.0
        return f"{size_bytes:.1f} To"
