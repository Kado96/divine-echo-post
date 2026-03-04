from .dependancies import *
from django.utils.timezone import now

def getBenefice(data):
	benefice = 0
	for s in data:
		pat = s.product.buy_price*s.quantity
		benefice += (s.amount-pat)

	return benefice

class SalesViewSet(viewsets.ModelViewSet):
	authentication_classes = SessionAuthentication, JWTAuthentication
	permission_classes = IsAuthenticated,
	queryset = Sales.objects.all()
	serializer_class = SalesSerializer
	filter_backends = [filters.DjangoFilterBackend, ]
	filterset_fields = {
		'product': ['exact'],
		'created_at': ['gte', 'lte'],
		'id': ['gt'],
	}

	def list(self, request, *args, **kwargs):
		str_du = request.query_params.get('created_at__gte')
		str_au = request.query_params.get('created_at__lte')
		shop = request.query_params.get('shop')

		totals = {}

		queryset = self.filter_queryset(self.get_queryset())
		if(shop):
			if(str_du and str_au):
				str_au = datetime.strptime(str_au, "%Y-%m-%d")+timedelta(days=1)
				str_au = str_au.strftime("%Y-%m-%d")
				queryset = self.queryset = self.queryset.filter(
					created_at__gte=str_du, created_at__lte=str_au, product__shop=shop
				).order_by('-id')
			else:
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
			pvt = queryset.aggregate(sum=models.Sum('amount'))['sum']
			benefice = getBenefice(queryset)
			totals = {"pvt":pvt,"benefice":benefice}
			response.data["totals"] = totals
			return response

		response = super().list(request, args, kwargs)
		pvt = queryset.aggregate(sum=models.Sum('amount'))['sum']
		benefice = getBenefice(queryset)
		totals = {"pvt":pvt,"benefice":benefice}

		response.data["totals"] = totals
		return response
