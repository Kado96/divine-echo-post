from django.contrib import admin
from django.urls import path, include, re_path
from django.conf.urls.static import static
from django.conf import settings
from django.http import HttpResponse, FileResponse, StreamingHttpResponse
import os
import requests

# Swagger
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

# Handlers
from shalomministry.handlers import handler400, handler403, handler404, handler500
from shalomministry.views import RootView, ImageProxyView, MediaProxyView

# Configuration Swagger
schema_view = get_schema_view(
   openapi.Info(
      title="Shalom Ministry API",
      default_version='v1',
      description="Documentation de l'API Shalom Ministry",
      terms_of_service="https://www.google.com/policies/terms/",
      contact=openapi.Contact(email="contact@shalomministry.org"),
      license=openapi.License(name="BSD License"),
   ),
   public=True,
   permission_classes=(permissions.AllowAny,),
)

admin.site.site_header = 'SHALOM MINISTRY ADMINISTRATION'
admin.site.index_title = 'Shalom Ministry Admin'
admin.site.site_title = 'Administration'

from django.shortcuts import redirect
import logging

logger = logging.getLogger(__name__)

def serve_media_with_cors(request, path):
    """Vue optimisée pour servir les médias (Vidéo/Audio) avec CORS et support du streaming"""
    file_path = os.path.join(settings.MEDIA_ROOT, path)
    
    # 1. Tenter de servir le fichier localement
    if os.path.exists(file_path):
        # Utilisation de FileResponse avec as_attachment=False pour le streaming
        response = FileResponse(open(file_path, 'rb'), content_type=None)
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "GET, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Range, Content-Type"
        response["Access-Control-Expose-Headers"] = "Content-Range, Content-Length, Accept-Ranges"
        response["Accept-Ranges"] = "bytes" # Crucial pour les lecteurs vidéo
        return response
        
    # 2. Construction de l'URL Supabase
    project_id = getattr(settings, 'PROJECT_ID', 'eiokoxdmgxxyexmqfsua')
    bucket = getattr(settings, 'AWS_STORAGE_BUCKET_NAME', 'media')
    clean_path = path.strip('/')
    
    # URL 1: Racine du bucket (nouvelle norme)
    supabase_url = f"https://{project_id}.supabase.co/storage/v1/object/public/{bucket}/{clean_path}"
    # URL 2: Dossier 'media/' (ancienne norme/fallback)
    fallback_url = f"https://{project_id}.supabase.co/storage/v1/object/public/{bucket}/media/{clean_path}"

    # 🔥 PROTECTION CORB : Pour les images, on utilise un proxy
    is_image = any(path.lower().endswith(ext) for ext in ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.png'])
    if is_image:
        try:
            # Tenter l'URL principale
            img_res = requests.get(supabase_url, timeout=5)
            if img_res.status_code != 200:
                # Tenter le fallback
                img_res = requests.get(fallback_url, timeout=5)
            
            img_res.raise_for_status()
            response = HttpResponse(img_res.content, content_type=img_res.headers.get('Content-Type'))
            response["Access-Control-Allow-Origin"] = "*"
            response["Access-Control-Allow-Methods"] = "GET, OPTIONS"
            return response
        except Exception as e:
            logger.error(f"[MEDIA PROXY ERROR] {str(e)} for path {path}")

    # Pour les autres fichiers (Audio/Vidéo), on STREAM aussi (pas de redirect 302, ça casse sur mobile)
    try:
        check_res = requests.head(supabase_url, timeout=3)
        final_url = supabase_url if check_res.status_code == 200 else fallback_url
    except:
        final_url = supabase_url

    logger.info(f"[MEDIA STREAM] Streaming depuis {final_url}")
    
    try:
        # Relayer les headers Range pour le streaming mobile
        stream_headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        range_header = request.META.get('HTTP_RANGE')
        if range_header:
            stream_headers['Range'] = range_header
        
        media_res = requests.get(final_url, headers=stream_headers, stream=True, timeout=30)
        media_res.raise_for_status()
        
        response = StreamingHttpResponse(
            media_res.iter_content(chunk_size=8192),
            status=media_res.status_code,
            content_type=media_res.headers.get('Content-Type', 'application/octet-stream')
        )
        
        # Relayer les headers essentiels pour le streaming
        for header in ['Content-Range', 'Content-Length', 'Accept-Ranges']:
            if header in media_res.headers:
                response[header] = media_res.headers[header]
        
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "GET, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Range, Content-Type"
        response["Access-Control-Expose-Headers"] = "Content-Range, Content-Length, Accept-Ranges"
        return response
    except Exception as e:
        logger.error(f"[MEDIA STREAM ERROR] {str(e)} for path {path}")
        # Dernier recours : redirection
        response = redirect(final_url)
        response["Access-Control-Allow-Origin"] = "*"
        return response


urlpatterns = [
    # Priorité absolue à l'API pour éviter les interceptions par les regex catch-all
    path('api/', include('api.urls')),
    
    # Admin
    path('admin/', admin.site.urls),
    
    # Documentation API
    re_path(r'^api/docs(?P<format>\.json|\.yaml)$', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    path('api/docs/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('api/redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    # Alias simplifies access
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='redoc-ui'),
    
    # Auth (Backward compatibility et simplicité)
    path('api/auth/', include('rest_framework.urls')),
    
    # Utilitaires
    path('api/image-proxy/', ImageProxyView.as_view(), name='image_proxy'),
    path('api/media-proxy/', MediaProxyView.as_view(), name='media_proxy'),
    re_path(r'^api/media/(?P<path>.*)$', serve_media_with_cors, name='media'),
    re_path(r'^favicon\.ico$', lambda request: HttpResponse(status=404)),
    
    # Catch-all pour le frontend si nécessaire
    re_path("^(?!admin)(?!api)(?!static).*$", RootView.as_view()),
]

# Servir les fichiers statiques et média en développement
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# Handlers d'erreur (Commentés pour le débogage Render)
# handler400 = 'shalomministry.handlers.handler400'
# handler403 = 'shalomministry.handlers.handler403'
# handler404 = 'shalomministry.handlers.handler404'
# handler500 = 'shalomministry.handlers.handler500'
