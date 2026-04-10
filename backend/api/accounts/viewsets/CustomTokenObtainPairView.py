from .dependencies import *
from rest_framework import parsers
from rest_framework.response import Response
from rest_framework import status
import logging

logger = logging.getLogger(__name__)

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    permission_classes = [AllowAny]
    authentication_classes = []
    # S'assurer que les parsers JSON sont disponibles
    parser_classes = [parsers.JSONParser, parsers.FormParser, parsers.MultiPartParser]
    
    def post(self, request, *args, **kwargs):
        """Override post pour assurer le bon format de réponse et ajouter du log"""
        from rest_framework.exceptions import APIException
        
        username = request.data.get('username')
        logger.info(f"Tentative de connexion pour l'utilisateur: {username}")
        
        try:
            response = super().post(request, *args, **kwargs)
            if response.status_code == 200:
                logger.info(f"Connexion réussie pour {username}")
            return response
        except APIException as e:
            logger.warning(f"Échec authentification pour {username}: {str(e)}")
            raise e
        except Exception as e:
            logger.error(f"Erreur inattendue dans CustomTokenObtainPairView.post: {e}", exc_info=True)
            # Retourner une erreur JSON claire pour les vraies erreurs 500
            error_data = {
                'detail': f'Erreur inattendue: {str(e)}',
                'error': 'server_error',
                'error_type': type(e).__name__,
            }
            return Response(error_data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)