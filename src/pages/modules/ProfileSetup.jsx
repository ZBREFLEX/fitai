import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ProfileSetup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    age: "",
    height: "",
    weight: "",
    gender: "male",
    activityLevel: "moderate",
    goal: "maintenance",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, we'd save this to backend/context
    console.log("Profile Data:", formData);
    localStorage.setItem("fitAI_userProfile", JSON.stringify(formData));
    navigate("/body-composition"); // Redirect to next step
  };

  return (
    <div className="hero-gradient min-h-screen flex items-center justify-center py-12 px-6">
      <div className="w-full max-w-2xl">
        <div className="bg-primary rounded-2xl border border-secondary p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-neutral mb-2">
              Setup Your Profile
            </h1>
            <p className="text-neutral text-opacity-70">
              Help us personalize your fitness journey
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Age */}
              <div>
                <label className="block text-neutral text-sm font-semibold mb-2">
                  Age
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  required
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
                  <option value="other">Other</option>
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
                  name="activityLevel"
                  value={formData.activityLevel}
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

              {/* Goal */}
              <div className="md:col-span-2">
                <label className="block text-neutral text-sm font-semibold mb-2">
                  Fitness Goal
                </label>
                <select
                  name="goal"
                  value={formData.goal}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-secondary text-neutral rounded-lg border border-accent border-opacity-20 focus:border-accent focus:border-opacity-100 outline-none transition-colors"
                >
                  <option value="loss">Weight Loss</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="gain">Muscle Gain</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-accent text-primary font-bold rounded-lg hover:bg-opacity-90 transition-all shadow-lg mt-8"
            >
              Analyze Profile
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
