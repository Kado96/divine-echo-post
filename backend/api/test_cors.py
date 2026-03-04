"""
Vue de test simple pour vérifier CORS
"""
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods


@csrf_exempt  # Pas de CSRF pour les tests
@require_http_methods(["GET", "POST", "OPTIONS"])
def test_cors(request):
    """
    Endpoint de test CORS ultra-simple
    """
    return JsonResponse({
        'status': 'OK',
        'method': request.method,
        'message': 'CORS fonctionne !',
        'origin': request.META.get('HTTP_ORIGIN', 'No origin'),
    })
