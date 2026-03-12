import pandas as pd
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import MinMaxScaler

def get_meal_recommendations_ml(user_vector, foods_list, top_n=10):
    """
    Recommends meals using Content-Based Filtering (Cosine Similarity).
    
    Args:
        user_vector (dict): A dictionary representing the user's ideal nutritional state.
                            Expected keys: 'calories', 'protein', 'carbs', 'fats'
        foods_list (list): A list of food objects to rank.
        top_n (int): Number of top recommendations to return.
        
    Returns:
        list: The top_n recommended food objects, sorted by similarity score.
    """
    if not foods_list:
        return []
        
    # 1. Create a DataFrame for foods
    food_data = []
    food_objects = [] # Keep reference to original objects
    
    for food in foods_list:
        food_data.append({
            'calories': float(food.calories),
            'protein': float(food.protein),
            'carbs': float(food.carbs),
            'fats': float(food.fats),
            # Include algo score component (e.g. medical boosts/penalties from earlier filters)
            'algo_score': float(getattr(food, 'algo_score', 0))
        })
        food_objects.append(food)
        
    df_foods = pd.DataFrame(food_data)
    
    # 2. Add user ideal vector to the top of DataFrame for vectorization
    user_row = {
        'calories': float(user_vector.get('calories', 0)),
        'protein': float(user_vector.get('protein', 0)),
        'carbs': float(user_vector.get('carbs', 0)),
        'fats': float(user_vector.get('fats', 0)),
        # User vector gets max score baseline
        'algo_score': df_foods['algo_score'].max() if not df_foods.empty and df_foods['algo_score'].max() > 0 else 100.0
    }
    
    # Prepend user row
    df_combined = pd.concat([pd.DataFrame([user_row]), df_foods], ignore_index=True)
    
    # 3. Normalize the features using MinMaxScaler
    scaler = MinMaxScaler()
    
    # Fill any NaNs with 0
    df_combined = df_combined.fillna(0)
    
    # Scale the metrics to [0, 1] so calories don't overpower macros
    try:
        scaled_features = scaler.fit_transform(df_combined)
    except ValueError:
        # Edge case: All values are empty/zero
        return foods_list[:top_n]
        
    # 4. Extract user vector and food vectors
    user_scaled_vector = scaled_features[0].reshape(1, -1)
    foods_scaled_vectors = scaled_features[1:]
    
    # 5. Calculate Cosine Similarity
    similarities = cosine_similarity(user_scaled_vector, foods_scaled_vectors)[0]
    
    # 6. Rank the foods based on similarity
    ranked_indices = similarities.argsort()[::-1] # Descending order
    
    ranked_foods = []
    for idx in ranked_indices:
        food = food_objects[idx]
        food.ml_score = float(similarities[idx]) # Attach ml_score for debugging/display
        ranked_foods.append(food)
        
    return ranked_foods[:top_n]


def get_workout_recommendations_ml(user_profile, workouts_list, top_n=10):
    """
    Recommends workouts using Content-Based Filtering (Cosine Similarity).
    
    Args:
        user_profile (dict): The user's target profile for the workout.
                             Expected keys: 'focus_part', 'target_intensity' (1-3)
        workouts_list (list): A list of dictionaries containing workout 'obj' and 'type'.
        top_n (int): Number of top recommendations to return.
        
    Returns:
        list: The top_n recommended workout dictionaries, sorted by similarity score.
    """
    if not workouts_list:
        return []
        
    workout_data = []
    workout_items = []
    
    # Intensity mapping to numerical values
    intensity_map = {'light': 1, 'moderate': 2, 'intense': 3}
    
    for item in workouts_list:
        w = item['obj']
        
        # Base features
        intensity_val = intensity_map.get(str(w.intensity).lower(), 2)
        duration_val = float(w.duration_minutes)
        
        # We handle body part focus as a binary feature
        focus_match = 1.0 if str(w.body_part).lower() == str(user_profile.get('focus_part', '')).lower() else 0.0
        
        workout_data.append({
            'intensity': intensity_val,
            'duration': duration_val,
            'focus_match': focus_match,
            # Integrate the pre-calculated medical/variety score
            'algo_score': float(item.get('base_score', 0))
        })
        workout_items.append(item)
        
    df_workouts = pd.DataFrame(workout_data)
    
    # User's ideal workout vector
    user_row = {
        'intensity': intensity_map.get(str(user_profile.get('target_intensity', 'moderate')).lower(), 2),
        'duration': float(user_profile.get('target_duration', 30.0)), # Default to 30 mins
        'focus_match': 1.0, # Ideal workout perfectly matches focus
        'algo_score': df_workouts['algo_score'].max() if not df_workouts.empty and df_workouts['algo_score'].max() > 0 else 100.0
    }
    
    df_combined = pd.concat([pd.DataFrame([user_row]), df_workouts], ignore_index=True)
    scaler = MinMaxScaler()
    df_combined = df_combined.fillna(0)
    
    try:
        scaled_features = scaler.fit_transform(df_combined)
    except ValueError:
        return workouts_list[:top_n]
        
    user_scaled_vector = scaled_features[0].reshape(1, -1)
    workouts_scaled_vectors = scaled_features[1:]
    
    similarities = cosine_similarity(user_scaled_vector, workouts_scaled_vectors)[0]
    ranked_indices = similarities.argsort()[::-1]
    
    ranked_workouts = []
    for idx in ranked_indices:
        item = workout_items[idx]
        item['ml_score'] = float(similarities[idx])
        # Update the final score to be driven by ML similarity
        item['score'] = float(similarities[idx]) * 100 # Scale 0-1 to 0-100 for display
        ranked_workouts.append(item)
        
    return ranked_workouts[:top_n]
