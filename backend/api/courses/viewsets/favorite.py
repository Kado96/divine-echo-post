from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from api.courses.models import Favorite, Course
from api.sermons.models import Sermon
from api.courses.serializers.favorite import FavoriteSerializer


class FavoriteViewSet(viewsets.ModelViewSet):
    """ViewSet pour gérer les favoris"""
    serializer_class = FavoriteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Retourner uniquement les favoris de l'utilisateur connecté"""
        return Favorite.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        """Créer un favori pour l'utilisateur connecté"""
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['post'])
    def toggle(self, request):
        """Ajouter ou retirer un favori"""
        content_type = request.data.get('content_type')
        content_id = request.data.get('content_id')

        if not content_type or not content_id:
            return Response(
                {'error': 'content_type et content_id sont requis'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if content_type not in ['course', 'sermon']:
            return Response(
                {'error': 'content_type doit être "course" ou "sermon"'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Vérifier que le contenu existe
        if content_type == 'course':
            content = get_object_or_404(Course, id=content_id)
        else:
            content = get_object_or_404(Sermon, id=content_id)

        # Vérifier si le favori existe déjà
        favorite, created = Favorite.objects.get_or_create(
            user=request.user,
            content_type=content_type,
            content_id=content_id
        )

        if not created:
            # Le favori existe déjà, le supprimer
            favorite.delete()
            return Response({'is_favorite': False, 'message': 'Favori retiré'})

        # Le favori a été créé
        serializer = self.get_serializer(favorite)
        return Response({'is_favorite': True, 'favorite': serializer.data})

    @action(detail=False, methods=['get'])
    def check(self, request):
        """Vérifier si un contenu est en favori"""
        content_type = request.query_params.get('content_type')
        content_id = request.query_params.get('content_id')

        if not content_type or not content_id:
            return Response(
                {'error': 'content_type et content_id sont requis'},
                status=status.HTTP_400_BAD_REQUEST
            )

        is_favorite = Favorite.objects.filter(
            user=request.user,
            content_type=content_type,
            content_id=content_id
        ).exists()

        return Response({'is_favorite': is_favorite})

