from .dependencies import *
from rest_framework_simplejwt.tokens import RefreshToken
from django.views.decorators.csrf import csrf_exempt
from api.tools import send_custom_email

import random
import string

def generate_password(length=8):
    if length < 4:
        raise ValueError("Password length should be at least 4 characters.")

    characters = string.ascii_letters + string.digits
    password = ''.join(random.choice(characters) for _ in range(length))
    return password


class AccountViewSet(viewsets.ModelViewSet):
	serializer_class = AccountSerializer
	authentication_classes = JWTAuthentication, SessionAuthentication
	permission_classes = [IsAuthenticated]
	filter_backends = [filters.DjangoFilterBackend, ]
	filterset_fields = {
		'user': ['exact'],
		'updated_at': ['gte', 'lte'],
		'id': ['gt'],
	}

	def get_queryset(self):
		user = self.request.user
		queryset = Account.objects.select_related("user")
		if(user.is_superuser):
			return queryset
		try:
			pk = vars(self.request)["parser_context"]["kwargs"]["pk"]
			return queryset.filter(id=pk)
		except Exception:
			return queryset.filter(user=user)

	@transaction.atomic()
	@csrf_exempt
	@action(
		methods=['POST'],
		detail=False,
		url_name=r'verify_otp',
		url_path=r"verify_otp",
		serializer_class=OTPSerializer,
		permission_classes=[IsAuthenticated])
	def verifyOTP(self, request):
		serializer = OTPSerializer(data=request.data)
		serializer.is_valid(raise_exception=True)
		otp_code = serializer.validated_data["otp_code"]
		account:Account = request.user.account
		if(account.otp_expire_at < timezone.now()):
			return Response({"status":"code OTP expiré"},status=status.HTTP_403_FORBIDDEN)
		if(account.otp_code == otp_code):
			account.otp_code = ""
			account.otp_expire_at = None
			account.email_validated = True
			account.save()
			refresh = RefreshToken.for_user(request.user)
			session_data = {
				"refresh": str(refresh),
				"access": str(refresh.access_token),
				"complete": False,
				"groups": [],
				"id": request.user.id,
				"account": account.id,
				"first_name": account.user.first_name,
				"last_name": account.user.last_name,
			}
			return Response(session_data, status=status.HTTP_200_OK)
		return Response({"status":"code OTP incorrect"}, status=status.HTTP_403_FORBIDDEN)

	@csrf_exempt
	@action(
		methods=['GET'],
		detail=False,
		url_name=r'resend_otp',
		url_path=r"resend_otp",
		permission_classes=[IsAuthenticated])
	def resendOTP(self, request):
		account:Account = request.user.account
		CustomTokenObtainPairSerializer.generateOTP(account)
		return Response({"status":"Code envoyé avec success !"}, status=status.HTTP_200_OK)

	@csrf_exempt
	@action(
		methods=['POST'],
		detail=False,
		url_name=r'reset-password',
		url_path=r"reset-password",
		permission_classes=[AllowAny],
		serializer_class=ResetPasswordSerializer)
	def reset_password(self, request):
		serializer = ResetPasswordSerializer(data=request.data)
		serializer.is_valid(raise_exception=True)
		email = serializer.validated_data["email"]
		account:Account = Account.objects.filter(user__email=email).first()
		if not account:
			return Response({"status":"Email incorrect"}, status=status.HTTP_403_FORBIDDEN)
		else:
			user = account.user
			new_password = generate_password(8)
			user.set_password(new_password)
			user.save()
			mail_data = {
				"email":[account.user.username],
				"password":new_password,
			}
			print(f"[PASSWORD] : {new_password}")
			send_custom_email(mail_data,"reset_password.html")
			return Response({"status":"Mot de passe de réinitilaisation  envoyé avec success ! Verifier votre mail"}, status=status.HTTP_200_OK)