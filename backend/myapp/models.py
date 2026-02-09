from django.db import models
from django.contrib.auth.models import User
from django.core.validators import RegexValidator
from django.core.exceptions import ValidationError


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
