from .dependencies import *
from rest_framework.filters import SearchFilter, OrderingFilter
from ..serializers.AdminUserSerializer import AdminUserSerializer
from ..permissions import CanManageUsers

class UserViewSet(viewsets.ModelViewSet):
	queryset = User.objects.all()
	authentication_classes = [JWTAuthentication]
	permission_classes = [CanManageUsers]
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
		# Utilisé par les admins (rôle admin ou superuser)
		return AdminUserSerializer

	def get_queryset(self):
		user = self.request.user
		queryset = User.objects.all().select_related('account')
		
		if user.is_superuser:
			return queryset
			
		account = getattr(user, 'account', None)
		if account and account.role == 'admin':
			# Un admin peut voir tout le monde
			return queryset
		
		# Les autres (Team, User) ne voient que leur propre profil
		return queryset.filter(id=user.id)

	def create(self, request, *args, **kwargs):
		"""Créer un nouvel utilisateur"""
		user = request.user
		account = getattr(user, 'account', None)
		is_admin = account and account.role == 'admin'
		
		if not (user.is_superuser or is_admin):
			return Response(
				{'detail': 'Vous n\'avez pas la permission de créer des utilisateurs.'},
				status=status.HTTP_403_FORBIDDEN
			)
		
		# Un Admin (non superuser) ne peut pas créer un Superuser ou un autre Admin
		if not user.is_superuser:
			target_role = request.data.get('role')
			target_is_superuser = request.data.get('is_superuser')
			if target_role == 'admin' or target_is_superuser:
				return Response(
					{'detail': 'Seuls les super-administrateurs peuvent créer d\'autres administrateurs.'},
					status=status.HTTP_403_FORBIDDEN
				)
		
		serializer = self.get_serializer(data=request.data)
		serializer.is_valid(raise_exception=True)
		self.perform_create(serializer)
		headers = self.get_success_headers(serializer.data)
		return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

	def perform_create(self, serializer):
		"""Logique de création de base (le serializer gère le mot de passe)"""
		serializer.save()

	def update(self, request, *args, **kwargs):
		"""Modifier un utilisateur"""
		user = request.user
		instance = self.get_object()
		account = getattr(user, 'account', None)
		is_admin = account and account.role == 'admin'
		
		# Check if modifying own profile (always allowed)
		if instance.id == user.id:
			pass
		elif not (user.is_superuser or is_admin):
			return Response(
				{'detail': 'Vous n\'avez pas la permission de modifier cet utilisateur.'},
				status=status.HTTP_403_FORBIDDEN
			)
		
		# Un Admin ne peut pas modifier un Superuser ou un autre Admin
		if not user.is_superuser and instance.id != user.id:
			target_account = getattr(instance, 'account', None)
			if instance.is_superuser or (target_account and target_account.role == 'admin'):
				return Response(
					{'detail': 'Seuls les super-administrateurs peuvent modifier d\'autres administrateurs.'},
					status=status.HTTP_403_FORBIDDEN
				)
			
			# Un Admin ne peut pas promouvoir quelqu'un au rang de Superuser ou Admin
			new_role = request.data.get('role')
			new_is_superuser = request.data.get('is_superuser')
			if new_role == 'admin' or new_is_superuser:
				return Response(
					{'detail': 'Vous ne pouvez pas promouvoir un utilisateur au rang d\'administrateur.'},
					status=status.HTTP_403_FORBIDDEN
				)
		
		partial = kwargs.pop('partial', False)
		instance = self.get_object()
		serializer = self.get_serializer(instance, data=request.data, partial=partial)
		serializer.is_valid(raise_exception=True)
		self.perform_update(serializer)

		return Response(serializer.data)

	def perform_update(self, serializer):
		"""Mise à jour de base (le serializer gère le mot de passe)"""
		serializer.save()

	def destroy(self, request, *args, **kwargs):
		"""Supprimer un utilisateur"""
		user = request.user
		instance = self.get_object()
		account = getattr(user, 'account', None)
		is_admin = account and account.role == 'admin'
		
		if not (user.is_superuser or is_admin):
			return Response(
				{'detail': 'Vous n\'avez pas la permission de supprimer des utilisateurs.'},
				status=status.HTTP_403_FORBIDDEN
			)
			
		# Un Admin ne peut pas supprimer un Superuser ou un autre Admin
		if not user.is_superuser:
			target_account = getattr(instance, 'account', None)
			if instance.is_superuser or (target_account and target_account.role == 'admin'):
				return Response(
					{'detail': 'Seuls les super-administrateurs peuvent supprimer d\'autres administrateurs.'},
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
