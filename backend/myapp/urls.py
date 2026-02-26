from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views
from . import views_body
from . import views_admin
from . import views_chat

urlpatterns = [
    # Auth endpoints
    path('register/', views.register_user, name='register'),
    path('login/', views.login_user, name='login'),
    path('logout/', views.logout_user, name='logout'),
    path('profile/', views.manage_user_profile, name='profile'),
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
    
    # Custom foods
    path('custom-foods/', views_body.custom_foods, name='custom_foods'),
    path('custom-foods/<int:pk>/', views_body.custom_food_detail, name='custom_food_detail'),
    path('all-foods/', views_body.all_foods, name='all_foods'),
    
    # Meal entries
    path('meals/', views_body.meal_entries, name='meal_entries'),
    path('meals/<int:pk>/', views_body.meal_entry_detail, name='meal_entry_detail'),
    
    # Workout entries
    path('workouts/', views_body.workout_entries, name='workout_entries'),
    path('workouts/<int:pk>/', views_body.workout_entry_detail, name='workout_entry_detail'),
    
    # Daily summary and streak
    path('daily-summary/', views_body.daily_summary, name='daily_summary'),
    path('weekly-stats/', views_body.weekly_stats, name='weekly_stats'),
    path('streak/', views_body.user_streak, name='user_streak'),
    
    # Allergies
    path('allergies/', views_body.user_allergies, name='user_allergies'),
    path('allergies/<int:pk>/', views_body.allergy_detail, name='allergy_detail'),
    
    # Recommendations
    path('recommendations/', views_body.meal_recommendations, name='meal_recommendations'),
    path('workout-recommendations/', views_body.workout_recommendations, name='workout_recommendations'),
    
    # Custom Workouts Templates
    path('custom-workouts/', views_body.custom_workouts, name='custom_workouts'),
    path('custom-workouts/<int:pk>/', views_body.custom_workout_detail, name='custom_workout_detail'),
    path('all-workout-presets/', views_body.all_workout_presets, name='all_workout_presets'),
    
    # Gamification
    path('gamification/status/', views_body.gamification_status, name='gamification_status'),
    path('gamification/mark-seen/', views_body.mark_badges_seen, name='mark_badges_seen'),

    # Admin Dashboard & Management
    path('admin-stats/', views_admin.admin_dashboard_stats, name='admin_stats'),
    path('admin/users/', views_admin.admin_user_list, name='admin_users'),
    path('admin/users/<int:pk>/toggle/', views_admin.admin_toggle_user, name='admin_toggle_user'),
    path('admin/foods/', views_admin.admin_add_food, name='admin_add_food'),
    path('admin/workouts/', views_admin.admin_add_workout, name='admin_add_workout'),
    
    # AI Chatbot
    path('chat/', views_chat.chat_with_ai, name='chat'),
]
