import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Trash2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "../components/ui/alert";
import { tokenService, workoutAPI, summaryAPI } from "../../services/api";

interface Workout {
  id: number;
  date: string;
  workout_type: string;
  exercise_name?: string;
  duration_minutes: number;
  intensity: string;
  calories_burned: number;
  created_at: string;
}

interface DailySummary {
  total_calories_burned: number;
  workouts_count: number;
}

interface WeekStats {
  workouts_this_week: number;
  calories_burned_this_week: number;
  total_duration: number;
}

const WORKOUT_TYPES = [
  { value: "cardio", label: "Cardio", base_cal: 8 },
  { value: "strength", label: "Strength Training", base_cal: 6 },
  { value: "flexibility", label: "Flexibility/Yoga", base_cal: 3 },
  { value: "sports", label: "Sports", base_cal: 7 },
  { value: "walking", label: "Walking", base_cal: 4 },
  { value: "cycling", label: "Cycling", base_cal: 9 },
  { value: "swimming", label: "Swimming", base_cal: 10 },
  { value: "running", label: "Running", base_cal: 12 },
  { value: "hiit", label: "HIIT", base_cal: 14 },
  { value: "other", label: "Other", base_cal: 5 },
];

const oldWeeklySchedule = [
  {
    day: "Monday",
    workout: "Upper Body Strength",
    duration: 45,
    intensity: "Intermediate",
    exercises: [
      { name: "Bench Press", sets: 4, reps: "8-10", rest: "90s" },
      { name: "Pull-ups", sets: 3, reps: "8-12", rest: "60s" },
      { name: "Shoulder Press", sets: 3, reps: "10-12", rest: "60s" },
      { name: "Bicep Curls", sets: 3, reps: "12-15", rest: "45s" },
    ],
    completed: true,
  },
  {
    day: "Tuesday",
    workout: "Cardio & Core",
    duration: 30,
    intensity: "Intermediate",
    exercises: [
      { name: "Running", sets: 1, reps: "20 min", rest: "-" },
      { name: "Plank", sets: 3, reps: "60s", rest: "30s" },
      { name: "Russian Twists", sets: 3, reps: "20", rest: "30s" },
      { name: "Mountain Climbers", sets: 3, reps: "30s", rest: "30s" },
    ],
    completed: true,
  },
  {
    day: "Wednesday",
    workout: "Lower Body Strength",
    duration: 50,
    intensity: "Intermediate",
    exercises: [
      { name: "Squats", sets: 4, reps: "8-10", rest: "90s" },
      { name: "Deadlifts", sets: 4, reps: "6-8", rest: "120s" },
      { name: "Lunges", sets: 3, reps: "12 each", rest: "60s" },
      { name: "Calf Raises", sets: 3, reps: "15-20", rest: "45s" },
    ],
    completed: true,
  },
  {
    day: "Thursday",
    workout: "Active Recovery",
    duration: 30,
    intensity: "Beginner",
    exercises: [
      { name: "Light Yoga", sets: 1, reps: "20 min", rest: "-" },
      { name: "Stretching", sets: 1, reps: "10 min", rest: "-" },
    ],
    completed: true,
  },
  {
    day: "Friday",
    workout: "Full Body Circuit",
    duration: 40,
    intensity: "Intermediate",
    exercises: [
      { name: "Burpees", sets: 3, reps: "10", rest: "45s" },
      { name: "Push-ups", sets: 3, reps: "15", rest: "45s" },
      { name: "Jump Squats", sets: 3, reps: "12", rest: "45s" },
      { name: "Plank to Push-up", sets: 3, reps: "10", rest: "45s" },
    ],
    completed: true,
  },
  {
    day: "Saturday",
    workout: "HIIT Training",
    duration: 35,
    intensity: "Advanced",
    exercises: [
      { name: "Sprint Intervals", sets: 6, reps: "30s", rest: "30s" },
      { name: "Box Jumps", sets: 4, reps: "12", rest: "45s" },
      { name: "Battle Ropes", sets: 4, reps: "30s", rest: "30s" },
      { name: "Kettlebell Swings", sets: 4, reps: "15", rest: "45s" },
    ],
    completed: false,
  },
  {
    day: "Sunday",
    workout: "Rest Day",
    duration: 0,
    intensity: "Rest",
    exercises: [],
    completed: false,
  },
];

export function WorkoutPage() {
  const navigate = useNavigate();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [dailySummary, setDailySummary] = useState<DailySummary | null>(null);
  const [weekStats, setWeekStats] = useState<WeekStats>({
    workouts_this_week: 0,
    calories_burned_this_week: 0,
    total_duration: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form states
  const [workoutType, setWorkoutType] = useState("cardio");
  const [exerciseName, setExerciseName] = useState("");
  const [duration, setDuration] = useState("");
  const [intensity, setIntensity] = useState("moderate");
  const [estimatedCalories, setEstimatedCalories] = useState(0);

  // Check auth
  useEffect(() => {
    if (!tokenService.isTokenValid()) {
      navigate("/login");
    } else {
      loadData();
    }
  }, [navigate]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [workoutsRes, summaryRes] = await Promise.all([
        workoutAPI.getWorkouts(),
        summaryAPI.getDailySummary(),
      ]);
      setWorkouts(workoutsRes);
      setDailySummary(summaryRes);
      calculateWeekStats(workoutsRes);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const calculateWeekStats = (workoutList: Workout[]) => {
    const today = new Date();
    const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
    weekStart.setHours(0, 0, 0, 0);

    const weekWorkouts = workoutList.filter(
      (w) => new Date(w.date) >= weekStart
    );

    const stats = {
      workouts_this_week: weekWorkouts.length,
      calories_burned_this_week: weekWorkouts.reduce(
        (sum, w) => sum + w.calories_burned,
        0
      ),
      total_duration: weekWorkouts.reduce((sum, w) => sum + w.duration_minutes, 0),
    };

    setWeekStats(stats);
  };

  const calculateCalories = (type: string, mins: number, intensityLevel: string) => {
    const workoutInfo = WORKOUT_TYPES.find((w) => w.value === type);
    if (!workoutInfo || !mins) return 0;

    const intensityMultipliers: Record<string, number> = {
      light: 0.8,
      moderate: 1.0,
      intense: 1.3,
    };

    const baseCal = workoutInfo.base_cal;
    const multiplier = intensityMultipliers[intensityLevel] || 1.0;
    return Math.round(baseCal * mins * multiplier);
  };

  const handleDurationChange = (value: string) => {
    setDuration(value);
    if (value) {
      const calories = calculateCalories(workoutType, parseInt(value), intensity);
      setEstimatedCalories(calories);
    }
  };

  const handleIntensityChange = (value: string) => {
    setIntensity(value);
    if (duration) {
      const calories = calculateCalories(workoutType, parseInt(duration), value);
      setEstimatedCalories(calories);
    }
  };

  const handleTypeChange = (value: string) => {
    setWorkoutType(value);
    if (duration) {
      const calories = calculateCalories(value, parseInt(duration), intensity);
      setEstimatedCalories(calories);
    }
  };

  const logWorkout = async () => {
    if (!duration || !workoutType) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      await workoutAPI.logWorkout({
        workout_type: workoutType,
        exercise_name: exerciseName,
        duration_minutes: parseInt(duration),
        intensity,
      });

      // Reset form
      setWorkoutType("cardio");
      setExerciseName("");
      setDuration("");
      setIntensity("moderate");
      setEstimatedCalories(0);
      setError("");

      // Reload data
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to log workout");
    } finally {
      setLoading(false);
    }
  };

  const deleteWorkout = async (workoutId: number) => {
    try {
      setLoading(true);
      await workoutAPI.deleteWorkout(workoutId);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete workout");
    } finally {
      setLoading(false);
    }
  };

  const getWorkoutLabel = (type: string) => {
    return WORKOUT_TYPES.find((w) => w.value === type)?.label || type;
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-foreground">Workouts</h1>
        <p className="text-muted-foreground">Track your exercises and fitness activities</p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Weekly Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {weekStats.workouts_this_week}
            </div>
            <p className="text-xs text-muted-foreground mt-1">workouts</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Calories Burned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {weekStats.calories_burned_this_week}
            </div>
            <p className="text-xs text-muted-foreground mt-1">this week</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Duration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {weekStats.total_duration}
            </div>
            <p className="text-xs text-muted-foreground mt-1">minutes</p>
          </CardContent>
        </Card>
      </div>

      {/* Today's Summary */}
      {dailySummary && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Today's Workouts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {dailySummary.workouts_count}
              </div>
              <p className="text-xs text-muted-foreground mt-1">workouts logged</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Calories Burned Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {dailySummary.total_calories_burned}
              </div>
              <p className="text-xs text-muted-foreground mt-1">kcal</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="log" className="space-y-4">
        <TabsList>
          <TabsTrigger value="log">Log Workout</TabsTrigger>
          <TabsTrigger value="history">Workout History</TabsTrigger>
        </TabsList>

        {/* Log Workout Tab */}
        <TabsContent value="log">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Log a Workout</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="workout-type">Workout Type *</Label>
                <Select value={workoutType} onValueChange={handleTypeChange}>
                  <SelectTrigger id="workout-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {WORKOUT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="exercise-name">Exercise Name (Optional)</Label>
                <Input
                  id="exercise-name"
                  placeholder="e.g., Morning Run, Bench Press"
                  value={exerciseName}
                  onChange={(e) => setExerciseName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration">Duration (minutes) *</Label>
                  <Input
                    id="duration"
                    type="number"
                    placeholder="30"
                    min="1"
                    max="480"
                    value={duration}
                    onChange={(e) => handleDurationChange(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="intensity">Intensity Level *</Label>
                  <Select value={intensity} onValueChange={handleIntensityChange}>
                    <SelectTrigger id="intensity">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="intense">Intense</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {estimatedCalories > 0 && (
                <div className="bg-secondary/50 p-4 rounded border border-primary/20">
                  <div className="text-sm text-muted-foreground mb-1">Estimated Calories Burned</div>
                  <div className="text-3xl font-bold text-primary">
                    {estimatedCalories}
                    <span className="text-sm ml-2 font-normal">kcal</span>
                  </div>
                </div>
              )}

              <Button
                onClick={logWorkout}
                disabled={loading || !duration || !workoutType}
                className="w-full"
              >
                {loading ? "Logging..." : "Log Workout"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Workout History Tab */}
        <TabsContent value="history">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Workout History ({workouts.length} total)</CardTitle>
            </CardHeader>
            <CardContent>
              {workouts.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No workouts logged yet</p>
              ) : (
                <div className="space-y-3">
                  {workouts.map((workout) => (
                    <div
                      key={workout.id}
                      className="flex items-center justify-between p-4 bg-secondary/50 rounded border border-border"
                    >
                      <div className="flex-1">
                        <div className="font-semibold">
                          {getWorkoutLabel(workout.workout_type)}
                          {workout.exercise_name && ` - ${workout.exercise_name}`}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          <div className="flex gap-4">
                            <span>
                              📅 {new Date(workout.date).toLocaleDateString()}
                            </span>
                            <span>⏱️ {workout.duration_minutes} min</span>
                            <span className="capitalize">💪 {workout.intensity}</span>
                            <span className="text-orange-500 font-medium">
                              🔥 {workout.calories_burned} kcal
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteWorkout(workout.id)}
                        className="text-destructive hover:text-destructive/80 ml-4"
                        disabled={loading}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
