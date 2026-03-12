from rest_framework import serializers
from .models import MediaFile

class MediaFileSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()
    formatted_size = serializers.SerializerMethodField()

    class Meta:
        model = MediaFile
        fields = [
            'id', 'file', 'file_url', 'title', 'alt_text', 
            'file_type', 'file_size', 'formatted_size', 
            'mime_type', 'created_at', 'updated_at'
        ]
        read_only_fields = ['file_type', 'file_size', 'mime_type', 'created_at', 'updated_at']

    def get_file_url(self, obj):
        if obj.file:
            request = self.context.get('request')
            if request is not None:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return None

    def get_formatted_size(self, obj):
        if not obj.file_size:
            return "0 B"
        for unit in ['B', 'KB', 'MB', 'GB']:
            if obj.file_size < 1024:
                return f"{obj.file_size:.1f} {unit}"
            obj.file_size /= 1024
        return f"{obj.file_size:.1f} TB"
