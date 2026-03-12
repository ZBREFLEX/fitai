import os
import django

# Set up Django environment
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "fitai.settings")
django.setup()

from myapp.models import PresetFood, PresetWorkout

print("Seeding database with Preset Foods and Workouts...")

presets_food = [
    {
        "food_name": "Oatmeal with Berries",
        "calories": 300,
        "protein": 10.0,
        "carbs": 55.0,
        "fats": 5.0,
        "serving_size": "1 bowl",
        "category": "breakfast",
        "ingredients": "oats, mixed berries, almond milk",
        "is_diabetic_friendly": False,
        "is_heart_healthy": True,
        "is_vegan": True,
        "suitable_for": "weight loss, general health",
    },
    {
        "food_name": "Grilled Chicken Salad",
        "calories": 400,
        "protein": 45.0,
        "carbs": 15.0,
        "fats": 18.0,
        "serving_size": "1 large bowl",
        "category": "lunch",
        "ingredients": "chicken breast, mixed greens, olive oil, tomatoes",
        "is_diabetic_friendly": True,
        "is_heart_healthy": True,
        "is_gluten_free": True,
        "suitable_for": "weight loss, muscle gain, diabetes",
    },
    {
        "food_name": "Salmon with Quinoa",
        "calories": 550,
        "protein": 40.0,
        "carbs": 45.0,
        "fats": 22.0,
        "serving_size": "1 plate",
        "category": "dinner",
        "ingredients": "salmon, quinoa, broccoli, lemon",
        "is_heart_healthy": True,
        "is_gluten_free": True,
        "suitable_for": "heart health, muscle gain",
    },
    {
        "food_name": "Greek Yogurt & Almonds",
        "calories": 250,
        "protein": 20.0,
        "carbs": 12.0,
        "fats": 15.0,
        "serving_size": "1 cup",
        "category": "snack",
        "ingredients": "greek yogurt, almonds, honey",
        "is_diabetic_friendly": True,
        "is_gluten_free": True,
        "suitable_for": "muscle gain, general health",
    },
    {
        "food_name": "Lentil Soup",
        "calories": 320,
        "protein": 18.0,
        "carbs": 50.0,
        "fats": 4.0,
        "serving_size": "1 bowl",
        "category": "lunch",
        "ingredients": "lentils, carrots, celery, vegetable broth",
        "is_heart_healthy": True,
        "is_vegan": True,
        "is_diabetic_friendly": True,
        "suitable_for": "weight loss, diabetes",
    }
]

for food_data in presets_food:
    obj, created = PresetFood.objects.get_or_create(
        food_name=food_data["food_name"],
        defaults=food_data
    )
    if created:
        print(f"Created food: {obj.food_name}")

presets_workout = [
    {
        "name": "Full Body HIIT",
        "workout_type": "hiit",
        "duration_minutes": 30,
        "intensity": "intense",
        "description": "High intensity interval training targeting all major muscle groups.",
        "benefits": "Burns fat, Improves stamina, saves time",
        "target_goal": "lose_weight",
        "is_low_impact": False,
        "requires_equipment": False,
        "body_part": "Full Body",
        "suitable_for": "weight loss, stamina",
        "avoid_for": "knee injury, heart conditions"
    },
    {
        "name": "Morning Yoga Flow",
        "workout_type": "flexibility",
        "duration_minutes": 20,
        "intensity": "light",
        "description": "A gentle morning stretch to wake up the body.",
        "benefits": "Improves flexibility, reduces stress",
        "target_goal": "maintain",
        "is_low_impact": True,
        "requires_equipment": False,
        "body_part": "Full Body",
        "suitable_for": "stress relief, flexibility",
    },
    {
        "name": "Upper Body Strength",
        "workout_type": "strength",
        "duration_minutes": 45,
        "intensity": "moderate",
        "description": "Dumbbell focused upper body workout focusing on chest, back, and arms.",
        "benefits": "Builds muscle, increases upper body strength",
        "target_goal": "gain_muscle",
        "is_low_impact": True,
        "requires_equipment": True,
        "body_part": "Upper Body",
        "suitable_for": "muscle gain, strength",
    },
    {
        "name": "Brisk Walking",
        "workout_type": "walking",
        "duration_minutes": 45,
        "intensity": "moderate",
        "description": "A fast-paced walk suitable for all fitness levels.",
        "benefits": "Improves cardiovascular health, burns calories",
        "target_goal": "lose_weight",
        "is_low_impact": True,
        "requires_equipment": False,
        "body_part": "Legs",
        "suitable_for": "weight loss, beginners, heart health",
    },
    {
        "name": "Core Crusher",
        "workout_type": "strength",
        "duration_minutes": 15,
        "intensity": "intense",
        "description": "Intense abdominal workout to build core strength.",
        "benefits": "Strengthens core, improves posture",
        "target_goal": "gain_muscle",
        "is_low_impact": True,
        "requires_equipment": False,
        "body_part": "Core",
        "suitable_for": "core strength, stability",
        "avoid_for": "lower back pain"
    }
]

for workout_data in presets_workout:
    obj, created = PresetWorkout.objects.get_or_create(
        name=workout_data["name"],
        defaults=workout_data
    )
    if created:
        print(f"Created workout: {obj.name}")

print("Seeding complete!")
