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

from .models import UserSettings, Goal, BodyMeasurement
from .serializers_body import (
    UserSettingsSerializer,
    GoalSerializer,
    BodyMeasurementListSerializer,
    BodyMeasurementDetailSerializer,
    BodyMeasurementCreateSerializer,
    BodyMeasurementStatsSerializer
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
        serializer = BodyMeasurementCreateSerializer(
            data=request.data,
            context={'request': request}
        )
        if serializer.is_valid():
            measurement = serializer.save()
            # Return detailed view
            detail_serializer = BodyMeasurementDetailSerializer(measurement)
            return Response(detail_serializer.data, status=status.HTTP_201_CREATED)
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
    
    # Calculate weekly change (if measurements span more than a week)
    days_between = (latest.date_recorded - first.date_recorded).days
    weight_change_weekly = 0
    if days_between >= 7:
        weeks = days_between / 7
        weight_change_weekly = weight_change_total / weeks
    
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
            break
    
    stats = {
        'total_measurements': total,
        'first_measurement_date': first.date_recorded,
        'latest_measurement_date': latest.date_recorded,
        'weight_change_total': round(weight_change_total, 2),
        'weight_change_weekly': round(weight_change_weekly, 2),
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
