from .dependencies import *

class RegisterViewSet(views.APIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    serializer_class = RegisterSerializer

    @transaction.atomic()
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            # Créer l'utilisateur Django
            user = User(
                username=serializer.validated_data['username'],
                email=serializer.validated_data.get('email', serializer.validated_data['username'])
            )
            user.set_password(serializer.validated_data['password'])
            user.save()

            # Créer le compte Shalom (Account)
            account = Account(
                user=user,
                phone_number=serializer.validated_data.get('phone_number')
            )
            account.save()

            # Générer les tokens JWT pour connexion immédiate
            refresh = RefreshToken.for_user(user)
            
            return Response({
                "status": "Ok",
                "message": "Utilisateur créé avec succès",
                "tokens": {
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                },
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "account_id": account.id
                }
            }, status=status.HTTP_201_CREATED)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
