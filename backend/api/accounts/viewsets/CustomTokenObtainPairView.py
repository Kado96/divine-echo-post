from .dependencies import *
from rest_framework import parsers
from rest_framework.response import Response
from rest_framework import status
import logging

logger = logging.getLogger(__name__)

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    # S'assurer que les parsers JSON sont disponibles
    parser_classes = [parsers.JSONParser, parsers.FormParser, parsers.MultiPartParser]
    
    def post(self, request, *args, **kwargs):
        """Override post pour gérer les erreurs de sérialisation"""
        try:
            return super().post(request, *args, **kwargs)
        except Exception as e:
            logger.error(f"Erreur dans CustomTokenObtainPairView.post: {e}", exc_info=True)
            # Retourner une erreur JSON claire
            error_data = {
                'detail': f'Erreur lors de la connexion: {str(e)}',
                'error': 'login_error',
                'error_type': type(e).__name__,
            }
            return Response(error_data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)