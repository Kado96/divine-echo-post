from .dependencies import *
from api.shops.models import Shop
from api.shops.serializers import ShopSerializer

class RegisterViewSet(views.APIView):
	serializer_class = RegisterSerializer

	@transaction.atomic()
	def post(self, request):
		serializer = RegisterSerializer(data=request.data)
		if serializer.is_valid():
			user = User(
				username=serializer.validated_data['username'],
				email = serializer.validated_data['username']
			)
			user.save()
			user.set_password(serializer.validated_data['password'])
			user.save()

			account = Account(
				user=user,
				phone_number=serializer.validated_data['phone_number']
			)
			account.save()

			shop = Shop(
				owner=account,
				name=f"Boutique de {account.user.email}",
				is_active=True
			)
			shop.save()

			refresh = RefreshToken.for_user(request.user)
			# session_data = {
			# 	"refresh": str(refresh),
			# 	"access": str(refresh.access_token),
			# 	"complete": False,
			# 	"groups": [],
			# 	"id": request.user.id,
			# 	"account": account.id,
			# 	"first_name": account.user.first_name,
			# 	"last_name": account.user.last_name,
			# 	"shop":ShopSerializer(shop, many=False).data
			# }
			return Response({"status":"Ok"},status=status.HTTP_200_OK)
		return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
