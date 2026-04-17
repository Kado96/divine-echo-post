from rest_framework import serializers
from django.contrib.auth.models import User
from api.accounts.models import Account

class AdminUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)
    photo = serializers.ImageField(required=False, allow_null=True, write_only=True)
    photo_display = serializers.SerializerMethodField()
    remove_photo = serializers.BooleanField(write_only=True, required=False, default=False)
    role = serializers.CharField(required=False)
    
    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "password",
            "is_superuser",
            "is_staff",
            "is_active",
            "date_joined",
            "role",
            "photo",
            "photo_display",
            "remove_photo"
        ]
        read_only_fields = ["id", "date_joined", "photo_display"]
        extra_kwargs = {
            'password': {'write_only': True, 'required': True}, # Mot de passe obligatoire
            'username': {'required': True}, # Identifiant obligatoire
            'email': {'required': False, 'allow_blank': True}, # Email optionnel
        }

    def to_internal_value(self, data):
        """Conversion robuste des booléens envoyés en FormData (chaînes "true"/"false")"""
        data = data.copy()
        for field in ['is_superuser', 'is_staff', 'is_active', 'remove_photo']:
            if field in data:
                val = data[field]
                if isinstance(val, str):
                    if val.lower() == 'true':
                        data[field] = True
                    elif val.lower() == 'false':
                        data[field] = False
        return super().to_internal_value(data)

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        account = getattr(instance, 'account', None)
        if account:
            ret['role'] = account.role
        else:
            ret['role'] = 'admin' if instance.is_superuser else 'user'
        return ret

    def get_photo_display(self, obj):
        request = self.context.get('request')
        try:
            # Ne pas utiliser get_or_create ici pour éviter les erreurs 500 en lecture
            account = getattr(obj, 'account', None)
            if account and account.photo:
                photo_url = account.photo.url
                if request is not None:
                    return request.build_absolute_uri(photo_url)
                return photo_url
        except Exception:
            pass
        return None

    def validate_username(self, value):
        user = self.instance
        if User.objects.filter(username=value).exclude(pk=user.pk if user else None).exists():
            raise serializers.ValidationError("Un utilisateur avec ce nom existe déjà.")
        return value

    def validate_email(self, value):
        user = self.instance
        if User.objects.filter(email=value).exclude(pk=user.pk if user else None).exists():
            raise serializers.ValidationError("Cet email est déjà utilisé par un autre compte.")
        return value

    def create(self, validated_data):
        photo = validated_data.pop('photo', None)
        password = validated_data.pop('password', None)
        remove_photo = validated_data.pop('remove_photo', False) # On retire ce champ car il n'existe pas sur le modèle User
        
        # Création de l'utilisateur
        role = validated_data.pop('role', 'user')
        
        # S'il y a un rôle d'admin ou équipe, s'assurer que is_staff est True
        if role in ['admin', 'team', 'user']:
            validated_data['is_staff'] = True

        user = User.objects.create(**validated_data)
        if password:
            user.set_password(password)
            user.save()
        
        # Création sécurisée de l'account
        try:
            account, created = Account.objects.get_or_create(user=user)
            account.role = role
            if photo:
                try:
                    account.photo = photo
                except Exception as e:
                    import logging
                    logger = logging.getLogger('django.request')
                    logger.error(f"Erreur lors de l'upload de la photo pour {user.username}: {e}")
            account.save()
        except Exception as e:
            import logging
            logger = logging.getLogger('django.request')
            logger.error(f"Erreur lors de la création de l'Account pour {user.username}: {e}")
            
        return user

    def update(self, instance, validated_data):
        photo = validated_data.pop('photo', None)
        remove_photo = validated_data.pop('remove_photo', False)
        password = validated_data.pop('password', None)
        role = validated_data.pop('role', None)
        
        # Mise à jour des champs basiques
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        if password:
            instance.set_password(password)
        
        instance.save()
        
        try:
            account, created = Account.objects.get_or_create(user=instance)
            if role:
                account.role = role
            
            if photo:
                account.photo = photo
            elif remove_photo:
                account.photo = None
            
            account.save()
        except Exception as e:
            import logging
            logger = logging.getLogger('django.request')
            logger.error(f"Erreur gestion Account update pour {instance.username}: {e}")
            
        return instance
