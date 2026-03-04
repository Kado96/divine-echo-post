from rest_framework import serializers
from api.courses.models import Favorite, Course
from api.sermons.models import Sermon


class FavoriteSerializer(serializers.ModelSerializer):
    """Serializer pour les favoris"""
    content_title = serializers.SerializerMethodField()
    content_slug = serializers.SerializerMethodField()
    content_image = serializers.SerializerMethodField()
    
    class Meta:
        model = Favorite
        fields = [
            'id',
            'user',
            'content_type',
            'content_id',
            'content_title',
            'content_slug',
            'content_image',
            'created_at',
        ]
        read_only_fields = ['id', 'user', 'created_at']

    def get_content_title(self, obj):
        """Récupérer le titre du contenu (course ou sermon)"""
        if obj.content_type == 'course':
            try:
                course = Course.objects.get(id=obj.content_id)
                return course.title
            except Course.DoesNotExist:
                return None
        elif obj.content_type == 'sermon':
            try:
                sermon = Sermon.objects.get(id=obj.content_id)
                return sermon.title
            except Sermon.DoesNotExist:
                return None
        return None

    def get_content_slug(self, obj):
        """Récupérer le slug du contenu"""
        if obj.content_type == 'course':
            try:
                course = Course.objects.get(id=obj.content_id)
                return course.slug
            except Course.DoesNotExist:
                return None
        elif obj.content_type == 'sermon':
            try:
                sermon = Sermon.objects.get(id=obj.content_id)
                return sermon.slug
            except Sermon.DoesNotExist:
                return None
        return None

    def get_content_image(self, obj):
        """Récupérer l'image du contenu"""
        request = self.context.get('request')
        if obj.content_type == 'course':
            try:
                course = Course.objects.get(id=obj.content_id)
                if course.image:
                    if request:
                        return request.build_absolute_uri(course.image.url)
                    return course.image.url
            except Course.DoesNotExist:
                return None
        elif obj.content_type == 'sermon':
            try:
                sermon = Sermon.objects.get(id=obj.content_id)
                if sermon.image:
                    if request:
                        return request.build_absolute_uri(sermon.image.url)
                    return sermon.image.url
            except Sermon.DoesNotExist:
                return None
        return None

