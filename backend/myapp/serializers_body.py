from rest_framework import serializers
from django.contrib.auth.models import User
from django.db.models import Q
from django.utils import timezone
from datetime import timedelta
from .models import UserSettings, Goal, BodyMeasurement, UserProfile, CustomFood, MealEntry, WorkoutEntry, DailyStreak


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
        """Validate that user doesn't already have a measurement for today."""
        user = self.context['request'].user
        date_recorded = data.get('date_recorded', timezone.now())
        
        # Check if this is an update (instance exists)
        if self.instance:
            return data
        
        # Check for existing measurement today
        today_start = date_recorded.replace(hour=0, minute=0, second=0, microsecond=0)
        today_end = today_start + timedelta(days=1)
        
        existing = BodyMeasurement.objects.filter(
            user=user,
            date_recorded__gte=today_start,
            date_recorded__lt=today_end
        ).exists()
        
        if existing:
            raise serializers.ValidationError(
                'You already have a measurement for today. Please update the existing measurement instead.'
            )
        
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
        fields = ['phone', 'age', 'gender', 'latest_measurement', 'settings', 'goal']
    
    def get_latest_measurement(self, obj):
        latest = BodyMeasurement.objects.filter(user=obj.user).order_by('-date_recorded').first()
        if latest:
            return BodyMeasurementListSerializer(latest).data
        return None


class CustomFoodSerializer(serializers.ModelSerializer):
    """Serializer for custom foods."""
    class Meta:
        model = CustomFood
        fields = ['id', 'food_name', 'calories', 'protein', 'carbs', 'fats', 'serving_size', 'is_favorite', 'created_at']
        read_only_fields = ['id', 'created_at']


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
            'intensity', 'calories_burned', 'notes', 'created_at'
        ]
        read_only_fields = ['id', 'calories_burned', 'created_at']


class WorkoutEntryCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating workout entries."""
    class Meta:
        model = WorkoutEntry
        fields = ['date', 'workout_type', 'exercise_name', 'duration_minutes', 'intensity', 'notes']
    
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


class DailySummarySerializer(serializers.Serializer):
    """Serializer for daily summary stats."""
    date = serializers.DateField()
    total_calories = serializers.IntegerField()
    total_protein = serializers.FloatField()
    total_carbs = serializers.FloatField()
    total_fats = serializers.FloatField()
    total_calories_burned = serializers.IntegerField()
    tdee = serializers.IntegerField()
    net_calories = serializers.IntegerField()
    meals_count = serializers.IntegerField()
    workouts_count = serializers.IntegerField()

