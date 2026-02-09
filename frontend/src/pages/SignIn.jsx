import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_URL = "http://localhost:8000/api";

export default function SignIn() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  // Validate email
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return "Email is required";
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    return true;
  };

  // Validate password
  const validatePassword = (password) => {
    if (!password) return "Password is required";
    return true;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === "checkbox" ? checked : value;
    
    setFormData((prev) => ({
      ...prev,
      [name]: fieldValue,
    }));
    
    // Validate field on change
    if (name === 'email') {
      const validation = validateEmail(fieldValue);
      setFieldErrors((prev) => ({
        ...prev,
        email: validation === true ? "" : validation
      }));
    } else if (name === 'password') {
      const validation = validatePassword(fieldValue);
      setFieldErrors((prev) => ({
        ...prev,
        password: validation === true ? "" : validation
      }));
    }
    
    setError("");
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    const emailValidation = validateEmail(formData.email);
    if (emailValidation !== true) {
      errors.email = emailValidation;
      isValid = false;
    }

    const passwordValidation = validatePassword(formData.password);
    if (passwordValidation !== true) {
      errors.password = passwordValidation;
      isValid = false;
    }

    setFieldErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Clear any old tokens before attempting login
      const response = await fetch(`${API_URL}/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email.toLowerCase(),
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store JWT tokens and user info
        const storage = formData.rememberMe ? localStorage : sessionStorage;
        storage.setItem('access_token', data.tokens.access);
        storage.setItem('refresh_token', data.tokens.refresh);
        storage.setItem('user', JSON.stringify(data.user));
        
        // Dispatch custom event to notify Navbar
        window.dispatchEvent(new Event('userLoggedIn'));
        
        // Redirect to dashboard or home
        navigate("/");
      } else {
        if (data.email) {
          setFieldErrors((prev) => ({ ...prev, email: data.email }));
        }
        if (data.password) {
          setFieldErrors((prev) => ({ ...prev, password: data.password }));
        }
        
        const errorMessage = data.error || "Invalid email or password.";
        setError(typeof errorMessage === 'object' ? Object.values(errorMessage).flat().join(', ') : errorMessage);
      }
    } catch (err) {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const getInputClassName = (fieldName) => {
    const baseClass = "w-full px-4 py-3 bg-secondary text-neutral rounded-lg border border-accent border-opacity-20 focus:border-accent focus:border-opacity-100 outline-none transition-colors";
    if (fieldErrors[fieldName]) {
      return baseClass + " border-red-500 border-opacity-100";
    }
    return baseClass;
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

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg text-red-300 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-neutral text-sm font-semibold mb-2">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={getInputClassName('email')}
                placeholder="you@example.com"
              />
              {fieldErrors.email && (
                <p className="mt-1 text-red-400 text-xs">{fieldErrors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-neutral text-sm font-semibold">
                  Password *
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
                className={getInputClassName('password')}
                placeholder="••••••••"
              />
              {fieldErrors.password && (
                <p className="mt-1 text-red-400 text-xs">{fieldErrors.password}</p>
              )}
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
              disabled={loading}
              className={`w-full py-3 bg-accent text-primary font-bold rounded-lg hover:bg-opacity-90 transition-all shadow-lg mt-8 ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Signing In..." : "Sign In"}
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
