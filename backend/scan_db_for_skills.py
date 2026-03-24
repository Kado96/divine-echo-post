import os
import django
import sys

# Ensure backend directory is in path for imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'shalomministry.settings')
django.setup()

from django.apps import apps
from django.db import models

def scan_database():
    print("--- [SCAN] RECHERCHE DE 'skills/' DANS LA BASE ---")
    found_any = False
    
    # On parcourt tous les modèles de l'application
    for model in apps.get_models():
        # On ne s'intéresse qu'aux champs capables de contenir du texte ou des fichiers
        # On inclut CharField et TextField pour les URLs "en dur" ou descriptions
        text_and_file_fields = []
        for f in model._meta.get_fields():
            if isinstance(f, (models.CharField, models.TextField, models.FileField, models.ImageField, models.URLField)):
                text_and_file_fields.append(f)
        
        if not text_and_file_fields:
            continue
            
        try:
            # On vérifie si le modèle a au moins un objet
            if not model.objects.exists():
                continue
                
            print(f"Scanning model: {model._meta.label}...")
            for obj in model.objects.all():
                for f in text_and_file_fields:
                    try:
                        val = getattr(obj, f.name, "")
                        if not val:
                            continue
                            
                        # Cas 1: C'est un FileField (objet avec attribut .name)
                        if hasattr(val, 'name') and val.name:
                            name_str = str(val.name)
                            if "skills/" in name_str:
                                print(f"  ✅ [REF FICHIER] Model:[{model._meta.label}] (ID:{obj.pk}) - Champ '{f.name}' : {name_str}")
                                found_any = True
                                
                        # Cas 2: C'est une chaîne de caractères (URL, Titre, Description)
                        elif isinstance(val, str):
                            if "skills/" in val:
                                print(f"  ✅ [REF TEXTE]   Model:[{model._meta.label}] (ID:{obj.pk}) - Champ '{f.name}' : {val}")
                                found_any = True
                                
                    except Exception as e:
                        pass # Erreur de lecture sur un champ spécifique, on continue
        except Exception as e:
            # print(f"Could not scan model {model._meta.label}: {e}") # Certains modèles système pourraient être inaccessibles
            pass

    if not found_any:
        print("\n[RESULTAT] RÉSULTAT DU SCAN : AUCUNE RÉFÉRENCE TROUVÉE.")
        print("Le dossier 'skills/' sur Supabase semble n'avoir aucun lien avec les données actuelles de votre site.")
    else:
        print("\n[ATTENTION] RÉSULTAT DU SCAN : DES RÉFÉRENCES ONT ÉTÉ TROUVÉES.")
        print("Il est fortement déconseillé de supprimer le dossier avant d'avoir nettoyé ou mis à jour ces objets.")
    
    print("\n--- SCAN TERMINÉ ---")

if __name__ == '__main__':
    scan_database()
