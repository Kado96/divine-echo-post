from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from api.shops.models import Category, SubCategory, PublicProduct
from ..serializers.admin_serializers import ShopCategorySerializer, ShopSubCategorySerializer, AdminProductSerializer


class AdminProductViewSet(viewsets.ModelViewSet):
    """API admin pour la gestion complète des produits"""
    queryset = PublicProduct.objects.select_related("category")
    serializer_class = AdminProductSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["category", "status"]
    search_fields = ["name", "description"]
    ordering_fields = ["created_at", "price", "quantity"]
    lookup_field = "id"

    def perform_create(self, serializer):
        serializer.save()

    def perform_update(self, serializer):
        serializer.save()


class AdminShopCategoryViewSet(viewsets.ModelViewSet):
    """API admin pour gérer les catégories de produits"""
    queryset = Category.objects.all()
    serializer_class = ShopCategorySerializer
    permission_classes = [IsAuthenticated]
    lookup_field = "id"


class AdminShopSubCategoryViewSet(viewsets.ModelViewSet):
    """API admin pour gérer les sous-catégories de produits"""
    queryset = SubCategory.objects.select_related("category")
    serializer_class = ShopSubCategorySerializer
    permission_classes = [IsAuthenticated]
    lookup_field = "id"

