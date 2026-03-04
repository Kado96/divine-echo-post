from .dependencies import *
from .UserSerializer import UserSerializer
class BasicAccountSerializer(serializers.ModelSerializer):
	class Meta:
		model = Account
		fields = "phone_number",

	def to_representation(self, obj:Account):
		try:
			data = super().to_representation(obj)
			try:
				data["complete"] = obj.complete() if hasattr(obj, 'complete') else False
			except Exception:
				data["complete"] = False
			return data
		except Exception as e:
			# En cas d'erreur, retourner un dictionnaire minimal
			import logging
			logger = logging.getLogger(__name__)
			logger.warning(f"Erreur dans BasicAccountSerializer.to_representation: {e}")
			return {
				"phone_number": getattr(obj, 'phone_number', None),
				"complete": False
			}
class AccountSerializer(serializers.ModelSerializer):
	class Meta:
		model = Account
		exclude = 'otp_code',
		read_only_fields = "is_active", "insecured", "otp_expire_at",
	
	def to_representation(self, obj:Account):
		data = super().to_representation(obj)
		data["complete"] = obj.complete()	
		data['user'] = UserSerializer(obj.user).data		
		return data

class OTPSerializer(serializers.Serializer):
	otp_code = serializers.CharField(min_length=5, max_length=5)

class ResetPasswordSerializer(serializers.Serializer):
	email = serializers.EmailField()