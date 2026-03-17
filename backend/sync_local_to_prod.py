# pyre-ignore-all-errors
"""
Script de synchronisation "PLATEFORME ÉMISSIONS UNIQUEMENT"
Synchronise les données de SQLite (local) vers Supabase (production)

🎯 Objectif :
    Transformer le projet en plateforme d'émissions pure en ignorant les modules Shops et Courses.
    Permet de réinitialiser la production pour faire correspondre les IDs locaux (commençant à 1).

📋 Utilisation :
    python sync_local_to_prod.py [--dry-run] [--confirm] [--reset]
"""

import os
import sys
import django  # type: ignore
import argparse
from pathlib import Path
from typing import Dict, Any, Optional, List, Union
from django.db import transaction, connections  # type: ignore
from django.conf import settings  # type: ignore
from django.core.exceptions import ObjectDoesNotExist  # type: ignore
from urllib.parse import unquote
import socket
import dj_database_url  # type: ignore
import logging

# Configuration du logging
import io
if sys.stdout.encoding != 'utf-8':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('sync_log.txt', encoding='utf-8')
    ]
)
logger = logging.getLogger(__name__)

# Configuration Django
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'shalomministry.settings')

def load_env_for_sync():
    env_path = Path(__file__).parent / '.env'
    if env_path.exists():
        with open(env_path, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith('#'): continue
                if '=' in line:
                    key, value = line.split('=', 1)
                    key = key.strip()
                    value = value.strip().strip('"').strip("'")
                    if key == 'DATABASE_URL' and not os.environ.get(key):
                        os.environ[key] = value

load_env_for_sync()
original_database_url = os.environ.get('DATABASE_URL')
if original_database_url:
    os.environ.pop('DATABASE_URL', None)

django.setup()

# Import des modèles RESTANTS (Émissions uniquement)
from django.contrib.auth.models import User  # type: ignore
from api.accounts.models import Account  # type: ignore
from api.sermons.models import SermonCategory, Sermon  # type: ignore
from api.settings.models import SiteSettings  # type: ignore
from api.announcements.models import Announcement  # type: ignore
from api.testimonials.models import Testimonial  # type: ignore
from api.contacts.models import ContactMessage  # type: ignore
from api.media.models import MediaFile  # type: ignore

class DatabaseSync:
    def __init__(self, dry_run: bool = False, confirm: bool = False, reset: bool = False):
        self.dry_run = dry_run
        self.confirm = confirm
        self.reset = reset
        self.stats = {'created': 0, 'updated': 0, 'skipped': 0, 'errors': 0}
        
        self.prod_db_url = original_database_url or ''
        if not self.prod_db_url:
            raise ValueError("❌ DATABASE_URL n'est pas défini dans le fichier .env")
        
        self._setup_prod_database()

    def _setup_prod_database(self):
        if 'prod' not in settings.DATABASES:
            config = dj_database_url.parse(self.prod_db_url, ssl_require=True)
            config.update({
                'CONN_MAX_AGE': 0,
                'AUTOCOMMIT': True,
                'TIME_ZONE': settings.TIME_ZONE,
            })
            settings.DATABASES['prod'] = config

    def _prepare_model_data(self, instance) -> Dict[str, Any]:
        data = {}
        for field in instance._meta.fields:
            if field.name in ['id']: continue
            
            if isinstance(field, django.db.models.ForeignKey):
                related_obj = getattr(instance, field.name, None)
                data[field.name + '_id'] = related_obj.id if related_obj else None
            else:
                value = getattr(instance, field.name)
                # Spécial pour les ImageField/FileField : on ne synchronise que si c'est pas binaire
                if isinstance(field, (django.db.models.FileField, django.db.models.ImageField)):
                    data[field.name] = value.name if value else None
                else:
                    data[field.name] = value
        return data

    def _sync_model(self, model_class, model_name: str) -> None:
        logger.info(f"\n📦 Synchronisation: {model_name}")
        
        local_items = list(model_class.objects.using('default').all())
        prod_items = {item.id: item for item in model_class.objects.using('prod').all()}
        
        logger.info(f"   Local: {len(local_items)} | Production: {len(prod_items)}")
        
        for local_item in local_items:
            try:
                data = self._prepare_model_data(local_item)
                if local_item.id in prod_items:
                    prod_item = prod_items[local_item.id]
                    needs_update = False
                    for key, value in data.items():
                        if getattr(prod_item, key, None) != value:
                            needs_update = True
                            break
                    
                    if needs_update and not self.dry_run:
                        for key, value in data.items():
                            setattr(prod_item, key, value)
                        prod_item.save(using='prod')
                        self.stats['updated'] += 1
                        logger.info(f"   ✅ Mis à jour ID {local_item.id}")
                    else:
                        self.stats['skipped'] += 1
                else:
                    if not self.dry_run:
                        data['id'] = local_item.id
                        model_class.objects.using('prod').create(**data)
                        self.stats['created'] += 1
                        logger.info(f"   ✅ Créé ID {local_item.id}")
            except Exception as e:
                self.stats['errors'] += 1
                logger.error(f"   ❌ Erreur ID {local_item.id}: {e}")

    def reset_production(self):
        """Vide les tables en production dans le bon ordre"""
        if not self.reset or self.dry_run:
            return
            
        logger.warning("\n⚠️ RÉINITIALISATION DE LA PRODUCTION (RESET)...")
        tables = [
            'api.accounts.models.Account',
            'api.sermons.models.Sermon',
            'api.sermons.models.SermonCategory',
            'api.announcements.models.Announcement',
            'api.testimonials.models.Testimonial',
            'api.contacts.models.ContactMessage',
            'api.media.models.MediaFile',
            'django.contrib.auth.models.User'
        ]
        
        for model_path in reversed(tables): # Inverser pour respecter les FK
            try:
                # Import dynamique pour le reset
                mod_name, class_name = model_path.rsplit('.', 1)
                mod = __import__(mod_name, fromlist=[class_name])
                model = getattr(mod, class_name)
                count = model.objects.using('prod').count()
                model.objects.using('prod').all().delete()
                logger.info(f"   🗑️ Purge {class_name}: {count} éléments supprimés.")
            except Exception as e:
                logger.error(f"   ❌ Erreur lors de la purge de {model_path}: {e}")

    def sync_all(self):
        if self.confirm:
            ans = input(f"⚠️ Confirmer la synchronisation vers {self.prod_db_url}? (oui/non): ")
            if ans.lower() != 'oui': return

        if self.reset:
            self.reset_production()

        # Ordre de synchronisation
        self._sync_model(User, "User")
        self._sync_model(Account, "Account")
        self._sync_model(SermonCategory, "Catégories Sermons")
        self._sync_model(Sermon, "Sermons")
        self._sync_model(Announcement, "Annonces")
        self._sync_model(Testimonial, "Témoignages")
        self._sync_model(ContactMessage, "Messages Contact")
        self._sync_model(MediaFile, "Fichiers Média")

        # Paramètres (Singleton)
        logger.info("\n⚙️  Paramètres du site...")
        try:
            local = SiteSettings.objects.using('default').get(pk=1)
            data = self._prepare_model_data(local)
            if not self.dry_run:
                SiteSettings.objects.using('prod').update_or_create(id=1, defaults=data)
                logger.info("   ✅ Mis à jour.")
        except:
            logger.warning("   ⚠️ Aucun paramètre en local.")

        logger.info(f"\n✨ TERMINÉ | Créés: {self.stats['created']} | Mis à jour: {self.stats['updated']} | Erreurs: {self.stats['errors']}")

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--dry-run', action='store_true')
    parser.add_argument('--confirm', action='store_true')
    parser.add_argument('--reset', action='store_true', help='Vide la prod avant de synchroniser')
    args = parser.parse_args()
    
    sync = DatabaseSync(dry_run=args.dry_run, confirm=args.confirm, reset=args.reset)
    sync.sync_all()

if __name__ == '__main__':
    main()
