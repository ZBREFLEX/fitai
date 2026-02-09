import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_URL = "http://localhost:8000/api";

export default function BodyComposition() {
  const [measurement, setMeasurement] = useState(null);
  const [hasTodayMeasurement, setHasTodayMeasurement] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLatestMeasurement();
    checkTodayMeasurement();
  }, []);

  const fetchLatestMeasurement = async () => {
    try {
      const token = localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
      const response = await fetch(`${API_URL}/body-measurements/latest/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMeasurement(data);
      }
    } catch (error) {
      console.error("Error fetching measurement:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkTodayMeasurement = async () => {
    try {
      const token = localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
      const response = await fetch(`${API_URL}/body-measurements/check-today/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setHasTodayMeasurement(data.has_measurement);
      }
    } catch (error) {
      console.error("Error checking today's measurement:", error);
    }
  };

  if (loading) {
    return (
      <div className="hero-gradient min-h-screen flex items-center justify-center">
        <div className="text-neutral">Loading...</div>
      </div>
    );
  }

  // If no measurements exist yet, show welcome screen
  if (!measurement) {
    return (
      <div className="hero-gradient min-h-screen p-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-6xl mb-6">📊</div>
          <h1 className="text-4xl font-bold text-neutral mb-4">
            Body Composition Analysis
          </h1>
          <p className="text-neutral text-opacity-70 mb-8 text-lg">
            Track your BMI, body fat percentage, and lean mass over time.
            <br />
            Take your first measurement to get started!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/profile-setup"
              className="px-8 py-4 bg-accent text-primary font-bold rounded-lg hover:bg-opacity-90 transition-all shadow-lg"
            >
              Take First Measurement
            </Link>
            <Link
              to="/body-composition/history"
              className="px-8 py-4 border border-accent text-neutral rounded-lg hover:bg-secondary transition-all"
            >
              View History
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="hero-gradient min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-neutral mb-2">
            Body Composition Analysis
          </h1>
          <p className="text-neutral text-opacity-70">
            Based on your physiological data
          </p>
          <p className="text-sm text-neutral text-opacity-50 mt-2">
            Last updated: {new Date(measurement.date_recorded).toLocaleDateString()}
          </p>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* BMI Card */}
          <div className="bg-primary rounded-2xl border border-secondary p-6 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 text-9xl font-bold text-neutral group-hover:scale-110 transition-transform duration-500">
              BMI
            </div>
            <div className="relative z-10">
              <h3 className="text-xl font-bold text-neutral mb-1">BMI Score</h3>
              <p className="text-sm text-neutral text-opacity-60 mb-4">
                Body Mass Index
              </p>

              <div className="text-5xl font-bold text-accent mb-2">
                {measurement.bmi}
              </div>
              <div
                className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                  measurement.bmi_category === "Normal weight"
                    ? "bg-green-500/20 text-green-400"
                    : measurement.bmi_category === "Overweight"
                    ? "bg-yellow-500/20 text-yellow-400"
                    : "bg-red-500/20 text-red-400"
                }`}
              >
                {measurement.bmi_category}
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
                {measurement.body_fat_percentage}%
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
                {measurement.lean_mass} <span className="text-2xl">kg</span>
              </div>
              <p className="text-xs text-neutral text-opacity-50">
                Approximate value
              </p>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* BMR & TDEE */}
          <div className="bg-primary rounded-2xl border border-secondary p-6 shadow-lg">
            <h3 className="text-lg font-bold text-neutral mb-4">Energy Expenditure</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-neutral text-opacity-70">BMR (Basal Metabolic Rate)</span>
                <span className="text-neutral font-semibold">{measurement.bmr} kcal</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral text-opacity-70">TDEE (Total Daily Energy)</span>
                <span className="text-neutral font-semibold">{measurement.tdee} kcal</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral text-opacity-70">Activity Level</span>
                <span className="text-accent capitalize">{measurement.activity_level.replace('_', ' ')}</span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-primary rounded-2xl border border-secondary p-6 shadow-lg">
            <h3 className="text-lg font-bold text-neutral mb-4">Current Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-neutral text-opacity-70">Height</span>
                <span className="text-neutral font-semibold">{measurement.height} cm</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral text-opacity-70">Weight</span>
                <span className="text-neutral font-semibold">{measurement.weight} kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral text-opacity-70">Age</span>
                <span className="text-neutral font-semibold">{measurement.age} years</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            to={hasTodayMeasurement ? "/profile-setup" : "/profile-setup"}
            className="px-6 py-3 bg-accent text-primary font-bold rounded-lg hover:bg-opacity-90 transition-all shadow-lg"
          >
            {hasTodayMeasurement ? "Update Today's Measurement" : "Add New Measurement"}
          </Link>
          
          <Link
            to="/body-composition/history"
            className="px-6 py-3 border border-accent text-neutral rounded-lg hover:bg-secondary transition-all"
          >
            View Full History
          </Link>
          
          <Link
            to="/calorie-estimation"
            className="px-6 py-3 bg-secondary text-neutral rounded-lg hover:bg-opacity-80 transition-all flex items-center gap-2"
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
