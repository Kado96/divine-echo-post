from storages.backends.s3boto3 import S3Boto3Storage

class CleanS3Boto3Storage(S3Boto3Storage):
    # CRITIQUE: Force l'écriture dans le sous-dossier 'media/' (conforme à la structure Supabase)
    location = 'media'
