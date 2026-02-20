import re
from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from .models import UserProfile


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['phone', 'age', 'gender']


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)
    phone = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    age = serializers.IntegerField(required=False, allow_null=True, min_value=1, max_value=150)
    gender = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    name = serializers.CharField(required=True, max_length=150)

    class Meta:
        model = User
        fields = ['email', 'password', 'confirm_password', 'name', 'phone', 'age', 'gender']

    def validate_email(self, value):
        """Validate email is unique."""
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value.lower()

    def validate_name(self, value):
        """Validate name is not empty and contains only valid characters."""
        if not value or not value.strip():
            raise serializers.ValidationError("Name is required.")
        if not re.match(r'^[a-zA-Z\s\-\']+$', value):
            raise serializers.ValidationError("Name can only contain letters, spaces, hyphens, and apostrophes.")
        return value.strip()

    def validate_phone(self, value):
        """Validate Indian phone number (10 digits starting with 6-9)."""
        # Allow None, empty string, or actual phone numbers
        if not value:
            return None

        # Remove any spaces or special characters
        cleaned = ''.join(filter(str.isdigit, str(value)))

        if len(cleaned) == 0:
            return None  # If only spaces/special chars, treat as empty
            
        if len(cleaned) != 10:
            raise serializers.ValidationError("Phone number must be exactly 10 digits.")

        if not cleaned[0] in '6789':
            raise serializers.ValidationError("Phone number must start with 6, 7, 8, or 9.")

        return cleaned

    def validate_age(self, value):
        """Validate age is reasonable."""
        if value is not None:
            if value < 1 or value > 150:
                raise serializers.ValidationError("Age must be between 1 and 150.")
        return value

    def validate_password(self, value):
        """Validate password meets minimum requirements."""
        if len(value) < 6:
            raise serializers.ValidationError("Password must be at least 6 characters.")
        return value

    def validate(self, data):
        """Validate password confirmation."""
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        return data

    def create(self, validated_data):
        # Extract profile data
        phone = validated_data.pop('phone', None)
        age = validated_data.pop('age', None)
        gender = validated_data.pop('gender', None)
        name = validated_data.pop('name', '')
        validated_data.pop('confirm_password', None)

        # Use email as username
        email = validated_data['email']

        # Create user with email as username
        user = User.objects.create_user(
            username=email,
            email=email,
            password=validated_data['password'],
            first_name=name
        )

        # Create user profile
        UserProfile.objects.create(
            user=user,
            phone=phone,
            age=age,
            gender=gender
        )

        return user


class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'profile']


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True, write_only=True)
