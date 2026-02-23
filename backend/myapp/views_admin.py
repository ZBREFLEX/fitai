from rest_framework import status
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import PresetFood, PresetWorkout, MealEntry, WorkoutEntry, UserProfile
from .serializers_body import PresetFoodSerializer, PresetWorkoutSerializer
from django.db.models import Count

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated, IsAdminUser])
def admin_dashboard_stats(request):
    """Get high-level stats for the admin dashboard."""
    total_users = User.objects.count()
    active_users = User.objects.filter(is_active=True).count()
    total_meals_today = MealEntry.objects.filter(date=timezone.now().date()).count()
    total_workouts_today = WorkoutEntry.objects.filter(date=timezone.now().date()).count()
    
    # Recent users
    recent_users = User.objects.order_by('-date_joined')[:5]
    user_data = []
    for u in recent_users:
        user_data.append({
            'username': u.username,
            'email': u.email,
            'date_joined': u.date_joined,
            'is_active': u.is_active
        })

    return Response({
        'total_users': total_users,
        'active_users': active_users,
        'total_meals_today': total_meals_today,
        'total_workouts_today': total_workouts_today,
        'recent_users': user_data
    })

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated, IsAdminUser])
def admin_user_list(request):
    """List all users for management."""
    users = User.objects.all().order_by('-date_joined')
    data = []
    for u in users:
        data.append({
            'id': u.id,
            'username': u.username,
            'email': u.email,
            'date_joined': u.date_joined,
            'is_active': u.is_active,
            'is_staff': u.is_staff
        })
    return Response(data)

@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated, IsAdminUser])
def admin_toggle_user(request, pk):
    """Enable or disable a user account."""
    user = get_object_or_404(User, pk=pk)
    if user.is_superuser:
        return Response({'error': 'Cannot disable superusers'}, status=status.HTTP_400_BAD_REQUEST)
    
    user.is_active = not user.is_active
    user.save()
    return Response({'status': 'success', 'is_active': user.is_active})

@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated, IsAdminUser])
def admin_add_food(request):
    """Add a new preset food to the global database."""
    serializer = PresetFoodSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated, IsAdminUser])
def admin_add_workout(request):
    """Add a new preset workout to the global database."""
    serializer = PresetWorkoutSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
