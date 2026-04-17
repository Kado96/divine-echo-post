import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'shalomministry.settings')

import django
django.setup()

from django.urls import get_resolver
resolver = get_resolver()

print("Resolving root patterns...")
try:
    patterns = resolver.url_patterns
    for p in patterns:
        print(p)
except Exception as e:
    import traceback
    traceback.print_exc()
