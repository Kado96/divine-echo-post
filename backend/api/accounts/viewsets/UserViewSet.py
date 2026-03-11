from .dependencies import *
from rest_framework.filters import SearchFilter, OrderingFilter
from ..serializers.AdminUserSerializer import AdminUserSerializer

class UserViewSet(viewsets.ModelViewSet):
	queryset = User.objects.all()
	authentication_classes = [JWTAuthentication]
	permission_classes = IsAuthenticated,
	filter_backends = [filters.DjangoFilterBackend, SearchFilter, OrderingFilter]
	filterset_fields = {
		'username': ['icontains'],
		'email': ['icontains'],
		'is_staff': ['exact'],
		'is_superuser': ['exact'],
	}
	search_fields = ['username', 'email', 'first_name', 'last_name']
	ordering_fields = ['date_joined', 'username']
	ordering = ['-date_joined']

	def get_serializer_class(self):
		# Utiliser AdminUserSerializer pour les superusers, UserSerializer pour les autres
		if self.request.user.is_superuser:
			return AdminUserSerializer
		return UserSerializer

	def get_queryset(self):
		user = self.request.user
		queryset = User.objects.all()
		if user.is_superuser:
			return queryset
		# Les utilisateurs non-admin ne voient que leur propre profil
		try:
			pk = vars(self.request)["parser_context"]["kwargs"]["pk"]
			return queryset.filter(id=pk)
		except Exception:
			return queryset.none()

	def create(self, request, *args, **kwargs):
		"""Créer un nouvel utilisateur"""
		# Vérifier que l'utilisateur est superuser
		if not request.user.is_superuser:
			return Response(
				{'detail': 'Seuls les administrateurs peuvent créer des utilisateurs.'},
				status=status.HTTP_403_FORBIDDEN
			)
		
		serializer = self.get_serializer(data=request.data)
		serializer.is_valid(raise_exception=True)
		self.perform_create(serializer)
		headers = self.get_success_headers(serializer.data)
		return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

	def perform_create(self, serializer):
		"""Créer l'utilisateur avec le mot de passe"""
		user = serializer.save()
		password = self.request.data.get('password')
		if password:
			user.set_password(password)
			user.save()

	def update(self, request, *args, **kwargs):
		"""Modifier un utilisateur"""
		# Vérifier les permissions
		if not request.user.is_superuser:
			return Response(
				{'detail': 'Seuls les administrateurs peuvent modifier les utilisateurs.'},
				status=status.HTTP_403_FORBIDDEN
			)
		
		partial = kwargs.pop('partial', False)
		instance = self.get_object()
		serializer = self.get_serializer(instance, data=request.data, partial=partial)
		serializer.is_valid(raise_exception=True)
		self.perform_update(serializer)

		if getattr(instance, '_prefetched_objects_cache', None):
			instance._prefetched_objects_cache = {}

		return Response(serializer.data)

	def perform_update(self, serializer):
		"""Mettre à jour l'utilisateur avec le mot de passe si fourni"""
		user = serializer.save()
		password = self.request.data.get('password')
		if password and password.strip():
			user.set_password(password)
			user.save()

	def destroy(self, request, *args, **kwargs):
		"""Supprimer un utilisateur"""
		# Vérifier les permissions
		if not request.user.is_superuser:
			return Response(
				{'detail': 'Seuls les administrateurs peuvent supprimer les utilisateurs.'},
				status=status.HTTP_403_FORBIDDEN
			)
		
		instance = self.get_object()
		
		# Éviter qu'un admin se supprime lui-même
		if instance.id == request.user.id:
			return Response(
				{'detail': 'Vous ne pouvez pas supprimer votre propre compte.'},
				status=status.HTTP_400_BAD_REQUEST
			)
		
		self.perform_destroy(instance)
		return Response(status=status.HTTP_204_NO_CONTENT)
