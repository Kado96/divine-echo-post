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

    def get_photo_display(self, obj):
        request = self.context.get('request')
        try:
            # S'assurer que l'account existe
            account, created = Account.objects.get_or_create(user=obj)
            if account.photo:
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
            raise serializers.ValidationError("Ce nom d'utilisateur existe déjà.")
        return value

    def validate_email(self, value):
        user = self.instance
        if User.objects.filter(email=value).exclude(pk=user.pk if user else None).exists():
            raise serializers.ValidationError("Cet email est déjà utilisé.")
        return value

    def create(self, validated_data):
        photo = validated_data.pop('photo', None)
        password = validated_data.pop('password', None)
        user = User(**validated_data)
        if password:
            user.set_password(password)
        user.save()
        
        account, created = Account.objects.get_or_create(user=user)
        if photo:
            account.photo = photo
            account.save()
            
        return user

    def update(self, instance, validated_data):
        photo = validated_data.pop('photo', None)
        remove_photo = validated_data.pop('remove_photo', False)
        password = validated_data.pop('password', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        if password:
            instance.set_password(password)
        
        instance.save()
        
        if photo:
            account, created = Account.objects.get_or_create(user=instance)
            account.photo = photo
            account.save()
        elif remove_photo:
            account, created = Account.objects.get_or_create(user=instance)
            account.photo = None
            account.save()
            
        return instance
