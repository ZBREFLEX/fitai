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
import { Trash2, AlertCircle, Activity, Sparkles, CheckCircle2, Trophy, Clock, Flame, Calendar, Dumbbell, Save, Plus, Bookmark, RefreshCw, Coffee, ClipboardList, Moon } from "lucide-react";
import { Alert, AlertDescription } from "../components/ui/alert";
import { tokenService, workoutAPI, summaryAPI, recommendationAPI, customWorkoutAPI } from "../../services/api";

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

  // AI Recommendations state
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isLowImpact, setIsLowImpact] = useState(false);
  const [focusDay, setFocusDay] = useState("");
  const [isRestDay, setIsRestDay] = useState(false);
  const [restMessage, setRestMessage] = useState("");
  const [skippedParts, setSkippedParts] = useState<string[]>([]);

  // Form states
  const [workoutType, setWorkoutType] = useState("cardio");
  const [exerciseName, setExerciseName] = useState("");
  const [duration, setDuration] = useState("");
  const [intensity, setIntensity] = useState("moderate");
  const [estimatedCalories, setEstimatedCalories] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [completedWorkoutName, setCompletedWorkoutName] = useState("");
  const [customWorkouts, setCustomWorkouts] = useState<any[]>([]);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [manualFocus, setManualFocus] = useState<string | null>(null);

  const SPLIT_OPTIONS = ['Chest', 'Back', 'Legs', 'Shoulders', 'Cardio', 'Abs', 'HIIT', 'Arms'];

  // Check auth
  useEffect(() => {
    if (!tokenService.isTokenValid()) {
      navigate("/login");
    } else {
      loadData();
    }
  }, [navigate]);

  const calculateWeekStats = (workoutList: Workout[]) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    // Get start of week (Monday)
    const day = now.getDay();
    const mondayDiff = day === 0 ? -6 : 1 - day;
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() + mondayDiff);

    const weekWorkouts = workoutList.filter(w => {
      const workoutDate = new Date(w.date + 'T00:00:00');
      return workoutDate >= weekStart;
    });

    const stats = {
      workouts_this_week: weekWorkouts.length,
      calories_burned_this_week: Math.round(weekWorkouts.reduce((sum, w) => sum + (w.calories_burned || 0), 0)),
      total_duration: weekWorkouts.reduce((sum, w) => sum + (w.duration_minutes || 0), 0),
    };

    setWeekStats(stats);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [workoutsRes, summaryRes, recsRes, customRes] = await Promise.all([
        workoutAPI.getWorkouts(),
        summaryAPI.getDailySummary(),
        recommendationAPI.getWorkoutRecommendations(manualFocus || undefined),
        customWorkoutAPI.getAll(),
      ]);
      setWorkouts(workoutsRes);
      setDailySummary(summaryRes);
      setCustomWorkouts(customRes);

      setIsLowImpact(recsRes.low_impact_mode || false);
      setFocusDay(recsRes.focus_of_the_day || "");
      setIsRestDay(recsRes.is_rest_day || false);
      setRestMessage(recsRes.rest_message || "");

      // Intelligent Filtering: Hide skipped body parts
      const filteredRecs = recsRes.recommendations.filter(
        (r: any) => !skippedParts.includes(r.body_part)
      );

      setRecommendations(filteredRecs || []);
      calculateWeekStats(workoutsRes);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const getLocalDateString = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const handleManualFocusChange = (newFocus: string) => {
    if (newFocus === "reset") {
      setManualFocus(null);
    } else {
      setManualFocus(newFocus);
    }
  };

  useEffect(() => {
    loadData();
  }, [manualFocus]);

  const quickLog = async (rec: any) => {
    try {
      setLoading(true);
      await workoutAPI.logWorkout({
        workout_type: rec.workout_type,
        exercise_name: rec.name,
        duration_minutes: rec.duration_minutes,
        intensity: rec.intensity,
        date: getLocalDateString(),
      });
      setCompletedWorkoutName(rec.name);
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 5000);

      // Refresh data (this will also refresh recommendations via loadData)
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to log workout");
    } finally {
      setLoading(false);
    }
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
        exercise_name: exerciseName || "Manual Workout",
        duration_minutes: parseInt(duration),
        intensity,
        date: getLocalDateString(),
      });

      setCompletedWorkoutName(exerciseName || "Manual Workout");
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 5000);

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

  const saveAsTemplate = async () => {
    if (!exerciseName || !duration || !workoutType) {
      setError("Exercise name, duration and type are required to save a template");
      return;
    }

    try {
      setLoading(true);
      await customWorkoutAPI.create({
        name: exerciseName,
        workout_type: workoutType,
        duration_minutes: parseInt(duration),
        intensity,
        body_part: focusDay || "Other",
      });
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 3000);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save template");
    } finally {
      setLoading(false);
    }
  };

  const logFromTemplate = async (template: any) => {
    try {
      setLoading(true);
      await workoutAPI.logWorkout({
        workout_type: template.workout_type,
        exercise_name: template.name,
        duration_minutes: template.duration_minutes,
        intensity: template.intensity,
        date: getLocalDateString(),
      });
      setCompletedWorkoutName(template.name);
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 5000);
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
    <div className="p-8 relative">
      {/* Celebration Popup */}
      {showCelebration && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-in fade-in zoom-in slide-in-from-top-10 duration-500">
          <div className="bg-primary text-primary-foreground px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border-2 border-primary-foreground/20">
            <div className="bg-white/20 p-2 rounded-lg">
              <Trophy className="w-8 h-8 text-yellow-300" />
            </div>
            <div>
              <div className="text-xl italic uppercase tracking-tighter font-bold">Session Crushed!</div>
              <p className="text-sm font-medium opacity-90">{completedWorkoutName} logged successfully.</p>
            </div>
          </div>
        </div>
      )}

      <div className="mb-8 ">
        <h1 className="text-3xl font-bold mb-2 text-foreground tracking-tight">Workouts</h1>
        <p className="text-muted-foreground">Track your exercises and fitness activities</p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* AI Recommendations & Daily Split */}
      {(recommendations.length > 0 || restMessage) && (
        <div className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-primary/10 via-background to-secondary/5 border border-primary/20 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Activity className="w-32 h-32 text-primary" />
          </div>

          <div className="relative z-10 flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary text-primary-foreground rounded-xl shadow-lg shadow-primary/20">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-foreground tracking-tight italic uppercase">
                    AI Coach Insight
                  </h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-widest">
                      {isRestDay ? "Recovery Phase" : `Today's Focus: ${focusDay}`}
                    </span>
                    {isLowImpact && (
                      <span className="text-[10px] bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded-full font-bold uppercase">
                        Safe Mode
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2 min-w-[140px]">
                <Label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Change Split</Label>
                <Select value={manualFocus || focusDay} onValueChange={handleManualFocusChange}>
                  <SelectTrigger className="h-8 text-[10px] font-bold uppercase bg-background/50 border-2 border-dashed hover:border-primary transition-all">
                    <div className="flex items-center gap-2">
                      <RefreshCw className="w-3 h-3" />
                      <SelectValue placeholder="Select Split" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {SPLIT_OPTIONS.map(opt => (
                      <SelectItem key={opt} value={opt} className="text-[10px] font-bold uppercase">
                        {opt}
                      </SelectItem>
                    ))}
                    <SelectItem value="reset" onClick={() => setManualFocus(null)} className="text-[10px] font-bold uppercase border-t mt-1">
                      Reset to AI Auto
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {restMessage && (
              <div className={`p-4 rounded-xl border ${isRestDay ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-primary/5 border-primary/10'}`}>
                <div className="flex items-start gap-4">
                  <div className="mt-1 p-2 bg-background rounded-lg shadow-sm">
                    {isRestDay ? <Coffee className="w-5 h-5 text-emerald-500" /> : <Activity className="w-5 h-5 text-primary" />}
                  </div>
                  <p className={`text-sm font-semibold tracking-tight ${isRestDay ? 'text-emerald-700 dark:text-emerald-400' : 'text-primary/80'}`}>
                    {restMessage}
                  </p>
                </div>
              </div>
            )}

            {!isRestDay && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recommendations.slice(0, 3).map((rec, idx) => (
                  <Card key={idx} className="bg-background/60 backdrop-blur-md border-border/50 hover:border-primary/40 transition-all duration-500 group relative">
                    <div className="absolute top-0 right-0 p-3">
                      <span className="text-[9px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                        {rec.body_part}
                      </span>
                    </div>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-md font-bold group-hover:text-primary transition-colors leading-tight">
                        {rec.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2 italic">
                          "{rec.description}"
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold text-muted-foreground/70">
                            <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> {rec.duration_minutes}m</span>
                            <span className="flex items-center gap-1.5 uppercase"><Dumbbell className="w-3 h-3" /> {rec.intensity}</span>
                            {rec.estimated_calories && (
                              <span className="flex items-center gap-1.5 text-orange-500"><Flame className="w-3 h-3" /> {rec.estimated_calories} kcal</span>
                            )}
                          </div>
                          <Button
                            onClick={() => quickLog(rec)}
                            disabled={loading}
                            size="sm"
                            className="h-8 px-4 text-[10px] font-bold uppercase tracking-tighter shadow-md shadow-primary/10"
                          >
                            {loading ? "..." : "Log +"}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
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
        <TabsList className="bg-secondary/50 p-1">
          <TabsTrigger value="log" className="font-bold">Log Activity</TabsTrigger>
          <TabsTrigger value="templates" className="font-bold">Templates</TabsTrigger>
          <TabsTrigger value="history" className="font-bold">History</TabsTrigger>
        </TabsList>

        {/* Log Workout Tab */}
        <TabsContent value="log">
          <Card className="bg-card border-border mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-primary" /> Log a Workout
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {showSaveSuccess && (
                <div className="bg-emerald-500/10 text-emerald-500 p-3 rounded-lg text-sm font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                  <CheckCircle2 className="w-4 h-4" /> Template saved successfully!
                </div>
              )}

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
                <Label htmlFor="exercise-name">Exercise Name *</Label>
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

              <div className="flex gap-3">
                <Button
                  onClick={logWorkout}
                  disabled={loading || !duration || !workoutType}
                  className="flex-1 font-bold uppercase tracking-widest italic"
                >
                  {loading ? "..." : "Log Workout"}
                </Button>
                <Button
                  onClick={saveAsTemplate}
                  disabled={loading || !exerciseName || !duration}
                  variant="outline"
                  className="font-bold uppercase tracking-widest italic border-2"
                >
                  <Save className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Saved Templates Tab */}
        <TabsContent value="templates">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-primary" /> Saved Templates
              </CardTitle>
            </CardHeader>
            <CardContent>
              {customWorkouts.length === 0 ? (
                <div className="text-center py-12">
                  <div className="bg-secondary/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ClipboardList className="w-8 h-8 text-muted-foreground opacity-50" />
                  </div>
                  <p className="text-muted-foreground font-medium">No templates saved yet. Create one when logging a workout!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {customWorkouts.map((template) => (
                    <div key={template.id} className="p-4 rounded-xl bg-secondary/20 border border-border/50 hover:border-primary/40 transition-all group">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-bold text-foreground group-hover:text-primary transition-colors">{template.name}</div>
                        <button onClick={() => customWorkoutAPI.delete(template.id).then(loadData)} className="p-1 hover:text-destructive transition-colors opacity-0 group-hover:opacity-100">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="text-[9px] font-black bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase italic">
                          {template.workout_type}
                        </span>
                        <span className="text-[9px] font-bold text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {template.duration_minutes}m
                        </span>
                        <span className="text-[9px] font-bold text-muted-foreground flex items-center gap-1 uppercase">
                          <Dumbbell className="w-3 h-3" /> {template.intensity}
                        </span>
                        {template.estimated_calories && (
                          <span className="text-[9px] font-bold text-orange-500 flex items-center gap-1">
                            <Flame className="w-3 h-3" /> {template.estimated_calories} kcal
                          </span>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="w-full text-[10px] font-bold uppercase tracking-widest italic h-7 bg-background shadow-sm hover:bg-primary hover:text-primary-foreground"
                        onClick={() => logFromTemplate(template)}
                      >
                        Launch
                      </Button>
                    </div>
                  ))}
                </div>
              )}
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
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" /> {new Date(workout.date).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {workout.duration_minutes} min
                            </span>
                            <span className="capitalize flex items-center gap-1">
                              <Dumbbell className="w-3 h-3" /> {workout.intensity}
                            </span>
                            <span className="text-orange-500 font-medium flex items-center gap-1">
                              <Flame className="w-3 h-3" /> {workout.calories_burned} kcal
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
