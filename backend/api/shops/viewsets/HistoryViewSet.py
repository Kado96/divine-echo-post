from .dependancies import *
from api.mixins import ExportMixin
class HistoryViewSet(ExportMixin,viewsets.ModelViewSet):
	authentication_classes = SessionAuthentication, JWTAuthentication
	permission_classes = IsAdminUser, IsAuthenticated
	queryset = History.objects.all()
	serializer_class = HistorySerializer
	filter_backends = [filters.DjangoFilterBackend, ]
	export_fields = "__all__"
	filterset_fields = {
		'shop_name': ['exact'],
		'shop_owner': ['exact'],
		'action' : ['exact'],
		'sub_category' : ['exact'],
		'product_name' : ['exact'],
		'product_id' : ['exact'],
		'created_at': ['gte', 'lte'],
		'id': ['gt'],
	}