"""
Middleware CORS ultra-simple qui ne peut pas planter
"""
from django.http import HttpResponse


class CorsMiddleware:
    """
    Middleware CORS qui fonctionne toujours, même en cas d'erreur
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Traitement spécial pour OPTIONS
        if request.method == 'OPTIONS':
            response = HttpResponse('OK', status=200)
        else:
            # Traiter la requête normalement
            response = self.get_response(request)
        
        # Ajouter les headers CORS à TOUTES les réponses
        response['Access-Control-Allow-Origin'] = '*'
        response['Access-Control-Allow-Methods'] = 'GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD'
        response['Access-Control-Allow-Headers'] = 'accept, authorization, content-type, user-agent, x-csrftoken, x-requested-with'
        response['Access-Control-Allow-Credentials'] = 'true'
        response['Access-Control-Max-Age'] = '3600'
        
        return response
