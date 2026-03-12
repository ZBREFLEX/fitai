import os
import django
from django.utils import timezone
import random

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "fitai.settings")
django.setup()

from django.contrib.auth.models import User
from myapp.models import UserProfile, Goal, BodyMeasurement, MealEntry, WorkoutEntry, DailySummary

def seed_users():
    print("--- Starting Realistic Mock User Seeding ---")
    
    # 1. Sarah (Goal: Weight Loss, Condition: PCOS)
    user1, created = User.objects.get_or_create(username='sarah_j', email='sarah@example.com')
    if created:
        user1.set_password('fitpass123')
        user1.first_name = 'Sarah'
        user1.last_name = 'Jenkins'
        user1.save()
        
        # Profile
        profile, _ = UserProfile.objects.get_or_create(user=user1)
        profile.phone = "555-0101"
        profile.age = 29
        profile.gender = "female"
        profile.medical_conditions = "PCOS"
        profile.save()
        
        # Goal
        Goal.objects.update_or_create(user=user1, defaults={'goal_type': 'lose_weight'})
        
        # Body Measurement
        BodyMeasurement.objects.create(
            user=user1,
            weight=180.5,
            height=165.0,
            age=29,
            gender='female',
            body_fat_percentage=32.0,
            activity_level='light'
        )
        print("Created User: Sarah Jenkins")

    # 2. David (Goal: Muscle Gain, Condition: None)
    user2, created = User.objects.get_or_create(username='david_c', email='david@example.com')
    if created:
        user2.set_password('fitpass123')
        user2.first_name = 'David'
        user2.last_name = 'Chen'
        user2.save()
        
        profile, _ = UserProfile.objects.get_or_create(user=user2)
        profile.age = 24
        profile.gender = "male"
        profile.medical_conditions = ""
        profile.save()
        
        Goal.objects.update_or_create(user=user2, defaults={'goal_type': 'gain_muscle'})
        
        BodyMeasurement.objects.create(
            user=user2,
            weight=165.0,
            height=180.0,
            age=24,
            gender='male',
            body_fat_percentage=15.0,
            activity_level='active'
        )
        print("Created User: David Chen")

    # 3. Maya (Goal: Maintain, Condition: Diabetes)
    user3, created = User.objects.get_or_create(username='maya_p', email='maya@example.com')
    if created:
        user3.set_password('fitpass123')
        user3.first_name = 'Maya'
        user3.last_name = 'Patel'
        user3.save()
        
        profile, _ = UserProfile.objects.get_or_create(user=user3)
        profile.age = 42
        profile.gender = "female"
        profile.medical_conditions = "Type 2 Diabetes, Hypertension"
        profile.save()
        
        Goal.objects.update_or_create(user=user3, defaults={'goal_type': 'maintain'})
        
        BodyMeasurement.objects.create(
            user=user3,
            weight=150.0,
            height=160.0,
            age=42,
            gender='female',
            body_fat_percentage=26.0,
            activity_level='sedentary'
        )
        print("Created User: Maya Patel")

    print("\n--- Seeding User History ---")
    today = timezone.now().date()
    yesterday = today - timezone.timedelta(days=1)
    
    # helper to safely create daily summary
    def update_summary(user_obj, date_obj, meal):
        req, _ = DailySummary.objects.get_or_create(user=user_obj, date=date_obj)
        req.total_calories = (req.total_calories or 0) + meal.calories
        req.total_protein = (req.total_protein or 0) + meal.protein
        req.total_carbs = (req.total_carbs or 0) + meal.carbs
        req.total_fats = (req.total_fats or 0) + meal.fats
        req.save()

    # Sarah's history
    if not MealEntry.objects.filter(user=user1).exists():
        m1 = MealEntry.objects.create(user=user1, meal_type='breakfast', food_name='Oatmeal with Berries', quantity=1, calories=300, protein=10, carbs=55, fats=5, date=yesterday)
        m2 = MealEntry.objects.create(user=user1, meal_type='lunch', food_name='Grilled Chicken Salad', quantity=1, calories=400, protein=45, carbs=15, fats=18, date=yesterday)
        update_summary(user1, yesterday, m1)
        update_summary(user1, yesterday, m2)
        
        WorkoutEntry.objects.create(user=user1, workout_type='cardio', exercise_name='Light Jogging', duration_minutes=30, intensity='light', calories_burned=200, date=yesterday)
        WorkoutEntry.objects.create(user=user1, workout_type='strength', exercise_name='Leg Press', duration_minutes=20, intensity='moderate', body_part='Legs', date=today)
        print("Seeded history for Sarah")

    # David's history
    if not MealEntry.objects.filter(user=user2).exists():
        m3 = MealEntry.objects.create(user=user2, meal_type='lunch', food_name='Salmon with Quinoa', quantity=2, calories=1100, protein=80, carbs=90, fats=44, date=today)
        update_summary(user2, today, m3)
        
        WorkoutEntry.objects.create(user=user2, workout_type='strength', exercise_name='Bench Press', duration_minutes=45, intensity='intense', body_part='Chest', date=yesterday)
        WorkoutEntry.objects.create(user=user2, workout_type='strength', exercise_name='Incline Dumbbell Press', duration_minutes=30, intensity='intense', body_part='Chest', date=yesterday)
        print("Seeded history for David")

    # Maya's history
    if not MealEntry.objects.filter(user=user3).exists():
        m4 = MealEntry.objects.create(user=user3, meal_type='dinner', food_name='Lentil Soup', quantity=1, calories=320, protein=18, carbs=50, fats=4, date=today)
        update_summary(user3, today, m4)
        
        WorkoutEntry.objects.create(user=user3, workout_type='cardio', exercise_name='Walking', duration_minutes=45, intensity='light', calories_burned=150, date=yesterday)
        print("Seeded history for Maya")

    print("\n--- Done! ---")
    print("You now have 3 demo accounts (Password for all is 'fitpass123'):")
    print("1. sarah_j (Weight Loss / PCOS)")
    print("2. david_c (Muscle Gain / Normal)")
    print("3. maya_p (Maintenance / Diabetic, Hypertension)")

if __name__ == '__main__':
    seed_users()
