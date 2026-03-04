from .dependancies import *


class BasicProductViewSet(viewsets.ModelViewSet):
	authentication_classes = SessionAuthentication, JWTAuthentication
	permission_classes = IsAuthenticated,
	queryset = BasicProduct.objects.all()
	serializer_class = BasicProductSerializer
	filter_backends = [filters.DjangoFilterBackend, ]
	filterset_fields = {
		'name': ['icontains'],
		'sub_category':['exact'],
		'created_at': ['gte', 'lte'],
		'id': ['gt'],
	}

class ProductViewSet(viewsets.ModelViewSet):
	authentication_classes = SessionAuthentication, JWTAuthentication
	permission_classes = IsAuthenticated,
	queryset = Product.objects.all()
	serializer_class = ProductSerializer
	filter_backends = [filters.DjangoFilterBackend, ]
	filterset_fields = {
		'shop': ['exact'],
		'updated_at': ['gte', 'lte'],
		'id': ['gt'],
	}


	def get_serializer_class(self):
		if self.action == "create":
			return ProductCreateSerializer
		return ProductSerializer

	@transaction.atomic()
	def create(self, request):
		serializer = self.get_serializer(data=request.data)
		serializer.is_valid(raise_exception=True)
		shop:Shop = serializer.validated_data.get("shop")
		if not shop.is_active:
			return Response({"details":"Imangazini yanyu  ntiremererwa gukora"}, status=status.HTTP_400_BAD_REQUEST)
		if not shop.owner.is_active:
			return Response({"details":"Konte yanyu ntiremererwa gukora"}, status=status.HTTP_400_BAD_REQUEST)
		basic_product = serializer.validated_data.get("product")
		product = Product(
			shop=serializer.validated_data.get("shop"),
			product = basic_product,
			name=basic_product.name,
			quantity=serializer.validated_data.get("quantity"),
			sale_price=serializer.validated_data.get("sale_price"),
			buy_price=serializer.validated_data.get("buy_price"),
			last_control_at=None
		)

		product.save()
		supply = Supply(
			user=request.user,
			product = product,
			quantity = serializer.validated_data.get("quantity"),
			total_buy_price = serializer.validated_data.get("quantity")*serializer.validated_data.get("buy_price")
		)
		supply.save()

		History.objects.create(
			shop_name=product.shop.name,
			shop_owner=product.shop.owner.user.username,
			shop_id=product.shop.id,

			province = product.shop.province,
			commune = product.shop.commune,
			quarter = product.shop.quarter,
			address = product.shop.address,
			longitude = product.shop.longitude,
			latitude = product.shop.latitude,

			action="Achat",
			category=product.product.sub_category.category.name,
			sub_category=product.product.sub_category.name,
			product_name=product.name,
			product_id=product.id,
			quantity=serializer.validated_data.get("quantity"),

			unity_price = product.buy_price,
			total_price = supply.total_buy_price
		)

		serializer = ProductSerializer(product).data
		return Response(serializer,status=status.HTTP_201_CREATED)
	

	@transaction.atomic()
	@csrf_exempt
	@action(
		methods=['POST'],
		detail=True,
		url_name=r'control',
		url_path=r"control",
		permission_classes=[IsAuthenticated],
		serializer_class=ControlProductSerializer)
	def controlProduct(self, request, pk):
		serializer = ControlProductSerializer(data=request.data)
		serializer.is_valid(raise_exception=True)
		product:Product = self.get_object()


		quantity = serializer.validated_data.get("quantity")

		control_frequency = ControlFrequency.objects.filter(shop=product.shop)
		if not control_frequency.exists():
			return Response({"details":"Veuillez d'abord ajouter la fréquence de contrôle"}, status=status.HTTP_400_BAD_REQUEST)

		if(product.quantity<quantity):
			return Response({"details":"Stoke ntikwiye bivanye n'igitigiri ushaka gukurako"}, status=status.HTTP_400_BAD_REQUEST)

		qt_vendu = product.quantity-quantity
		product.quantity = quantity
		product.last_control_at = datetime.now()
		product.save()
		
		sale = Sales(
			user=request.user,
			product = product,
			quantity = qt_vendu,
			amount = product.sale_price*qt_vendu
		)
		sale.save()

		History.objects.create(
			shop_name=product.shop.name,
			shop_owner=product.shop.owner.user.username,
			shop_id=product.shop.id,

			province = product.shop.province,
			commune = product.shop.commune,
			quarter = product.shop.quarter,
			address = product.shop.address,
			longitude = product.shop.longitude,
			latitude = product.shop.latitude,

			action="Vente",
			category=product.product.sub_category.category.name,
			sub_category=product.product.sub_category.name,
			product_name=product.name,
			product_id=product.id,
			quantity=qt_vendu,

			unity_price = product.sale_price,
			total_price = product.sale_price*qt_vendu,
		)

		return Response({"status":"Wahejeje gu controla"}, status=status.HTTP_200_OK)
	

	@transaction.atomic()
	@csrf_exempt
	@action(
		methods=['POST'],
		detail=True,
		url_name=r'supply',
		url_path=r"supply",
		permission_classes=[IsAuthenticated],
		serializer_class=SupplyProductSerializer)
	def supplyProduct(self, request, pk):
		serializer = SupplyProductSerializer(data=request.data)
		serializer.is_valid(raise_exception=True)
		product:Product = self.get_object()
		quantity = serializer.validated_data.get("quantity")
		total_buy_price = serializer.validated_data.get("total_buy_price")

		product.quantity += quantity
		product.buy_price = round(total_buy_price/quantity)
		product.save()
				
		supply = Supply(
			user=request.user,
			product = product,
			quantity = quantity,
			total_buy_price = total_buy_price
		)
		supply.save()

		History.objects.create(
			shop_name=product.shop.name,
			shop_owner=product.shop.owner.user.username,
			shop_id=product.shop.id,

			province = product.shop.province,
			commune = product.shop.commune,
			quarter = product.shop.quarter,
			address = product.shop.address,
			longitude = product.shop.longitude,
			latitude = product.shop.latitude,

			action="Achat",
			category=product.product.sub_category.category.name,
			sub_category=product.product.sub_category.name,
			product_name=product.name,
			product_id=product.id,
			quantity=quantity,

			unity_price = round(total_buy_price/quantity),
			total_price = total_buy_price,
		)

		return Response({"status":"Wahejeje kurangura"}, status=status.HTTP_200_OK)
	

	@transaction.atomic()
	@csrf_exempt
	@action(
		methods=['GET'],
		detail=True,
		url_name=r'stock',
		url_path=r"stock",
		permission_classes=[IsAuthenticated])
	def stockProduct(self, request, pk):
		product = self.get_object()

		stocks = Supply.objects.filter(product=product)

		serializer = SupplySerializer(stocks, many=True)
	
		return Response(serializer.data, status=status.HTTP_200_OK)


	@transaction.atomic()
	@csrf_exempt
	@action(
		methods=['POST'],
		detail=True,
		url_name=r'change-sale-price',
		url_path=r"change-sale-price",
		permission_classes=[IsAuthenticated])
	def changeSalePrice(self, request, pk):
		print(request.data)
		product = self.get_object()
		new_price = request.data['new_price']
		new_buy_price = request.data['new_buy_price']
		if(new_price!=product.sale_price):
			SalePriceHistory.objects.create(
				user=request.user,
				product=product,
				old_price=product.sale_price,
				new_price=new_price,
			)
			product.sale_price=new_price

		if(new_buy_price!=product.buy_price):
			product.buy_price=new_buy_price
			supply = Supply.objects.filter(
				product=product,
				created_at__date=product.created_at
			)
			if(supply.exists()):
				supply = supply[0]
				supply.total_buy_price=supply.quantity*new_buy_price
				supply.save()

		product.save()
		return Response(status=status.HTTP_200_OK)
	
class CategoryViewSet(viewsets.ModelViewSet):
	authentication_classes = SessionAuthentication, JWTAuthentication
	permission_classes = IsAuthenticated,
	queryset = Category.objects.all()
	serializer_class = CategorySerializer
	filter_backends = [filters.DjangoFilterBackend, ]
	filterset_fields = {
		'name': ['contains'],
		'id': ['gt'],
	}

class SubCategoryViewSet(viewsets.ModelViewSet):
	authentication_classes = SessionAuthentication, JWTAuthentication
	permission_classes = IsAuthenticated,
	queryset = SubCategory.objects.all()
	serializer_class = SubCategorySerializer
	filter_backends = [filters.DjangoFilterBackend, ]
	filterset_fields = {
		'category': ['exact'],
		'updated_at': ['gte', 'lte'],
		'id': ['gt'],
	}