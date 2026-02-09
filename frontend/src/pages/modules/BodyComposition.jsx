import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function BodyComposition() {
  const [metrics, setMetrics] = useState({
    bmi: 0,
    bmiCategory: "",
    bodyFat: 0,
    leanMass: 0,
  });

  useEffect(() => {
    const userProfile = JSON.parse(localStorage.getItem("fitAI_userProfile"));

    if (userProfile) {
      const { weight, height, age, gender } = userProfile;

      // Calculate BMI
      const heightInMeters = height / 100;
      const bmiValue = (weight / (heightInMeters * heightInMeters)).toFixed(1);

      // BMI Category
      let category = "";
      if (bmiValue < 18.5) category = "Underweight";
      else if (bmiValue < 24.9) category = "Normal weight";
      else if (bmiValue < 29.9) category = "Overweight";
      else category = "Obesity";

      // Calculate Body Fat (Deurenberg formula)
      // Body fat % = (1.20 × BMI) + (0.23 × Age) - (10.8 × sex) - 5.4
      // sex: 1 for men, 0 for women
      const sexValue = gender === "male" ? 1 : 0;
      const bodyFatValue = (
        1.2 * bmiValue +
        0.23 * age -
        10.8 * sexValue -
        5.4
      ).toFixed(1);

      // Lean Body Mass
      const leanMassValue = (weight * (1 - bodyFatValue / 100)).toFixed(1);

      setMetrics({
        bmi: bmiValue,
        bmiCategory: category,
        bodyFat: bodyFatValue,
        leanMass: leanMassValue,
      });
    }
  }, []);

  return (
    <div className="hero-gradient min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-neutral mb-2">
            Body Composition Analysis
          </h1>
          <p className="text-neutral text-opacity-70">
            Based on your physiological data
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* BMI Card */}
          <div className="bg-primary rounded-2xl border border-secondary p-6 shadow-xl relative overflow-hidden group">
            <div
              className={`absolute top-0 right-0 p-4 opacity-10 text-9xl font-bold text-neutral group-hover:scale-110 transition-transform duration-500`}
            >
              BMI
            </div>
            <div className="relative z-10">
              <h3 className="text-xl font-bold text-neutral mb-1">BMI Score</h3>
              <p className="text-sm text-neutral text-opacity-60 mb-4">
                Body Mass Index
              </p>

              <div className="text-5xl font-bold text-accent mb-2">
                {metrics.bmi}
              </div>
              <div
                className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                  metrics.bmiCategory === "Normal weight"
                    ? "bg-green-500/20 text-green-400"
                    : metrics.bmiCategory === "Overweight"
                      ? "bg-yellow-500/20 text-yellow-400"
                      : "bg-red-500/20 text-red-400"
                }`}
              >
                {metrics.bmiCategory}
              </div>
            </div>
          </div>

          {/* Body Fat Card */}
          <div className="bg-primary rounded-2xl border border-secondary p-6 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 text-9xl font-bold text-neutral group-hover:scale-110 transition-transform duration-500">
              %
            </div>
            <div className="relative z-10">
              <h3 className="text-xl font-bold text-neutral mb-1">Body Fat</h3>
              <p className="text-sm text-neutral text-opacity-60 mb-4">
                Estimated Percentage
              </p>

              <div className="text-5xl font-bold text-accent2 mb-2">
                {metrics.bodyFat}%
              </div>
              <p className="text-xs text-neutral text-opacity-50">
                Using Deurenberg formula
              </p>
            </div>
          </div>

          {/* Lean Mass Card */}
          <div className="bg-primary rounded-2xl border border-secondary p-6 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 text-9xl font-bold text-neutral group-hover:scale-110 transition-transform duration-500">
              LB
            </div>
            <div className="relative z-10">
              <h3 className="text-xl font-bold text-neutral mb-1">Lean Mass</h3>
              <p className="text-sm text-neutral text-opacity-60 mb-4">
                Muscle & Bone Mass
              </p>

              <div className="text-5xl font-bold text-blue-400 mb-2">
                {metrics.leanMass} <span className="text-2xl">kg</span>
              </div>
              <p className="text-xs text-neutral text-opacity-50">
                Approximate value
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 flex justify-center">
          <Link
            to="/calorie-estimation"
            className="btn-primary flex items-center gap-2"
          >
            Next: Calorie Estimation
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
