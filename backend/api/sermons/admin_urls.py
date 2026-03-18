from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .viewsets import AdminSermonViewSet, AdminSermonCategoryViewSet

router = DefaultRouter()
router.register(r"sermons", AdminSermonViewSet, basename="admin-sermon")
router.register(r"categories", AdminSermonCategoryViewSet, basename="admin-sermon-category")

urlpatterns = [
    path("", include(router.urls)),
]
