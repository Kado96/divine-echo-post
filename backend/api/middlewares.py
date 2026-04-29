"""
Middlewares personnalisés pour l'API
"""
from django.utils.deprecation import MiddlewareMixin
from django.http import JsonResponse, HttpResponse
from django.conf import settings
import logging

logger = logging.getLogger(__name__)


class APIDebugMiddleware(MiddlewareMixin):
    """
    Middleware de débogage pour les requêtes API
    """
    def process_request(self, request):
        if request.path.startswith('/api/'):
            # Logger les détails de la requête pour le débogage
            logger.debug(
                f"API Request: {request.method} {request.path}",
                extra={
                    'method': request.method,
                    'path': request.path,
                    'content_type': request.content_type,
                    'content_length': request.META.get('CONTENT_LENGTH', '0'),
                    'query_params': dict(request.GET),
                }
            )
            # Pour les requêtes GET, supprimer Content-Type pour éviter les erreurs de parsing
            if request.method == 'GET':
                # Supprimer Content-Type si présent pour éviter que DRF essaie de parser un body vide
                if 'CONTENT_TYPE' in request.META:
                    content_type = request.META.get('CONTENT_TYPE', '')
                    # Si c'est application/json ou autre Content-Type, supprimer pour GET
                    if content_type and content_type not in ['', 'text/html', 'text/plain']:
                        # Ne pas supprimer complètement, mais laisser vide pour que DRF ne parse pas
                        request.META['CONTENT_TYPE'] = ''
                        request.META['CONTENT_LENGTH'] = '0'
        return None


class DisableCSRF(MiddlewareMixin):
    """
    Désactive CSRF pour les requêtes API
    """
    def process_request(self, request):
        # Désactiver CSRF pour toutes les requêtes API
        if request.path.startswith('/api/'):
            setattr(request, '_dont_enforce_csrf_checks', True)
            # Également désactiver la vérification du Content-Length pour les GET
            if request.method == 'GET':
                # Ne pas vérifier le body pour les requêtes GET
                pass
        return None


class ExceptionMiddleware(MiddlewareMixin):
    """
    Middleware pour capturer les exceptions et retourner des réponses JSON
    GARANTIT que toutes les erreurs API retournent du JSON (pas HTML)
    """
    def process_exception(self, request, exception):
        # Seulement pour les requêtes API
        if request.path.startswith('/api/'):
            logger.error(
                f"Unhandled exception in API: {exception.__class__.__name__} - {str(exception)}",
                exc_info=True,
                extra={
                    'request': request,
                    'method': request.method,
                    'path': request.path,
                    'query_params': dict(request.GET),
                }
            )
            # Retourner TOUJOURS du JSON pour les erreurs API
            return JsonResponse(
                {
                    'detail': str(exception),
                    'error_type': exception.__class__.__name__,
                    'path': request.path,
                    'method': request.method,
                },
                status=500,
                content_type='application/json'  # Forcer le Content-Type JSON
            )
        return None


class MediaCORSMiddleware(MiddlewareMixin):
    """
    Middleware pour ajouter les headers CORS aux fichiers média
    Résout les problèmes CORB (Cross-Origin Read Blocking) pour les images
    """
    def process_response(self, request, response):
        # Ajouter les headers CORS pour les fichiers média
        if request.path.startswith(settings.MEDIA_URL):
            # Obtenir l'origine de la requête
            origin = request.META.get('HTTP_ORIGIN', '')
            
            # Vérifier si on doit autoriser tout (DEBUG ou configuration spécifique)
            allow_all = getattr(settings, 'CORS_ALLOW_ALL_ORIGINS', False)
            allowed_origins = getattr(settings, 'CORS_ALLOWED_ORIGINS', [])
            
            if allow_all or not origin:
                response['Access-Control-Allow-Origin'] = '*'
                response['Access-Control-Allow-Credentials'] = 'true'
            else:
                # Autoriser l'origine si elle est dans la liste ou forcer l'autorisation pour les médias publics
                response['Access-Control-Allow-Origin'] = origin
                response['Access-Control-Allow-Credentials'] = 'true'
            
            # Toujours ajouter les méthodes et headers pour éviter les échecs de preflight
            response['Access-Control-Allow-Methods'] = 'GET, HEAD, OPTIONS'
            response['Access-Control-Allow-Headers'] = 'accept, accept-encoding, authorization, content-type, dnt, origin, user-agent, x-csrftoken, x-requested-with'
            response['Access-Control-Expose-Headers'] = 'Content-Length, Content-Type'
            
            # Pour les requêtes OPTIONS (preflight)
            if request.method == 'OPTIONS':
                response['Access-Control-Max-Age'] = '86400'
        
        return response

