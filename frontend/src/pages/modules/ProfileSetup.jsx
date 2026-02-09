import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:8000/api";

export default function ProfileSetup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasTodayMeasurement, setHasTodayMeasurement] = useState(false);
  const [todayMeasurement, setTodayMeasurement] = useState(null);

  const [formData, setFormData] = useState({
    age: "",
    height: "",
    weight: "",
    gender: "male",
    activity_level: "moderate",
    notes: "",
  });

  useEffect(() => {
    checkTodayMeasurement();
  }, []);

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
        if (data.has_measurement) {
          setHasTodayMeasurement(true);
          setTodayMeasurement(data.measurement);
          // Pre-fill form with today's data
          setFormData({
            age: data.measurement.age,
            height: data.measurement.height,
            weight: data.measurement.weight,
            gender: data.measurement.gender,
            activity_level: data.measurement.activity_level,
            notes: data.measurement.notes || "",
          });
        }
      }
    } catch (error) {
      console.error("Error checking today's measurement:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
      
      const url = hasTodayMeasurement 
        ? `${API_URL}/body-measurements/${todayMeasurement.id}/`
        : `${API_URL}/body-measurements/`;
      
      const method = hasTodayMeasurement ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          age: parseInt(formData.age),
          height: parseFloat(formData.height),
          weight: parseFloat(formData.weight),
          gender: formData.gender,
          activity_level: formData.activity_level,
          notes: formData.notes,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Measurement saved:", data);
        navigate("/body-composition");
      } else {
        const errorData = await response.json();
        setError(errorData.error || errorData.detail || "Failed to save measurement");
      }
    } catch (error) {
      console.error("Error saving measurement:", error);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hero-gradient min-h-screen flex items-center justify-center py-12 px-6">
      <div className="w-full max-w-2xl">
        <div className="bg-primary rounded-2xl border border-secondary p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-neutral mb-2">
              {hasTodayMeasurement ? "Update Today's Measurement" : "Add New Measurement"}
            </h1>
            <p className="text-neutral text-opacity-70">
              {hasTodayMeasurement 
                ? "Update your body composition data for today"
                : "Enter your current body measurements"
              }
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Age */}
              <div>
                <label className="block text-neutral text-sm font-semibold mb-2">
                  Age (years)
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  required
                  min="10"
                  max="120"
                  className="w-full px-4 py-3 bg-secondary text-neutral rounded-lg border border-accent border-opacity-20 focus:border-accent focus:border-opacity-100 outline-none transition-colors"
                  placeholder="25"
                />
              </div>

              {/* Gender */}
              <div>
                <label className="block text-neutral text-sm font-semibold mb-2">
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-secondary text-neutral rounded-lg border border-accent border-opacity-20 focus:border-accent focus:border-opacity-100 outline-none transition-colors"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              {/* Height */}
              <div>
                <label className="block text-neutral text-sm font-semibold mb-2">
                  Height (cm)
                </label>
                <input
                  type="number"
                  name="height"
                  value={formData.height}
                  onChange={handleChange}
                  required
                  min="50"
                  max="300"
                  step="0.1"
                  className="w-full px-4 py-3 bg-secondary text-neutral rounded-lg border border-accent border-opacity-20 focus:border-accent focus:border-opacity-100 outline-none transition-colors"
                  placeholder="175"
                />
              </div>

              {/* Weight */}
              <div>
                <label className="block text-neutral text-sm font-semibold mb-2">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  required
                  min="20"
                  max="500"
                  step="0.1"
                  className="w-full px-4 py-3 bg-secondary text-neutral rounded-lg border border-accent border-opacity-20 focus:border-accent focus:border-opacity-100 outline-none transition-colors"
                  placeholder="70"
                />
              </div>

              {/* Activity Level */}
              <div className="md:col-span-2">
                <label className="block text-neutral text-sm font-semibold mb-2">
                  Activity Level
                </label>
                <select
                  name="activity_level"
                  value={formData.activity_level}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-secondary text-neutral rounded-lg border border-accent border-opacity-20 focus:border-accent focus:border-opacity-100 outline-none transition-colors"
                >
                  <option value="sedentary">
                    Sedentary (Little or no exercise)
                  </option>
                  <option value="light">
                    Lightly active (Light exercise 1-3 days/week)
                  </option>
                  <option value="moderate">
                    Moderately active (Moderate exercise 3-5 days/week)
                  </option>
                  <option value="active">
                    Active (Hard exercise 6-7 days/week)
                  </option>
                  <option value="very_active">
                    Very active (Very hard exercise & physical job)
                  </option>
                </select>
              </div>

              {/* Notes */}
              <div className="md:col-span-2">
                <label className="block text-neutral text-sm font-semibold mb-2">
                  Notes (optional)
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-3 bg-secondary text-neutral rounded-lg border border-accent border-opacity-20 focus:border-accent focus:border-opacity-100 outline-none transition-colors resize-none"
                  placeholder="Any additional notes about today's measurement..."
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate("/body-composition")}
                className="flex-1 py-3 border border-accent text-neutral font-bold rounded-lg hover:bg-secondary transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 bg-accent text-primary font-bold rounded-lg hover:bg-opacity-90 transition-all shadow-lg disabled:opacity-50"
              >
                {loading 
                  ? "Saving..." 
                  : hasTodayMeasurement 
                    ? "Update Measurement" 
                    : "Save Measurement"
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
