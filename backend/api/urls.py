from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
from api.accounts.viewsets import CustomTokenObtainPairView, RegisterViewSet

urlpatterns = [
    # Authentification
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('register/', RegisterViewSet.as_view(), name='token_register'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Modules standards (Frontend)
    path('accounts/', include('api.accounts.urls')),
    path('announcements/', include('api.announcements.urls')),
    path('testimonials/', include('api.testimonials.urls')),
    path('contacts/', include('api.contacts.urls')),
    path('settings/', include('api.settings.urls')),
    path('sermons/', include('api.sermons.urls')),
    
    # Administration (Chargement dynamique par module pour plus de robustesse)
    path('admin/sermons/', include('api.sermons.admin_urls')),
    path('admin/media/', include('api.media.urls')),
]
