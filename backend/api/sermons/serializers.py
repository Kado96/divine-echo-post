from rest_framework import serializers
from .models import SermonCategory, Sermon, SermonComment


class SermonCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = SermonCategory
        fields = (
            "id", "name", "name_fr", "name_en", "name_rn", "name_sw",
            "slug", "description", "description_fr", "description_en", 
            "description_rn", "description_sw", "icon"
        )


class SermonListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)
    image_url = serializers.SerializerMethodField()
    audio_file_url = serializers.SerializerMethodField()
    video_file_url = serializers.SerializerMethodField()

    class Meta:
        model = Sermon
        fields = (
            "id",
            "title", "title_fr", "title_en", "title_rn", "title_sw",
            "slug",
            "description", "description_fr", "description_en", "description_rn", "description_sw",
            "preacher_name",
            "category",
            "category_name",
            "language",
            "content_type",
            "image",
            "image_url",
            "video_url",
            "video_file",
            "video_file_url",
            "audio_url",
            "audio_file",
            "audio_file_url",
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

    def get_audio_file_url(self, obj):
        request = self.context.get("request")
        if obj.audio_file:
            url = obj.audio_file.url
            if request:
                return request.build_absolute_uri(url)
            return url
        return None

    def get_video_file_url(self, obj):
        request = self.context.get("request")
        if obj.video_file:
            url = obj.video_file.url
            if request:
                return request.build_absolute_uri(url)
            return url
        return None


class SermonDetailSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)
    image_url = serializers.SerializerMethodField()
    audio_file_url = serializers.SerializerMethodField()
    video_file_url = serializers.SerializerMethodField()

    class Meta:
        model = Sermon
        fields = (
            "id",
            "title", "title_fr", "title_en", "title_rn", "title_sw",
            "slug",
            "description", "description_fr", "description_en", "description_rn", "description_sw",
            "preacher_name",
            "category",
            "category_name",
            "language",
            "content_type",
            "duration_minutes",
            "video_url",
            "video_file",
            "video_file_url",
            "audio_url",
            "audio_file",
            "audio_file_url",
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

    def get_audio_file_url(self, obj):
        request = self.context.get("request")
        if obj.audio_file:
            url = obj.audio_file.url
            if request:
                return request.build_absolute_uri(url)
            return url
        return None

    def get_video_file_url(self, obj):
        request = self.context.get("request")
        if obj.video_file:
            url = obj.video_file.url
            if request:
                return request.build_absolute_uri(url)
            return url
        return None


class AdminSermonSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)
    image_url = serializers.SerializerMethodField()
    audio_file_url = serializers.SerializerMethodField()
    video_file_url = serializers.SerializerMethodField()

    class Meta:
        model = Sermon
        fields = (
            "id",
            "title", "title_fr", "title_en", "title_rn", "title_sw",
            "slug",
            "description", "description_fr", "description_en", "description_rn", "description_sw",
            "preacher_name",
            "category",
            "category_name",
            "language",
            "content_type",
            "duration_minutes",
            "video_url",
            "video_file",
            "video_file_url",
            "audio_url",
            "audio_file",
            "audio_file_url",
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

    def get_audio_file_url(self, obj):
        request = self.context.get("request")
        if obj.audio_file:
            url = obj.audio_file.url
            if request:
                return request.build_absolute_uri(url)
            return url
        return None

    def get_video_file_url(self, obj):
        request = self.context.get("request")
        if obj.video_file:
            url = obj.video_file.url
            if request:
                return request.build_absolute_uri(url)
            return url
        return None


class SermonCommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = SermonComment
        fields = (
            "id",
            "sermon",
            "author_name",
            "author_email",
            "content",
            "is_approved",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "is_approved", "created_at", "updated_at")
