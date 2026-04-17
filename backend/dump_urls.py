import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'shalomministry.settings')

import django
django.setup()

from django.urls import get_resolver

def get_urls(urlconf=None, prefix=''):
    resolver = get_resolver(urlconf)
    urls = []
    try:
        patterns = resolver.url_patterns
    except Exception as e:
        print(f"Error getting patterns for {urlconf or 'ROOT'}: {e}")
        import traceback
        traceback.print_exc()
        return urls

    for pattern in patterns:
        if hasattr(pattern, 'url_patterns'):
            try:
                urls.extend(get_urls(pattern, prefix + str(pattern.pattern)))
            except Exception as e:
                print(f"Error recursively resolving {pattern}: {e}")
        else:
            urls.append(prefix + str(pattern.pattern))
    return urls

if __name__ == '__main__':
    for url in get_urls():
        print(url)
