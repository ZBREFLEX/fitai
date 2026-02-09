import { Link } from "react-router-dom";

export default function Gamification() {
  const points = 1250;
  const level = 5;
  const nextLevelPoints = 2000;
  const progress = (points / nextLevelPoints) * 100;

  const badges = [
    {
      title: "First Step",
      icon: "🚀",
      desc: "Completed profile setup",
      unlocked: true,
    },
    {
      title: "Consistency",
      icon: "🔥",
      desc: "Logged explicitly for 7 days",
      unlocked: true,
    },
    {
      title: "Weight Goal",
      icon: "🎯",
      desc: "Reached target weight",
      unlocked: false,
    },
    {
      title: "Nutritionist",
      icon: "🍎",
      desc: "Followed meal plan 5x",
      unlocked: false,
    },
    {
      title: "Warrior",
      icon: "⚔️",
      desc: "Completed 10 workouts",
      unlocked: true,
    },
    {
      title: "Social Bee",
      icon: "🐝",
      desc: "Shared progress",
      unlocked: false,
    },
  ];

  return (
    <div className="hero-gradient min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-neutral mb-2">Achievements</h1>
          <p className="text-neutral text-opacity-70">
            Level up your fitness journey
          </p>
        </div>

        {/* Level Card */}
        <div className="bg-primary rounded-2xl border border-secondary p-8 shadow-xl mb-8 relative overflow-hidden text-center">
          <div className="inline-block p-4 rounded-full bg-accent/20 border-4 border-accent mb-4">
            <span className="text-5xl font-bold text-accent">{level}</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Fitness Enthusiast
          </h2>
          <p className="text-neutral/70 mb-6">
            {points} / {nextLevelPoints} XP
          </p>

          <div className="w-full h-4 bg-secondary rounded-full overflow-hidden border border-white/5">
            <div
              className="h-full bg-gradient-to-r from-accent to-accent2 transition-all duration-1000"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Badges Grid */}
        <h3 className="text-2xl font-bold text-neutral mb-6">
          Badges Collection
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {badges.map((badge, index) => (
            <div
              key={index}
              className={`p-6 rounded-xl border transition-all duration-300 ${
                badge.unlocked
                  ? "bg-secondary border-accent/30 shadow-lg shadow-accent/5"
                  : "bg-primary/50 border-white/5 opacity-50 grayscale"
              }`}
            >
              <div className="text-4xl mb-3">{badge.icon}</div>
              <h4 className="font-bold text-white mb-1">{badge.title}</h4>
              <p className="text-xs text-neutral/60">{badge.desc}</p>
              {badge.unlocked && (
                <div className="mt-3 text-xs font-bold text-accent uppercase tracking-wider">
                  Unlocked
                </div>
              )}
              {!badge.unlocked && (
                <div className="mt-3 text-xs font-bold text-neutral/40 uppercase tracking-wider">
                  Locked
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <Link to="/" className="btn-secondary">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
