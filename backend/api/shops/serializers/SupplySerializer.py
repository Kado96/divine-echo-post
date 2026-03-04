from .dependancies import *

class CreateSupplySerializer(serializers.ModelSerializer):
    class Meta:
        model = Supply
        fields = "__all__"


class SupplySerializer(serializers.ModelSerializer):
    class Meta:
        model = Supply
        fields = "__all__"
        depth = 2

