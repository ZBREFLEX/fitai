import { useState } from "react";
import { Link } from "react-router-dom";

export default function SignIn() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Sign in:", formData);
  };

  return (
    <div className="hero-gradient min-h-screen flex items-center justify-center py-12 px-6">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-primary rounded-2xl border border-secondary p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="text-4xl font-bold gradient-text mb-2">⚡</div>
            <h1 className="text-3xl font-bold text-neutral mb-2">Welcome Back</h1>
            <p className="text-neutral text-opacity-70">
              Sign in to your FitAI Pro account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-neutral text-sm font-semibold mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-secondary text-neutral rounded-lg border border-accent border-opacity-20 focus:border-accent focus:border-opacity-100 outline-none transition-colors"
                placeholder="you@example.com"
              />
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-neutral text-sm font-semibold">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-accent text-xs hover:text-opacity-80"
                >
                  Forgot?
                </Link>
              </div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-secondary text-neutral rounded-lg border border-accent border-opacity-20 focus:border-accent focus:border-opacity-100 outline-none transition-colors"
                placeholder="••••••••"
              />
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="rememberMe"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                className="w-4 h-4 bg-secondary border border-accent border-opacity-40 rounded cursor-pointer accent-accent"
              />
              <label htmlFor="rememberMe" className="ml-2 text-neutral text-sm">
                Remember me
              </label>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              className="w-full py-3 bg-accent text-primary font-bold rounded-lg hover:bg-opacity-90 transition-all shadow-lg mt-8"
            >
              Sign In
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-secondary"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-primary text-neutral text-opacity-70">
                Or continue with
              </span>
            </div>
          </div>

          {/* Social Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button className="px-4 py-2 bg-secondary text-neutral rounded-lg border border-accent border-opacity-20 hover:border-opacity-40 transition-all">
              Google
            </button>
            <button className="px-4 py-2 bg-secondary text-neutral rounded-lg border border-accent border-opacity-20 hover:border-opacity-40 transition-all">
              GitHub
            </button>
          </div>

          {/* Sign Up Link */}
          <p className="text-center text-neutral text-opacity-70 mt-6">
            Don't have an account?{" "}
            <Link to="/signup" className="text-accent font-semibold hover:text-opacity-80">
              Sign Up
            </Link>
          </p>
        </div>

        {/* Benefits List */}
        <div className="mt-8 bg-secondary rounded-xl p-6">
          <h3 className="text-neutral font-semibold mb-4">Why join FitAI Pro?</h3>
          <ul className="space-y-2">
            <li className="flex items-center gap-2 text-neutral text-opacity-80">
              <span className="text-accent">✓</span>
              Personalized AI fitness plans
            </li>
            <li className="flex items-center gap-2 text-neutral text-opacity-80">
              <span className="text-accent">✓</span>
              Real-time progress tracking
            </li>
            <li className="flex items-center gap-2 text-neutral text-opacity-80">
              <span className="text-accent">✓</span>
              Gamified achievement system
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
