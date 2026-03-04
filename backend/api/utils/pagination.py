from rest_framework.pagination import LimitOffsetPagination
from rest_framework.exceptions import ValidationError


class CustomLimitOffsetPagination(LimitOffsetPagination):
    """
    Pagination personnalisée avec meilleure gestion des erreurs
    """
    default_limit = 100
    limit_query_param = 'limit'
    offset_query_param = 'offset'
    max_limit = 1000  # Limite maximale pour éviter les abus
    
    def get_limit(self, request):
        """
        Récupère la limite avec gestion d'erreur améliorée
        """
        if self.limit_query_param:
            limit_str = request.query_params.get(self.limit_query_param)
            if limit_str is None or limit_str == '':
                return self.default_limit
            
            try:
                # Convertir en entier
                limit = int(limit_str)
                
                # Vérifier les limites
                if limit < 0:
                    raise ValidationError({
                        'limit': 'La limite doit être un nombre positif.'
                    })
                
                if limit > self.max_limit:
                    limit = self.max_limit
                
                return limit
            except ValueError:
                # Si la valeur n'est pas un entier valide, retourner la limite par défaut
                # au lieu de lever une ValidationError pour éviter les erreurs 400
                # sur les ViewSets qui n'utilisent pas la pagination
                return self.default_limit
    
    def get_offset(self, request):
        """
        Récupère l'offset avec gestion d'erreur améliorée
        """
        if self.offset_query_param:
            offset_str = request.query_params.get(self.offset_query_param)
            if offset_str is None or offset_str == '':
                return 0
            
            try:
                # Convertir en entier
                offset = int(offset_str)
                
                # Vérifier que l'offset est positif
                if offset < 0:
                    raise ValidationError({
                        'offset': 'L\'offset doit être un nombre positif ou zéro.'
                    })
                
                return offset
            except ValueError:
                # Si la valeur n'est pas un entier valide, retourner 0
                # au lieu de lever une ValidationError pour éviter les erreurs 400
                # sur les ViewSets qui n'utilisent pas la pagination
                return 0

