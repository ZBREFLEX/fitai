from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.shortcuts import get_object_or_404
from django.db.models import Avg, Min, Max, Count
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal

from .models import UserSettings, Goal, BodyMeasurement, UserProfile, CustomFood, PresetFood, MealEntry, WorkoutEntry, PresetWorkout, DailyStreak, UserAllergy, DailySummary, CustomWorkout
from .serializers_body import (
    UserSettingsSerializer,
    GoalSerializer,
    BodyMeasurementListSerializer,
    BodyMeasurementDetailSerializer,
    BodyMeasurementCreateSerializer,
    BodyMeasurementStatsSerializer,
    CustomFoodSerializer,
    PresetFoodSerializer,
    MealEntrySerializer,
    MealEntryCreateSerializer,
    WorkoutEntrySerializer,
    WorkoutEntryCreateSerializer,
    DailyStreakSerializer,
    DailySummarySerializer,
    UserAllergySerializer,
    PresetWorkoutSerializer,
    CustomWorkoutSerializer
)


# ==================== USER SETTINGS ====================

@api_view(['GET', 'PUT'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def user_settings(request):
    """Get or update user settings."""
    settings, created = UserSettings.objects.get_or_create(
        user=request.user,
        defaults={'preferred_units': 'metric'}
    )
    
    if request.method == 'GET':
        serializer = UserSettingsSerializer(settings)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = UserSettingsSerializer(settings, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ==================== GOALS ====================

@api_view(['GET', 'POST', 'PUT', 'DELETE'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def user_goal(request):
    """Manage user fitness goals."""
    if request.method == 'GET':
        try:
            goal = Goal.objects.get(user=request.user)
            serializer = GoalSerializer(goal)
            return Response(serializer.data)
        except Goal.DoesNotExist:
            return Response({'error': 'No goal set'}, status=status.HTTP_404_NOT_FOUND)
    
    elif request.method == 'POST':
        # Check if goal already exists
        goal, created = Goal.objects.get_or_create(
            user=request.user,
            defaults=request.data
        )
        if not created:
            # Update existing goal
            serializer = GoalSerializer(goal, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        return Response(GoalSerializer(goal).data, status=status.HTTP_201_CREATED)
    
    elif request.method == 'PUT':
        try:
            goal = Goal.objects.get(user=request.user)
            serializer = GoalSerializer(goal, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Goal.DoesNotExist:
            return Response({'error': 'No goal found'}, status=status.HTTP_404_NOT_FOUND)
    
    elif request.method == 'DELETE':
        try:
            goal = Goal.objects.get(user=request.user)
            goal.delete()
            return Response({'message': 'Goal deleted successfully'})
        except Goal.DoesNotExist:
            return Response({'error': 'No goal found'}, status=status.HTTP_404_NOT_FOUND)


# ==================== BODY MEASUREMENTS ====================

@api_view(['GET', 'POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def body_measurement_list(request):
    """List all measurements or create new one."""
    import logging
    logger = logging.getLogger(__name__)
    
    if request.method == 'GET':
        measurements = BodyMeasurement.objects.filter(user=request.user)
        
        # Filter by date range
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        if start_date:
            measurements = measurements.filter(date_recorded__gte=start_date)
        if end_date:
            measurements = measurements.filter(date_recorded__lte=end_date)
        
        # Pagination
        limit = request.query_params.get('limit', 30)
        measurements = measurements[:int(limit)]
        
        serializer = BodyMeasurementListSerializer(measurements, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        logger.info(f"Create measurement request from user: {request.user}")
        logger.info(f"Request data: {request.data}")
        
        serializer = BodyMeasurementCreateSerializer(
            data=request.data,
            context={'request': request}
        )
        if serializer.is_valid():
            try:
                measurement = serializer.save()
                logger.info(f"Measurement created successfully: {measurement.id}")
                # Return detailed view
                detail_serializer = BodyMeasurementDetailSerializer(measurement)
                return Response(detail_serializer.data, status=status.HTTP_201_CREATED)
            except Exception as e:
                logger.error(f"Error saving measurement: {str(e)}")
                return Response(
                    {'error': f'Failed to save measurement: {str(e)}'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        
        logger.error(f"Serializer errors: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def body_measurement_detail(request, pk):
    """Retrieve, update or delete a measurement."""
    measurement = get_object_or_404(BodyMeasurement, pk=pk, user=request.user)
    
    if request.method == 'GET':
        serializer = BodyMeasurementDetailSerializer(measurement)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = BodyMeasurementCreateSerializer(
            measurement,
            data=request.data,
            partial=True,
            context={'request': request}
        )
        if serializer.is_valid():
            measurement = serializer.save()
            # Recalculate metrics
            measurement.save()
            detail_serializer = BodyMeasurementDetailSerializer(measurement)
            return Response(detail_serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        measurement.delete()
        return Response({'message': 'Measurement deleted successfully'})


@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def body_measurement_latest(request):
    """Get the most recent measurement."""
    measurement = BodyMeasurement.objects.filter(
        user=request.user
    ).order_by('-date_recorded').first()
    
    if measurement:
        serializer = BodyMeasurementDetailSerializer(measurement)
        return Response(serializer.data)
    
    return Response({'error': 'No measurements found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def body_measurement_stats(request):
    """Get statistics about user's measurements."""
    measurements = BodyMeasurement.objects.filter(user=request.user)
    
    if not measurements.exists():
        return Response({'error': 'No measurements found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Basic stats
    total = measurements.count()
    first = measurements.order_by('date_recorded').first()
    latest = measurements.order_by('-date_recorded').first()
    
    # Weight stats
    weight_stats = measurements.aggregate(
        avg_weight=Avg('weight'),
        min_weight=Min('weight'),
        max_weight=Max('weight')
    )
    
    # BMI stats
    bmi_stats = measurements.aggregate(
        avg_bmi=Avg('bmi'),
        min_bmi=Min('bmi'),
        max_bmi=Max('bmi')
    )
    
    # Calculate weight change
    weight_change_total = latest.weight - first.weight
    
    # Calculate weekly change
    days_between = (latest.date_recorded - first.date_recorded).days
    weight_change_weekly = 0
    if days_between >= 7:
        weeks = days_between / 7
        weight_change_weekly = weight_change_total / weeks

    # Recent change (vs previous entry)
    previous = measurements.order_by('-date_recorded')[1:2].first()
    weight_change_recent = 0
    if previous:
        weight_change_recent = latest.weight - previous.weight
    
    # 30-day change
    thirty_days_ago = timezone.now() - timedelta(days=30)
    old_measurement = measurements.filter(date_recorded__lte=thirty_days_ago).order_by('-date_recorded').first()
    weight_change_30d = 0
    if old_measurement:
        weight_change_30d = latest.weight - old_measurement.weight
    
    # Calculate streak (consecutive days with measurements)
    streak = 0
    current_date = timezone.now().date()
    for i in range(30):  # Check last 30 days max
        check_date = current_date - timedelta(days=i)
        has_measurement = measurements.filter(
            date_recorded__date=check_date
        ).exists()
        if has_measurement:
            streak += 1
        else:
            if i > 0: # If we have a streak from yesterday, break. If today is first skip, break.
                break
    
    stats = {
        'total_measurements': total,
        'first_measurement_date': first.date_recorded,
        'latest_measurement_date': latest.date_recorded,
        'weight_change_total': round(weight_change_total, 2),
        'weight_change_weekly': round(weight_change_weekly, 2),
        'weight_change_recent': round(weight_change_recent, 2),
        'weight_change_30d': round(weight_change_30d, 2),
        'average_weight': round(float(weight_stats['avg_weight'] or 0), 2),
        'min_weight': round(float(weight_stats['min_weight'] or 0), 2),
        'max_weight': round(float(weight_stats['max_weight'] or 0), 2),
        'average_bmi': round(float(bmi_stats['avg_bmi'] or 0), 2),
        'min_bmi': round(float(bmi_stats['min_bmi'] or 0), 2),
        'max_bmi': round(float(bmi_stats['max_bmi'] or 0), 2),
        'current_streak': streak,
    }
    
    return Response(stats)


@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def check_today_measurement(request):
    """Check if user has a measurement for today."""
    today = timezone.now().date()
    today_start = timezone.make_aware(timezone.datetime.combine(today, timezone.datetime.min.time()))
    today_end = today_start + timedelta(days=1)
    
    measurement = BodyMeasurement.objects.filter(
        user=request.user,
        date_recorded__gte=today_start,
        date_recorded__lt=today_end
    ).first()
    
    if measurement:
        serializer = BodyMeasurementListSerializer(measurement)
        return Response({
            'has_measurement': True,
            'measurement': serializer.data
        })
    
    return Response({'has_measurement': False})


# ==================== CUSTOM FOODS ====================

@api_view(['GET', 'POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def custom_foods(request):
    """List user's custom foods only or create new one."""
    if request.method == 'GET':
        # Get user's custom foods only (not preset foods)
        custom_foods_list = CustomFood.objects.filter(user=request.user)
        
        # Filter by favorite if requested
        is_favorite = request.query_params.get('favorite')
        if is_favorite == 'true':
            custom_foods_list = custom_foods_list.filter(is_favorite=True)
        
        serializer = CustomFoodSerializer(custom_foods_list, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = CustomFoodSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE', 'PUT'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def custom_food_detail(request, pk):
    """Delete or update custom food."""
    try:
        food = CustomFood.objects.get(pk=pk, user=request.user)
    except CustomFood.DoesNotExist:
        return Response({'error': 'Food not found'}, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'DELETE':
        food.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    elif request.method == 'PUT':
        serializer = CustomFoodSerializer(food, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def all_foods(request):
    """Get all searchable foods (user's custom foods + all preset foods) for logging meals."""
    # Get user's custom foods
    custom_foods_list = CustomFood.objects.filter(user=request.user)
    
    # Get all preset foods
    preset_foods = PresetFood.objects.all()
    
    # Serialize both
    custom_serializer = CustomFoodSerializer(custom_foods_list, many=True)
    preset_serializer = PresetFoodSerializer(preset_foods, many=True)
    
    # Combine and return
    combined_data = custom_serializer.data + preset_serializer.data
    return Response(combined_data)


# ==================== MEAL ENTRIES ====================

@api_view(['GET', 'POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def meal_entries(request):
    """List all meal entries or create new one."""
    if request.method == 'GET':
        date = request.query_params.get('date')
        meals = MealEntry.objects.filter(user=request.user)
        
        if date:
            meals = meals.filter(date=date)
        
        serializer = MealEntrySerializer(meals, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = MealEntryCreateSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            meal = serializer.save()
            # Update streak
            update_user_streak(request.user)
            return Response(MealEntrySerializer(meal).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def meal_entry_detail(request, pk):
    """Delete meal entry."""
    try:
        meal = MealEntry.objects.get(pk=pk, user=request.user)
    except MealEntry.DoesNotExist:
        return Response({'error': 'Meal not found'}, status=status.HTTP_404_NOT_FOUND)
    
    meal.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


# ==================== WORKOUT ENTRIES ====================

@api_view(['GET', 'POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def workout_entries(request):
    """List all workout entries or create new one."""
    if request.method == 'GET':
        date = request.query_params.get('date')
        workouts = WorkoutEntry.objects.filter(user=request.user)
        
        if date:
            workouts = workouts.filter(date=date)
        
        serializer = WorkoutEntrySerializer(workouts, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = WorkoutEntryCreateSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            workout = serializer.save()
            # Update streak
            update_user_streak(request.user)
            return Response(WorkoutEntrySerializer(workout).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def workout_entry_detail(request, pk):
    """Delete workout entry."""
    try:
        workout = WorkoutEntry.objects.get(pk=pk, user=request.user)
    except WorkoutEntry.DoesNotExist:
        return Response({'error': 'Workout not found'}, status=status.HTTP_404_NOT_FOUND)
    
    workout.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


# ==================== DAILY SUMMARY ====================

def update_user_streak(user):
    """Update user's daily streak."""
    streak, created = DailyStreak.objects.get_or_create(user=user)
    streak.update_streak()


@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def daily_summary(request):
    """Get daily summary for a specific date."""
    date = request.query_params.get('date', timezone.now().date())
    
    # Get latest measurement for TDEE
    latest_measurement = BodyMeasurement.objects.filter(user=request.user).order_by('-date_recorded').first()
    tdee = int(latest_measurement.tdee) if latest_measurement else 2000
    
    # Get meals for the date
    meals = MealEntry.objects.filter(user=request.user, date=date)
    total_calories = sum(m.calories for m in meals)
    total_protein = sum(m.protein for m in meals)
    total_carbs = sum(m.carbs for m in meals)
    total_fats = sum(m.fats for m in meals)
    meals_count = meals.count()
    
    # Get workouts for the date
    workouts = WorkoutEntry.objects.filter(user=request.user, date=date)
    total_calories_burned = sum(w.calories_burned for w in workouts)
    workouts_count = workouts.count()
    
    # Calculate net calories
    net_calories = total_calories - total_calories_burned
    
    data = {
        'date': date,
        'total_calories': total_calories,
        'total_protein': total_protein,
        'total_carbs': total_carbs,
        'total_fats': total_fats,
        'total_calories_burned': total_calories_burned,
        'tdee': tdee,
        'net_calories': net_calories,
        'meals_count': meals_count,
        'workouts_count': workouts_count,
    }
    
    serializer = DailySummarySerializer(data)
    return Response(serializer.data)


@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def user_streak(request):
    """Get user's daily streak."""
    streak, created = DailyStreak.objects.get_or_create(user=request.user)
    serializer = DailyStreakSerializer(streak)
    return Response(serializer.data)


@api_view(['GET', 'POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def user_allergies(request):
    """List user's allergies or add a new one."""
    if request.method == 'GET':
        allergies = UserAllergy.objects.filter(user=request.user)
        serializer = UserAllergySerializer(allergies, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = UserAllergySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def allergy_detail(request, pk):
    """Delete a specific allergy."""
    allergy = get_object_or_404(UserAllergy, id=pk, user=request.user)
    if request.method == 'DELETE':
        allergy.delete()
        return Response({'detail': 'Allergy removed'}, status=status.HTTP_200_OK)
    return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)


@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def meal_recommendations(request):
    """Get meal recommendations based on user's allergies, medical conditions, and nutrition gaps."""
    limit = request.query_params.get('limit', None)
    if limit:
        try:
            limit = int(limit)
        except ValueError:
            limit = None
    
    # Get user profiles and summaries
    profile = request.user.profile
    conditions = [c.strip().lower() for c in (profile.medical_conditions or "").split(',')]
    
    try:
        daily_summary = DailySummary.objects.get(user=request.user, date=timezone.now().date())
        current_calories = daily_summary.total_calories
        current_protein = daily_summary.total_protein
        current_carbs = daily_summary.total_carbs
        current_fats = daily_summary.total_fats
        tdee = daily_summary.tdee or 2000
    except DailySummary.DoesNotExist:
        current_calories = current_protein = current_carbs = current_fats = 0
        tdee = 2000
    
    # Calculate gaps based on Goal
    goal = getattr(request.user, 'goal', None)
    goal_type = goal.goal_type if goal else 'maintain'
    
    # 1. Calorie Adjustment (Energy Budget)
    if goal_type == 'lose_weight':
        daily_calorie_target = tdee - 500
        protein_ratio, carbs_ratio, fats_ratio = 0.35, 0.35, 0.30 # High protein for satiety
    elif goal_type == 'gain_muscle':
        daily_calorie_target = tdee + 300
        protein_ratio, carbs_ratio, fats_ratio = 0.30, 0.45, 0.25 # More carbs for energy
    else:
        daily_calorie_target = tdee
        protein_ratio, carbs_ratio, fats_ratio = 0.25, 0.45, 0.30 # Balanced maintenance
        
    daily_protein_target = int((daily_calorie_target * protein_ratio) / 4)
    daily_carbs_target = int((daily_calorie_target * carbs_ratio) / 4)
    daily_fats_target = int((daily_calorie_target * fats_ratio) / 9)

    nutrition_gap = {
        'calories': max(0, daily_calorie_target - current_calories),
        'protein': max(0, daily_protein_target - current_protein),
        'carbs': max(0, daily_carbs_target - current_carbs),
        'fats': max(0, daily_fats_target - current_fats),
    }

    # Allergy filters
    allergies = UserAllergy.objects.filter(user=request.user).values_list('ingredient', flat=True)
    allergies_list = [str(a).lower() for a in allergies]
    
    # Profile-based flags
    is_diabetic = any('diabetes' in c for c in conditions)
    has_hypertension = any('hypertension' in c or 'heart' in c for c in conditions)
    is_vegan_user = any('vegan' in c for c in conditions)
    is_gluten_free_user = any('gluten-free' in c or 'gluten sensitivity' in c for c in conditions)

    # AI Filtering Logic
    preset_foods = PresetFood.objects.all()
    safe_foods = []
    
    for food in preset_foods:
        # 1. Automated Dietary Filtering (Vegan/Gluten-Free)
        if is_vegan_user and not food.is_vegan:
            continue
        if is_gluten_free_user and not food.is_gluten_free:
            continue

        # 2. Allergy Check
        food_ingredients = food.get_ingredients_list()
        if any(a in ing for a in allergies_list for ing in food_ingredients):
            continue
            
        # 3. Medical Condition Check
        if is_diabetic and not food.is_diabetic_friendly:
            if food.carbs > 30: continue
        
        if has_hypertension and not food.is_heart_healthy:
            if food.fats > 20: continue

        safe_foods.append(food)

    # 4. Dynamic Ranking
    if nutrition_gap['protein'] > 20:
        safe_foods.sort(key=lambda x: x.protein, reverse=True)
    elif nutrition_gap['calories'] < 500:
        safe_foods.sort(key=lambda x: x.calories)

    total_safe_foods = len(safe_foods)
    if limit:
        safe_foods = safe_foods[:limit]
    
    serializer = PresetFoodSerializer(safe_foods, many=True)
    return Response({
        'total_available': PresetFood.objects.count(),
        'safe_foods': total_safe_foods,
        'skipped_count': PresetFood.objects.count() - total_safe_foods,
        'recommendations': serializer.data,
        'your_allergies': list(allergies),
        'dietary_flags': {
            'vegan': is_vegan_user,
            'gluten_free': is_gluten_free_user,
            'diabetic': is_diabetic
        },
        'current_nutrition': {
            'calories': current_calories,
            'protein': current_protein,
            'carbs': current_carbs,
            'fats': current_fats,
        },
        'daily_targets': {
            'calories': daily_calorie_target,
            'protein': daily_protein_target,
            'carbs': daily_carbs_target,
            'fats': daily_fats_target,
        },
        'nutrition_gap': nutrition_gap,
    })


@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def workout_recommendations(request):
    """Personalized workout recommendations based on goal, health, and activity level."""
    profile = request.user.profile
    goal = getattr(request.user, 'goal', None)
    latest_m = BodyMeasurement.objects.filter(user=request.user).order_by('-date_recorded').first()
    activity_level = latest_m.activity_level if latest_m else 'moderate'
    
    conditions = [c.strip().lower() for c in (profile.medical_conditions or "").split(',')]
    
    # Profile flags
    is_low_impact_needed = any(c in ['asthma', 'arthritis', 'heart disease', 'hypertension'] for c in conditions)
    
    # --- Intelligent Rest & Fatigue Logic ---
    today = timezone.now().date()
    consecutive_days = 0
    for i in range(1, 11): # Check last 10 days for a more generous streak
        check_date = today - timezone.timedelta(days=i)
        if WorkoutEntry.objects.filter(user=request.user, date=check_date).exists():
            consecutive_days += 1
        else:
            break
            
    # Determine "Fatigue Threshold" based on health
    max_days = 6 # Standard
    if is_low_impact_needed:
        max_days = 3 # More frequent recovery
        
    is_rest_day = False
    rest_message = ""
    todays_workouts = WorkoutEntry.objects.filter(user=request.user, date=today)
    total_mins_today = sum(w.duration_minutes for w in todays_workouts)
    
    if consecutive_days >= max_days:
        is_rest_day = True
        rest_message = f"AI Recovery: {consecutive_days} days active! Your body needs rest to recover and prevent injury."
    elif total_mins_today > 120: # Block only after 2 hours of work
        is_rest_day = True
        rest_message = f"Elite session! {total_mins_today}m recorded. Time to stop and let the muscles repair."
    elif todays_workouts.exists():
        rest_message = f"Active day! You've logged {total_mins_today}m so far. Ready for more?"

    # 0. Intelligent Rotation (Body Part Split)
    # Personalized Split based on Goal
    if goal and goal.goal_type == 'gain_muscle':
        SPLIT_ROTATION = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms']
    elif goal and goal.goal_type == 'lose_weight':
        SPLIT_ROTATION = ['Cardio', 'Legs', 'Back', 'HIIT', 'Chest', 'Abs']
    else:
        SPLIT_ROTATION = ['Chest', 'Back', 'Legs', 'Shoulders', 'Cardio', 'Abs']
    
    # Get last 5 body parts hit (excluding those done Today to ensure rotation)
    recent_body_parts = WorkoutEntry.objects.filter(
        user=request.user
    ).exclude(body_part='').exclude(date=today).order_by('-date').values_list('body_part', flat=True)[:15]
    
    unique_recent = []
    for bp in recent_body_parts:
        if bp not in unique_recent:
            unique_recent.append(bp)
    
    # Identify what's missing or oldest in rotation
    focus_part = SPLIT_ROTATION[0]
    for part in SPLIT_ROTATION:
        if part not in unique_recent:
            focus_part = part
            break

    # Manual Override from Frontend
    manual_focus = request.GET.get('override_focus')
    if manual_focus:
        focus_part = manual_focus
        is_rest_day = False # Bypassing rest day if user manually swaps

    if is_rest_day:
        focus_part = "Rest & Recovery"
    
    # Get today's completed exercise names to exclude them
    completed_today = list(todays_workouts.values_list('exercise_name', flat=True))
    
    # Pool of workouts: Global Presets + User's Custom Templates
    presets = PresetWorkout.objects.all()
    user_custom = CustomWorkout.objects.filter(user=request.user)
    
    # Combined pool
    all_possible = []
    for p in presets:
        all_possible.append({'obj': p, 'type': 'preset'})
    for c in user_custom:
        all_possible.append({'obj': c, 'type': 'custom'})
        
    recommendations = []
    
    for item in all_possible:
        w = item['obj']
        # Don't recommend what we already did today
        if w.name in completed_today:
            continue
            
        score = 0
        # If it's a custom workout, give it a tiny boost because user created it
        if item['type'] == 'custom':
            score += 5
            
        # 0. Body Part Focus (Intelligent Rotation)
        if w.body_part == focus_part:
            score += 50 # Extreme priority for the split focus
            
        # 1. Safety Filter
        if is_low_impact_needed and not w.is_low_impact:
            if w.intensity == 'intense': continue
        
        # 2. Activity Level AI Scaling
        if activity_level in ['sedentary', 'light']:
            if w.intensity == 'light': score += 5
            elif w.intensity == 'intense': score -= 10
        elif activity_level in ['active', 'very_active']:
            if w.intensity == 'intense': score += 10
            elif w.intensity == 'light': score += 2
            
        # 3. Goal Alignment
        if hasattr(w, 'target_goal') and goal and w.target_goal == goal.goal_type:
            score += 20
            
        recommendations.append({
            'id': w.id,
            'name': w.name,
            'workout_type': w.workout_type,
            'duration_minutes': w.duration_minutes,
            'intensity': w.intensity,
            'description': getattr(w, 'description', '') or getattr(w, 'benefits', '') or getattr(w, 'notes', ''),
            'body_part': w.body_part,
            'score': score,
            'is_custom': item['type'] == 'custom',
            'estimated_calories': w.calculate_calories() if item['type'] == 'custom' else None
        })
    
    # Sort by score
    recommendations.sort(key=lambda x: x['score'], reverse=True)
    
    return Response({
        'focus_of_the_day': focus_part,
        'recommendations': recommendations[:10],
        'user_activity_level': activity_level,
        'low_impact_mode': is_low_impact_needed,
        'is_rest_day': is_rest_day,
        'rest_message': rest_message,
        'consecutive_days': consecutive_days
    })


# ==================== CUSTOM WORKOUTS ====================

@api_view(['GET', 'POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def custom_workouts(request):
    """List or create custom workout templates."""
    if request.method == 'GET':
        workouts = CustomWorkout.objects.filter(user=request.user)
        serializer = CustomWorkoutSerializer(workouts, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        serializer = CustomWorkoutSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def custom_workout_detail(request, pk):
    """Retrieve, update or delete a custom workout template."""
    workout = get_object_or_404(CustomWorkout, id=pk, user=request.user)
    if request.method == 'GET':
        serializer = CustomWorkoutSerializer(workout)
        return Response(serializer.data)
    elif request.method == 'PUT':
        serializer = CustomWorkoutSerializer(workout, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        workout.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
