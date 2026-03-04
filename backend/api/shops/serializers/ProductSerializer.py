from .dependancies import *
from datetime import timezone as tz

class BasicProductSerializer(serializers.ModelSerializer):

	class Meta:
		model = BasicProduct
		fields = "__all__"
		
	def get_image_url(self, obj):
		request = self.context.get('request')
		if obj.image:
			return request.build_absolute_uri(obj.image.url) if request else obj.image.url
		return None


class ProductCreateSerializer(serializers.ModelSerializer):
	class Meta:
		model = Product
		fields = "__all__"

class ProductSerializer(serializers.ModelSerializer):
	product = BasicProductSerializer()
	class Meta:
		model = Product
		fields = "__all__"

	def to_representation(self, obj):
		representation = super(ProductSerializer, self).to_representation(obj)
		controlled = None
		
		if obj.last_control_at:
			frequency = ControlFrequency.objects.filter(shop=obj.shop)
			if(frequency):
				if(frequency[0].days>0):
					representation["control_days"] = frequency[0].days
					difference_in_days = (datetime.now(tz=tz.utc).date() - obj.last_control_at.date()).days
					if(difference_in_days>frequency[0].days):
						controlled = False
					else: controlled = True
				if(frequency[0].hours>0):
					representation["control_hours"] = frequency[0].hours
					difference_in_hours = (datetime.now(tz=tz.utc) - obj.last_control_at)
					difference_in_hours = difference_in_hours.total_seconds()/3600
					if(difference_in_hours>frequency[0].hours):
						controlled = False
					else:controlled = True
		else:
			controlled=False		

		representation["controlled"] = controlled
		#representation["product"] = BasicProductSerializer(obj.product,many=False).data
		return representation

class CategorySerializer(serializers.ModelSerializer):
	class Meta:
		model = Category
		fields = "__all__"

	def to_representation(self, obj):
		representation = super().to_representation(obj)
		sub_categories = SubCategory.objects.filter(category=obj.id)
		representation["subCategories"] = SubCategorySerializerCustom(sub_categories, many=True).data
		return representation


class SubCategorySerializer(serializers.ModelSerializer):
	class Meta:
		model = SubCategory
		fields = "__all__"

class SubCategorySerializerCustom(serializers.ModelSerializer):
	class Meta:
		model = SubCategory
		fields = "id","name"

class ControlProductSerializer(serializers.Serializer):
	quantity = serializers.IntegerField(required=True)


class SupplyProductSerializer(serializers.Serializer):
	quantity = serializers.IntegerField(required=True)
	total_buy_price = serializers.FloatField(required=True)