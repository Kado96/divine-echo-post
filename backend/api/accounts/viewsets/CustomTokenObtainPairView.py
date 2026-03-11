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
        """Override post pour assurer le bon format de réponse"""
        from rest_framework.exceptions import APIException
        try:
            return super().post(request, *args, **kwargs)
        except APIException as e:
            # Laisser DRF gérer ses propres exceptions (Authentification, Validation)
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