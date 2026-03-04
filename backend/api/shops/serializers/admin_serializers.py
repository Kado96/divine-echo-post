from rest_framework import serializers
from api.shops.models import Category, SubCategory, PublicProduct


class ShopCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ("id", "name", "created_at", "updated_at")


class ShopSubCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = SubCategory
        fields = ("id", "category", "name", "created_at", "updated_at")


class AdminProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True, required=False)
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = PublicProduct
        fields = (
            "id",
            "name",
            "slug",
            "description",
            "category",
            "category_name",
            "price",
            "quantity",
            "status",
            "image",
            "image_url",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "slug", "created_at", "updated_at")

    def get_image_url(self, obj):
        request = self.context.get("request")
        if obj.image:
            url = obj.image.url
            if request:
                return request.build_absolute_uri(url)
            return url
        return None

