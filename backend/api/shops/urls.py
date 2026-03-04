from django.urls import path, include
from rest_framework import routers
from .viewsets import *
from .viewsets.admin_viewsets import AdminProductViewSet, AdminShopCategoryViewSet, AdminShopSubCategoryViewSet

router = routers.DefaultRouter()

router.register("shops", ShopViewSet, basename="shops")
router.register("control-frequency", ControlFrequencyViewSet, basename="frequency-controls")
router.register("provinces", ProvincesViewSet, basename="provinces")
router.register("sales", SalesViewSet, basename="sales")
router.register("products", ProductViewSet, basename="products")
router.register("basic-products", BasicProductViewSet, basename="basic-products")
router.register("supplies", SupplyViewSet, basename="supplies")
router.register("categories", CategoryViewSet, basename="categories")
router.register("sub-categories", SubCategoryViewSet, basename="sub-categories")
router.register("history", HistoryViewSet, basename="history")

admin_router = routers.DefaultRouter()
# Enregistrer "shops" pour correspondre au frontend qui utilise /api/admin/shops/
admin_router.register("shops", AdminProductViewSet, basename="admin-shops")
admin_router.register("products", AdminProductViewSet, basename="admin-products")
admin_router.register("categories", AdminShopCategoryViewSet, basename="admin-shop-categories")
admin_router.register("sub-categories", AdminShopSubCategoryViewSet, basename="admin-shop-sub-categories")

urlpatterns = [
    path('', include(router.urls)),
    path('admin/', include(admin_router.urls)),
]

# Export pour utilisation dans urls.py principal
admin_urlpatterns = [
    path('', include(admin_router.urls)),
]

