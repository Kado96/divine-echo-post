"""
Handlers personnalisés pour les erreurs HTTP
Retournent du JSON pour les requêtes API au lieu de HTML
"""
from django.http import JsonResponse


def handler400(request, exception):
    """
    Handler 400 personnalisé qui retourne du JSON pour les requêtes API
    """
    if request and hasattr(request, 'path') and request.path.startswith('/api/'):
        return JsonResponse(
            {
                'detail': str(exception) if exception else 'Bad Request',
                'error': 'bad_request',
                'path': getattr(request, 'path', 'unknown'),
                'method': getattr(request, 'method', 'unknown'),
            },
            status=400
        )
    # Pour les autres requêtes, utiliser le handler par défaut de Django
    from django.views.defaults import bad_request
    return bad_request(request, exception)


def handler403(request, exception):
    """
    Handler 403 personnalisé qui retourne du JSON pour les requêtes API
    """
    if request and hasattr(request, 'path') and request.path.startswith('/api/'):
        return JsonResponse(
            {
                'detail': str(exception) if exception else 'Forbidden',
                'error': 'forbidden',
                'path': getattr(request, 'path', 'unknown'),
                'method': getattr(request, 'method', 'unknown'),
            },
            status=403
        )
    from django.views.defaults import permission_denied
    return permission_denied(request, exception)


def handler404(request, exception):
    """
    Handler 404 personnalisé qui retourne du JSON pour les requêtes API
    """
    if request and hasattr(request, 'path') and request.path.startswith('/api/'):
        from django.urls import get_resolver
        resolver = get_resolver()
        # Essayer d'extraire les routes pour debug
        try:
            available_routes = [str(p.pattern) for p in resolver.url_patterns if hasattr(p, 'pattern')]
        except:
            available_routes = ["error_getting_routes"]

        return JsonResponse(
            {
                'detail': 'Not found',
                'error': 'not_found',
                'path': getattr(request, 'path', 'unknown'),
                'method': getattr(request, 'method', 'unknown'),
                'available_routes_patterns': available_routes[:15], # Limiter pour la réponse
                'debug_info': 'Check apps.py and shalomministry/urls.py'
            },
            status=404
        )
    from django.views.defaults import page_not_found
    return page_not_found(request, exception)


def handler500(request):
    """
    Handler 500 personnalisé qui retourne du JSON pour les requêtes API
    et logue l'erreur pour le débogage.
    """
    import traceback
    import logging
    logger = logging.getLogger('django.request')
    
    # On essaye de récupérer l'erreur depuis sys.exc_info()
    import sys
    exc_type, exc_value, exc_traceback = sys.exc_info()
    error_msg = str(exc_value) if exc_value else "Internal Server Error"
    
    # Log de l'erreur avec la stacktrace complète dans la console du serveur
    logger.error(f"Erreur 500 sur {request.path}: {error_msg}")
    if exc_info := sys.exc_info():
        logger.error("".join(traceback.format_exception(*exc_info)))

    # Vérifier si c'est une requête API
    if request and hasattr(request, 'path') and request.path.startswith('/api/'):
        return JsonResponse(
            {
                'detail': error_msg,
                'error': 'server_error',
                'error_type': exc_type.__name__ if exc_type else 'Exception',
                'path': getattr(request, 'path', 'unknown'),
                'method': getattr(request, 'method', 'unknown'),
            },
            status=500
        )
    # Pour les autres requêtes, utiliser le handler par défaut
    from django.views.defaults import server_error
    return server_error(request)

