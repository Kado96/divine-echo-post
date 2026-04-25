"""
Vues personnalisées pour Shalom Ministry
"""
from django.http import HttpResponse, StreamingHttpResponse
from django.views import View
from rest_framework.views import APIView
from rest_framework.response import Response
import requests
import re
from django.core.cache import cache
from urllib.parse import urlparse


class ShalomMinistryView(APIView):
    """Vue principale de l'API Shalom Ministry"""
    def get(self, request, *args, **kwargs):
        custom_links = {
            "admin": "/admin/",
            "api_accounts": "/api/accounts/",
            "api_shops": "/api/shops/",
            "api_courses": "/api/courses/",
            "api_sermons": "/api/sermons/",
            "api_settings": "/api/settings/",
        }
        return Response({
            'message': 'Bienvenue sur l\'API de Shalom Ministry',
            'links': custom_links,
        })


class RootView(APIView):
    """Vue racine pour les routes non-API"""
    permission_classes = []  # Permettre l'accès sans authentification
    authentication_classes = []  # Pas d'authentification requise
    
    def get(self, request, *args, **kwargs):
        return Response({
            'error': 'Cette route n\'existe pas. Utilisez /api/ pour accéder à l\'API.',
            'available_endpoints': [
                '/api/',
                '/api/accounts/',
                '/api/sermons/',
                '/api/settings/',
                '/admin/',
            ]
        }, status=404)


class ImageProxyView(View):
    """
    Proxy pour les images Google Drive qui contourne les erreurs CORB
    """
    
    def get(self, request, *args, **kwargs):
        # Récupérer l'URL de l'image depuis les paramètres
        image_url = request.GET.get('url')
        if not image_url:
            return HttpResponse('URL manquante', status=400)
        
        # Vérifier que c'est une URL Google Drive
        if 'drive.google.com' not in image_url:
            return HttpResponse('Seules les URLs Google Drive sont supportées', status=400)
        
        # Convertir l'URL si nécessaire
        converted_url = self.convert_google_drive_url(image_url)
        
        # Utiliser le cache pour éviter de télécharger plusieurs fois la même image
        cache_key = f"image_proxy_{hash(converted_url)}"
        cached_response = cache.get(cache_key)
        
        if cached_response:
            content, content_type = cached_response
            response = HttpResponse(content, content_type=content_type)
            response['Cache-Control'] = 'public, max-age=3600'  # Cache 1h
            return response
        
        try:
            # Télécharger l'image depuis Google Drive
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
            
            img_response = requests.get(converted_url, headers=headers, timeout=10)
            img_response.raise_for_status()
            
            # Déterminer le content-type
            content_type = img_response.headers.get('content-type', 'image/jpeg')
            
            # Mettre en cache pendant 1 heure
            cache.set(cache_key, (img_response.content, content_type), 3600)
            
            # Retourner l'image avec les headers CORS appropriés
            response = HttpResponse(img_response.content, content_type=content_type)
            response['Access-Control-Allow-Origin'] = '*'
            response['Cache-Control'] = 'public, max-age=3600'
            
            return response
            
        except requests.exceptions.RequestException as e:
            return HttpResponse(f'Erreur lors du téléchargement: {str(e)}', status=500)
    
    def convert_google_drive_url(self, url):
        """Convertit une URL Google Drive en URL de téléchargement direct"""
        # Pattern pour extraire l'ID du fichier Google Drive
        drive_file_id_match = re.search(r'/d/([a-zA-Z0-9_-]+)', url)
        if drive_file_id_match:
            file_id = drive_file_id_match.group(1)
            return f'https://drive.google.com/uc?export=view&id={file_id}'
        return url

class MediaProxyView(View):
    """
    Proxy pour les fichiers média Google Drive qui supporte le streaming (Range requests)
    """
    def get(self, request, *args, **kwargs):
        media_url = request.GET.get('url')
        if not media_url:
            return HttpResponse('URL manquante', status=400)
        
        if 'drive.google.com' not in media_url:
            return HttpResponse('Seules les URLs Google Drive sont supportées', status=400)
        
        # Extraire l'ID du fichier
        file_id_match = re.search(r'(?:/d/|id=)([a-zA-Z0-9_-]+)', media_url)
        if not file_id_match:
            return HttpResponse('ID de fichier non trouvé', status=400)
        
        file_id = file_id_match.group(1)
        direct_url = f'https://drive.google.com/uc?export=download&id={file_id}'
        
        # Gérer les headers de Range pour le streaming mobile
        range_header = request.headers.get('Range', None)
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        if range_header:
            headers['Range'] = range_header

        try:
            # On utilise stream=True pour ne pas charger tout le fichier en mémoire
            with requests.get(direct_url, headers=headers, stream=True, timeout=30) as r:
                r.raise_for_status()
                
                # Créer une StreamingHttpResponse pour relayer les données
                response = StreamingHttpResponse(
                    r.iter_content(chunk_size=8192),
                    status=r.status_code,
                    content_type=r.headers.get('Content-Type', 'video/mp4')
                )
                
                # Relayer les headers essentiels pour le lecteur vidéo
                for header in ['Content-Range', 'Content-Length', 'Accept-Ranges']:
                    if header in r.headers:
                        response[header] = r.headers[header]
                
                response['Access-Control-Allow-Origin'] = '*'
                return response
                
        except Exception as e:
            return HttpResponse(f'Erreur de proxying: {str(e)}', status=500)
