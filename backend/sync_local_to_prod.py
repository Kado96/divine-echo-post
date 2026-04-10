# pyre-ignore-all-errors
"""
⛪ Shalom Ministry Connect - Script de Synchronisation (Upload S3 Inclus)
SQLite (Local) ➔ Supabase (Production)

Ce script transfert vos données locales vers le site en production.
Il gère automatiquement l'envoi des images/médias locaux vers Supabase Storage (S3).
Utilisation: python sync_local_to_prod.py [--dry-run]
"""

import os
import sys
import django
import argparse
import logging
from django.db import transaction, connections
from django.conf import settings
import dj_database_url
from urllib.parse import unquote

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger(__name__)

def load_env_file():
    dotenv_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env')
    if os.path.exists(dotenv_path):
        with open(dotenv_path, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith('#'): continue
                if '=' in line:
                    key, value = line.split('=', 1)
                    value = value.strip('"').strip("'")
                    os.environ.setdefault(key.strip(), value.strip())

load_env_file()

# Initialisation Django
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'shalomministry.settings')

prod_db_url = os.environ.get('DATABASE_URL')
if not prod_db_url:
    print("❌ ERREUR: DATABASE_URL n'est pas défini dans votre fichier .env.")
    sys.exit(1)

# On force la lecture locale au démarrage
os.environ['USE_LOCAL_SQLITE'] = 'True'
django.setup()

# Modèles spécifiques au projet Shalom Ministry
from django.contrib.auth.models import User
from api.accounts.models import Account
from api.settings.models import SiteSettings
from api.announcements.models import Announcement
from api.testimonials.models import Testimonial
from api.sermons.models import SermonCategory, Sermon
from api.contacts.models import ContactMessage
from api.media.models import MediaFile

class ShalomSync:

    def _setup_prod_db(self):
        db_config_prod = dj_database_url.parse(prod_db_url, ssl_require=True)
        db_config_prod['PASSWORD'] = unquote(db_config_prod['PASSWORD'])
        
        new_config = settings.DATABASES['default'].copy()
        new_config.update(db_config_prod)
        settings.DATABASES['prod'] = new_config
        
        try:
            with connections['prod'].cursor() as cursor:
                cursor.execute("SELECT 1")
            logger.info("✅ Connexion à Supabase (Production) réussie.")
        except Exception as e:
            logger.error(f"❌ Impossible de se connecter à Supabase: {e}")
            sys.exit(1)

    def _prepare_data(self, instance):
        data = {}
        for field in instance._meta.fields:
            if field.name == 'id': continue
            try:
                val = getattr(instance, field.name)
                if field.is_relation and val:
                    data[f"{field.name}_id"] = val.id
                elif hasattr(val, 'url'):
                    try:
                        if val and hasattr(val, 'name') and val.name:
                            # ON UPLOAD SUR S3 VOLONTAIREMENT
                            from api.utils.storage import CleanS3Boto3Storage
                            prod_storage = CleanS3Boto3Storage()
                            try:
                                if val.storage.exists(val.name):
                                    if not prod_storage.exists(val.name):
                                        logger.info(f"    [FILE] Uploading {val.name} to S3...")
                                        with val.open('rb') as f:
                                            prod_storage.save(val.name, f)
                                else:
                                    logger.warning(f"    ⚠️ Manquant en local : {val.name}")
                            except Exception as file_err:
                                logger.warning(f"    ⚠️ Erreur S3 sur {field.name}: {file_err}")
                            data[field.name] = val.name
                        else:
                            data[field.name] = None
                    except (ValueError, AttributeError):
                        data[field.name] = None
                else:
                    data[field.name] = val
            except Exception as e:
                data[field.name] = None
        return data

    def __init__(self, dry_run=False):
        self.dry_run = dry_run
        self.stats = {'created': 0, 'updated': 0, 'errors': 0}
        self.id_map = {}
        self._setup_prod_db()

    def _get_natural_query(self, model_class, item):
        if model_class == User: return {'username': item.username}
        if model_class == Account: return {'user_id': self.id_map.get('User', {}).get(item.user_id, item.user_id)}
        if model_class == SiteSettings: return {'id': 1}
        if model_class == SermonCategory: return {'name': getattr(item, 'name')} if hasattr(item, 'name') else None
        if model_class == Sermon: return {'title': getattr(item, 'title')} if hasattr(item, 'title') else None
        if model_class == Announcement: return {'title': getattr(item, 'title')} if hasattr(item, 'title') else None
        if model_class == Testimonial: return {'author': getattr(item, 'author')} if hasattr(item, 'author') else None
        if model_class == ContactMessage: return {'email': getattr(item, 'email')} if hasattr(item, 'email') else None
        if model_class == MediaFile: return {'file': getattr(item, 'file')} if hasattr(item, 'file') else None
        return None

    def sync_model(self, model_class, name):
        logger.info(f"--- Synchronisation: {name} ---")
        model_name = model_class.__name__
        self.id_map[model_name] = {}
        local_items = model_class.objects.using('default').all()
        
        for item in local_items:
            data = self._prepare_data(item)
            for field in model_class._meta.fields:
                if field.is_relation:
                    for key in [field.name, f"{field.name}_id"]:
                        if key in data and data[key]:
                            rel_name = field.related_model.__name__
                            local_id = data[key]
                            if rel_name in self.id_map and local_id in self.id_map[rel_name]:
                                data[key] = self.id_map[rel_name][local_id]

            try:
                with transaction.atomic(using='prod'):
                    query = model_class.objects.using('prod').filter(id=item.id)
                    if not query.exists() and hasattr(item, 'slug') and item.slug:
                        query = model_class.objects.using('prod').filter(slug=item.slug)
                    if not query.exists():
                        nat_query = self._get_natural_query(model_class, item)
                        if nat_query and all(v is not None for v in nat_query.values()):
                            query = model_class.objects.using('prod').filter(**nat_query)

                    if query.exists():
                        prod_id = query.first().id
                        if not self.dry_run:
                            if 'id' in data: del data['id'] 
                            query.update(**data)
                            self.stats['updated'] += 1
                            logger.info(f"  [UPD] '{item}' mis à jour.")
                        self.id_map[model_name][item.id] = prod_id
                    else:
                        if not self.dry_run:
                            if model_class.objects.using('prod').filter(id=item.id).exists():
                                if 'id' in data: del data['id']
                            new_obj = model_class.objects.using('prod').create(**data)
                            self.stats['created'] += 1
                            logger.info(f"  [NEW] '{item}' créé.")
                            self.id_map[model_name][item.id] = new_obj.id
                        else:
                            self.id_map[model_name][item.id] = item.id
            except Exception as e:
                logger.error(f"  ❌ Erreur sur '{item}': {e}")
                self.stats['errors'] += 1

    def run(self):
        logger.info(f"{'⚠️ MODE SIMULATION' if self.dry_run else '🚀 MODE RÉEL'}")
        
        try:
            # On désactive la synchronisation des utilisateurs et comptes pour préserver les identités de production
            # self.sync_model(User, "Utilisateurs")
            # self.sync_model(Account, "Profils")
            self.sync_model(SiteSettings, "Paramètres Site")
            self.sync_model(MediaFile, "Médias (Fichiers)")
            self.sync_model(SermonCategory, "Catégories")
            self.sync_model(Testimonial, "Témoignages")
            self.sync_model(Announcement, "Actualités/Annonces")
            self.sync_model(Sermon, "Sermons (Émissions)")
            self.sync_model(ContactMessage, "Messages")
            
            logger.info("\n" + "="*30)
            logger.info(f"RÉSULTAT: {self.stats['created']} créés, {self.stats['updated']} up, {self.stats['errors']} errs.")
        except Exception as e:
            logger.error(f"❌ Erreur critique : {e}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('--dry-run', action='store_true', help='Simulation')
    args = parser.parse_args()
    ShalomSync(args.dry_run).run()
