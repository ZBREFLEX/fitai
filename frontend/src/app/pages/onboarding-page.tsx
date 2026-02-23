import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { Brain, ArrowLeft, ArrowRight, Check, Search, X } from "lucide-react";
import { tokenService, bodyMeasurementAPI, goalAPI, settingsAPI } from "../../services/api";
import { Badge } from "../components/ui/badge";

export function OnboardingPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    age: "",
    height: "",
    weight: "",
    gender: "",
    phone: "",
    activityLevel: "",
    fitnessGoal: "",
  });
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const commonConditions = [
    "Diabetes", "Hypertension", "Asthma", "Cholesterol", "Arthritis",
    "PCOS", "Thyroid", "Anemia", "Depression", "Anxiety",
    "Back Pain", "Knee Injury", "Heart Disease", "None"
  ];

  const totalSteps = 3;

  // Check authentication
  useEffect(() => {
    if (!tokenService.isTokenValid()) {
      navigate("/login");
    }
  }, [navigate]);

  const handleNext = async () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      // Save data and navigate to dashboard
      await handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      // Validate required fields
      if (!formData.height || !formData.weight) {
        setError("Height and weight are required");
        setLoading(false);
        return;
      }

      if (!formData.age) {
        setError("Age is required");
        setLoading(false);
        return;
      }

      if (!formData.gender) {
        setError("Gender is required");
        setLoading(false);
        return;
      }

      if (!formData.activityLevel) {
        setError("Activity level is required");
        setLoading(false);
        return;
      }

      if (!formData.fitnessGoal) {
        setError("Fitness goal is required");
        setLoading(false);
        return;
      }

      // Save body measurements
      await bodyMeasurementAPI.save({
        weight: parseFloat(formData.weight),
        height: parseFloat(formData.height),
        age: parseInt(formData.age),
        gender: formData.gender,
        activityLevel: formData.activityLevel,
      });

      // Save fitness goal
      await goalAPI.save(formData.fitnessGoal);

      // Save profile updates (phone, medical conditions)
      await settingsAPI.updateProfile({
        phone: formData.phone || undefined,
        medical_conditions: selectedConditions.join(", ") || undefined,
      });

      navigate("/dashboard");
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to save progress";
      console.error("Onboarding error:", errorMsg);

      try {
        // Try to parse error object
        const errorObj = JSON.parse(errorMsg);
        const fieldErrors = Object.entries(errorObj)
          .map(([field, messages]: [string, any]) => {
            const msg = Array.isArray(messages) ? messages[0] : messages;
            return `${field}: ${msg}`;
          })
          .join("\n");
        setError(fieldErrors || errorMsg);
      } catch {
        setError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10 transition-colors duration-300">
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
            className="border-border text-foreground hover:bg-muted transition-colors"
          >
            Exit
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-2xl">
          {/* Progress Bar */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground">
                Step {currentStep} of {totalSteps}
              </span>
              <span className="text-sm text-muted-foreground">
                {Math.round((currentStep / totalSteps) * 100)}% Complete
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300 ease-out"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          {/* Step Content */}
          <div className="bg-card rounded-lg border border-border p-8 shadow-sm transition-colors duration-300">
            {error && (
              <div className="mb-6 p-3 bg-destructive/10 border border-destructive/20 rounded text-destructive text-sm">
                {error}
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Body Measurements</h2>
                  <p className="text-muted-foreground">
                    Help us calculate your BMI and body composition
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="height" className="text-foreground">
                        Height (cm)
                      </Label>
                      <Input
                        id="height"
                        type="number"
                        placeholder="170"
                        value={formData.height}
                        onChange={(e) =>
                          updateFormData("height", e.target.value)
                        }
                        disabled={loading}
                        className="bg-background border-input text-foreground mt-2 focus:ring-ring"
                      />
                    </div>

                    <div>
                      <Label htmlFor="weight" className="text-foreground">
                        Weight (kg)
                      </Label>
                      <Input
                        id="weight"
                        type="number"
                        placeholder="70"
                        value={formData.weight}
                        onChange={(e) =>
                          updateFormData("weight", e.target.value)
                        }
                        disabled={loading}
                        className="bg-background border-input text-foreground mt-2 focus:ring-ring"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="age" className="text-foreground">
                        Age
                      </Label>
                      <Input
                        id="age"
                        type="number"
                        placeholder="25"
                        value={formData.age}
                        onChange={(e) => updateFormData("age", e.target.value)}
                        disabled={loading}
                        className="bg-background border-input text-foreground mt-2 focus:ring-ring"
                      />
                    </div>

                    <div>
                      <Label htmlFor="gender" className="text-foreground">
                        Gender
                      </Label>
                      <select
                        id="gender"
                        value={formData.gender}
                        onChange={(e) =>
                          updateFormData("gender", e.target.value)
                        }
                        disabled={loading}
                        className="w-full px-3 py-2 mt-2 border border-border rounded-md bg-background text-foreground"
                      >
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="activityLevel" className="text-foreground">
                      Activity Level
                    </Label>
                    <select
                      id="activityLevel"
                      value={formData.activityLevel}
                      onChange={(e) =>
                        updateFormData("activityLevel", e.target.value)
                      }
                      disabled={loading}
                      className="w-full px-3 py-2 mt-2 border border-border rounded-md bg-background text-foreground"
                    >
                      <option value="">Select activity level</option>
                      <option value="sedentary">
                        Sedentary - Little or no exercise
                      </option>
                      <option value="light">
                        Lightly Active - Exercise 1-3 times per week
                      </option>
                      <option value="moderate">
                        Moderately Active - Exercise 3-5 times per week
                      </option>
                      <option value="very">
                        Very Active - Exercise 6-7 times per week
                      </option>
                      <option value="extreme">
                        Extremely Active - Intense exercise daily
                      </option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Fitness Goal</h2>
                  <p className="text-muted-foreground">
                    What's your primary fitness objective?
                  </p>
                </div>

                <div className="space-y-3">
                  <RadioGroup
                    value={formData.fitnessGoal}
                    onValueChange={(value) =>
                      updateFormData("fitnessGoal", value)
                    }
                  >
                    {[
                      {
                        id: "lose",
                        label: "Lose Weight",
                        desc: "Create a calorie deficit to reduce body fat",
                      },
                      {
                        id: "maintain",
                        label: "Maintain Weight",
                        desc: "Keep your current weight while staying healthy",
                      },
                      {
                        id: "gain",
                        label: "Gain Muscle",
                        desc: "Build lean muscle mass with calorie surplus",
                      },
                      {
                        id: "endurance",
                        label: "Improve Endurance",
                        desc: "Enhance cardiovascular fitness and stamina",
                      },
                    ].map((goal) => (
                      <div
                        key={goal.id}
                        className="flex items-start space-x-3 bg-background p-4 rounded border border-border hover:border-ring transition-all cursor-pointer"
                      >
                        <RadioGroupItem
                          value={goal.id}
                          id={goal.id}
                          className="mt-1 border-primary text-primary"
                          disabled={loading}
                        />
                        <div className="flex-1">
                          <Label
                            htmlFor={goal.id}
                            className="cursor-pointer font-semibold"
                          >
                            {goal.label}
                          </Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            {goal.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Medical Conditions & Profile</h2>
                  <p className="text-muted-foreground">
                    Final details to personalize your experience
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Phone */}
                  <div>
                    <Label htmlFor="phone" className="text-foreground">
                      Phone Number (Optional)
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Enter 10 digit number"
                      value={formData.phone}
                      onChange={(e) => updateFormData("phone", e.target.value)}
                      disabled={loading}
                      className="bg-background border-input text-foreground mt-2"
                    />
                  </div>

                  {/* Medical Conditions Search */}
                  <div className="space-y-2">
                    <Label className="text-foreground">Medical Conditions</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search conditions (e.g. Diabetes, Asthma...)"
                        className="pl-10 bg-background"
                        onChange={(e) => {
                          const query = e.target.value.toLowerCase();
                          setSearchTerm(query);
                        }}
                        value={searchTerm}
                      />
                    </div>

                    {/* Search Results */}
                    {searchTerm && (
                      <div className="mt-1 border border-border rounded-md bg-card shadow-lg max-h-40 overflow-y-auto z-20 sticky">
                        {commonConditions
                          .filter(c => c.toLowerCase().includes(searchTerm) && !selectedConditions.includes(c))
                          .map(condition => (
                            <div
                              key={condition}
                              className="px-4 py-2 hover:bg-muted cursor-pointer text-sm"
                              onClick={() => {
                                setSelectedConditions([...selectedConditions, condition]);
                                setSearchTerm("");
                              }}
                            >
                              {condition}
                            </div>
                          ))}
                        {commonConditions.filter(c => c.toLowerCase().includes(searchTerm)).length === 0 && (
                          <div className="px-4 py-2 text-sm text-muted-foreground italic">
                            No matching conditions found
                          </div>
                        )}
                      </div>
                    )}

                    {/* Selected Conditions */}
                    <div className="flex flex-wrap gap-2 mt-4">
                      {selectedConditions.map(condition => (
                        <Badge
                          key={condition}
                          variant="secondary"
                          className="flex items-center gap-1 py-1 px-3 bg-primary/10 text-primary border-primary/20"
                        >
                          {condition}
                          <X
                            className="w-3 h-3 cursor-pointer hover:text-destructive"
                            onClick={() => setSelectedConditions(selectedConditions.filter(c => c !== condition))}
                          />
                        </Badge>
                      ))}
                      {selectedConditions.length === 0 && (
                        <p className="text-sm text-muted-foreground italic">No conditions selected</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-border">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1 || loading}
                className="border-border text-foreground hover:bg-muted transition-colors"
                type="button"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={handleNext}
                disabled={loading}
                className="bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                type="button"
              >
                {currentStep === totalSteps ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    {loading ? "Saving..." : "Complete"}
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
