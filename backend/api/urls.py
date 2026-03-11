from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
from api.accounts.viewsets import CustomTokenObtainPairView, RegisterViewSet

# Import des URLs spécialisées
from api.sermons.urls import admin_urlpatterns as sermon_admin_urls
from api.shops.urls import admin_urlpatterns as shop_admin_urls

urlpatterns = [
    # Authentification (Directement sous /api/ selon API_ARCHITECTURE.md)
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('register/', RegisterViewSet.as_view(), name='token_register'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Modules standards
    path('accounts/', include('api.accounts.urls')),
    path('announcements/', include('api.announcements.urls')),
    path('testimonials/', include('api.testimonials.urls')),
    path('contacts/', include('api.contacts.urls')),
    path('settings/', include('api.settings.urls')),
    path('shops/', include('api.shops.urls')),
    path('courses/', include('api.courses.urls')),
    path('sermons/', include('api.sermons.urls')),
    
    # Administration (Préfixe /api/admin/ selon API_ARCHITECTURE.md)
    path('admin/sermons/', include((sermon_admin_urls, 'sermons'), namespace='admin_sermons')),
    path('admin/shops/', include((shop_admin_urls, 'shops'), namespace='admin_shops')),
]
