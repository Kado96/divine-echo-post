from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .viewsets import SermonCategoryViewSet, SermonViewSet, AdminSermonViewSet

# Router Frontend
router = DefaultRouter()
router.register(r"categories", SermonCategoryViewSet, basename="sermon-category")
router.register(r"", SermonViewSet, basename="sermon")

# Router Admin
admin_router = DefaultRouter()
admin_router.register(r"sermons", AdminSermonViewSet, basename="admin-sermon")

urlpatterns = [
    # Si inclus sans namespace, on sert les routes frontend
    path("", include(router.urls)),
]

# Export explicite pour l'admin
admin_urlpatterns = [
    path("", include(admin_router.urls)),
]
