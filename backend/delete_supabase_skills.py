import boto3
import os
import sys

# Charger les variables du backend/.env directement
def load_backend_env():
    env_path = os.path.join(os.path.dirname(__file__), '.env')
    if os.path.exists(env_path):
        with open(env_path, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith('#'): continue
                if '=' in line:
                    key, value = line.split('=', 1)
                    os.environ[key.strip()] = value.strip('"').strip("'")

load_backend_env()

def run_cleanup():
    s3 = boto3.client(
        's3',
        endpoint_url=os.getenv('AWS_S3_ENDPOINT_URL'),
        aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
        aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY')
    )
    
    bucket = os.getenv('AWS_STORAGE_BUCKET_NAME', 'media')
    prefix = 'skills/'
    
    print(f"--- [CLEANUP] Supression de '{prefix}' dans le bucket '{bucket}' ---")
    
    # Lister les objets
    response = s3.list_objects_v2(Bucket=bucket, Prefix=prefix)
    objects = response.get('Contents', [])
    
    if not objects:
        print("Fin : Aucun fichier trouvé avec ce préfixe.")
        return

    # Préparer la liste pour suppression par lot
    delete_keys = {'Objects': [{'Key': obj['Key']} for obj in objects]}
    
    # Suppression
    del_res = s3.delete_objects(Bucket=bucket, Delete=delete_keys)
    
    count = len(del_res.get('Deleted', []))
    print(f"OK : {count} fichiers supprimés définitivement.")

if __name__ == '__main__':
    run_cleanup()
