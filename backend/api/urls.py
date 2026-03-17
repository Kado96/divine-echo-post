from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
from api.accounts.viewsets import CustomTokenObtainPairView, RegisterViewSet

# Import direct pour éviter les erreurs d'include imbriqués
from api.sermons.urls import admin_router as sermon_admin_router
from api.media.urls import router as media_router

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
    
    # Administration (Points d'entrée directs au lieu d'includes complexes)
    path('admin/sermons/', include(sermon_admin_router.urls)),
    path('admin/media/', include(media_router.urls)),
]
