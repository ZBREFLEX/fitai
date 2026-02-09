from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views
from . import views_body

urlpatterns = [
    # Auth endpoints
    path('register/', views.register_user, name='register'),
    path('login/', views.login_user, name='login'),
    path('logout/', views.logout_user, name='logout'),
    path('profile/', views.get_user_profile, name='profile'),
    path('token/refresh/', views.refresh_token, name='token_refresh'),
    
    # User settings
    path('settings/', views_body.user_settings, name='user_settings'),
    
    # Goals
    path('goals/', views_body.user_goal, name='user_goal'),
    
    # Body measurements
    path('body-measurements/', views_body.body_measurement_list, name='body_measurement_list'),
    path('body-measurements/latest/', views_body.body_measurement_latest, name='body_measurement_latest'),
    path('body-measurements/stats/', views_body.body_measurement_stats, name='body_measurement_stats'),
    path('body-measurements/check-today/', views_body.check_today_measurement, name='check_today_measurement'),
    path('body-measurements/<int:pk>/', views_body.body_measurement_detail, name='body_measurement_detail'),
]
