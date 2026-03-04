from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .viewsets import SermonCategoryViewSet, SermonViewSet, AdminSermonViewSet

router = DefaultRouter()
router.register(r"categories", SermonCategoryViewSet, basename="sermon-category")
router.register(r"", SermonViewSet, basename="sermon")

admin_router = DefaultRouter()
admin_router.register(r"sermons", AdminSermonViewSet, basename="admin-sermon")

urlpatterns = [
    path("", include(router.urls)),
]

admin_urlpatterns = [
    path("", include(admin_router.urls)),
]


