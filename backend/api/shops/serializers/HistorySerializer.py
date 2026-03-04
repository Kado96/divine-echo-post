from .dependancies import *

class HistorySerializer(serializers.ModelSerializer):
	class Meta:
		model = History
		fields = "__all__"