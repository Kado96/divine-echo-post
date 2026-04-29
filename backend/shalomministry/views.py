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
        
        # Convertir l'URL si c'est du Google Drive
        converted_url = self.convert_google_drive_url(image_url) if 'drive.google.com' in image_url else image_url
        
        # Utiliser le cache pour éviter de télécharger plusieurs fois la même image
        cache_key = f"image_proxy_{hash(converted_url)}"
        cached_data = cache.get(cache_key)
        
        if cached_data:
            content, content_type = cached_data
            response = HttpResponse(content, content_type=content_type)
            response['Access-Control-Allow-Origin'] = '*'
            response['Access-Control-Allow-Methods'] = 'GET, OPTIONS'
            response['Access-Control-Allow-Headers'] = '*'
            response['Cache-Control'] = 'public, max-age=3600'
            return response

        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
            
            # Logique intelligente : on tente l'URL fournie, 
            # et si elle échoue on tente l'autre variante (avec ou sans double media)
            img_response = requests.get(converted_url, headers=headers, timeout=10)
            
            if img_response.status_code != 200:
                if "/public/media/media/" in converted_url:
                    retry_url = converted_url.replace("/public/media/media/", "/public/media/")
                elif "/public/media/" in converted_url:
                    retry_url = converted_url.replace("/public/media/", "/public/media/media/")
                else:
                    retry_url = None
                
                if retry_url:
                    img_response = requests.get(retry_url, headers=headers, timeout=10)
            
            img_response.raise_for_status()
            
            # Déterminer le content-type
            content_type = img_response.headers.get('content-type', 'image/jpeg')
            
            # Mettre en cache pendant 1 heure
            cache.set(cache_key, (img_response.content, content_type), 3600)
            
            # Retourner l'image avec les headers CORS et de cache appropriés
            response = HttpResponse(img_response.content, content_type=content_type)
            response['Access-Control-Allow-Origin'] = '*'
            response['Access-Control-Allow-Methods'] = 'GET, OPTIONS'
            response['Access-Control-Allow-Headers'] = '*'
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
    Proxy pour les fichiers média Google Drive qui supporte le streaming (Range requests).
    Gère la page de confirmation de téléchargement de Google Drive.
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
        
        # Gérer les headers de Range pour le streaming mobile
        range_header = request.headers.get('Range', None)
        
        user_agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

        try:
            # Étape 1 : Créer une session pour gérer les cookies de confirmation
            session = requests.Session()
            session.headers.update({'User-Agent': user_agent})
            
            # Étape 2 : Tenter le téléchargement direct
            direct_url = f'https://drive.google.com/uc?export=download&id={file_id}'
            resp = session.get(direct_url, stream=True, timeout=30)
            
            # Étape 3 : Vérifier si Google demande une confirmation (page HTML au lieu du fichier)
            content_type = resp.headers.get('Content-Type', '')
            if 'text/html' in content_type:
                # Google a renvoyé une page de confirmation, extraire le token
                logger.info(f"[MEDIA PROXY] Page de confirmation détectée pour {file_id}, tentative de contournement...")
                
                # Chercher le cookie de confirmation
                confirm_token = None
                for key, value in session.cookies.items():
                    if key.startswith('download_warning'):
                        confirm_token = value
                        break
                
                if not confirm_token:
                    # Tenter d'extraire le token depuis le contenu HTML
                    page_content = resp.text
                    import re as re_mod
                    token_match = re_mod.search(r'confirm=([0-9A-Za-z_-]+)', page_content)
                    if token_match:
                        confirm_token = token_match.group(1)
                    else:
                        # Dernier recours : UUID du formulaire
                        uuid_match = re_mod.search(r'name="uuid" value="([^"]+)"', page_content)
                        if uuid_match:
                            confirm_token = 't'
                
                # Retenter avec le token de confirmation
                if confirm_token:
                    confirmed_url = f'https://drive.google.com/uc?export=download&confirm={confirm_token}&id={file_id}'
                else:
                    # Tenter quand même avec confirm=t (fonctionne souvent)
                    confirmed_url = f'https://drive.google.com/uc?export=download&confirm=t&id={file_id}'
                
                headers = {}
                if range_header:
                    headers['Range'] = range_header
                    
                resp = session.get(confirmed_url, headers=headers, stream=True, timeout=30)
                
                # Vérification finale : si c'est toujours du HTML, Google bloque l'accès
                final_ct = resp.headers.get('Content-Type', '')
                if 'text/html' in final_ct:
                    logger.error(f"[MEDIA PROXY] Google Drive refuse toujours le téléchargement pour {file_id}")
                    return HttpResponse(
                        'Ce fichier Google Drive n\'est pas accessible publiquement. '
                        'Vérifiez que le partage est activé pour "Tous les utilisateurs disposant du lien".',
                        status=403
                    )
            else:
                # Le fichier a été obtenu directement, gérer le Range si nécessaire
                if range_header and resp.status_code == 200:
                    resp.close()
                    headers = {'Range': range_header}
                    resp = session.get(direct_url, headers=headers, stream=True, timeout=30)
            
            resp.raise_for_status()
            
            # Créer une StreamingHttpResponse pour relayer les données
            response = StreamingHttpResponse(
                resp.iter_content(chunk_size=8192),
                status=resp.status_code,
                content_type=resp.headers.get('Content-Type', 'video/mp4')
            )
            
            # Relayer les headers essentiels pour le lecteur vidéo
            for header in ['Content-Range', 'Content-Length', 'Accept-Ranges']:
                if header in resp.headers:
                    response[header] = resp.headers[header]
            
            response['Access-Control-Allow-Origin'] = '*'
            response["Access-Control-Allow-Methods"] = "GET, OPTIONS"
            response["Access-Control-Allow-Headers"] = "Range, Content-Type"
            response["Access-Control-Expose-Headers"] = "Content-Range, Content-Length, Accept-Ranges"
            return response
                
        except requests.exceptions.RequestException as e:
            logger.error(f"[MEDIA PROXY] Erreur réseau pour {file_id}: {str(e)}")
            return HttpResponse(f'Erreur de proxying: {str(e)}', status=500)
        except Exception as e:
            logger.error(f"[MEDIA PROXY] Erreur inattendue pour {file_id}: {str(e)}")
            return HttpResponse(f'Erreur interne: {str(e)}', status=500)

