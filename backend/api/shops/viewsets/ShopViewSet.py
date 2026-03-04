from .dependancies import *

def getBeneficeSales(data):
	benefice = 0
	for s in data:
		pat = s.product.buy_price*s.quantity
		benefice += (s.amount-pat)

	return benefice

def getBeneficeSupplies(data):
	benefice = 0
	for s in data:
		pat = s.product.sale_price*s.quantity
		benefice += (s.total_buy_price-pat)

	return benefice

class ShopViewSet(viewsets.ModelViewSet):
	authentication_classes = SessionAuthentication, JWTAuthentication
	permission_classes = IsAuthenticated,
	queryset = Shop.objects.all()
	serializer_class = ShopSerializer


	def get_queryset(self):
		user = self.request.user
		queryset = Shop.objects.select_related("owner")
		if(user.is_superuser):
			return queryset
		try:
			pk = vars(self.request)["parser_context"]["kwargs"]["pk"]
			return queryset.filter(id=pk)
		except Exception:
			return queryset.filter(owner__user=user)

	
	@transaction.atomic()
	def create(self, request):
		serializer = self.get_serializer(data=request.data)
		serializer.is_valid(raise_exception=True)
		try:
			account = Account.objects.get(user=request.user, is_active=True)
		except:
			return Response({"details":"Konte yanyu ntiremererwa gukora"}, status=status.HTTP_400_BAD_REQUEST)
		shop = Shop(
			owner=account,
			name=serializer.validated_data.get("name"),
			province=serializer.validated_data.get("province"),
			commune=serializer.validated_data.get("commune"),
			quarter=serializer.validated_data.get("quarter"),
			address=serializer.validated_data.get("address"),
		)

		shop.save()
		serializer = self.get_serializer(shop).data
		return Response(serializer,status=status.HTTP_201_CREATED)
	

	@transaction.atomic()
	@csrf_exempt
	@action(
		methods=['GET'],
		detail=True,
		url_name=r'sales',
		url_path=r"sales",
		permission_classes=[IsAuthenticated],)
	def shopSales(self, request, pk):
		shop = self.get_object()
		if(shop.owner.user != request.user):
			return Response({"details":"Mushobora kubona ivyo mu ma botike yanyu gusa"}, status=status.HTTP_400_BAD_REQUEST)
		
		sales = Sales.objects.filter(created_at__gte=datetime.today())
		

		return Response({"status":"Wahejeje gu controla"}, status=status.HTTP_200_OK)

	
	@transaction.atomic()
	@csrf_exempt
	@action(
		methods=['POST'],
		detail=True,
		url_name=r'set_position',
		url_path=r"set_position",
		permission_classes=[IsAuthenticated],)
	def set_position(self, request, pk):
		shop = self.get_object()
		longitude = request.data.get("longitude")
		latitude = request.data.get("latitude")

		if(shop.owner.user != request.user):
			return Response({"details":"Mushobora gukora iki gikorwa mw'ibotike yanyu gusa"}, status=status.HTTP_400_BAD_REQUEST)
		
		shop.latitude = latitude
		shop.longitude = longitude
		shop.save()
		return Response({"status":"Ivyo mwakoze vyakunze"}, status=status.HTTP_200_OK)
	

	@transaction.atomic()
	@csrf_exempt
	@action(
		methods=['GET'],
		detail=True,
		url_name=r'stats',
		url_path=r"stats",
		permission_classes=[IsAuthenticated],)
	def shopSales(self, request, pk):
		str_du = request.query_params.get('created_at__gte')
		str_au = request.query_params.get('created_at__lte')
		shop:Shop = self.get_object()
		sales={}
		supply={}
		supply_f=[]
		sales_f=[]
		b_sales=0
		b_supplies=0

		if(str_du and str_au):
			str_au = datetime.strptime(str_au, "%Y-%m-%d")+timedelta(days=1)
			str_au = str_au.strftime("%Y-%m-%d")

			sales_f = Sales.objects.filter(
				created_at__gte=str_du, created_at__lte=str_au, product__shop=shop.id
			)
			sales = sales_f.aggregate(
				total_sales=models.Sum('quantity'),
				total_amount=models.Sum('amount')
			)
			if len(sales_f)>0:
				b_sales = getBeneficeSales(sales_f)

			supply_f = Supply.objects.filter(
				created_at__gte=str_du, created_at__lte=str_au, product__shop=shop.id
			)
			supply = supply_f.aggregate(
				total_suplies=models.Sum('quantity'),
				total_amount=models.Sum(models.F('product__sale_price')*models.F('quantity'))
			)
			if len(supply_f) > 0:
				b_supplies = getBeneficeSupplies(supply_f)


		else:
			today = datetime.now().date()
			if(not request.user.is_superuser):
				sales_f = Sales.objects.filter(
					created_at__date=today, product__shop=shop.id
				)
				sales = sales_f.aggregate(
					total_sales=models.Sum('quantity'),
					total_amount=models.Sum('amount')
				)
				if len(sales_f) > 0:
					b_sales = getBeneficeSales(sales_f)

				supply_f = Supply.objects.filter(
					created_at__date=today, product__shop=shop.id
				)
				supply = supply_f.aggregate(
					total_supplies=models.Sum('quantity'),
					total_amount=models.Sum(models.F('product__sale_price')*models.F('quantity'))
				)
				if len(supply_f) > 0:
					b_supplies = getBeneficeSupplies(supply_f)
				
		data = {
			"sales":sales,
			"b_sales":b_sales,
			"supply":supply,
			"b_supplies":b_supplies,
		}
		return Response(data, 200)


class ControlFrequencyViewSet(viewsets.ModelViewSet):
	authentication_classes = SessionAuthentication, JWTAuthentication
	permission_classes = IsAuthenticated,
	queryset = ControlFrequency.objects.all()
	serializer_class = ControlFrequencySerializer


	def get_queryset(self):
		user = self.request.user
		queryset = ControlFrequency.objects.select_related("shop")
		if(user.is_superuser):
			return queryset
		else:
			shop = self.request.query_params.get('shop')
			if(shop):
				return queryset.filter(shop=shop)
			else:
				return queryset.none()