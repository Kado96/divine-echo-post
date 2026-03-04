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
        return JsonResponse(
            {
                'detail': 'Not found',
                'error': 'not_found',
                'path': getattr(request, 'path', 'unknown'),
                'method': getattr(request, 'method', 'unknown'),
            },
            status=404
        )
    from django.views.defaults import page_not_found
    return page_not_found(request, exception)


def handler500(request):
    """
    Handler 500 personnalisé qui retourne du JSON pour les requêtes API
    """
    # Vérifier si request existe et si c'est une requête API
    if request and hasattr(request, 'path') and request.path.startswith('/api/'):
        return JsonResponse(
            {
                'detail': 'Internal Server Error',
                'error': 'server_error',
                'path': getattr(request, 'path', 'unknown'),
                'method': getattr(request, 'method', 'unknown'),
            },
            status=500
        )
    # Pour les autres requêtes (comme favicon.ico), utiliser le handler par défaut
    from django.views.defaults import server_error
    return server_error(request)

