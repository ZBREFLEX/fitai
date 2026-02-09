import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function CalorieEstimation() {
  const [calories, setCalories] = useState(0);
  const [macroSplit, setMacroSplit] = useState({ p: 0, c: 0, f: 0 });

  useEffect(() => {
    const userProfile = JSON.parse(localStorage.getItem("fitAI_userProfile"));

    if (userProfile) {
      const { weight, height, age, gender, activityLevel, goal } = userProfile;

      // Mifflin-St Jeor Equation
      let bmr = 10 * weight + 6.25 * height - 5 * age;
      if (gender === "male") bmr += 5;
      else bmr -= 161;

      // Activity Multipliers
      const activityMultipliers = {
        sedentary: 1.2,
        light: 1.375,
        moderate: 1.55,
        active: 1.725,
        very_active: 1.9,
      };

      const tdee = bmr * (activityMultipliers[activityLevel] || 1.2);

      // Goal Adjustment
      let targetCalories = tdee;
      if (goal === "loss") targetCalories -= 500;
      else if (goal === "gain") targetCalories += 500;

      const finalCalories = Math.round(targetCalories);
      setCalories(finalCalories);

      // Store for next step
      localStorage.setItem("fitAI_calories", finalCalories);

      // Simple Macro Split (40/30/30 for balanced)
      setMacroSplit({
        p: Math.round((finalCalories * 0.3) / 4), // 30% Protein
        c: Math.round((finalCalories * 0.4) / 4), // 40% Carbs
        f: Math.round((finalCalories * 0.3) / 9), // 30% Fat
      });
    }
  }, []);

  return (
    <div className="hero-gradient min-h-screen p-6 flex flex-col items-center">
      <div className="max-w-3xl w-full">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-neutral mb-2">
            Calorie Estimation
          </h1>
          <p className="text-neutral text-opacity-70">
            Daily energy requirements for your goal
          </p>
        </div>

        {/* Main Calorie Display */}
        <div className="bg-primary rounded-3xl border border-secondary p-10 shadow-2xl text-center mb-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent to-accent2"></div>

          <h2 className="text-xl font-semibold text-neutral text-opacity-80 mb-4">
            Daily Target
          </h2>
          <div className="text-7xl font-bold gradient-text mb-4">
            {calories} <span className="text-2xl text-neutral">kcal</span>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-8">
            <div className="bg-secondary/50 p-4 rounded-xl border border-accent/10">
              <p className="text-accent text-sm font-bold">Protein</p>
              <p className="text-2xl font-bold text-neutral">{macroSplit.p}g</p>
            </div>
            <div className="bg-secondary/50 p-4 rounded-xl border border-accent/10">
              <p className="text-accent2 text-sm font-bold">Carbs</p>
              <p className="text-2xl font-bold text-neutral">{macroSplit.c}g</p>
            </div>
            <div className="bg-secondary/50 p-4 rounded-xl border border-accent/10">
              <p className="text-yellow-400 text-sm font-bold">Fats</p>
              <p className="text-2xl font-bold text-neutral">{macroSplit.f}g</p>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="bg-secondary/30 rounded-xl p-6 mb-8 border border-white/5">
          <h3 className="text-lg font-semibold text-neutral mb-2">
            How we calculated this?
          </h3>
          <p className="text-sm text-neutral text-opacity-60 leading-relaxed">
            We used the <strong>Mifflin-St Jeor equation</strong> to estimate
            your Basal Metabolic Rate (BMR) and adjusted it based on your
            activity level and fitness goal. This provides a scientific baseline
            for your nutrition plan.
          </p>
        </div>

        <div className="flex justify-center">
          <Link to="/nutrition" className="btn-primary flex items-center gap-2">
            Get Nutrition Plan
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
