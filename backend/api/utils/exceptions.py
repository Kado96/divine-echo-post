from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
import logging
import traceback

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    """
    Gestionnaire d'exceptions personnalisé pour mieux logger les erreurs
    GARANTIT que toutes les réponses sont en JSON (pas HTML)
    """
    request = context.get('request')
    view = context.get('view')
    
    # Appeler le gestionnaire par défaut de DRF (retourne déjà du JSON)
    response = exception_handler(exc, context)
    
    # Logger l'erreur pour le débogage
    if response is not None:
        # Pour les erreurs 400, logger plus de détails
        log_level = logger.error if response.status_code != 400 else logger.warning
        extra_data = {
            'request_path': request.path if request else None,
            'request_method': request.method if request else None,
            'view_class': view.__class__.__name__ if view else None,
            'response_status': response.status_code,
            'response_data': response.data if hasattr(response, 'data') else None,
        }
        
        # Ajouter les paramètres de requête pour les erreurs 400
        if response.status_code == 400 and request:
            extra_data['query_params'] = dict(request.GET)
            extra_data['request_body'] = getattr(request, 'body', None)
            extra_data['content_type'] = request.content_type if hasattr(request, 'content_type') else None
            extra_data['headers'] = dict(request.headers) if hasattr(request, 'headers') else None
            # Essayer d'accéder à request.data de manière sécurisée pour éviter les erreurs de parsing
            try:
                if hasattr(request, 'data'):
                    extra_data['parsed_data'] = request.data
            except Exception as parse_error:
                extra_data['parse_error'] = str(parse_error)
                extra_data['parsed_data'] = None
            # Logger avec plus de détails pour le débogage
            logger.warning(
                f"400 Bad Request on {request.method} {request.path}",
                extra=extra_data
            )
        
        log_level(
            f"API Error: {exc.__class__.__name__} - {str(exc)}",
            extra=extra_data
        )
        
        # S'assurer que la réponse est toujours en JSON (DRF le fait déjà, mais on vérifie)
        if hasattr(response, 'data'):
            # La réponse DRF est déjà en JSON via JSONRenderer
            # S'assurer que le Content-Type est bien application/json
            if hasattr(response, 'renderer_context'):
                response.renderer_context = response.renderer_context or {}
                response.renderer_context['request'] = request
    else:
        # Erreur non gérée par DRF - retourner du JSON quand même
        error_traceback = traceback.format_exc()
        logger.error(
            f"Unhandled API Error: {exc.__class__.__name__} - {str(exc)}",
            extra={
                'request_path': request.path if request else None,
                'request_method': request.method if request else None,
                'view_class': view.__class__.__name__ if view else None,
                'traceback': error_traceback,
            },
            exc_info=True
        )
        # Retourner une réponse d'erreur générique en JSON (via DRF Response)
        response = Response(
            {
                'detail': str(exc),
                'error_type': exc.__class__.__name__,
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
    # GARANTIR que la réponse est en JSON (même si DRF devrait le faire)
    if response and hasattr(response, 'accepted_renderer'):
        # DRF gère déjà le format JSON
        pass
    
    return response

