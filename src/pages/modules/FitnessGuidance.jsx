import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function FitnessGuidance() {
  const [plan, setPlan] = useState(null);

  const workoutDatabase = {
    beginner: {
      level: "Beginner",
      frequency: "3 days/week",
      focus: "Full Body Adaptation",
      exercises: [
        { name: "Bodyweight Squats", sets: 3, reps: "10-12" },
        { name: "Push-ups (Knees if needed)", sets: 3, reps: "8-10" },
        { name: "Dumbbell Rows", sets: 3, reps: "12" },
        { name: "Plank", sets: 3, reps: "30 sec" },
      ],
    },
    intermediate: {
      level: "Intermediate",
      frequency: "4 days/week",
      focus: "Hypertrophy & Strength",
      exercises: [
        { name: "Barbell Squats", sets: 4, reps: "8-10" },
        { name: "Bench Press", sets: 4, reps: "8-10" },
        { name: "Deadlifts", sets: 3, reps: "6-8" },
        { name: "Overhead Press", sets: 3, reps: "8-10" },
        { name: "Pull-ups", sets: 3, reps: "Max" },
      ],
    },
    advanced: {
      level: "Advanced",
      frequency: "5-6 days/week",
      focus: "Split Routine (Push/Pull/Legs)",
      exercises: [
        { name: "Heavy Squats", sets: 5, reps: "5" },
        { name: "Incline Bench Press", sets: 4, reps: "8-12" },
        { name: "Weighted Pull-ups", sets: 4, reps: "8-10" },
        { name: "Romanian Deadlifts", sets: 4, reps: "8-12" },
        { name: "Face Pulls", sets: 3, reps: "15" },
      ],
    },
  };

  useEffect(() => {
    const userProfile = JSON.parse(localStorage.getItem("fitAI_userProfile"));
    if (userProfile) {
      const { activityLevel } = userProfile;

      let level = "beginner";
      if (activityLevel === "moderate") level = "intermediate";
      if (activityLevel === "active" || activityLevel === "very_active")
        level = "advanced";

      setPlan(workoutDatabase[level]);
    } else {
      // Default to beginner if no profile
      setPlan(workoutDatabase["beginner"]);
    }
  }, []);

  if (!plan)
    return <div className="text-center text-white mt-20">Loading Plan...</div>;

  // Explicit hex codes to ensure Tailwind picks them up correctly
  // Primary: #1a1a2e, Secondary: #0f3460, Accent: #00d4ff

  return (
    <div className="hero-gradient min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-neutral mb-2">
            Fitness Guidance
          </h1>
          <p className="text-neutral text-opacity-70">
            Recommended workout plan for your level
          </p>
        </div>

        {/* Plan Header */}
        <div className="bg-gradient-to-r from-[#0f3460] to-[#1a1a2e] rounded-2xl p-8 mb-8 border border-[#00d4ff]/20 flex flex-col md:flex-row justify-between items-center shadow-lg">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">
              {plan.level} Level
            </h2>
            <p className="text-[#00d4ff] text-lg">{plan.focus}</p>
          </div>
          <div className="mt-4 md:mt-0 bg-black/30 px-6 py-3 rounded-xl border border-white/10">
            <span className="text-sm text-neutral/60 block">Frequency</span>
            <span className="text-xl font-bold text-white">
              {plan.frequency}
            </span>
          </div>
        </div>

        {/* Exercises Grid */}
        <h3 className="text-2xl font-bold text-neutral mb-6">Routine</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {plan.exercises.map((exercise, index) => (
            <div
              key={index}
              className="bg-[#0f3460]/40 p-5 rounded-xl border border-white/5 hover:border-[#00d4ff]/30 transition-colors flex justify-between items-center"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#00d4ff]/10 flex items-center justify-center text-[#00d4ff] font-bold">
                  {index + 1}
                </div>
                <span className="font-semibold text-neutral text-lg">
                  {exercise.name}
                </span>
              </div>
              <div className="text-right">
                <div className="text-sm text-neutral/60">Sets</div>
                <div className="font-bold text-white">
                  {exercise.sets} x {exercise.reps}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <Link
            to="/progress-tracking"
            className="btn-primary flex items-center gap-2"
          >
            Start Tracking Progress
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
