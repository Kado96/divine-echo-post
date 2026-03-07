from rest_framework import serializers
from .models import SermonCategory, Sermon


class SermonCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = SermonCategory
        fields = ("id", "name", "slug", "description", "icon")


class SermonListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Sermon
        fields = (
            "id",
            "title",
            "slug",
            "description",
            "preacher_name",
            "category",
            "category_name",
            "language",
            "image",
            "image_url",
            "content_type",
            "featured",
            "is_active",
            "sermon_date",
            "duration_minutes",
            "views_count",
        )

    def get_image_url(self, obj):
        request = self.context.get("request")
        if obj.image:
            url = obj.image.url
            if request:
                return request.build_absolute_uri(url)
            return url
        return None


class SermonDetailSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Sermon
        fields = (
            "id",
            "title",
            "slug",
            "description",
            "preacher_name",
            "category",
            "category_name",
            "language",
            "content_type",
            "duration_minutes",
            "video_url",
            "video_file",
            "audio_url",
            "audio_file",
            "image",
            "image_url",
            "featured",
            "is_active",
            "sermon_date",
            "views_count",
            "created_at",
            "updated_at",
        )

    def get_image_url(self, obj):
        request = self.context.get("request")
        if obj.image:
            url = obj.image.url
            if request:
                return request.build_absolute_uri(url)
            return url
        return None


class AdminSermonSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Sermon
        fields = (
            "id",
            "title",
            "slug",
            "description",
            "preacher_name",
            "category",
            "category_name",
            "language",
            "content_type",
            "duration_minutes",
            "video_url",
            "video_file",
            "audio_url",
            "audio_file",
            "image",
            "image_url",
            "featured",
            "is_active",
            "sermon_date",
            "views_count",
            "created_at",
            "updated_at",
        )

    def get_image_url(self, obj):
        request = self.context.get("request")
        if obj.image:
            url = obj.image.url
            if request:
                return request.build_absolute_uri(url)
            return url
        return None
