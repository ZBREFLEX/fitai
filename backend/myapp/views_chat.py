import json
import requests
from django.conf import settings
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from .models import BodyMeasurement, Goal

@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def chat_with_ai(request):
    """
    Handle chat messages with the Groq AI model.
    """
    try:
        data = request.data
        user_message = data.get("message", "")
        history = data.get("history", [])

        if not user_message:
            return Response({"error": "Message is required"}, status=status.HTTP_400_BAD_REQUEST)

        # Build context about the user to make the AI smarter
        user = request.user
        context_str = f"You are a helpful, encouraging fitness and nutrition AI coach for the FitAI app. "
        context_str += f"The user's name is {user.first_name or user.username}. "

        # Add user measurements and goals if available
        latest_measurement = BodyMeasurement.objects.filter(user=user).order_by('-date_recorded').first()
        if latest_measurement:
            context_str += f"They weigh {latest_measurement.weight}kg, are {latest_measurement.height}cm tall. "
            if latest_measurement.tdee:
                context_str += f"Their estimated TDEE is {latest_measurement.tdee} kcal/day. "

        try:
            goal = Goal.objects.get(user=user)
            context_str += f"Their goal is to {goal.goal_type.replace('_', ' ')}. "
        except Goal.DoesNotExist:
            pass

        context_str += "Keep your answers concise, practical, and heavily focused on fitness, health, and nutrition."

        # Prepare messages array for Groq API
        messages = [{"role": "system", "content": context_str}]
        
        # Add history (limit to last 10 messages for context)
        for msg in history[-10:]:
            # Ensure valid roles: 'user' or 'assistant'
            role = msg.get("role", "user")
            content = msg.get("content", "")
            if role in ["user", "assistant"] and content:
                messages.append({"role": role, "content": content})
                
        # Append the new user message
        messages.append({"role": "user", "content": user_message})

        # Make request to Groq API
        api_key = getattr(settings, "GROQ_API_KEY", None)
        if not api_key:
            return Response({"error": "Groq API key not configured"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        api_key = api_key.strip()
        
        try:
            response = requests.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "llama-3.3-70b-versatile",
                    "messages": messages,
                    "temperature": 0.7,
                    "max_completion_tokens": 800
                },
                timeout=15
            )
            
            if response.status_code != 200:
                print(f"Groq API Error: {response.text}")
                return Response({"error": "Failed to communicate with AI service"}, status=status.HTTP_502_BAD_GATEWAY)
                
            result = response.json()
            ai_reply = result.get("choices", [{}])[0].get("message", {}).get("content", "I'm sorry, I couldn't process that request.")
            
            return Response({"reply": ai_reply}, status=status.HTTP_200_OK)
            
        except requests.exceptions.RequestException as e:
            print(f"Groq API Request Error: {str(e)}")
            return Response({"error": "Failed to connect to AI service"}, status=status.HTTP_502_BAD_GATEWAY)
            
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"Chat error: {error_trace}")
        return Response({"error": "Internal Error", "details": error_trace}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
