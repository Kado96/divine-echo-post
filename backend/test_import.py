import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'shalomministry.settings')

import django
django.setup()

try:
    import api.urls
    print("api.urls imported successfully")
except Exception as e:
    import traceback
    traceback.print_exc()
