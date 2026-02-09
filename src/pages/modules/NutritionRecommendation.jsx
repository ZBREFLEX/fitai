import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function NutritionRecommendation() {
  const [mealPlan, setMealPlan] = useState(null);

  const foodDatabase = {
    breakfast: [
      {
        name: "Oatmeal with Berries",
        calories: 350,
        protein: 12,
        carbs: 60,
        fat: 6,
      },
      {
        name: "Scrambled Eggs & Toast",
        calories: 400,
        protein: 20,
        carbs: 30,
        fat: 22,
      },
      {
        name: "Greek Yogurt Parfait",
        calories: 300,
        protein: 15,
        carbs: 40,
        fat: 8,
      },
      { name: "Avocado Toast", calories: 450, protein: 10, carbs: 45, fat: 25 },
    ],
    lunch: [
      { name: "Chicken Salad", calories: 500, protein: 40, carbs: 20, fat: 25 },
      { name: "Quinoa Bowl", calories: 550, protein: 18, carbs: 70, fat: 20 },
      { name: "Turkey Wrap", calories: 450, protein: 30, carbs: 40, fat: 15 },
      { name: "Lentil Soup", calories: 400, protein: 18, carbs: 55, fat: 10 },
    ],
    dinner: [
      {
        name: "Grilled Salmon & Veggies",
        calories: 600,
        protein: 45,
        carbs: 10,
        fat: 35,
      },
      { name: "Beef Stir-Fry", calories: 650, protein: 40, carbs: 50, fat: 30 },
      {
        name: "Vegetable Pasta",
        calories: 550,
        protein: 15,
        carbs: 80,
        fat: 18,
      },
      {
        name: "Roast Chicken & Potatoes",
        calories: 700,
        protein: 50,
        carbs: 45,
        fat: 30,
      },
    ],
    snack: [
      {
        name: "Almonds & Apple",
        calories: 200,
        protein: 6,
        carbs: 25,
        fat: 10,
      },
      { name: "Protein Shake", calories: 150, protein: 25, carbs: 5, fat: 3 },
      {
        name: "Hummus & Carrots",
        calories: 180,
        protein: 5,
        carbs: 20,
        fat: 10,
      },
      { name: "Dark Chocolate", calories: 150, protein: 2, carbs: 15, fat: 10 },
    ],
  };

  useEffect(() => {
    const dailyCalories =
      parseInt(localStorage.getItem("fitAI_calories")) || 2000;

    // Simple allocation logic
    // Breakfast: 25%, Lunch: 35%, Dinner: 30%, Snack: 10%
    const targets = {
      breakfast: dailyCalories * 0.25,
      lunch: dailyCalories * 0.35,
      dinner: dailyCalories * 0.3,
      snack: dailyCalories * 0.1,
    };

    const getClosestMeal = (type, target) => {
      const meals = foodDatabase[type];
      return meals.reduce((prev, curr) =>
        Math.abs(curr.calories - target) < Math.abs(prev.calories - target)
          ? curr
          : prev,
      );
    };

    setMealPlan({
      breakfast: getClosestMeal("breakfast", targets.breakfast),
      lunch: getClosestMeal("lunch", targets.lunch),
      dinner: getClosestMeal("dinner", targets.dinner),
      snack: getClosestMeal("snack", targets.snack),
      totalCalories: dailyCalories,
    });
  }, []);

  if (!mealPlan)
    return (
      <div className="text-center text-white mt-20">Generating Plan...</div>
    );

  return (
    <div className="hero-gradient min-h-screen p-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-neutral mb-2">
            Your Nutrition Plan
          </h1>
          <p className="text-neutral text-opacity-70">
            Tailored to your {mealPlan.totalCalories} kcal daily goal
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Meal Cards */}
          {["breakfast", "lunch", "dinner", "snack"].map((mealType) => (
            <div
              key={mealType}
              className="bg-primary rounded-xl border border-secondary p-5 shadow-lg flex flex-col h-full transform transition hover:-translate-y-2 duration-300"
            >
              <div className="text-xs font-bold text-accent uppercase tracking-widest mb-2">
                {mealType}
              </div>
              <h3 className="text-xl font-bold text-neutral mb-3 capitalize">
                {mealPlan[mealType].name}
              </h3>

              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-bold text-white">
                  {mealPlan[mealType].calories}{" "}
                  <span className="text-xs text-neutral/60">kcal</span>
                </span>
                <span className="bg-secondary px-2 py-1 rounded text-xs text-neutral/80 border border-white/10">
                  Recommended
                </span>
              </div>

              <div className="mt-auto space-y-2">
                <div className="flex justify-between text-sm text-neutral/70">
                  <span>Protein</span>
                  <span>{mealPlan[mealType].protein}g</span>
                </div>
                <div className="flex justify-between text-sm text-neutral/70">
                  <span>Carbs</span>
                  <span>{mealPlan[mealType].carbs}g</span>
                </div>
                <div className="flex justify-between text-sm text-neutral/70">
                  <span>Fats</span>
                  <span>{mealPlan[mealType].fat}g</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <Link
            to="/fitness-guidance"
            className="btn-primary flex items-center gap-2"
          >
            Get Workout Plan
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
