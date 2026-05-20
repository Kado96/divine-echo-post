from storages.backends.s3boto3 import S3Boto3Storage

class CleanS3Boto3Storage(S3Boto3Storage):
    # On garde 'media' car l'utilisateur a confirmé que la structure doit rester ainsi.
    # Les fichiers seront dans le sous-dossier 'media/' du bucket 'media'.
    location = 'media'
