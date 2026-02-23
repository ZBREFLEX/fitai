from django.db import models
from django.contrib.auth.models import User
from django.core.validators import RegexValidator, MinValueValidator, MaxValueValidator
from django.core.exceptions import ValidationError
from django.utils import timezone


def validate_indian_phone(value):
    """Validate Indian phone number (10 digits starting with 6-9)."""
    if not value:
        return
    # Remove any spaces or special characters
    cleaned = ''.join(filter(str.isdigit, str(value)))
    if len(cleaned) != 10:
        raise ValidationError('Phone number must be exactly 10 digits.')
    if not cleaned[0] in '6789':
        raise ValidationError('Indian phone number must start with 6, 7, 8, or 9.')


def get_today_date():
    """Return today's date for use as default in DateField."""
    return timezone.now().date()


class UserSettings(models.Model):
    """User preferences and settings."""
    UNIT_CHOICES = [
        ('metric', 'Metric (cm, kg)'),
        ('imperial', 'Imperial (ft/in, lbs)'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='settings')
    preferred_units = models.CharField(max_length=10, choices=UNIT_CHOICES, default='metric')
    measurement_reminders = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.username}'s Settings"


class Goal(models.Model):
    """User fitness goals."""
    GOAL_TYPE_CHOICES = [
        ('lose_weight', 'Lose Weight'),
        ('gain_muscle', 'Gain Muscle'),
        ('maintain', 'Maintain Current'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='goal')
    goal_type = models.CharField(max_length=20, choices=GOAL_TYPE_CHOICES, default='maintain')
    target_weight = models.FloatField(
        null=True, 
        blank=True,
        validators=[MinValueValidator(20), MaxValueValidator(500)],
        help_text='Target weight in kg'
    )
    target_bmi = models.FloatField(
        null=True, 
        blank=True,
        validators=[MinValueValidator(10), MaxValueValidator(60)],
        help_text='Target BMI'
    )
    target_body_fat = models.FloatField(
        null=True, 
        blank=True,
        validators=[MinValueValidator(1), MaxValueValidator(80)],
        help_text='Target body fat percentage'
    )
    goal_deadline = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.username}'s Goal: {self.get_goal_type_display()}"
    
    def calculate_progress(self, current_measurement):
        """Calculate progress percentage toward goal."""
        if not current_measurement:
            return 0
        
        if self.target_weight:
            current = current_measurement.weight
            target = self.target_weight
            # Lazy import to avoid circular dependency
            from .models import BodyMeasurement
            # We'll need the first measurement for proper calculation
            first_measurement = BodyMeasurement.objects.filter(
                user=self.user
            ).order_by('date_recorded').first()
            
            if first_measurement and first_measurement.weight != target:
                start = first_measurement.weight
                if self.goal_type == 'lose_weight':
                    progress = (start - current) / (start - target) * 100
                elif self.goal_type == 'gain_muscle':
                    progress = (current - start) / (target - start) * 100
                else:
                    return 100 if abs(current - target) < 1 else 0
                return max(0, min(100, progress))
        
        return 0


class BodyMeasurement(models.Model):
    """Body composition measurements over time."""
    
    ACTIVITY_LEVEL_CHOICES = [
        ('sedentary', 'Sedentary (little or no exercise)'),
        ('light', 'Light (1-3 days/week)'),
        ('moderate', 'Moderate (3-5 days/week)'),
        ('active', 'Active (6-7 days/week)'),
        ('very_active', 'Very Active (physical job + exercise)'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='measurements')
    date_recorded = models.DateTimeField(default=timezone.now)
    
    # Physical measurements (stored in metric)
    height = models.FloatField(
        validators=[MinValueValidator(50), MaxValueValidator(300)],
        help_text='Height in centimeters'
    )
    weight = models.FloatField(
        validators=[MinValueValidator(20), MaxValueValidator(500)],
        help_text='Weight in kilograms'
    )
    age = models.PositiveIntegerField(
        validators=[MinValueValidator(10), MaxValueValidator(120)],
        help_text='Age in years'
    )
    gender = models.CharField(
        max_length=20,
        choices=[
            ('male', 'Male'),
            ('female', 'Female'),
        ],
        help_text='Gender for calculations'
    )
    activity_level = models.CharField(
        max_length=20,
        choices=ACTIVITY_LEVEL_CHOICES,
        default='moderate',
        help_text='Activity level for TDEE calculation'
    )
    
    # Calculated metrics (auto-populated)
    bmi = models.FloatField(null=True, blank=True)
    body_fat_percentage = models.FloatField(null=True, blank=True)
    lean_mass = models.FloatField(null=True, blank=True)
    bmr = models.FloatField(null=True, blank=True)
    tdee = models.FloatField(null=True, blank=True)
    
    # Optional notes
    notes = models.TextField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-date_recorded']
        # Ensure one measurement per user per day
        constraints = [
            models.UniqueConstraint(
                fields=['user', 'date_recorded'],
                name='unique_measurement_per_day'
            )
        ]
    
    def __str__(self):
        return f"{self.user.username} - {self.date_recorded.date()} - {self.weight}kg"
    
    def calculate_bmi(self):
        """Calculate BMI from height and weight."""
        height_in_meters = self.height / 100
        return self.weight / (height_in_meters ** 2)
    
    def calculate_body_fat(self):
        """Calculate body fat percentage using Deurenberg formula."""
        # Body fat % = (1.20 × BMI) + (0.23 × Age) - (10.8 × sex) - 5.4
        # sex: 1 for men, 0 for women
        sex_value = 1 if self.gender == 'male' else 0
        bmi = self.calculate_bmi()
        body_fat = (1.20 * bmi) + (0.23 * self.age) - (10.8 * sex_value) - 5.4
        return max(1, min(80, body_fat))  # Clamp between 1% and 80%
    
    def calculate_lean_mass(self):
        """Calculate lean body mass."""
        body_fat_percentage = self.calculate_body_fat()
        return self.weight * (1 - body_fat_percentage / 100)
    
    def calculate_bmr(self):
        """Calculate Basal Metabolic Rate using Mifflin-St Jeor equation."""
        if self.gender == 'male':
            bmr = (10 * self.weight) + (6.25 * self.height) - (5 * self.age) + 5
        else:
            bmr = (10 * self.weight) + (6.25 * self.height) - (5 * self.age) - 161
        return bmr
    
    def calculate_tdee(self):
        """Calculate Total Daily Energy Expenditure."""
        activity_multipliers = {
            'sedentary': 1.2,
            'light': 1.375,
            'moderate': 1.55,
            'active': 1.725,
            'very_active': 1.9,
        }
        bmr = self.calculate_bmr()
        multiplier = activity_multipliers.get(self.activity_level, 1.55)
        return bmr * multiplier
    
    def get_bmi_category(self):
        """Get BMI category."""
        bmi = self.calculate_bmi()
        if bmi < 18.5:
            return 'Underweight'
        elif bmi < 24.9:
            return 'Normal weight'
        elif bmi < 29.9:
            return 'Overweight'
        else:
            return 'Obesity'
    
    def save(self, *args, **kwargs):
        """Override save to auto-calculate metrics."""
        # Calculate all metrics before saving
        self.bmi = round(self.calculate_bmi(), 2)
        self.body_fat_percentage = round(self.calculate_body_fat(), 2)
        self.lean_mass = round(self.calculate_lean_mass(), 2)
        self.bmr = round(self.calculate_bmr(), 2)
        self.tdee = round(self.calculate_tdee(), 2)
        
        super().save(*args, **kwargs)


class UserProfile(models.Model):
    GENDER_CHOICES = [
        ('male', 'Male'),
        ('female', 'Female'),
        ('other', 'Other'),
        ('prefer-not-to-say', 'Prefer not to say'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    phone = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        validators=[validate_indian_phone],
        help_text='Enter 10 digit Indian mobile number (e.g., 9876543210)'
    )
    age = models.PositiveIntegerField(blank=True, null=True)
    gender = models.CharField(max_length=20, choices=GENDER_CHOICES, blank=True, null=True)
    medical_conditions = models.TextField(blank=True, null=True, help_text='List any medical conditions like diabetes, hypertension, etc.')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}'s Profile"

    def clean(self):
        super().clean()
        if self.age is not None and (self.age < 1 or self.age > 150):
            raise ValidationError({'age': 'Age must be between 1 and 150.'})

    def save(self, *args, **kwargs):
        # Clean phone number before saving
        if self.phone:
            self.phone = ''.join(filter(str.isdigit, str(self.phone)))
        self.clean()
        super().save(*args, **kwargs)


class CustomFood(models.Model):
    """Custom foods created by users."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='custom_foods')
    food_name = models.CharField(max_length=200)
    calories = models.IntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(2000)],
        help_text='Calories per serving'
    )
    protein = models.FloatField(
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text='Protein in grams per serving'
    )
    carbs = models.FloatField(
        validators=[MinValueValidator(0), MaxValueValidator(300)],
        help_text='Carbs in grams per serving'
    )
    fats = models.FloatField(
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text='Fats in grams per serving'
    )
    serving_size = models.CharField(max_length=50, default='100g', help_text='e.g., 100g, 1 cup, 1 piece')
    is_favorite = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-is_favorite', '-created_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.food_name}"


class PresetFood(models.Model):
    """Global preset foods available to all users."""
    food_name = models.CharField(max_length=200, unique=True)
    calories = models.IntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(2000)],
        help_text='Calories per serving'
    )
    protein = models.FloatField(
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text='Protein in grams per serving'
    )
    carbs = models.FloatField(
        validators=[MinValueValidator(0), MaxValueValidator(300)],
        help_text='Carbs in grams per serving'
    )
    fats = models.FloatField(
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text='Fats in grams per serving'
    )
    serving_size = models.CharField(max_length=50, default='100g', help_text='e.g., 100g, 1 cup, 1 piece')
    category = models.CharField(
        max_length=50,
        choices=[
            ('protein', 'Protein'),
            ('carbs', 'Carbs'),
            ('vegetable', 'Vegetables'),
            ('fruit', 'Fruits'),
            ('beverage', 'Beverages'),
            ('snack', 'Snacks'),
            ('dairy', 'Dairy'),
        ],
        default='snack'
    )
    ingredients = models.TextField(
        default='',
        blank=True,
        help_text='Comma-separated list of ingredients (e.g., chicken, salt, pepper)'
    )
    
    # Health tags for AI recommendations
    is_diabetic_friendly = models.BooleanField(default=False, help_text='Low sugar/carbs')
    is_heart_healthy = models.BooleanField(default=False, help_text='Low sodium/saturated fat')
    is_gluten_free = models.BooleanField(default=False)
    is_vegan = models.BooleanField(default=False)
    
    suitable_for = models.TextField(blank=True, default='', help_text='Comma-separated conditions this is good for (e.g., diabetes, PCOS)')
    avoid_for = models.TextField(blank=True, default='', help_text='Comma-separated conditions this should be avoided for (e.g., hypertension)')
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['category', 'food_name']
    
    def __str__(self):
        return f"{self.food_name} ({self.get_category_display()})"
    
    def get_ingredients_list(self):
        """Return ingredients as a list."""
        if not self.ingredients:
            return []
        return [ing.strip().lower() for ing in self.ingredients.split(',')]


class UserAllergy(models.Model):
    """Track user food allergies and intolerances."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='allergies')
    ingredient = models.CharField(
        max_length=100,
        help_text='Ingredient or allergen name (e.g., peanuts, dairy, gluten)'
    )
    severity = models.CharField(
        max_length=20,
        choices=[
            ('mild', 'Mild - Causes minor discomfort'),
            ('moderate', 'Moderate - Causes significant discomfort'),
            ('severe', 'Severe - Life threatening'),
        ],
        default='moderate'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('user', 'ingredient')
        ordering = ['-severity', 'ingredient']
    
    def __str__(self):
        return f"{self.user.username} - {self.ingredient} ({self.severity})"


class MealEntry(models.Model):
    """User meal entries for daily tracking."""
    MEAL_TYPE_CHOICES = [
        ('breakfast', 'Breakfast'),
        ('lunch', 'Lunch'),
        ('dinner', 'Dinner'),
        ('snack', 'Snack'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='meal_entries')
    date = models.DateField(default=get_today_date)
    meal_type = models.CharField(max_length=20, choices=MEAL_TYPE_CHOICES)
    
    # Food details
    food_name = models.CharField(max_length=200)
    quantity = models.FloatField(help_text='Quantity in grams or serving size')
    
    # Nutritional info (at time of entry)
    calories = models.IntegerField()
    protein = models.FloatField()
    carbs = models.FloatField()
    fats = models.FloatField()
    
    # Optional
    custom_food = models.ForeignKey(CustomFood, on_delete=models.SET_NULL, null=True, blank=True, related_name='meal_entries')
    notes = models.TextField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-date', '-created_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.meal_type} - {self.date}"


class WorkoutEntry(models.Model):
    """User workout entries for tracking."""
    INTENSITY_CHOICES = [
        ('light', 'Light'),
        ('moderate', 'Moderate'),
        ('intense', 'Intense'),
    ]
    
    WORKOUT_TYPE_CHOICES = [
        ('cardio', 'Cardio'),
        ('strength', 'Strength Training'),
        ('flexibility', 'Flexibility/Yoga'),
        ('sports', 'Sports'),
        ('walking', 'Walking'),
        ('cycling', 'Cycling'),
        ('swimming', 'Swimming'),
        ('running', 'Running'),
        ('hiit', 'HIIT'),
        ('other', 'Other'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='workout_entries')
    date = models.DateField(default=get_today_date)
    
    # Workout details
    workout_type = models.CharField(max_length=50, choices=WORKOUT_TYPE_CHOICES)
    exercise_name = models.CharField(max_length=200, blank=True, help_text='Optional: specific exercise name')
    duration_minutes = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(480)],
        help_text='Duration in minutes'
    )
    intensity = models.CharField(max_length=20, choices=INTENSITY_CHOICES, default='moderate')
    body_part = models.CharField(max_length=50, blank=True, help_text='e.g., Chest, Back, Legs')
    reps = models.IntegerField(null=True, blank=True, help_text='Number of repetitions')
    sets = models.IntegerField(null=True, blank=True, help_text='Number of sets')
    
    # Calculated
    calories_burned = models.IntegerField()
    
    # Optional
    notes = models.TextField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-date', '-created_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.workout_type} - {self.date}"
    
    def calculate_calories_burned(self):
        """Calculate calories burned based on type, duration, and intensity."""
        # Base calories per minute for different activities
        base_calories = {
            'cardio': 8,
            'strength': 6,
            'flexibility': 3,
            'sports': 7,
            'walking': 4,
            'cycling': 9,
            'swimming': 10,
            'running': 12,
            'hiit': 14,
            'other': 5,
        }
        
        # Intensity multipliers
        intensity_multipliers = {
            'light': 0.8,
            'moderate': 1.0,
            'intense': 1.3,
        }
        
        base = base_calories.get(self.workout_type, 5)
        multiplier = intensity_multipliers.get(self.intensity, 1.0)
        return int(base * self.duration_minutes * multiplier)
    
    def save(self, *args, **kwargs):
        """Auto-calculate calories burned before saving if not provided."""
        if not self.calories_burned or self.calories_burned == 0:
            self.calories_burned = self.calculate_calories_burned()
        super().save(*args, **kwargs)


class DailyStreak(models.Model):
    """Track user's daily activity streak."""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='daily_streak')
    current_streak = models.IntegerField(default=0)
    longest_streak = models.IntegerField(default=0)
    last_activity_date = models.DateField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.current_streak} day streak"
    
    def update_streak(self):
        """Update streak based on recent activity."""
        today = timezone.now().date()
        
        # Check if user has any meal or workout entry today
        has_activity_today = (
            MealEntry.objects.filter(user=self.user, date=today).exists() or
            WorkoutEntry.objects.filter(user=self.user, date=today).exists()
        )
        
        if not has_activity_today:
            # Check if there was activity yesterday
            yesterday = today - timezone.timedelta(days=1)
            if self.last_activity_date != yesterday:
                # Streak broken
                self.current_streak = 0
            return
        
        # Has activity today
        if self.last_activity_date == today:
            # Already counted today
            return
        
        if self.last_activity_date == timezone.now().date() - timezone.timedelta(days=1):
            # Continuing streak
            self.current_streak += 1
        else:
            # New streak
            self.current_streak = 1
        
        # Update longest streak
        if self.current_streak > self.longest_streak:
            self.longest_streak = self.current_streak
        
        self.last_activity_date = today
        self.save()


class DailySummary(models.Model):
    """Daily nutrition and activity summary for a user."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='daily_summaries')
    date = models.DateField(default=timezone.now)
    
    # Nutrition totals
    total_calories = models.FloatField(default=0)
    total_protein = models.FloatField(default=0)
    total_carbs = models.FloatField(default=0)
    total_fats = models.FloatField(default=0)
    
    # Activity
    total_calories_burned = models.FloatField(default=0)
    net_calories = models.FloatField(default=0)
    meals_count = models.IntegerField(default=0)
    workouts_count = models.IntegerField(default=0)
    
    # Metadata
    tdee = models.FloatField(null=True, blank=True, help_text='Daily Energy Expenditure')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('user', 'date')
        ordering = ['-date']
    
    def __str__(self):
        return f"{self.user.username} - {self.date}"
class PresetWorkout(models.Model):
    """Global preset workouts for recommendations."""
    name = models.CharField(max_length=200)
    workout_type = models.CharField(max_length=50, choices=WorkoutEntry.WORKOUT_TYPE_CHOICES)
    duration_minutes = models.IntegerField(default=30)
    intensity = models.CharField(max_length=20, choices=WorkoutEntry.INTENSITY_CHOICES, default='moderate')
    description = models.TextField(blank=True)
    benefits = models.TextField(blank=True, help_text='e.g., Burns fat, Improves stamina')
    target_goal = models.CharField(max_length=20, choices=Goal.GOAL_TYPE_CHOICES, null=True, blank=True)
    
    # Health constraints
    is_low_impact = models.BooleanField(default=False, help_text='Safe for joint issues/asthma')
    requires_equipment = models.BooleanField(default=False)
    body_part = models.CharField(max_length=50, blank=True, help_text='e.g., Chest, Back, Legs, Cardio')
    suitable_for = models.TextField(blank=True, default='', help_text='Comma-separated conditions this is good for (e.g., weight loss, strength)')
    avoid_for = models.TextField(blank=True, default='', help_text='Comma-separated conditions this should be avoided for (e.g., asthma, knee injury)')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.get_workout_type_display()})"

    def calculate_calories(self):
        """Calculate estimated calories for this preset."""
        base_calories = {
            'cardio': 8,
            'strength': 6,
            'flexibility': 3,
            'sports': 7,
            'walking': 4,
            'cycling': 9,
            'swimming': 10,
            'running': 12,
            'hiit': 14,
            'other': 5,
        }
        intensity_multipliers = {
            'light': 0.8,
            'moderate': 1.0,
            'intense': 1.3,
        }
        base = base_calories.get(self.workout_type, 5)
        multiplier = intensity_multipliers.get(self.intensity, 1.0)
        return int(base * self.duration_minutes * multiplier)
class CustomWorkout(models.Model):
    """User-created workout templates."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='custom_workouts')
    name = models.CharField(max_length=200)
    workout_type = models.CharField(max_length=50, choices=WorkoutEntry.WORKOUT_TYPE_CHOICES)
    duration_minutes = models.IntegerField(default=30)
    intensity = models.CharField(max_length=20, choices=WorkoutEntry.INTENSITY_CHOICES, default='moderate')
    body_part = models.CharField(max_length=50, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.name}"

    def calculate_calories(self):
        """Calculate estimated calories for this template."""
        base_calories = {
            'cardio': 8,
            'strength': 6,
            'flexibility': 3,
            'sports': 7,
            'walking': 4,
            'cycling': 9,
            'swimming': 10,
            'running': 12,
            'hiit': 14,
            'other': 5,
        }
        intensity_multipliers = {
            'light': 0.8,
            'moderate': 1.0,
            'intense': 1.3,
        }
        base = base_calories.get(self.workout_type, 5)
        multiplier = intensity_multipliers.get(self.intensity, 1.0)
        return int(base * self.duration_minutes * multiplier)

class GamificationProfile(models.Model):
    """Tracks user points, level, and XP."""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='gamification')
    total_points = models.IntegerField(default=0)
    xp = models.IntegerField(default=0)
    level = models.IntegerField(default=1)
    
    LEVEL_NAMES = {
        1: 'Beginner',
        2: 'Intermediate',
        3: 'Advanced',
        4: 'Elite'
    }

    def __str__(self):
        return f"{self.user.username} - Level {self.level} ({self.total_points} pts)"

    def add_points(self, points):
        self.total_points += points
        self.xp += points
        # Simple level logic: every 1000 XP is a level
        new_level = (self.xp // 1000) + 1
        self.level = min(new_level, 4) # Max level 4 (Elite)
        self.save()
        return self.level

class Badge(models.Model):
    """Badge definitions."""
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField()
    icon_name = models.CharField(max_length=50, help_text="Lucide icon name")
    requirement_type = models.CharField(max_length=50, choices=[
        ('workout_count', 'Total Workouts'),
        ('streak', 'Day Streak'),
        ('body_part_count', 'Body Part Workouts'),
        ('total_calories', 'Total Calories Burned')
    ])
    requirement_value = models.IntegerField()
    body_part = models.CharField(max_length=50, blank=True, null=True)

    def __str__(self):
        return self.name

class UserBadge(models.Model):
    """Badges earned by users."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='earned_badges')
    badge = models.ForeignKey(Badge, on_delete=models.CASCADE)
    date_earned = models.DateTimeField(auto_now_add=True)
    is_seen = models.BooleanField(default=False)

    class Meta:
        unique_together = ('user', 'badge')

    def __str__(self):
        return f"{self.user.username} earned {self.badge.name}"
