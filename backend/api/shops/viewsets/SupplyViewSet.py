from .dependancies import *

class SupplyViewSet(viewsets.ModelViewSet):
	authentication_classes = SessionAuthentication, JWTAuthentication
	permission_classes = IsAuthenticated,
	queryset = Supply.objects.all()
	serializer_class = SupplySerializer
	filterset_fields = {
		'product': ['exact'],
		'created_at': ['gte', 'lte'],
		'id': ['gt'],
	}

	def get_serializer_class(self):
		if self.action == "create":
			return SupplyCreateSerializer
		return SupplySerializer

	def list(self, request, *args, **kwargs):
		shop = request.query_params.get('shop')
		str_du = request.query_params.get('created_at__gte')
		str_au = request.query_params.get('created_at__lte')		
		queryset = self.filter_queryset(self.get_queryset())
		if(shop):
			if(str_du and str_au):
				str_au = datetime.strptime(str_au, "%Y-%m-%d")+timedelta(days=1)
				str_au = str_au.strftime("%Y-%m-%d")
				queryset = self.queryset = self.queryset.filter(
					created_at__gte=str_du, created_at__lte=str_au, product__shop=shop
				).order_by('-id')
			else:
				today = datetime.now().date()
				if(not request.user.is_superuser):
					queryset = self.queryset.filter(
						product__shop=shop,
					).order_by('-id')
				else:
					queryset = self.queryset.filter(
						product__shop=shop, user=request.user
					).order_by('-id')

		page = self.paginate_queryset(queryset)
		if page is not None:
			serializer = self.get_serializer(
				page,
				many=True,
				context = {'request': request}
			)
			response = self.get_paginated_response(serializer.data)
			response.data["totals"] = queryset.aggregate(sum=models.Sum('total_buy_price'))['sum']
			return response

		response = super().list(request, args, kwargs)
		response.data["totals"] = queryset.aggregate(sum=models.Sum('total_buy_price'))['sum']
		return response