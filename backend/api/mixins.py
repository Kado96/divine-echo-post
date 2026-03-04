import csv
import io
from datetime import datetime, time
from django.http import HttpResponse
from django.utils.timezone import make_aware
from django.utils.dateparse import parse_date
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

class ExportMixin:
    export_fields = "__all__"  # or override in your ViewSet

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def export(self, request):
        from_date_str = request.query_params.get('from')
        to_date_str = request.query_params.get('to')

        model = self.get_queryset().model
        all_fields = [f.name for f in model._meta.fields]

        # Determine export fields
        if self.export_fields == "__all__":
            fields = all_fields
        elif isinstance(self.export_fields, list):
            fields = [f for f in self.export_fields if f in all_fields]
        else:
            return Response({"error": "export_fields must be '__all__' or a list of field names."}, status=400)

        queryset = self.get_queryset()

        # Apply optional date filtering
        if from_date_str or to_date_str:
            try:
                if from_date_str:
                    from_date = make_aware(datetime.combine(parse_date(from_date_str), time.min))
                    queryset = queryset.filter(created_at__gte=from_date)
                if to_date_str:
                    to_date = make_aware(datetime.combine(parse_date(to_date_str), time.max))
                    queryset = queryset.filter(created_at__lte=to_date)
            except Exception:
                return Response({"error": "Invalid date format. Use YYYY-MM-DD."}, status=400)

        data = list(queryset.values(*fields))

        # Generate CSV
        buffer = io.StringIO()
        writer = csv.DictWriter(buffer, fieldnames=fields)
        writer.writeheader()
        writer.writerows(data)

        response = HttpResponse(buffer.getvalue(), content_type="text/csv")
        response['Content-Disposition'] = 'attachment; filename="export.csv"'
        return response
