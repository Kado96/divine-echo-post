from rest_framework import serializers
from django.contrib.auth.models import User
from api.accounts.models import Account

class AdminUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)
    photo = serializers.ImageField(required=False, allow_null=True, write_only=True)
    photo_display = serializers.SerializerMethodField()
    remove_photo = serializers.BooleanField(write_only=True, required=False, default=False)
    
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
            "photo",
            "photo_display",
            "remove_photo"
        ]
        read_only_fields = ["id", "date_joined", "photo_display"]
        extra_kwargs = {
            'password': {'write_only': True, 'required': False},
            'username': {'required': True},
            'email': {'required': True},
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
        
        # Création de l'utilisateur
        user = User.objects.create(**validated_data)
        if password:
            user.set_password(password)
            user.save()
        
        # Création sécurisée de l'account
        try:
            account, created = Account.objects.get_or_create(user=user)
            if photo:
                try:
                    account.photo = photo
                    account.save()
                except Exception as e:
                    import logging
                    logger = logging.getLogger('django.request')
                    logger.error(f"Erreur lors de l'upload de la photo pour {user.username}: {e}")
                    # On continue même si la photo échoue pour éviter une erreur 500
        except Exception as e:
            import logging
            logger = logging.getLogger('django.request')
            logger.error(f"Erreur lors de la création de l'Account pour {user.username}: {e}")
            
        return user

    def update(self, instance, validated_data):
        photo = validated_data.pop('photo', None)
        remove_photo = validated_data.pop('remove_photo', False)
        password = validated_data.pop('password', None)
        
        # Mise à jour des champs basiques
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        if password:
            instance.set_password(password)
        
        instance.save()
        
        try:
            if photo or remove_photo:
                account, created = Account.objects.get_or_create(user=instance)
                if photo:
                    try:
                        account.photo = photo
                        account.save()
                    except Exception as e:
                        import logging
                        logger = logging.getLogger('django.request')
                        logger.error(f"Erreur upload photo update pour {instance.username}: {e}")
                elif remove_photo:
                    account.photo = None
                    account.save()
        except Exception as e:
            import logging
            logger = logging.getLogger('django.request')
            logger.error(f"Erreur gestion Account update pour {instance.username}: {e}")
            
        return instance
