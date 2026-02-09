import { Link } from "react-router-dom";
import FeatureCard from "../components/FeatureCard";

const features = [
  {
    title: "Body Composition Analysis",
    desc: "BMI, body fat estimation and lean mass analysis.",
    link: "/body-composition",
  },
  {
    title: "ML-Based Calorie Estimation",
    desc: "AI-powered daily calorie requirement prediction.",
    link: "/calorie-estimation",
  },
  {
    title: "Nutrition Recommendation",
    desc: "Personalized diet plans using structured food databases.",
    link: "/nutrition",
  },
  {
    title: "Basic Fitness Guidance",
    desc: "Workout intensity guidance based on goals.",
    link: "/fitness-guidance",
  },
  {
    title: "Progress Tracking",
    desc: "Track weight, workouts and diet consistency.",
    link: "/progress-tracking",
  },
  {
    title: "Gamification",
    desc: "Badges, points and achievements to boost motivation.",
    link: "/gamification",
  },
];

export default function Landing() {
  return (
    <>
      {/* Hero Section */}
      <section className="hero-gradient min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-10 w-72 h-72 bg-accent rounded-full mix-blend-multiply filter blur-3xl"></div>
          <div className="absolute bottom-20 left-10 w-72 h-72 bg-accent2 rounded-full mix-blend-multiply filter blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 text-center">
          <div className="mb-6 inline-block">
            <span className="text-accent text-sm font-semibold uppercase tracking-wider">
              AI-Powered Fitness Platform
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-neutral mb-6 leading-tight">
            Transform Your Fitness with
            <span className="gradient-text"> AI Intelligence</span>
          </h1>
          <p className="text-xl text-neutral text-opacity-80 mb-8 max-w-2xl mx-auto leading-relaxed">
            Get personalized nutrition plans, smart calorie estimation, and AI-guided workouts
            tailored to your fitness goals.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              to="/signup"
              className="btn-primary inline-flex items-center justify-center gap-2 text-lg"
            >
              Start Your Journey <span>→</span>
            </Link>
            <Link
              to="/about"
              className="btn-secondary inline-flex items-center justify-center gap-2 text-lg"
            >
              Learn More
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-4 md:gap-8 mt-12 pt-8 border-t border-secondary">
            <div>
              <div className="text-3xl font-bold text-accent mb-2">100K+</div>
              <p className="text-neutral text-opacity-70">Active Users</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent mb-2">6</div>
              <p className="text-neutral text-opacity-70">AI Modules</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent mb-2">99%</div>
              <p className="text-neutral text-opacity-70">Success Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Modules Section */}
      <section className="bg-primary py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-accent text-sm font-semibold uppercase tracking-wider">
              Features
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-neutral mt-2 mb-4">
              Powerful AI-Driven Modules
            </h2>
            <p className="text-neutral text-opacity-70 max-w-2xl mx-auto">
              Comprehensive tools designed to optimize every aspect of your fitness journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <FeatureCard key={i} {...f} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-secondary py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-neutral mb-4">
            Ready to achieve your fitness goals?
          </h2>
          <p className="text-neutral text-opacity-80 mb-8 text-lg">
            Join thousands of people transforming their bodies and minds with FitAI Pro.
          </p>
          <Link
            to="/signup"
            className="btn-primary inline-flex items-center justify-center gap-2 text-lg"
          >
            Get Started Free <span>→</span>
          </Link>
        </div>
      </section>
    </>
  );
}
