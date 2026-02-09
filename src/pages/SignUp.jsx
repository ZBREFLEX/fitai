import { useState } from "react";
import { Link } from "react-router-dom";

export default function SignUp() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
  };

  return (
    <div className="hero-gradient min-h-screen flex items-center justify-center py-12 px-6">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-primary rounded-2xl border border-secondary p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="text-4xl font-bold gradient-text mb-2">⚡</div>
            <h1 className="text-3xl font-bold text-neutral mb-2">Create Account</h1>
            <p className="text-neutral text-opacity-70">
              Join FitAI Pro and transform your fitness journey
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Field */}
            <div>
              <label className="block text-neutral text-sm font-semibold mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-secondary text-neutral rounded-lg border border-accent border-opacity-20 focus:border-accent focus:border-opacity-100 outline-none transition-colors"
                placeholder="John Doe"
              />
            </div>

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
              <label className="block text-neutral text-sm font-semibold mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-secondary text-neutral rounded-lg border border-accent border-opacity-20 focus:border-accent focus:border-opacity-100 outline-none transition-colors"
                placeholder="••••••••"
              />
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-neutral text-sm font-semibold mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-secondary text-neutral rounded-lg border border-accent border-opacity-20 focus:border-accent focus:border-opacity-100 outline-none transition-colors"
                placeholder="••••••••"
              />
            </div>

            {/* Sign Up Button */}
            <button
              type="submit"
              className="w-full py-3 bg-accent text-primary font-bold rounded-lg hover:bg-opacity-90 transition-all shadow-lg mt-8"
            >
              Create Account
            </button>
          </form>

          {/* Divider */}
          {/* <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-secondary"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-primary text-neutral text-opacity-70">
                Or continue with
              </span>
            </div>
          </div> */}

          {/* Social Buttons */}
          {/* <div className="grid grid-cols-2 gap-3">
            <button className="px-4 py-2 bg-secondary text-neutral rounded-lg border border-accent border-opacity-20 hover:border-opacity-40 transition-all">
              Google
            </button>
            <button className="px-4 py-2 bg-secondary text-neutral rounded-lg border border-accent border-opacity-20 hover:border-opacity-40 transition-all">
              GitHub
            </button>
          </div> */}

          {/* Sign In Link */}
          <p className="text-center text-neutral text-opacity-70 mt-6">
            Already have an account?{" "}
            <Link to="/signin" className="text-accent font-semibold hover:text-opacity-80">
              Sign In
            </Link>
          </p>
        </div>

        {/* Features List */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl mb-2">💪</div>
            <p className="text-neutral text-opacity-70 text-xs">AI Training</p>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-2">🍎</div>
            <p className="text-neutral text-opacity-70 text-xs">Nutrition Plans</p>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-2">📊</div>
            <p className="text-neutral text-opacity-70 text-xs">Progress Track</p>
          </div>
        </div>
      </div>
    </div>
  );
}
