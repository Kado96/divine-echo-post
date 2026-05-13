from django.contrib import admin
from .models import Announcement, DailyVerse

@admin.register(Announcement)
class AnnouncementAdmin(admin.ModelAdmin):
    list_display = ('title', 'priority', 'is_active', 'created_at')
    list_filter = ('priority', 'is_active')
    search_fields = ('title', 'content')

@admin.register(DailyVerse)
class DailyVerseAdmin(admin.ModelAdmin):
    list_display = ('reference', 'published_at', 'is_active', 'author')
    list_filter = ('is_active', 'published_at')
    search_fields = ('text_fr', 'reference')
    autocomplete_fields = ['author']
