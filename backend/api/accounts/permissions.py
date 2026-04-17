from rest_framework import permissions

class IsSuperUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_superuser

class IsAdminManager(permissions.BasePermission):
    """Accès complet mais ne peut pas modifier les superusers ou d'autres admins."""
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        if request.user.is_superuser:
            return True
        account = getattr(request.user, 'account', None)
        return account and account.role == 'admin'

class IsTeamMember(permissions.BasePermission):
    """Accès aux contenus (sermons, categories, annonces, témoignages)."""
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        if request.user.is_superuser:
            return True
        account = getattr(request.user, 'account', None)
        return account and account.role in ['team', 'admin']

class IsSimpleUser(permissions.BasePermission):
    """Accès uniquement aux sermons et témoignages."""
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        if request.user.is_superuser:
            return True
        account = getattr(request.user, 'account', None)
        return account and account.role in ['user', 'team', 'admin']

class CanManageUsers(permissions.BasePermission):
    """Seuls les Superusers peuvent créer/supprimer des Admins."""
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        if request.user.is_superuser:
            return True
        
        account = getattr(request.user, 'account', None)
        if not account or account.role != 'admin':
            return False
            
        # Un Admin peut voir la liste des utilisateurs
        if request.method in permissions.SAFE_METHODS:
            return True
            
        # Pour la création/modification, on check le rôle de la cible dans le viewset
        return True

    def has_object_permission(self, request, view, obj):
        if request.user.is_superuser:
            return True
            
        # Un Admin ne peut pas modifier un Superuser
        if obj.is_superuser:
            return False
            
        # Un Admin ne peut pas modifier/supprimer un autre Admin
        target_account = getattr(obj, 'account', None)
        if target_account and target_account.role == 'admin' and obj != request.user:
            return False
            
        return True
