import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_URL = "http://localhost:8000/api";

export default function SignUp() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    age: "",
    gender: "",
    password: "",
    confirmPassword: "",
  });

  // Validate Indian phone number (10 digits starting with 6-9)
  const validateIndianPhone = (phone) => {
    if (!phone) return true; // Phone is optional
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length !== 10) return "Phone number must be exactly 10 digits";
    if (!/^[6-9]/.test(cleaned)) return "Indian phone number must start with 6, 7, 8, or 9";
    return true;
  };

  // Validate email
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return "Email is required";
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    return true;
  };

  // Validate name
  const validateName = (name) => {
    if (!name || !name.trim()) return "Name is required";
    if (!/^[a-zA-Z\s\-\']+$/.test(name)) return "Name can only contain letters, spaces, hyphens, and apostrophes";
    if (name.trim().length < 2) return "Name must be at least 2 characters";
    return true;
  };

  // Validate age
  const validateAge = (age) => {
    if (!age) return true; // Age is optional
    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 1 || ageNum > 150) return "Age must be between 1 and 150";
    return true;
  };

  // Validate password
  const validatePassword = (password) => {
    if (!password) return "Password is required";
    if (password.length < 8) return "Password must be at least 8 characters";
    if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter";
    if (!/[a-z]/.test(password)) return "Password must contain at least one lowercase letter";
    if (!/[0-9]/.test(password)) return "Password must contain at least one number";
    return true;
  };

  const validateField = (name, value) => {
    let result;
    switch (name) {
      case 'name':
        result = validateName(value);
        break;
      case 'email':
        result = validateEmail(value);
        break;
      case 'phone':
        result = validateIndianPhone(value);
        break;
      case 'age':
        result = validateAge(value);
        break;
      case 'password':
        result = validatePassword(value);
        break;
      case 'confirmPassword':
        if (!value) result = "Please confirm your password";
        else if (value !== formData.password) result = "Passwords do not match";
        else result = true;
        break;
      default:
        result = true;
    }
    return result;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Validate field on change
    const validation = validateField(name, value);
    setFieldErrors((prev) => ({
      ...prev,
      [name]: validation === true ? "" : validation
    }));
    
    setError("");
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    const fields = ['name', 'email', 'password', 'confirmPassword'];
    fields.forEach(field => {
      const validation = validateField(field, formData[field]);
      if (validation !== true) {
        errors[field] = validation;
        isValid = false;
      }
    });

    // Validate optional fields only if they have values
    if (formData.phone) {
      const phoneValidation = validateField('phone', formData.phone);
      if (phoneValidation !== true) {
        errors.phone = phoneValidation;
        isValid = false;
      }
    }

    if (formData.age) {
      const ageValidation = validateField('age', formData.age);
      if (ageValidation !== true) {
        errors.age = ageValidation;
        isValid = false;
      }
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
    setSuccess("");

    try {
      const response = await fetch(`${API_URL}/register/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email.toLowerCase(),
          password: formData.password,
          confirm_password: formData.confirmPassword,
          name: formData.name.trim(),
          phone: formData.phone ? formData.phone.replace(/\D/g, '') : "",
          age: formData.age ? parseInt(formData.age) : null,
          gender: formData.gender,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store JWT tokens and auto-login
        localStorage.setItem('access_token', data.tokens.access);
        localStorage.setItem('refresh_token', data.tokens.refresh);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Dispatch custom event to notify Navbar
        window.dispatchEvent(new Event('userLoggedIn'));
        
        setSuccess("Account created successfully! Redirecting...");
        setTimeout(() => {
          navigate("/");
        }, 2000);
      } else {
        // Handle backend validation errors
        if (data.email) {
          setFieldErrors((prev) => ({ ...prev, email: data.email }));
        }
        if (data.name) {
          setFieldErrors((prev) => ({ ...prev, name: data.name }));
        }
        if (data.phone) {
          setFieldErrors((prev) => ({ ...prev, phone: data.phone }));
        }
        if (data.age) {
          setFieldErrors((prev) => ({ ...prev, age: data.age }));
        }
        if (data.password) {
          setFieldErrors((prev) => ({ ...prev, password: data.password }));
        }
        if (data.confirm_password) {
          setFieldErrors((prev) => ({ ...prev, confirmPassword: data.confirm_password }));
        }
        
        const errorMessage = data.error || data.detail || "Registration failed. Please check your inputs.";
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
            <h1 className="text-3xl font-bold text-neutral mb-2">Create Account</h1>
            <p className="text-neutral text-opacity-70">
              Join FitAI Pro and transform your fitness journey
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-4 p-3 bg-green-500 bg-opacity-20 border border-green-500 rounded-lg text-green-300 text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Field */}
            <div>
              <label className="block text-neutral text-sm font-semibold mb-2">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={getInputClassName('name')}
                placeholder="John Doe"
              />
              {fieldErrors.name && (
                <p className="mt-1 text-red-400 text-xs">{fieldErrors.name}</p>
              )}
            </div>

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

            {/* Phone Field */}
            <div>
              <label className="block text-neutral text-sm font-semibold mb-2">
                Phone Number (10 digits)
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                maxLength="10"
                className={getInputClassName('phone')}
                placeholder="9876543210"
              />
              {fieldErrors.phone && (
                <p className="mt-1 text-red-400 text-xs">{fieldErrors.phone}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Age Field */}
              <div>
                <label className="block text-neutral text-sm font-semibold mb-2">
                  Age
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  min="1"
                  max="150"
                  className={getInputClassName('age')}
                  placeholder="25"
                />
                {fieldErrors.age && (
                  <p className="mt-1 text-red-400 text-xs">{fieldErrors.age}</p>
                )}
              </div>

              {/* Gender Field */}
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
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-neutral text-sm font-semibold mb-2">
                Password *
              </label>
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
              <p className="mt-1 text-neutral text-opacity-50 text-xs">
                Min 8 chars, 1 uppercase, 1 lowercase, 1 number
              </p>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-neutral text-sm font-semibold mb-2">
                Confirm Password *
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={getInputClassName('confirmPassword')}
                placeholder="••••••••"
              />
              {fieldErrors.confirmPassword && (
                <p className="mt-1 text-red-400 text-xs">{fieldErrors.confirmPassword}</p>
              )}
            </div>

            {/* Sign Up Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 bg-accent text-primary font-bold rounded-lg hover:bg-opacity-90 transition-all shadow-lg mt-8 ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

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
