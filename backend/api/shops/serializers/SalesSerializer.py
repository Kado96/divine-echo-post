from .dependancies import *

class SalesSerializer(serializers.ModelSerializer):

	class Meta:
		model = Sales
		fields = "__all__"
		depth = 2
