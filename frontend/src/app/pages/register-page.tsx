import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Brain, Eye, EyeOff, AlertCircle } from "lucide-react";
import { authAPI } from "../../services/api";

export function RegisterPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    age: "",
    gender: "",
  });
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validatePhone = (phone: string): string | null => {
    if (!phone || phone.trim() === "") return null; // Optional field
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length !== 10) {
      return "Phone must be exactly 10 digits";
    }
    if (!/^[6-9]/.test(cleaned)) {
      return "Phone must start with 6, 7, 8, or 9";
    }
    return null;
  };

  const validateAge = (age: string): string | null => {
    if (!age || age.trim() === "") return null; // Optional field
    const ageNum = parseInt(age);
    if (isNaN(ageNum)) {
      return "Age must be a number";
    }
    if (ageNum < 1 || ageNum > 150) {
      return "Age must be between 1 and 150";
    }
    return null;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear field error when user starts typing
    setFieldErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Validate specific fields
    if (name === "phone") {
      const error = validatePhone(value);
      if (error) {
        setFieldErrors((prev) => ({ ...prev, phone: error }));
      }
    } else if (name === "age") {
      const error = validateAge(value);
      if (error) {
        setFieldErrors((prev) => ({ ...prev, age: error }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFieldErrors({});

    // Frontend validation
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords don't match";
    }

    // Validate optional fields when filled
    if (formData.phone) {
      const phoneError = validatePhone(formData.phone);
      if (phoneError) newErrors.phone = phoneError;
    }
    if (formData.age) {
      const ageError = validateAge(formData.age);
      if (ageError) newErrors.age = ageError;
    }

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      await authAPI.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        phone: formData.phone || undefined,
        age: formData.age ? parseInt(formData.age) : undefined,
        gender: formData.gender || undefined,
      });
      // After registration, go to onboarding for body measurements
      navigate("/onboarding");
    } catch (err) {
      const error = err instanceof Error ? err.message : "Registration failed";
      
      // Parse field-specific errors (e.g., "phone: Phone must be exactly 10 digits | email: Email already exists")
      const fieldErrors: Record<string, string> = {};
      const errorParts = error.split(" | ");
      
      errorParts.forEach((part) => {
        const [field, message] = part.split(": ");
        if (field && message) {
          fieldErrors[field] = message;
        }
      });
      
      if (Object.keys(fieldErrors).length > 0) {
        setFieldErrors(fieldErrors);
      } else {
        setFieldErrors({ submit: error });
      }
    } finally {
      setLoading(false);
    }
  };

  const renderFieldError = (fieldName: string) => {
    if (!fieldErrors[fieldName]) return null;
    return (
      <div className="flex items-center gap-1 mt-1 text-destructive text-sm">
        <AlertCircle className="w-4 h-4" />
        <span>{fieldErrors[fieldName]}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold text-foreground">
              AI FitGuide
            </span>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="border-border text-foreground hover:bg-muted"
          >
            Back
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-lg border border-border p-8 shadow-sm">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">Create Account</h1>
              <p className="text-muted-foreground">
                Join us to start your fitness journey
              </p>
            </div>

            {fieldErrors.submit && (
              <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded text-destructive text-sm flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{fieldErrors.submit}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground">
                  Full Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className={`border-border bg-background text-foreground placeholder:text-muted-foreground ${
                    fieldErrors.name ? "border-destructive" : ""
                  }`}
                />
                {renderFieldError("name")}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className={`border-border bg-background text-foreground placeholder:text-muted-foreground ${
                    fieldErrors.email ? "border-destructive" : ""
                  }`}
                />
                {renderFieldError("email")}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className={`border-border bg-background text-foreground placeholder:text-muted-foreground pr-10 ${
                      fieldErrors.password ? "border-destructive" : ""
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {renderFieldError("password")}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-foreground">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className={`border-border bg-background text-foreground placeholder:text-muted-foreground pr-10 ${
                      fieldErrors.confirmPassword ? "border-destructive" : ""
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    disabled={loading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {renderFieldError("confirmPassword")}
              </div>

              {/* Optional Fields */}
              <div className="grid grid-cols-2 gap-3">
                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-foreground text-sm">
                    Phone (Optional)
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="10 digits"
                    value={formData.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={loading}
                    className={`border-border bg-background text-foreground placeholder:text-muted-foreground text-sm ${
                      fieldErrors.phone ? "border-destructive" : ""
                    }`}
                  />
                  {renderFieldError("phone")}
                </div>

                {/* Age */}
                <div className="space-y-2">
                  <Label htmlFor="age" className="text-foreground text-sm">
                    Age (Optional)
                  </Label>
                  <Input
                    id="age"
                    name="age"
                    type="number"
                    placeholder="25"
                    value={formData.age}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    min="1"
                    max="150"
                    disabled={loading}
                    className={`border-border bg-background text-foreground placeholder:text-muted-foreground text-sm ${
                      fieldErrors.age ? "border-destructive" : ""
                    }`}
                  />
                  {renderFieldError("age")}
                </div>
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <Label htmlFor="gender" className="text-foreground">
                  Gender (Optional)
                </Label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground text-sm"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 mt-6"
              >
                {loading ? "Creating account..." : "Create Account"}
              </Button>
            </form>

            {/* Login Link */}
            <div className="mt-6 pt-6 border-t border-border text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <button
                  onClick={() => navigate("/login")}
                  className="text-primary hover:underline font-medium"
                >
                  Sign in
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
