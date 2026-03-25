import os
import django

def check_users():
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'shalomministry.settings')
    django.setup()
    
    from django.contrib.auth.models import User
    from django.conf import settings
    import dj_database_url
    from django.db import connections

    # Check local
    try:
        u_local = User.objects.get(username='donald')
        print(f"LOCAL: user 'donald' found. ID: {u_local.id}, Hash starts with: {u_local.password[:30]}")
    except User.DoesNotExist:
        print("LOCAL: user 'donald' NOT FOUND")
        return

    # Check prod
    prod_url = os.environ.get('DATABASE_URL')
    if not prod_url:
        print("PROD_URL not found in ENV")
        return

    db_config = dj_database_url.parse(prod_url, ssl_require=True)
    # On ajoute manuellement les settings manquants pour éviter l'erreur TIME_ZONE
    db_config['TIME_ZONE'] = settings.TIME_ZONE
    settings.DATABASES['prod_check'] = db_config
    
    try:
        # On force la connexion pour vérifier qu'elle marche
        connections['prod_check'].ensure_connection()
        
        u_prod = User.objects.using('prod_check').get(username='donald')
        print(f"PROD: user 'donald' found. ID: {u_prod.id}, Hash starts with: {u_prod.password[:30]}")
        
        if u_local.id == u_prod.id:
            print("SUCCESS: IDs match.")
        else:
            print(f"WARNING: IDs MISMATCH (Local: {u_local.id}, Prod: {u_prod.id})")
            
        if u_local.password == u_prod.password:
            print("SUCCESS: Hashes match perfectly.")
        else:
            print("WARNING: Hashes are DIFFERENT.")
            
    except User.DoesNotExist:
        print("PROD: user 'donald' NOT FOUND")
    except Exception as e:
        print(f"PROD checking error: {e}")

if __name__ == "__main__":
    check_users()
