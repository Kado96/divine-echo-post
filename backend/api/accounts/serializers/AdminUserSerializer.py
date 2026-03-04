from rest_framework import serializers
from django.contrib.auth.models import User

class AdminUserSerializer(serializers.ModelSerializer):
    enrollments_count = serializers.SerializerMethodField()
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)
    
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
            "enrollments_count",
        ]
        read_only_fields = ["id", "date_joined"]
        extra_kwargs = {
            'password': {'write_only': True, 'required': False},
            'username': {'required': True},
            'email': {'required': True},
        }
    
    def get_enrollments_count(self, obj):
        # Compter les inscriptions de l'utilisateur depuis le modèle Course
        try:
            from api.courses.models import Enrollment
            return Enrollment.objects.filter(user=obj).count()
        except Exception:
            return 0

    def validate_username(self, value):
        """Vérifier que le nom d'utilisateur n'existe pas déjà"""
        user = self.instance
        if User.objects.filter(username=value).exclude(pk=user.pk if user else None).exists():
            raise serializers.ValidationError("Ce nom d'utilisateur existe déjà.")
        return value

    def validate_email(self, value):
        """Vérifier que l'email n'existe pas déjà"""
        user = self.instance
        if User.objects.filter(email=value).exclude(pk=user.pk if user else None).exists():
            raise serializers.ValidationError("Cet email est déjà utilisé.")
        return value

    def create(self, validated_data):
        """Créer un nouvel utilisateur"""
        password = validated_data.pop('password', None)
        user = User(**validated_data)
        if password:
            user.set_password(password)
        user.save()
        return user

    def update(self, instance, validated_data):
        """Mettre à jour un utilisateur"""
        password = validated_data.pop('password', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        if password:
            instance.set_password(password)
        
        instance.save()
        return instance


