"""
Parsers personnalisés pour éviter les erreurs 400 sur les requêtes GET
"""
from rest_framework.parsers import BaseParser, JSONParser
from django.http import QueryDict
import json


class SafeJSONParser(JSONParser):
    """
    Parser JSON qui ne lève pas d'erreur si le body est vide ou invalide
    Retourne un dict vide au lieu de lever une exception
    """
    def parse(self, stream, media_type=None, parser_context=None):
        """
        Parse le JSON, retourne un dict vide si le body est vide ou invalide
        """
        try:
            if hasattr(stream, 'read'):
                data = stream.read()
                # Si le body est vide, retourner un dict vide
                if not data or len(data) == 0:
                    return {}
                # Essayer de parser le JSON
                return json.loads(data.decode('utf-8'))
            return {}
        except (json.JSONDecodeError, UnicodeDecodeError, ValueError):
            # Si le JSON est invalide, retourner un dict vide au lieu de lever une exception
            return {}
        except Exception:
            # Pour toute autre erreur, retourner un dict vide
            return {}


class EmptyParser(BaseParser):
    """
    Parser qui retourne un dict vide pour éviter les erreurs de parsing
    sur les requêtes GET ou autres requêtes sans body
    """
    media_type = '*/*'

    def parse(self, stream, media_type=None, parser_context=None):
        """
        Retourne un dict vide - utilisé pour les requêtes GET
        """
        return {}


class SafeFormParser(BaseParser):
    """
    Parser Form qui ne lève pas d'erreur si le body est vide
    """
    media_type = 'application/x-www-form-urlencoded'

    def parse(self, stream, media_type=None, parser_context=None):
        """
        Parse le body comme form data, retourne un dict vide si le body est vide
        """
        try:
            if hasattr(stream, 'read'):
                data = stream.read()
                if not data or len(data) == 0:
                    return QueryDict('', encoding='utf-8')
                return QueryDict(data, encoding='utf-8')
            return QueryDict('', encoding='utf-8')
        except Exception:
            # En cas d'erreur, retourner un QueryDict vide
            return QueryDict('', encoding='utf-8')

