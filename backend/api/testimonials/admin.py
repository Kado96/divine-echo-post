from django.contrib import admin
from .models import Testimonial

@admin.register(Testimonial)
class TestimonialAdmin(admin.ModelAdmin):
    list_display = ('author', 'rating', 'language', 'status', 'created_at')
    list_filter = ('language', 'status')
    search_fields = ('author', 'content')
