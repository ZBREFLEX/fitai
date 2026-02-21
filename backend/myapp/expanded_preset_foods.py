"""Expanded list of preset foods with detailed ingredients"""

EXPANDED_PRESET_FOODS = [
    # PROTEINS - Poultry
    {'food_name': 'Chicken Breast (grilled)', 'calories': 165, 'protein': 31, 'carbs': 0, 'fats': 3.6, 'serving_size': '100g', 'ingredients': 'chicken breast'},
    {'food_name': 'Chicken Thigh (roasted)', 'calories': 209, 'protein': 26, 'carbs': 0, 'fats': 11, 'serving_size': '100g', 'ingredients': 'chicken thigh'},
    {'food_name': 'Turkey Breast', 'calories': 135, 'protein': 30, 'carbs': 0, 'fats': 1.3, 'serving_size': '100g', 'ingredients': 'turkey breast, salt'},
    {'food_name': 'Duck Breast', 'calories': 301, 'protein': 25.5, 'carbs': 0, 'fats': 22.5, 'serving_size': '100g', 'ingredients': 'duck breast'},
    
    # PROTEINS - Beef & Pork
    {'food_name': 'Ground Beef (90% lean)', 'calories': 176, 'protein': 20, 'carbs': 0, 'fats': 10, 'serving_size': '100g', 'ingredients': 'beef'},
    {'food_name': 'Ground Beef (95% lean)', 'calories': 156, 'protein': 22.5, 'carbs': 0, 'fats': 7, 'serving_size': '100g', 'ingredients': 'beef'},
    {'food_name': 'Beef Steak (sirloin)', 'calories': 180, 'protein': 28, 'carbs': 0, 'fats': 8, 'serving_size': '100g', 'ingredients': 'beef'},
    {'food_name': 'Pork Chop (lean)', 'calories': 165, 'protein': 28, 'carbs': 0, 'fats': 6, 'serving_size': '100g', 'ingredients': 'pork'},
    {'food_name': 'Pork Tenderloin', 'calories': 142, 'protein': 27, 'carbs': 0, 'fats': 3.5, 'serving_size': '100g', 'ingredients': 'pork'},
    {'food_name': 'Lamb Chop', 'calories': 209, 'protein': 28.3, 'carbs': 0, 'fats': 10, 'serving_size': '100g', 'ingredients': 'lamb'},
    
    # PROTEINS - Fish & Seafood
    {'food_name': 'Salmon Fillet', 'calories': 206, 'protein': 20, 'carbs': 0, 'fats': 13, 'serving_size': '100g', 'ingredients': 'salmon'},
    {'food_name': 'Cod Fillet', 'calories': 82, 'protein': 17.6, 'carbs': 0, 'fats': 0.7, 'serving_size': '100g', 'ingredients': 'cod'},
    {'food_name': 'Tuna Steak', 'calories': 144, 'protein': 29.9, 'carbs': 0, 'fats': 1.3, 'serving_size': '100g', 'ingredients': 'tuna'},
    {'food_name': 'Tuna (canned in water)', 'calories': 96, 'protein': 22, 'carbs': 0, 'fats': 0.8, 'serving_size': '100g', 'ingredients': 'tuna, water, salt'},
    {'food_name': 'Mackerel', 'calories': 305, 'protein': 25, 'carbs': 0, 'fats': 23, 'serving_size': '100g', 'ingredients': 'mackerel'},
    {'food_name': 'Shrimp', 'calories': 99, 'protein': 24, 'carbs': 0, 'fats': 0.3, 'serving_size': '100g', 'ingredients': 'shrimp, salt'},
    {'food_name': 'Crab Meat', 'calories': 102, 'protein': 20.3, 'carbs': 0, 'fats': 1.1, 'serving_size': '100g', 'ingredients': 'crab'},
    
    # PROTEINS - Eggs & Dairy
    {'food_name': 'Eggs (1 large)', 'calories': 70, 'protein': 6, 'carbs': 0.6, 'fats': 5, 'serving_size': '1 piece', 'ingredients': 'egg'},
    {'food_name': 'Egg Whites', 'calories': 17, 'protein': 3.6, 'carbs': 0.4, 'fats': 0, 'serving_size': '1 large', 'ingredients': 'egg white'},
    {'food_name': 'Greek Yogurt (plain)', 'calories': 59, 'protein': 10, 'carbs': 3.3, 'fats': 0.4, 'serving_size': '100g', 'ingredients': 'milk, yogurt cultures, dairy'},
    {'food_name': 'Cottage Cheese (low-fat)', 'calories': 79, 'protein': 11, 'carbs': 2.8, 'fats': 2, 'serving_size': '100g', 'ingredients': 'milk, dairy, lactose'},
    {'food_name': 'Cottage Cheese (full-fat)', 'calories': 98, 'protein': 11, 'carbs': 3.4, 'fats': 5, 'serving_size': '100g', 'ingredients': 'milk, dairy, lactose'},
    {'food_name': 'Ricotta Cheese', 'calories': 174, 'protein': 12, 'carbs': 3, 'fats': 13, 'serving_size': '100g', 'ingredients': 'milk, dairy, lactose, salt'},
    
    # PROTEINS - Plant-Based
    {'food_name': 'Tofu (firm)', 'calories': 76, 'protein': 8, 'carbs': 1.9, 'fats': 4.8, 'serving_size': '100g', 'ingredients': 'soybeans, salt, water, soy'},
    {'food_name': 'Tofu (silken)', 'calories': 61, 'protein': 6.4, 'carbs': 2, 'fats': 3.5, 'serving_size': '100g', 'ingredients': 'soybeans, salt, water, soy'},
    {'food_name': 'Tempeh', 'calories': 165, 'protein': 19, 'carbs': 7, 'fats': 9, 'serving_size': '100g', 'ingredients': 'soybeans, salt, water, soy'},
    {'food_name': 'Seitan (wheat gluten)', 'calories': 370, 'protein': 25, 'carbs': 14, 'fats': 1.6, 'serving_size': '100g', 'ingredients': 'wheat gluten, water, salt'},
    {'food_name': 'Lentils (cooked)', 'calories': 116, 'protein': 9, 'carbs': 20, 'fats': 0.4, 'serving_size': '100g', 'ingredients': 'lentils, water, salt'},
    {'food_name': 'Black Beans (cooked)', 'calories': 132, 'protein': 9, 'carbs': 24, 'fats': 0.6, 'serving_size': '100g', 'ingredients': 'black beans, water, salt'},
    
    # CARBS - Grains & Starches
    {'food_name': 'White Rice (cooked)', 'calories': 130, 'protein': 2.7, 'carbs': 28, 'fats': 0.3, 'serving_size': '100g', 'ingredients': 'rice, water, salt'},
    {'food_name': 'Brown Rice (cooked)', 'calories': 111, 'protein': 2.6, 'carbs': 23, 'fats': 0.9, 'serving_size': '100g', 'ingredients': 'brown rice, water, salt'},
    {'food_name': 'Basmati Rice (cooked)', 'calories': 130, 'protein': 2.7, 'carbs': 28, 'fats': 0.3, 'serving_size': '100g', 'ingredients': 'basmati rice, water, salt'},
    {'food_name': 'Quinoa (cooked)', 'calories': 120, 'protein': 4.4, 'carbs': 21, 'fats': 1.9, 'serving_size': '100g', 'ingredients': 'quinoa, water, salt'},
    {'food_name': 'Oatmeal (dry)', 'calories': 389, 'protein': 17, 'carbs': 66, 'fats': 6.9, 'serving_size': '100g', 'ingredients': 'oats, wheat, gluten'},
    {'food_name': 'Pasta (wheat, cooked)', 'calories': 131, 'protein': 5, 'carbs': 25, 'fats': 1.1, 'serving_size': '100g', 'ingredients': 'wheat, gluten, durum wheat, water, salt'},
    {'food_name': 'Sweet Potato (boiled)', 'calories': 86, 'protein': 1.6, 'carbs': 20, 'fats': 0.1, 'serving_size': '100g', 'ingredients': 'sweet potato'},
    {'food_name': 'Regular Potato (boiled)', 'calories': 77, 'protein': 1.7, 'carbs': 17, 'fats': 0.1, 'serving_size': '100g', 'ingredients': 'potato'},
    {'food_name': 'Whole Wheat Bread', 'calories': 247, 'protein': 9, 'carbs': 44, 'fats': 1.6, 'serving_size': '100g', 'ingredients': 'wheat, gluten, salt, water, yeast'},
    {'food_name': 'Sourdough Bread', 'calories': 289, 'protein': 9, 'carbs': 51, 'fats': 1.4, 'serving_size': '100g', 'ingredients': 'wheat, gluten, salt, water, yeast'},
    
    # VEGETABLES
    {'food_name': 'Broccoli (raw)', 'calories': 34, 'protein': 2.8, 'carbs': 7, 'fats': 0.4, 'serving_size': '100g', 'ingredients': 'broccoli'},
    {'food_name': 'Spinach (raw)', 'calories': 23, 'protein': 2.9, 'carbs': 3.6, 'fats': 0.4, 'serving_size': '100g', 'ingredients': 'spinach'},
    {'food_name': 'Kale (raw)', 'calories': 49, 'protein': 4.3, 'carbs': 9, 'fats': 0.9, 'serving_size': '100g', 'ingredients': 'kale'},
    {'food_name': 'Bell Pepper (red)', 'calories': 31, 'protein': 1, 'carbs': 6, 'fats': 0.3, 'serving_size': '100g', 'ingredients': 'bell pepper'},
    {'food_name': 'Carrots (raw)', 'calories': 41, 'protein': 0.9, 'carbs': 10, 'fats': 0.2, 'serving_size': '100g', 'ingredients': 'carrot'},
    {'food_name': 'Tomato (raw)', 'calories': 18, 'protein': 0.9, 'carbs': 3.9, 'fats': 0.2, 'serving_size': '100g', 'ingredients': 'tomato'},
    {'food_name': 'Cucumber (raw)', 'calories': 16, 'protein': 0.7, 'carbs': 3.6, 'fats': 0.1, 'serving_size': '100g', 'ingredients': 'cucumber'},
    {'food_name': 'Zucchini (raw)', 'calories': 17, 'protein': 1.5, 'carbs': 3.5, 'fats': 0.4, 'serving_size': '100g', 'ingredients': 'zucchini'},
    {'food_name': 'Mushrooms (raw)', 'calories': 22, 'protein': 3.1, 'carbs': 3.3, 'fats': 0.3, 'serving_size': '100g', 'ingredients': 'mushrooms'},
    {'food_name': 'Green Beans', 'calories': 31, 'protein': 1.8, 'carbs': 7, 'fats': 0.1, 'serving_size': '100g', 'ingredients': 'green beans'},
    {'food_name': 'Asparagus', 'calories': 20, 'protein': 2.2, 'carbs': 3.7, 'fats': 0.1, 'serving_size': '100g', 'ingredients': 'asparagus'},
    
    # FRUITS
    {'food_name': 'Banana', 'calories': 89, 'protein': 1.1, 'carbs': 23, 'fats': 0.3, 'serving_size': '1 medium', 'ingredients': 'banana'},
    {'food_name': 'Apple (medium)', 'calories': 52, 'protein': 0.3, 'carbs': 14, 'fats': 0.2, 'serving_size': '1 medium', 'ingredients': 'apple'},
    {'food_name': 'Orange (medium)', 'calories': 47, 'protein': 0.7, 'carbs': 12, 'fats': 0.3, 'serving_size': '1 medium', 'ingredients': 'orange, citrus'},
    {'food_name': 'Blueberries', 'calories': 57, 'protein': 0.7, 'carbs': 14, 'fats': 0.3, 'serving_size': '100g', 'ingredients': 'blueberries'},
    {'food_name': 'Strawberries', 'calories': 32, 'protein': 0.8, 'carbs': 7.7, 'fats': 0.3, 'serving_size': '100g', 'ingredients': 'strawberries'},
    {'food_name': 'Watermelon', 'calories': 30, 'protein': 0.6, 'carbs': 7.6, 'fats': 0.2, 'serving_size': '100g', 'ingredients': 'watermelon'},
    {'food_name': 'Avocado', 'calories': 160, 'protein': 2, 'carbs': 9, 'fats': 15, 'serving_size': '100g', 'ingredients': 'avocado'},
    {'food_name': 'Grapes', 'calories': 67, 'protein': 0.6, 'carbs': 17, 'fats': 0.2, 'serving_size': '100g', 'ingredients': 'grapes'},
    
    # NUTS & SEEDS
    {'food_name': 'Almonds', 'calories': 579, 'protein': 21, 'carbs': 22, 'fats': 50, 'serving_size': '100g', 'ingredients': 'almonds, tree nuts'},
    {'food_name': 'Peanuts', 'calories': 567, 'protein': 26, 'carbs': 16, 'fats': 49, 'serving_size': '100g', 'ingredients': 'peanuts, legumes'},
    {'food_name': 'Walnuts', 'calories': 654, 'protein': 9, 'carbs': 14, 'fats': 65, 'serving_size': '100g', 'ingredients': 'walnuts, tree nuts'},
    {'food_name': 'Cashews', 'calories': 553, 'protein': 18, 'carbs': 30, 'fats': 44, 'serving_size': '100g', 'ingredients': 'cashews, tree nuts'},
    {'food_name': 'Peanut Butter', 'calories': 588, 'protein': 25, 'carbs': 20, 'fats': 50, 'serving_size': '100g', 'ingredients': 'peanuts, legumes, salt, oil'},
    {'food_name': 'Almond Butter', 'calories': 614, 'protein': 21, 'carbs': 19, 'fats': 56, 'serving_size': '100g', 'ingredients': 'almonds, tree nuts, salt, oil'},
    {'food_name': 'Sunflower Seeds', 'calories': 584, 'protein': 20, 'carbs': 20, 'fats': 51, 'serving_size': '100g', 'ingredients': 'sunflower seeds, sesame'},
    {'food_name': 'Pumpkin Seeds', 'calories': 541, 'protein': 24, 'carbs': 13, 'fats': 46, 'serving_size': '100g', 'ingredients': 'pumpkin seeds, sesame'},
    
    # DAIRY & CHEESE
    {'food_name': 'Milk (whole)', 'calories': 61, 'protein': 3.2, 'carbs': 4.8, 'fats': 3.3, 'serving_size': '100ml', 'ingredients': 'milk, dairy, lactose'},
    {'food_name': 'Milk (low-fat)', 'calories': 49, 'protein': 3.3, 'carbs': 4.8, 'fats': 1.5, 'serving_size': '100ml', 'ingredients': 'milk, dairy, lactose'},
    {'food_name': 'Almond Milk (unsweetened)', 'calories': 17, 'protein': 0.6, 'carbs': 0.6, 'fats': 1.4, 'serving_size': '100ml', 'ingredients': 'almonds, tree nuts, water, salt'},
    {'food_name': 'Oat Milk', 'calories': 49, 'protein': 2, 'carbs': 4.3, 'fats': 1.5, 'serving_size': '100ml', 'ingredients': 'oats, wheat, gluten, water, salt'},
    {'food_name': 'Soy Milk', 'calories': 54, 'protein': 3.3, 'carbs': 2.3, 'fats': 2.3, 'serving_size': '100ml', 'ingredients': 'soybeans, soy, water, salt'},
    {'food_name': 'Cheddar Cheese', 'calories': 402, 'protein': 25, 'carbs': 1.3, 'fats': 33, 'serving_size': '100g', 'ingredients': 'milk, dairy, lactose, salt'},
    {'food_name': 'Mozzarella Cheese', 'calories': 280, 'protein': 28, 'carbs': 3.1, 'fats': 17, 'serving_size': '100g', 'ingredients': 'milk, dairy, lactose, salt'},
    {'food_name': 'Feta Cheese', 'calories': 264, 'protein': 14, 'carbs': 4, 'fats': 21, 'serving_size': '100g', 'ingredients': 'milk, dairy, lactose, salt'},
    
    # BEVERAGES
    {'food_name': 'Water', 'calories': 0, 'protein': 0, 'carbs': 0, 'fats': 0, 'serving_size': '250ml', 'ingredients': 'water'},
    {'food_name': 'Coffee (black)', 'calories': 2, 'protein': 0.3, 'carbs': 0, 'fats': 0, 'serving_size': '240ml', 'ingredients': 'coffee, water'},
    {'food_name': 'Green Tea', 'calories': 2, 'protein': 0.5, 'carbs': 0.3, 'fats': 0, 'serving_size': '240ml', 'ingredients': 'green tea, water'},
    {'food_name': 'Orange Juice (fresh)', 'calories': 45, 'protein': 0.9, 'carbs': 11, 'fats': 0.3, 'serving_size': '100ml', 'ingredients': 'orange, citrus'},
    {'food_name': 'Apple Juice', 'calories': 46, 'protein': 0.1, 'carbs': 11, 'fats': 0.1, 'serving_size': '100ml', 'ingredients': 'apple'},
    
    # CONDIMENTS & SAUCES
    {'food_name': 'Olive Oil', 'calories': 884, 'protein': 0, 'carbs': 0, 'fats': 100, 'serving_size': '100ml', 'ingredients': 'olives'},
    {'food_name': 'Coconut Oil', 'calories': 892, 'protein': 0, 'carbs': 0, 'fats': 99, 'serving_size': '100ml', 'ingredients': 'coconut'},
    {'food_name': 'Honey', 'calories': 304, 'protein': 0.3, 'carbs': 82, 'fats': 0, 'serving_size': '100g', 'ingredients': 'honey'},
    {'food_name': 'Maple Syrup', 'calories': 260, 'protein': 0, 'carbs': 67, 'fats': 0, 'serving_size': '100ml', 'ingredients': 'maple, sugar'},
    
    # LEGUMES
    {'food_name': 'Chickpeas (cooked)', 'calories': 134, 'protein': 8.9, 'carbs': 22, 'fats': 2.1, 'serving_size': '100g', 'ingredients': 'chickpeas, legumes, water, salt'},
    {'food_name': 'Black Beans (cooked)', 'calories': 132, 'protein': 9, 'carbs': 24, 'fats': 0.6, 'serving_size': '100g', 'ingredients': 'black beans, legumes, water, salt'},
    {'food_name': 'Peas (frozen)', 'calories': 81, 'protein': 5.4, 'carbs': 14, 'fats': 0.4, 'serving_size': '100g', 'ingredients': 'peas, water, salt'},
]
