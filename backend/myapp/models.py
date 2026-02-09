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
