from rest_framework import serializers
from .models import Announcement, DailyVerse

class AnnouncementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Announcement
        fields = '__all__'

class DailyVerseSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyVerse
        fields = '__all__'
