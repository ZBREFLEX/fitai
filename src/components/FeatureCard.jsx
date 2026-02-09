import { Link } from "react-router-dom";

export default function FeatureCard({ title, desc, link }) {
  const icons = {
    "Body Composition Analysis": "📊",
    "ML-Based Calorie Estimation": "🔥",
    "Nutrition Recommendation": "🍎",
    "Basic Fitness Guidance": "💪",
    "Progress Tracking": "📈",
    "Gamification": "🎮",
  };

  return (
    <Link to={link}>
      <div className="card-modern group h-full flex flex-col">
        <div className="text-4xl mb-4">{icons[title] || "⭐"}</div>
        <h3 className="text-xl font-bold text-neutral mb-2 group-hover:text-accent transition-colors">
          {title}
        </h3>
        <p className="text-neutral text-opacity-80 text-sm mb-4 flex-grow">{desc}</p>
        <div className="inline-flex items-center text-accent font-semibold text-sm hover:gap-3 gap-2 transition-all">
          Explore <span>→</span>
        </div>
      </div>
    </Link>
  );
}
