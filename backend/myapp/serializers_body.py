from rest_framework import serializers
from django.contrib.auth.models import User
from django.db.models import Q
from django.utils import timezone
from datetime import timedelta
from .models import UserSettings, Goal, BodyMeasurement, UserProfile, CustomFood, PresetFood, MealEntry, WorkoutEntry, PresetWorkout, DailyStreak, UserAllergy, DailySummary, CustomWorkout, Badge, GamificationProfile, UserBadge


class UserSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserSettings
        fields = ['id', 'preferred_units', 'measurement_reminders', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class GoalSerializer(serializers.ModelSerializer):
    progress_percentage = serializers.SerializerMethodField()
    days_remaining = serializers.SerializerMethodField()
    
    class Meta:
        model = Goal
        fields = [
            'id', 'goal_type', 'target_weight', 'target_bmi', 'target_body_fat',
            'goal_deadline', 'is_active', 'progress_percentage', 'days_remaining',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_progress_percentage(self, obj):
        """Get current progress toward goal."""
        latest = BodyMeasurement.objects.filter(user=obj.user).order_by('-date_recorded').first()
        if latest:
            return round(obj.calculate_progress(latest), 1)
        return 0
    
    def get_days_remaining(self, obj):
        """Get days remaining until goal deadline."""
        if obj.goal_deadline:
            delta = obj.goal_deadline - timezone.now().date()
            return max(0, delta.days)
        return None


class BodyMeasurementListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views."""
    bmi_category = serializers.SerializerMethodField()
    
    class Meta:
        model = BodyMeasurement
        fields = [
            'id', 'date_recorded', 'height', 'weight', 'bmi', 'bmi_category',
            'body_fat_percentage', 'lean_mass', 'bmr', 'tdee', 'notes'
        ]
    
    def get_bmi_category(self, obj):
        return obj.get_bmi_category()


class BodyMeasurementDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer with all calculated fields."""
    bmi_category = serializers.SerializerMethodField()
    weight_change = serializers.SerializerMethodField()
    
    class Meta:
        model = BodyMeasurement
        fields = [
            'id', 'date_recorded', 'height', 'weight', 'age', 'gender',
            'activity_level', 'bmi', 'bmi_category', 'body_fat_percentage',
            'lean_mass', 'bmr', 'tdee', 'weight_change', 'notes',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'bmi', 'body_fat_percentage', 'lean_mass', 'bmr', 'tdee',
            'created_at', 'updated_at'
        ]
    
    def get_bmi_category(self, obj):
        return obj.get_bmi_category()
    
    def get_weight_change(self, obj):
        """Calculate weight change from previous measurement."""
        previous = BodyMeasurement.objects.filter(
            user=obj.user,
            date_recorded__lt=obj.date_recorded
        ).order_by('-date_recorded').first()
        
        if previous:
            change = obj.weight - previous.weight
            return round(change, 2)
        return None
    
    def validate(self, data):
        """Validate input data."""
        return data


class BodyMeasurementCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new measurements."""
    
    class Meta:
        model = BodyMeasurement
        fields = [
            'height', 'weight', 'age', 'gender', 'activity_level', 'notes'
        ]
    
    def create(self, validated_data):
        """Create measurement with current user."""
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class BodyMeasurementStatsSerializer(serializers.Serializer):
    """Serializer for statistics endpoint."""
    total_measurements = serializers.IntegerField()
    first_measurement_date = serializers.DateTimeField()
    latest_measurement_date = serializers.DateTimeField()
    weight_change_total = serializers.FloatField()
    weight_change_weekly = serializers.FloatField()
    weight_change_30d = serializers.FloatField()
    weight_change_recent = serializers.FloatField()
    average_weight = serializers.FloatField()
    average_bmi = serializers.FloatField()
    current_streak = serializers.IntegerField()


class UserProfileWithMeasurementsSerializer(serializers.ModelSerializer):
    """User profile with latest measurement and settings."""
    latest_measurement = BodyMeasurementListSerializer(read_only=True)
    settings = UserSettingsSerializer(read_only=True)
    goal = GoalSerializer(read_only=True)
    
    class Meta:
        model = UserProfile
        fields = ['phone', 'age', 'gender', 'medical_conditions', 'latest_measurement', 'settings', 'goal']
    
    def get_latest_measurement(self, obj):
        latest = BodyMeasurement.objects.filter(user=obj.user).order_by('-date_recorded').first()
        if latest:
            return BodyMeasurementListSerializer(latest).data
        return None


class CustomFoodSerializer(serializers.ModelSerializer):
    """Serializer for custom foods."""
    food_type = serializers.SerializerMethodField()
    
    class Meta:
        model = CustomFood
        fields = ['id', 'food_name', 'calories', 'protein', 'carbs', 'fats', 'serving_size', 'is_favorite', 'food_type', 'created_at']
        read_only_fields = ['id', 'created_at', 'food_type']
    
    def get_food_type(self, obj):
        return 'custom'


class CustomFoodCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating custom foods."""
    class Meta:
        model = CustomFood
        fields = ['food_name', 'calories', 'protein', 'carbs', 'fats', 'serving_size', 'is_favorite']
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class PresetFoodSerializer(serializers.ModelSerializer):
    """Serializer for preset foods available to all users."""
    food_type = serializers.SerializerMethodField()
    is_favorite = serializers.SerializerMethodField()
    ingredients_list = serializers.SerializerMethodField()
    
    class Meta:
        model = PresetFood
        fields = [
            'id', 'food_name', 'calories', 'protein', 'carbs', 'fats', 'serving_size', 
            'ingredients', 'ingredients_list', 'is_favorite', 'food_type', 
            'is_diabetic_friendly', 'is_heart_healthy', 'is_gluten_free', 'is_vegan',
            'suitable_for', 'avoid_for', 'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'food_type', 'is_favorite', 'ingredients_list']
    
    def get_food_type(self, obj):
        return 'preset'
    
    def get_is_favorite(self, obj):
        return False
    
    def get_ingredients_list(self, obj):
        return obj.get_ingredients_list()


class MealEntrySerializer(serializers.ModelSerializer):
    """Serializer for meal entries."""
    custom_food_name = serializers.CharField(source='custom_food.food_name', read_only=True)
    
    class Meta:
        model = MealEntry
        fields = [
            'id', 'date', 'meal_type', 'food_name', 'quantity', 'calories', 
            'protein', 'carbs', 'fats', 'custom_food', 'custom_food_name', 'notes', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class MealEntryCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating meal entries."""
    class Meta:
        model = MealEntry
        fields = ['date', 'meal_type', 'food_name', 'quantity', 'calories', 'protein', 'carbs', 'fats', 'custom_food', 'notes']
    
    def create(self, validated_data):
        """Create meal entry with current user."""
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class WorkoutEntrySerializer(serializers.ModelSerializer):
    """Serializer for workout entries."""
    class Meta:
        model = WorkoutEntry
        fields = [
            'id', 'date', 'workout_type', 'exercise_name', 'duration_minutes', 
            'intensity', 'body_part', 'reps', 'sets', 'calories_burned', 'notes', 'created_at'
        ]
        read_only_fields = ['id', 'calories_burned', 'created_at']


class WorkoutEntryCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating workout entries."""
    class Meta:
        model = WorkoutEntry
        fields = ['date', 'workout_type', 'exercise_name', 'duration_minutes', 'intensity', 'body_part', 'reps', 'sets', 'calories_burned', 'notes']
        extra_kwargs = {
            'calories_burned': {'required': False, 'allow_null': True},
            'reps': {'required': False, 'allow_null': True},
            'sets': {'required': False, 'allow_null': True},
            'notes': {'required': False, 'allow_null': True},
            'body_part': {'required': False},
            'exercise_name': {'required': False}
        }
    
    def create(self, validated_data):
        """Create workout entry with current user."""
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class DailyStreakSerializer(serializers.ModelSerializer):
    """Serializer for daily streak."""
    class Meta:
        model = DailyStreak
        fields = ['id', 'current_streak', 'longest_streak', 'last_activity_date', 'updated_at']
        read_only_fields = ['id', 'current_streak', 'longest_streak', 'last_activity_date', 'updated_at']




class DailySummarySerializer(serializers.ModelSerializer):
    """Serializer for daily nutrition summary."""
    class Meta:
        model = DailySummary
        fields = ['id', 'date', 'total_calories', 'total_protein', 'total_carbs', 'total_fats', 
                  'total_calories_burned', 'net_calories', 'meals_count', 'workouts_count', 'tdee', 
                  'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class UserAllergySerializer(serializers.ModelSerializer):
    """Serializer for user allergies."""
    severity_display = serializers.CharField(source='get_severity_display', read_only=True)
    
    class Meta:
        model = UserAllergy
        fields = ['id', 'ingredient', 'severity', 'severity_display', 'created_at']
        read_only_fields = ['id', 'created_at', 'severity_display']

class PresetWorkoutSerializer(serializers.ModelSerializer):
    """Serializer for preset workouts."""
    class Meta:
        model = PresetWorkout
        fields = [
            'id', 'name', 'workout_type', 'duration_minutes', 'intensity', 
            'description', 'benefits', 'target_goal', 'is_low_impact', 
            'requires_equipment', 'body_part', 'suitable_for', 'avoid_for', 'created_at'
        ]

class CustomWorkoutSerializer(serializers.ModelSerializer):
    """Serializer for user custom workouts."""
    estimated_calories = serializers.SerializerMethodField()

    class Meta:
        model = CustomWorkout
        fields = [
            'id', 'name', 'workout_type', 'duration_minutes', 'intensity', 
            'body_part', 'notes', 'estimated_calories', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_estimated_calories(self, obj):
        return obj.calculate_calories()

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class BadgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Badge
        fields = ['id', 'name', 'description', 'icon_name', 'requirement_type', 'requirement_value', 'body_part']

class UserBadgeSerializer(serializers.ModelSerializer):
    badge = BadgeSerializer(read_only=True)
    class Meta:
        model = UserBadge
        fields = ['id', 'badge', 'date_earned', 'is_seen']

class GamificationProfileSerializer(serializers.ModelSerializer):
    level_name = serializers.SerializerMethodField()
    badges = serializers.SerializerMethodField()
    
    class Meta:
        model = GamificationProfile
        fields = ['total_points', 'xp', 'level', 'level_name', 'badges']
        
    def get_level_name(self, obj):
        return obj.LEVEL_NAMES.get(obj.level, 'Beginner')

    def get_badges(self, obj):
        badges = UserBadge.objects.filter(user=obj.user)
        return UserBadgeSerializer(badges, many=True).data

class BadgeUnlockSerializer(serializers.ModelSerializer):
    badge = BadgeSerializer(read_only=True)
    class Meta:
        model = UserBadge
        fields = ['id', 'badge', 'date_earned']
