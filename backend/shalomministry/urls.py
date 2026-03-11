from django.contrib import admin
from django.urls import path, include, re_path
from django.conf.urls.static import static
from django.conf import settings
from django.http import HttpResponse, FileResponse
import os

# Swagger
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

# Handlers
from shalomministry.handlers import handler400, handler403, handler404, handler500
from shalomministry.views import RootView, ImageProxyView

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

def serve_media_with_cors(request, path):
    """Vue pour servir les médias avec CORS"""
    file_path = os.path.join(settings.MEDIA_ROOT, path)
    if os.path.exists(file_path):
        response = FileResponse(open(file_path, 'rb'))
        response["Access-Control-Allow-Origin"] = "*"
        return response
    return HttpResponse(status=404)

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),
    
    # API Centralisée
    path('api/', include('api.urls')),
    
    # Documentation API
    re_path(r'^api/docs(?P<format>\.json|\.yaml)$', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    path('api/docs/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('api/redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    
    # Auth (Backward compatibility et simplicité)
    path('api/auth/', include('rest_framework.urls')),
    
    # Utilitaires
    path('api/image-proxy/', ImageProxyView.as_view(), name='image_proxy'),
    re_path(r'^api/media/(?P<path>.*)$', serve_media_with_cors, name='media'),
    re_path(r'^favicon\.ico$', lambda request: HttpResponse(status=404)),
    
    # Catch-all pour le frontend si nécessaire (à utiliser avec précaution)
    re_path("^(?!admin)(?!api)(?!static).*$", RootView.as_view()),
]

# Servir les fichiers statiques et média en développement
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# Handlers d'erreur
handler400 = 'shalomministry.handlers.handler400'
handler403 = 'shalomministry.handlers.handler403'
handler404 = 'shalomministry.handlers.handler404'
handler500 = 'shalomministry.handlers.handler500'
