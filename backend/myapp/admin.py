from django.contrib import admin
from .models import (
    UserProfile, Goal, BodyMeasurement, UserSettings,
    CustomFood, PresetFood, UserAllergy, MealEntry,
    WorkoutEntry, DailyStreak, DailySummary,
    PresetWorkout, CustomWorkout,
    GamificationProfile, Badge, UserBadge
)

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'phone', 'age', 'gender', 'created_at']
    list_filter = ['gender', 'created_at']
    search_fields = ['user__username', 'user__email', 'phone']
    readonly_fields = ['created_at', 'updated_at']

@admin.register(Goal)
class GoalAdmin(admin.ModelAdmin):
    list_display = ['user', 'goal_type', 'target_weight', 'goal_deadline', 'is_active']
    list_filter = ['goal_type', 'is_active']
    search_fields = ['user__username']

@admin.register(BodyMeasurement)
class BodyMeasurementAdmin(admin.ModelAdmin):
    list_display = ['user', 'date_recorded', 'weight', 'body_fat_percentage', 'bmi', 'tdee']
    list_filter = ['date_recorded', 'activity_level']
    search_fields = ['user__username']

@admin.register(PresetFood)
class PresetFoodAdmin(admin.ModelAdmin):
    list_display = ['food_name', 'category', 'calories', 'protein', 'is_vegan', 'is_gluten_free']
    list_filter = ['category', 'is_vegan', 'is_gluten_free', 'is_diabetic_friendly', 'is_heart_healthy']
    search_fields = ['food_name', 'ingredients', 'suitable_for', 'avoid_for']

@admin.register(PresetWorkout)
class PresetWorkoutAdmin(admin.ModelAdmin):
    list_display = ['name', 'workout_type', 'intensity', 'duration_minutes', 'body_part']
    list_filter = ['workout_type', 'intensity', 'body_part', 'is_low_impact']
    search_fields = ['name', 'description', 'benefits', 'suitable_for', 'avoid_for']

@admin.register(MealEntry)
class MealEntryAdmin(admin.ModelAdmin):
    list_display = ['user', 'date', 'meal_type', 'food_name', 'calories']
    list_filter = ['date', 'meal_type']
    search_fields = ['user__username', 'food_name']

@admin.register(WorkoutEntry)
class WorkoutEntryAdmin(admin.ModelAdmin):
    list_display = ['user', 'date', 'workout_type', 'exercise_name', 'duration_minutes', 'calories_burned']
    list_filter = ['date', 'workout_type', 'intensity']
    search_fields = ['user__username', 'exercise_name']

@admin.register(Badge)
class BadgeAdmin(admin.ModelAdmin):
    list_display = ['name', 'requirement_type', 'requirement_value', 'icon_name']
    search_fields = ['name', 'description']

@admin.register(GamificationProfile)
class GamificationProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'level', 'total_points', 'xp']
    search_fields = ['user__username']

@admin.register(UserBadge)
class UserBadgeAdmin(admin.ModelAdmin):
    list_display = ['user', 'badge', 'date_earned', 'is_seen']
    list_filter = ['date_earned', 'is_seen']
    search_fields = ['user__username', 'badge__name']

@admin.register(DailyStreak)
class DailyStreakAdmin(admin.ModelAdmin):
    list_display = ['user', 'current_streak', 'longest_streak', 'last_activity_date']
    search_fields = ['user__username']

@admin.register(DailySummary)
class DailySummaryAdmin(admin.ModelAdmin):
    list_display = ['user', 'date', 'total_calories', 'total_calories_burned', 'net_calories']
    list_filter = ['date']
    search_fields = ['user__username']

admin.site.register(UserSettings)
admin.site.register(CustomFood)
admin.site.register(UserAllergy)
admin.site.register(CustomWorkout)
