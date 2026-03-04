"""
Script de synchronisation manuelle des données de SQLite (local) vers Supabase (production)

🎯 Objectif :
    Synchroniser les données du développement local (SQLite) vers la production (Supabase/PostgreSQL)
    sans modifier le comportement existant du projet.

⚠️ Contraintes :
    - Ne supprime JAMAIS de données en production
    - Ne synchronise PAS les fichiers binaires (seulement les URLs)
    - Respecte les IDs existants
    - Utilise des transactions pour la sécurité
    - Gère les relations dans le bon ordre

📋 Utilisation :
    python sync_local_to_prod.py [--dry-run] [--confirm]

    --dry-run    : Mode simulation (affiche ce qui serait fait sans modifier)
    --confirm    : Confirmation explicite requise avant synchronisation
"""

import os
import sys
import django
import argparse
from pathlib import Path
from typing import Dict, Any, Optional
from django.db import transaction, connections
from django.conf import settings
from django.core.exceptions import ObjectDoesNotExist
from urllib.parse import unquote
import socket
import dj_database_url
import logging

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('sync_log.txt', encoding='utf-8')
    ]
)
logger = logging.getLogger(__name__)

# Configuration Django pour la base locale (SQLite)
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'shalomministry.settings')

# Sauvegarder DATABASE_URL si défini (pour ne pas interférer avec la config locale)
original_database_url = os.environ.get('DATABASE_URL')
if original_database_url:
    # Retirer temporairement pour que Django utilise SQLite
    del os.environ['DATABASE_URL']

django.setup()

# Maintenant configurer les deux bases : 'local' (SQLite) et 'prod' (PostgreSQL)
from django.conf import settings as django_settings

# Base locale (SQLite) - déjà configurée par settings.py
# On va ajouter une configuration 'prod' pour PostgreSQL

# Import des modèles
from django.contrib.auth.models import User, Group, Permission
from api.accounts.models import Account
from api.courses.models import (
    CourseCategory, Course, Lesson, Enrollment, LessonProgress, Favorite
)
from api.sermons.models import SermonCategory, Sermon
from api.settings.models import SiteSettings
from api.shops.models import (
    Shop, ControlFrequency, Category, SubCategory, BasicProduct,
    Product, SalePriceHistory, Supply, Sales, History, PublicProduct
)


class DatabaseSync:
    """
    Classe principale pour la synchronisation des données
    """
    
    def __init__(self, dry_run: bool = False, confirm: bool = False):
        self.dry_run = dry_run
        self.confirm = confirm
        self.stats = {
            'created': 0,
            'updated': 0,
            'skipped': 0,
            'errors': 0
        }
        
        # Vérifier que DATABASE_URL est défini pour la production
        self.prod_db_url = original_database_url
        if not self.prod_db_url:
            raise ValueError(
                "❌ DATABASE_URL n'est pas défini.\n"
                "Définissez la variable d'environnement DATABASE_URL avec l'URL Supabase.\n"
                "Exemple PowerShell: $env:DATABASE_URL = 'postgresql://postgres.eiokoxdmgxxyexmqfsua:VOTRE_MOT_DE_PASSE@aws-1-eu-central-1.pooler.supabase.com:5432/postgres?sslmode=require'\n"
                "Exemple Bash: export DATABASE_URL='postgresql://postgres.eiokoxdmgxxyexmqfsua:VOTRE_MOT_DE_PASSE@aws-1-eu-central-1.pooler.supabase.com:5432/postgres?sslmode=require'"
            )
        
        # Vérifier que ce n'est pas un placeholder
        if 'xxxx' in self.prod_db_url.lower() or 'example' in self.prod_db_url.lower():
            raise ValueError(
                "❌ DATABASE_URL contient un placeholder (xxxx ou example).\n"
                "Vous devez utiliser votre vraie URL Supabase.\n"
                "Pour obtenir votre URL Supabase:\n"
                "1. Allez sur https://app.supabase.com\n"
                "2. Sélectionnez votre projet\n"
                "3. Allez dans Settings > Database\n"
                "4. Copiez la 'Connection string' (URI mode)\n"
                "5. Remplacez [YOUR-PASSWORD] par votre mot de passe\n"
                f"URL actuelle (invalide): {self.prod_db_url[:50]}..."
            )
        
        # Configurer la base de production
        self._setup_prod_database()
        
        logger.info("=" * 80)
        logger.info("🔄 SYNC LOCAL → PRODUCTION")
        logger.info("=" * 80)
        logger.info(f"Mode: {'DRY-RUN (simulation)' if dry_run else 'SYNCHRONISATION RÉELLE'}")
        logger.info(f"Base locale: SQLite ({settings.DATABASES['default']['NAME']})")
        logger.info(f"Base production: PostgreSQL (Supabase)")
        logger.info("=" * 80)
    
    def _resolve_ipv4(self, hostname):
        """Résout un hostname en adresse IPv4 si possible"""
        if not hostname:
            return hostname
        
        try:
            socket.inet_aton(hostname)
            return hostname
        except socket.error:
            pass
        
        try:
            addr_info = socket.getaddrinfo(hostname, None, socket.AF_INET, socket.SOCK_STREAM)
            if addr_info:
                return addr_info[0][4][0]
        except (socket.gaierror, OSError):
            pass
        
        return hostname
    
    def _setup_prod_database(self):
        """Configure la connexion à la base de production"""
        # Parser DATABASE_URL
        db_config = dj_database_url.parse(
            self.prod_db_url,
            conn_max_age=0,
            ssl_require=True,
        )
        
        # Décoder le mot de passe et l'utilisateur
        if 'PASSWORD' in db_config and db_config['PASSWORD']:
            db_config['PASSWORD'] = unquote(db_config['PASSWORD'])
        
        # S'assurer que l'utilisateur est correctement décodé (important pour Supabase pooler)
        if 'USER' in db_config and db_config['USER']:
            # Le nom d'utilisateur peut contenir des points (ex: postgres.eiokoxdmgxxyexmqfsua)
            # urlparse.unquote devrait déjà le gérer, mais on s'assure qu'il est correct
            db_config['USER'] = unquote(db_config['USER'])
            logger.debug(f"Utilisateur de la base de données: {db_config['USER']}")
        
        # Résoudre IPv4 si nécessaire
        if 'HOST' in db_config and db_config['HOST']:
            resolved_host = self._resolve_ipv4(db_config['HOST'])
            if resolved_host != db_config['HOST'] and '.' in resolved_host:
                db_config['HOSTADDR'] = resolved_host
            else:
                db_config['HOST'] = resolved_host
        
        # Options de connexion
        db_config['OPTIONS'] = db_config.get('OPTIONS', {})
        db_config['OPTIONS'].update({
            'connect_timeout': 30,  # Augmenté à 30 secondes pour les connexions lentes
            'options': '-c statement_timeout=30000',
        })
        
        # Copier la configuration de la base 'default' pour avoir toutes les clés nécessaires
        # et remplacer par les valeurs de production
        default_config = settings.DATABASES['default'].copy()
        default_config.update(db_config)
        
        # S'assurer que toutes les clés nécessaires sont présentes
        # Ces clés sont vérifiées par Django lors de la connexion
        if 'TIME_ZONE' not in default_config:
            default_config['TIME_ZONE'] = settings.TIME_ZONE
        if 'USE_TZ' not in default_config:
            default_config['USE_TZ'] = settings.USE_TZ
        if 'ATOMIC_REQUESTS' not in default_config:
            default_config['ATOMIC_REQUESTS'] = False
        if 'AUTOCOMMIT' not in default_config:
            default_config['AUTOCOMMIT'] = True
        if 'CONN_MAX_AGE' not in default_config:
            default_config['CONN_MAX_AGE'] = 0
        
        # Ajouter la configuration 'prod' aux DATABASES
        settings.DATABASES['prod'] = default_config
        
        # Log de débogage (masquer le mot de passe)
        logger.debug(f"Configuration de la base de production:")
        logger.debug(f"  HOST: {default_config.get('HOST', 'NON DÉFINI')}")
        logger.debug(f"  PORT: {default_config.get('PORT', 'NON DÉFINI')}")
        logger.debug(f"  USER: {default_config.get('USER', 'NON DÉFINI')}")
        logger.debug(f"  NAME: {default_config.get('NAME', 'NON DÉFINI')}")
        logger.debug(f"  PASSWORD: {'***' if default_config.get('PASSWORD') else 'NON DÉFINI'}")
        
        # Tester la connexion
        try:
            with connections['prod'].cursor() as cursor:
                cursor.execute("SELECT 1")
            logger.info("✅ Connexion à la base de production réussie")
        except Exception as e:
            error_msg = str(e)
            logger.error(f"❌ Erreur de connexion à la base de production: {error_msg}")
            
            # Messages d'aide selon le type d'erreur
            if "could not translate host name" in error_msg or "Name or service not known" in error_msg:
                logger.error("")
                logger.error("💡 PROBLÈME: Le hostname de la base de données ne peut pas être résolu.")
                logger.error("   Causes possibles:")
                logger.error("   1. L'URL DATABASE_URL contient un placeholder (ex: 'xxxx')")
                logger.error("   2. Le hostname est incorrect")
                logger.error("   3. Problème de connexion réseau")
                logger.error("")
                logger.error("   SOLUTION:")
                logger.error("   1. Vérifiez que DATABASE_URL contient votre vraie URL Supabase")
                logger.error("   2. Format attendu: postgresql://postgres.eiokoxdmgxxyexmqfsua:VOTRE_MOT_DE_PASSE@aws-1-eu-central-1.pooler.supabase.com:5432/postgres?sslmode=require")
                logger.error("   3. Remplacez VOTRE_MOT_DE_PASSE par votre mot de passe réel")
                logger.error(f"   4. URL actuelle (masquée): {self.prod_db_url.split('@')[0] if '@' in self.prod_db_url else self.prod_db_url[:50]}@...")
            elif "password authentication failed" in error_msg.lower():
                logger.error("")
                logger.error("💡 PROBLÈME: Authentification échouée.")
                logger.error("   Causes possibles:")
                logger.error("   1. Le mot de passe dans DATABASE_URL est incorrect")
                logger.error("   2. Le nom d'utilisateur est incorrect (doit être: postgres.eiokoxdmgxxyexmqfsua)")
                logger.error("   3. Le mot de passe n'est pas correctement encodé en URL")
                logger.error("")
                logger.error("   SOLUTION:")
                logger.error("   1. Vérifiez que votre URL contient: postgres.eiokoxdmgxxyexmqfsua (pas juste 'postgres')")
                logger.error("   2. Vérifiez que le mot de passe est correctement encodé (ex: @ devient %40)")
                logger.error("   3. Format attendu: postgresql://postgres.eiokoxdmgxxyexmqfsua:VOTRE_MOT_DE_PASSE@aws-1-eu-central-1.pooler.supabase.com:5432/postgres?sslmode=require")
                if 'USER' in settings.DATABASES.get('prod', {}):
                    logger.error(f"   4. Utilisateur actuellement utilisé: {settings.DATABASES['prod'].get('USER', 'NON DÉFINI')}")
                logger.error(f"   5. URL actuelle (masquée): {self.prod_db_url.split('@')[0] if '@' in self.prod_db_url else self.prod_db_url[:80]}@...")
            elif "connection refused" in error_msg.lower() or "timeout" in error_msg.lower() or "timeout expired" in error_msg.lower():
                logger.error("")
                logger.error("💡 PROBLÈME: Timeout de connexion ou connexion refusée.")
                logger.error("   Causes possibles:")
                logger.error("   1. Problème de connexion internet (lente ou instable)")
                logger.error("   2. Firewall ou antivirus bloquant la connexion au port 5432")
                logger.error("   3. Le serveur Supabase est temporairement inaccessible")
                logger.error("   4. Le pooler Supabase a des restrictions de connexion")
                logger.error("")
                logger.error("   SOLUTIONS:")
                logger.error("   1. Vérifiez votre connexion internet")
                logger.error("   2. Vérifiez que le port 5432 n'est pas bloqué par un firewall")
                logger.error("   3. Essayez d'utiliser l'URL directe (sans pooler) depuis Supabase:")
                logger.error("      - Allez dans Settings > Database > Connection string")
                logger.error("      - Utilisez 'Direct connection' au lieu de 'Connection pooling'")
                logger.error("   4. Attendez quelques minutes et réessayez")
                logger.error("   5. Vérifiez que votre projet Supabase est actif et non en pause")
                logger.error("")
                logger.error(f"   Hostname: {default_config.get('HOST', 'NON DÉFINI')}")
                logger.error(f"   Port: {default_config.get('PORT', 'NON DÉFINI')}")
            
            import traceback
            logger.debug(traceback.format_exc())
            raise
    
    def _get_field_value(self, instance, field_name: str) -> Any:
        """
        Récupère la valeur d'un champ, en convertissant les FileField/ImageField en URLs
        """
        field = instance._meta.get_field(field_name)
        value = getattr(instance, field_name)
        
        # Si c'est un FileField/ImageField, ne pas synchroniser le fichier
        # Utiliser l'URL correspondante si elle existe, sinon None
        if isinstance(field, (django.db.models.FileField, django.db.models.ImageField)):
            if value:
                # Si un champ URL correspondant existe, l'utiliser
                url_field_name = field_name.replace('_file', '_url').replace('image', 'image_url')
                if hasattr(instance, url_field_name):
                    url_value = getattr(instance, url_field_name)
                    if url_value:
                        return None  # On garde None pour le fichier, l'URL sera synchronisée séparément
            return None  # Ne pas synchroniser les fichiers binaires
        
        return value
    
    def _prepare_model_data(self, instance) -> Dict[str, Any]:
        """
        Prépare les données d'un modèle pour la synchronisation
        Exclut les fichiers binaires et prépare les ForeignKeys
        """
        data = {}
        
        for field in instance._meta.get_fields():
            if field.name in ['id']:
                continue  # ID sera géré séparément
            
            # Ignorer les relations inverses
            if field.one_to_many or field.many_to_many:
                continue
            
            # Gérer les ForeignKeys
            if isinstance(field, django.db.models.ForeignKey):
                related_obj = getattr(instance, field.name, None)
                if related_obj:
                    data[field.name + '_id'] = related_obj.id
                else:
                    data[field.name + '_id'] = None
            else:
                # Récupérer la valeur (avec gestion spéciale pour les fichiers)
                value = self._get_field_value(instance, field.name)
                if value is not None:
                    data[field.name] = value
        
        return data
    
    def _sync_model(
        self,
        model_class,
        model_name: str,
        order_by: Optional[str] = None
    ) -> None:
        """
        Synchronise un modèle spécifique
        
        Args:
            model_class: La classe du modèle Django
            model_name: Nom du modèle pour les logs
            order_by: Champ pour ordonner (optionnel)
        """
        logger.info(f"\n📦 Synchronisation: {model_name}")
        
        # Lire depuis la base locale (SQLite)
        local_queryset = model_class.objects.using('default')
        if order_by:
            local_queryset = local_queryset.order_by(order_by)
        local_items = list(local_queryset.all())
        
        # Lire depuis la base de production (PostgreSQL)
        prod_queryset = model_class.objects.using('prod')
        prod_items = {item.id: item for item in prod_queryset.all()}
        
        logger.info(f"   Local: {len(local_items)} éléments")
        logger.info(f"   Production: {len(prod_items)} éléments existants")
        
        for local_item in local_items:
            try:
                # Préparer les données (sans les fichiers binaires)
                data = self._prepare_model_data(local_item)
                
                # Vérifier si l'élément existe en production
                if local_item.id in prod_items:
                    # UPDATE : mettre à jour si nécessaire
                    prod_item = prod_items[local_item.id]
                    needs_update = False
                    
                    for key, value in data.items():
                        current_value = getattr(prod_item, key, None)
                        if current_value != value:
                            needs_update = True
                            break
                    
                    if needs_update:
                        if not self.dry_run:
                            for key, value in data.items():
                                setattr(prod_item, key, value)
                            prod_item.save(using='prod')
                            self.stats['updated'] += 1
                            logger.info(f"   ✅ Mis à jour: {model_name} ID {local_item.id}")
                        else:
                            self.stats['updated'] += 1
                            logger.info(f"   [DRY-RUN] Mise à jour: {model_name} ID {local_item.id}")
                    else:
                        self.stats['skipped'] += 1
                        logger.debug(f"   ⏭️  Déjà à jour: {model_name} ID {local_item.id}")
                else:
                    # INSERT : créer en production
                    if not self.dry_run:
                        # Créer avec le même ID
                        data['id'] = local_item.id
                        prod_item = model_class.objects.using('prod').create(**data)
                        self.stats['created'] += 1
                        logger.info(f"   ✅ Créé: {model_name} ID {local_item.id}")
                    else:
                        self.stats['created'] += 1
                        logger.info(f"   [DRY-RUN] Création: {model_name} ID {local_item.id}")
            
            except Exception as e:
                self.stats['errors'] += 1
                logger.error(f"   ❌ Erreur pour {model_name} ID {local_item.id}: {e}")
                import traceback
                logger.debug(traceback.format_exc())
    
    def sync_all(self) -> None:
        """
        Synchronise tous les modèles dans le bon ordre (respect des dépendances)
        """
        if self.confirm and not self.dry_run:
            response = input("\n⚠️  Êtes-vous sûr de vouloir synchroniser vers la production? (oui/non): ")
            if response.lower() not in ['oui', 'yes', 'o', 'y']:
                logger.info("❌ Synchronisation annulée par l'utilisateur")
                return
        
        try:
            # Utiliser une transaction pour la production
            with transaction.atomic(using='prod'):
                logger.info("\n" + "=" * 80)
                logger.info("🔄 DÉBUT DE LA SYNCHRONISATION")
                logger.info("=" * 80)
                
                # 1. User (Django built-in) - doit être en premier
                logger.info("\n👤 Synchronisation des utilisateurs...")
                self._sync_model(User, "User")
                
                # 2. Account (dépend de User)
                logger.info("\n👤 Synchronisation des comptes...")
                self._sync_model(Account, "Account")
                
                # 3. Catégories indépendantes
                logger.info("\n📚 Synchronisation des catégories de cours...")
                self._sync_model(CourseCategory, "CourseCategory")
                
                logger.info("\n📚 Synchronisation des catégories de sermons...")
                self._sync_model(SermonCategory, "SermonCategory")
                
                logger.info("\n🏪 Synchronisation des catégories de boutiques...")
                self._sync_model(Category, "Category")
                
                # 4. SubCategory (dépend de Category)
                logger.info("\n🏪 Synchronisation des sous-catégories...")
                self._sync_model(SubCategory, "SubCategory")
                
                # 5. BasicProduct (dépend de SubCategory)
                logger.info("\n🏪 Synchronisation des produits de base...")
                self._sync_model(BasicProduct, "BasicProduct")
                
                # 6. Course, Sermon, Shop (dépendent des catégories et Account)
                logger.info("\n📖 Synchronisation des cours...")
                self._sync_model(Course, "Course")
                
                logger.info("\n📖 Synchronisation des sermons...")
                self._sync_model(Sermon, "Sermon")
                
                logger.info("\n🏪 Synchronisation des boutiques...")
                self._sync_model(Shop, "Shop")
                
                # 7. Lesson, Product, ControlFrequency (dépendent de Course/Shop)
                logger.info("\n📝 Synchronisation des leçons...")
                self._sync_model(Lesson, "Lesson", order_by='course_id,order')
                
                logger.info("\n🏪 Synchronisation des produits...")
                self._sync_model(Product, "Product")
                
                logger.info("\n🏪 Synchronisation des fréquences de contrôle...")
                self._sync_model(ControlFrequency, "ControlFrequency")
                
                # 8. Enrollment, PublicProduct (dépendent de Course/User/Category)
                logger.info("\n📚 Synchronisation des inscriptions...")
                self._sync_model(Enrollment, "Enrollment")
                
                logger.info("\n🏪 Synchronisation des produits publics...")
                self._sync_model(PublicProduct, "PublicProduct")
                
                # 9. LessonProgress, SalePriceHistory, Supply, Sales (dépendent de Enrollment/Product)
                logger.info("\n📊 Synchronisation de la progression des leçons...")
                self._sync_model(LessonProgress, "LessonProgress")
                
                logger.info("\n🏪 Synchronisation de l'historique des prix...")
                self._sync_model(SalePriceHistory, "SalePriceHistory")
                
                logger.info("\n🏪 Synchronisation des approvisionnements...")
                self._sync_model(Supply, "Supply")
                
                logger.info("\n🏪 Synchronisation des ventes...")
                self._sync_model(Sales, "Sales")
                
                # 10. Favorite (dépend de User)
                logger.info("\n⭐ Synchronisation des favoris...")
                self._sync_model(Favorite, "Favorite")
                
                # 11. History (indépendant, pas de FK)
                logger.info("\n📜 Synchronisation de l'historique...")
                self._sync_model(History, "History")
                
                # 12. SiteSettings (singleton, pk=1)
                logger.info("\n⚙️  Synchronisation des paramètres du site...")
                try:
                    local_settings = SiteSettings.objects.using('default').get(pk=1)
                    try:
                        prod_settings = SiteSettings.objects.using('prod').get(pk=1)
                        # UPDATE
                        data = self._prepare_model_data(local_settings)
                        needs_update = False
                        for key, value in data.items():
                            if getattr(prod_settings, key, None) != value:
                                needs_update = True
                                break
                        
                        if needs_update:
                            if not self.dry_run:
                                for key, value in data.items():
                                    setattr(prod_settings, key, value)
                                prod_settings.save(using='prod')
                                self.stats['updated'] += 1
                                logger.info("   ✅ Paramètres du site mis à jour")
                            else:
                                self.stats['updated'] += 1
                                logger.info("   [DRY-RUN] Mise à jour des paramètres du site")
                        else:
                            self.stats['skipped'] += 1
                            logger.info("   ⏭️  Paramètres du site déjà à jour")
                    except SiteSettings.DoesNotExist:
                        # CREATE
                        if not self.dry_run:
                            data = self._prepare_model_data(local_settings)
                            data['id'] = 1
                            SiteSettings.objects.using('prod').create(**data)
                            self.stats['created'] += 1
                            logger.info("   ✅ Paramètres du site créés")
                        else:
                            self.stats['created'] += 1
                            logger.info("   [DRY-RUN] Création des paramètres du site")
                except SiteSettings.DoesNotExist:
                    logger.warning("   ⚠️  Aucun paramètre du site en local")
                    self.stats['skipped'] += 1
                
                if self.dry_run:
                    logger.info("\n" + "=" * 80)
                    logger.info("⚠️  MODE DRY-RUN - Aucune modification n'a été effectuée")
                    logger.info("=" * 80)
                else:
                    logger.info("\n" + "=" * 80)
                    logger.info("✅ SYNCHRONISATION TERMINÉE")
                    logger.info("=" * 80)
        
        except Exception as e:
            logger.error(f"\n❌ ERREUR CRITIQUE: {e}")
            import traceback
            logger.error(traceback.format_exc())
            raise
        
        finally:
            # Afficher les statistiques
            logger.info("\n📊 STATISTIQUES:")
            logger.info(f"   ✅ Créés: {self.stats['created']}")
            logger.info(f"   🔄 Mis à jour: {self.stats['updated']}")
            logger.info(f"   ⏭️  Ignorés (déjà à jour): {self.stats['skipped']}")
            logger.info(f"   ❌ Erreurs: {self.stats['errors']}")
            logger.info("=" * 80)


def main():
    """
    Point d'entrée principal
    """
    parser = argparse.ArgumentParser(
        description='Synchronise les données de SQLite (local) vers Supabase (production)',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Exemples:
  # Mode simulation (dry-run)
  python sync_local_to_prod.py --dry-run
  
  # Synchronisation avec confirmation
  python sync_local_to_prod.py --confirm
  
  # Synchronisation directe
  python sync_local_to_prod.py
        """
    )
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Mode simulation (affiche ce qui serait fait sans modifier)'
    )
    parser.add_argument(
        '--confirm',
        action='store_true',
        help='Demande confirmation avant de synchroniser'
    )
    
    args = parser.parse_args()
    
    try:
        sync = DatabaseSync(dry_run=args.dry_run, confirm=args.confirm)
        sync.sync_all()
        
        if sync.stats['errors'] > 0:
            sys.exit(1)
        else:
            sys.exit(0)
    
    except KeyboardInterrupt:
        logger.info("\n\n❌ Synchronisation interrompue par l'utilisateur")
        sys.exit(1)
    except Exception as e:
        logger.error(f"\n❌ Erreur fatale: {e}")
        import traceback
        logger.error(traceback.format_exc())
        sys.exit(1)


if __name__ == '__main__':
    main()

