from rest_framework import viewsets, status, parsers
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from rest_framework.renderers import JSONRenderer
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.conf import settings as django_settings
import logging
from api.accounts.permissions import IsAdminManager
from .models import SiteSettings, TeamMember
from .serializers import SiteSettingsSerializer, TeamMemberSerializer

logger = logging.getLogger(__name__)


class SiteSettingsCurrentView(APIView):
    """
    Vue API simple pour récupérer les paramètres du site
    GET /api/settings/current/ - Retourne l'objet unique directement
    """
    permission_classes = [AllowAny]
    authentication_classes = []
    # Forcer le renderer JSON et désactiver la pagination
    renderer_classes = [JSONRenderer]
    pagination_class = None
    # Parser JSON pour les requêtes (même si GET n'a pas de body, DRF en a besoin)
    parser_classes = [parsers.JSONParser]
    
    def get(self, request):
        """Récupérer les paramètres du site"""
        try:
            logger.info(f"Requête reçue sur /api/settings/current/ depuis {request.META.get('REMOTE_ADDR', 'unknown')}")
            
            # Essayer de récupérer l'instance
            try:
                settings = SiteSettings.objects.get(pk=1)
                logger.info(f"Instance SiteSettings trouvée (ID: {settings.id})")
            except SiteSettings.DoesNotExist:
                logger.warning("Instance SiteSettings non trouvée, création...")
                # Créer l'instance si elle n'existe pas
                try:
                    settings = SiteSettings.objects.create(
                        pk=1,
                        site_name='Shalom Ministry',
                        description='Plateforme de formation chrétienne en ligne',
                        contact_email='contact@shalomministry.org',
                        contact_phone='+257 79 000 000',
                        contact_address='Bujumbura, Burundi',
                        hero_title_fr='Grandissez dans la foi',
                        hero_subtitle_fr='Découvrez nos émissions, enseignements et temps de méditation pour approfondir votre relation avec Dieu.',
                        about_content_fr='Bienvenue sur Shalom Ministry, une plateforme dédiée à la croissance spirituelle.',
                        contact_content_fr='Contactez-nous pour toute question ou demande.',
                    )
                    logger.info(f"Instance SiteSettings créée (ID: {settings.id})")
                except Exception as create_error:
                    logger.error(f"Erreur lors de la création de SiteSettings: {create_error}", exc_info=True)
                    # Retourner une réponse minimale même si la création échoue
                    return Response(
                        {
                            'id': 1,
                            'site_name': 'Shalom Ministry',
                            'description': 'Plateforme de formation chrétienne en ligne',
                            'error': 'creation_error',
                            'message': f'Erreur lors de la création: {str(create_error)}'
                        },
                        status=status.HTTP_200_OK
                    )
            
            # Sérialiser avec le contexte de la requête
            try:
                serializer = SiteSettingsSerializer(settings, context={'request': request})
                data = serializer.data
                logger.info(f"Sérialisation réussie, {len(data)} champs")
                
                # Utiliser Response de DRF pour garantir le format JSON correct
                return Response(data, status=status.HTTP_200_OK)
            except Exception as ser_error:
                logger.error(f"Erreur de sérialisation: {ser_error}", exc_info=True)
                # Retourner un JSON minimal en cas d'erreur de sérialisation
                try:
                    minimal_data = {
                        'id': getattr(settings, 'id', 1),
                        'site_name': getattr(settings, 'site_name', 'Shalom Ministry'),
                        'description': getattr(settings, 'description', '') or '',
                        'contact_email': getattr(settings, 'contact_email', '') or '',
                        'contact_phone': getattr(settings, 'contact_phone', '') or '',
                        'contact_address': getattr(settings, 'contact_address', '') or '',
                        'hero_title_fr': getattr(settings, 'hero_title_fr', '') or '',
                        'hero_subtitle_fr': getattr(settings, 'hero_subtitle_fr', '') or '',
                        'error': 'serialization_partial',
                        'message': f'Sérialisation partielle due à: {str(ser_error)}'
                    }
                    return Response(minimal_data, status=status.HTTP_200_OK)
                except Exception as minimal_error:
                    logger.error(f"Erreur même lors de la création de la réponse minimale: {minimal_error}", exc_info=True)
                    return Response(
                        {
                            'error': 'critical_error',
                            'message': f'Erreur critique: {str(minimal_error)}'
                        },
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                    )
            
        except Exception as e:
            import traceback
            error_traceback = traceback.format_exc()
            logger.error(f"Erreur dans SiteSettingsCurrentView: {str(e)}", exc_info=True)
            logger.error(f"Traceback: {error_traceback}")
            
            # Retourner une erreur JSON claire avec Response de DRF
            error_data = {
                'detail': f'Erreur lors de la récupération des paramètres: {str(e)}',
                'error': 'retrieval_error',
                'error_type': type(e).__name__,
            }
            if django_settings.DEBUG:
                error_data['traceback'] = error_traceback
            return Response(error_data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SiteSettingsViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les paramètres du site
    - GET /api/settings/ : Récupérer les paramètres (public)
    - PUT/PATCH /api/settings/1/ : Modifier les paramètres (admin seulement)
    - PATCH /api/settings/1/ avec FormData : Upload de logo
    """
    queryset = SiteSettings.objects.all()
    serializer_class = SiteSettingsSerializer
    lookup_field = 'pk'
    pagination_class = None  # Désactiver complètement la pagination pour éviter les erreurs 400
    parser_classes = (MultiPartParser, FormParser, JSONParser)  # Support pour les uploads de fichiers
    
    def get_permissions(self):
        """Permettre la lecture publique, l'écriture admin seulement"""
        if self.action in ['list', 'retrieve', 'current']:
            return [AllowAny()]
        return [IsAdminManager()]
    
    @property
    def paginator(self):
        """Désactiver complètement la pagination - retourner toujours None"""
        return None
    
    def paginate_queryset(self, queryset):
        """Désactiver complètement la pagination pour éviter les erreurs 400"""
        return None
    
    def filter_queryset(self, queryset):
        """Ne pas filtrer pour éviter les erreurs"""
        return queryset
    
    def list(self, request, *args, **kwargs):
        """Retourne toujours la première (et seule) instance - Version simplifiée"""
        try:
            # S'assurer que self.request est correctement défini
            self.request = request
            
            # Récupérer ou créer l'instance
            try:
                settings = SiteSettings.objects.get(pk=1)
            except SiteSettings.DoesNotExist:
                settings = SiteSettings.objects.create(
                    pk=1,
                    site_name='Shalom Ministry',
                    description='Plateforme de formation chrétienne en ligne',
                    contact_email='contact@shalomministry.org',
                    contact_phone='+257 79 000 000',
                    contact_address='Bujumbura, Burundi',
                    hero_title_fr='Grandissez dans la foi',
                    hero_subtitle_fr='Découvrez nos émissions, enseignements et temps de méditation pour approfondir votre relation avec Dieu.',
                    about_content_fr='Bienvenue sur Shalom Ministry, une plateforme dédiée à la croissance spirituelle.',
                    contact_content_fr='Contactez-nous pour toute question ou demande.',
                )
            
            # Sérialiser et retourner - IMPORTANT: retourner une liste même pour un singleton
            try:
                serializer = self.get_serializer(settings, context={'request': request})
                # Retourner une liste avec un seul élément pour respecter l'API REST
                return Response([serializer.data], status=status.HTTP_200_OK)
            except Exception as ser_error:
                # Si le serializer échoue, retourner une liste vide plutôt qu'une erreur
                logger.error(f"Erreur de sérialisation dans list(): {ser_error}", exc_info=True)
                return Response([], status=status.HTTP_200_OK)
        except Exception as e:
            # En cas d'erreur, retourner une liste vide plutôt qu'une erreur 500
            logger.error(f"Erreur dans list(): {e}", exc_info=True)
            return Response([], status=status.HTTP_200_OK)
    
    def retrieve(self, request, *args, **kwargs):
        """Retourne toujours la première (et seule) instance"""
        try:
            # Essayer de récupérer les settings
            try:
                settings = SiteSettings.get_settings()
            except Exception:
                # Si get_settings échoue, créer l'instance directement
                settings, created = SiteSettings.objects.get_or_create(pk=1)
            
            # S'assurer que l'instance existe
            if not settings:
                settings, created = SiteSettings.objects.get_or_create(pk=1)
            
            # Sérialiser avec gestion d'erreur
            try:
                serializer = self.get_serializer(settings, context={'request': request})
                return Response(serializer.data)
            except Exception as e:
                # Si le serializer échoue, retourner une réponse JSON d'erreur
                return Response(
                    {
                        'detail': f'Erreur lors de la sérialisation: {str(e)}',
                        'error': 'serialization_error'
                    },
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        except Exception as e:
            # En cas d'erreur, créer l'instance avec les valeurs par défaut
            try:
                settings, created = SiteSettings.objects.get_or_create(
                    pk=1,
                    defaults={
                        'site_name': 'Shalom Ministry',
                        'description': 'Plateforme de formation chrétienne en ligne',
                        'contact_email': 'contact@shalomministry.org',
                        'contact_phone': '+257 79 000 000',
                        'contact_address': 'Bujumbura, Burundi',
                        'hero_title': 'Grandissez dans la foi',
                        'hero_subtitle': 'Découvrez nos émissions, enseignements et temps de méditation pour approfondir votre relation avec Dieu.',
                        'about_content': 'Bienvenue sur Shalom Ministry, une plateforme dédiée à la croissance spirituelle.',
                        'contact_content': 'Contactez-nous pour toute question ou demande.',
                    }
                )
                serializer = self.get_serializer(settings, context={'request': request})
                return Response(serializer.data)
            except Exception as e2:
                # Si même la création échoue, retourner une erreur JSON
                return Response(
                    {
                        'detail': f'Erreur lors de la création des paramètres: {str(e2)}',
                        'error': 'creation_error'
                    },
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
    
    def create(self, request, *args, **kwargs):
        """Créer ou récupérer l'instance unique"""
        settings, created = SiteSettings.objects.get_or_create(pk=1, defaults=request.data)
        serializer = self.get_serializer(settings, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
    
    def update(self, request, *args, **kwargs):
        """Mettre à jour l'instance unique"""
        settings = SiteSettings.get_settings()
        serializer = self.get_serializer(settings, data=request.data, partial=kwargs.get('partial', False), context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
    
    def partial_update(self, request, *args, **kwargs):
        """Mettre à jour partiellement l'instance unique"""
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)
    
    @action(detail=False, methods=['get'], permission_classes=[AllowAny], url_path='current')
    def current(self, request):
        """Action personnalisée pour récupérer l'objet unique directement (sans liste)"""
        try:
            # Désactiver la pagination pour cette action (déjà géré par la propriété paginator)
            
            # Utiliser get_settings() qui gère automatiquement la création si nécessaire
            settings = SiteSettings.get_settings()
            
            # S'assurer que l'instance existe
            if not settings:
                # Si get_settings() retourne None, créer l'instance
                settings = SiteSettings.objects.create(
                    pk=1,
                    site_name='Shalom Ministry',
                    description='Plateforme de formation chrétienne en ligne',
                    contact_email='contact@shalomministry.org',
                    contact_phone='+257 79 000 000',
                    contact_address='Bujumbura, Burundi',
                    hero_title_fr='Grandissez dans la foi',
                    hero_subtitle_fr='Découvrez nos émissions, enseignements et temps de méditation pour approfondir votre relation avec Dieu.',
                    about_content_fr='Bienvenue sur Shalom Ministry, une plateforme dédiée à la croissance spirituelle.',
                    contact_content_fr='Contactez-nous pour toute question ou demande.',
                )
            
            # Sérialiser avec le contexte de la requête pour les URLs absolues
            serializer = self.get_serializer(settings, context={'request': request})
            
            # Retourner le JSON directement (DRF le formate automatiquement)
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except SiteSettings.DoesNotExist:
            # Créer l'instance si elle n'existe pas
            try:
                settings = SiteSettings.objects.create(
                    pk=1,
                    site_name='Shalom Ministry',
                    description='Plateforme de formation chrétienne en ligne',
                    contact_email='contact@shalomministry.org',
                    contact_phone='+257 79 000 000',
                    contact_address='Bujumbura, Burundi',
                    hero_title_fr='Grandissez dans la foi',
                    hero_subtitle_fr='Découvrez nos émissions, enseignements et temps de méditation pour approfondir votre relation avec Dieu.',
                    about_content_fr='Bienvenue sur Shalom Ministry, une plateforme dédiée à la croissance spirituelle.',
                    contact_content_fr='Contactez-nous pour toute question ou demande.',
                )
                serializer = self.get_serializer(settings, context={'request': request})
                return Response(serializer.data, status=status.HTTP_200_OK)
            except Exception as create_error:
                logger.error(f"Erreur lors de la création de SiteSettings: {create_error}", exc_info=True)
                return Response(
                    {
                        'detail': f'Erreur lors de la création des paramètres: {str(create_error)}',
                        'error': 'creation_error'
                    },
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        except Exception as e:
            import traceback
            error_detail = str(e)
            error_traceback = traceback.format_exc() if django_settings.DEBUG else None
            logger.error(f"Erreur dans current(): {error_detail}", exc_info=True)
            return Response(
                {
                    'detail': f'Erreur lors de la récupération des paramètres: {error_detail}',
                    'error': 'retrieval_error',
                    'traceback': error_traceback
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class TeamMemberViewSet(viewsets.ModelViewSet):
    """ViewSet pour gérer les membres de l'équipe"""
    queryset = TeamMember.objects.all()
    serializer_class = TeamMemberSerializer
    permission_classes = [AllowAny]
    pagination_class = None
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    def get_permissions(self):
        """Lecture publique, écriture admin seulement"""
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAdminManager()]
