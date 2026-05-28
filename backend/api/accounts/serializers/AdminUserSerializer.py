from rest_framework import serializers
from django.contrib.auth.models import User
from api.accounts.models import Account

class AdminUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)
    photo = serializers.ImageField(required=False, allow_null=True, write_only=True)
    photo_display = serializers.SerializerMethodField()
    remove_photo = serializers.BooleanField(write_only=True, required=False, default=False)
    role = serializers.CharField(required=False)
    banner = serializers.ImageField(required=False, allow_null=True, write_only=True)
    is_banned = serializers.BooleanField(required=False, default=False)
    deactivated_at = serializers.DateTimeField(required=False, allow_null=True)
    
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
            "banner",
            "is_banned",
            "deactivated_at",
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
        request = self.context.get('request')
        account = getattr(instance, 'account', None)
        if account:
            ret['role'] = account.role
            ret['is_banned'] = account.is_banned
            ret['deactivated_at'] = account.deactivated_at
            if account.banner:
                ret['banner'] = request.build_absolute_uri(account.banner.url) if request else account.banner.url
            else:
                ret['banner'] = None
        else:
            ret['role'] = 'admin' if instance.is_superuser else 'user'
            ret['is_banned'] = False
            ret['deactivated_at'] = None
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
        banner = validated_data.pop('banner', None)
        is_banned = validated_data.pop('is_banned', None)
        deactivated_at = validated_data.pop('deactivated_at', None)
        password = validated_data.pop('password', None)
        remove_photo = validated_data.pop('remove_photo', False)
        
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
                account.photo = photo
            if banner:
                account.banner = banner
            if is_banned is not None:
                account.is_banned = is_banned
            if deactivated_at:
                account.deactivated_at = deactivated_at
            account.save()
        except Exception as e:
            import logging
            logger = logging.getLogger('django.request')
            logger.error(f"Erreur lors de la création de l'Account pour {user.username}: {e}")
            
        return user

    def update(self, instance, validated_data):
        photo = validated_data.pop('photo', None)
        banner = validated_data.pop('banner', None)
        is_banned = validated_data.pop('is_banned', None)
        deactivated_at = validated_data.pop('deactivated_at', None)
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
            
            if banner:
                account.banner = banner
            elif remove_photo:
                account.photo = None
            
            if is_banned is not None:
                account.is_banned = is_banned
            if deactivated_at:
                account.deactivated_at = deactivated_at
                
            account.save()
        except Exception as e:
            import logging
            logger = logging.getLogger('django.request')
            logger.error(f"Erreur gestion Account update pour {instance.username}: {e}")
            
        return instance
