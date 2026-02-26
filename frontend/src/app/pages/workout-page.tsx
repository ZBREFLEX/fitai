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
import { Trash2, AlertCircle, Activity, Sparkles, CheckCircle2, Trophy, Clock, Flame, Calendar, Dumbbell, Save, Plus, Bookmark, RefreshCw, Coffee, ClipboardList, Moon, List, LayoutGrid, X } from "lucide-react";
import { Alert, AlertDescription } from "../components/ui/alert";
import { tokenService, workoutAPI, summaryAPI, recommendationAPI, customWorkoutAPI } from "../../services/api";
import { useBadgeUnlock } from "../contexts/badge-context";

interface Workout {
  id: number;
  date: string;
  workout_type: string;
  exercise_name?: string;
  duration_minutes: number;
  intensity: string;
  reps?: number;
  sets?: number;
  body_part?: string;
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

  // Workout Session states
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [sessionReps, setSessionReps] = useState<number | null>(null);
  const [sessionSets, setSessionSets] = useState<number | null>(null);
  const [isResting, setIsResting] = useState(false);
  const [restTimeLeft, setRestTimeLeft] = useState(0);
  const [sessionNotes, setSessionNotes] = useState("");
  const [activeExerciseName, setActiveExerciseName] = useState("");
  const [isCalorieOverride, setIsCalorieOverride] = useState(false);
  const [manualCalories, setManualCalories] = useState<string>("");
  const [selectedBodyPart, setSelectedBodyPart] = useState<string>("Cardio");
  const [allPresets, setAllPresets] = useState<any[]>([]);
  const [showPresets, setShowPresets] = useState(false);
  const [isPlanMode, setIsPlanMode] = useState(false);
  const [recDurations, setRecDurations] = useState<Record<string, string>>({});
  const [nextExercise, setNextExercise] = useState<any>(null);
  const { checkNewBadges } = useBadgeUnlock();

  const SPLIT_OPTIONS = ['Chest', 'Back', 'Legs', 'Shoulders', 'Cardio', 'Abs', 'HIIT', 'Arms'];

  // Timer Effect
  useEffect(() => {
    let interval: any;
    if (isWorkoutActive && !isResting) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isWorkoutActive, isResting]);

  // Rest Timer Effect
  useEffect(() => {
    let interval: any;
    if (isResting && restTimeLeft > 0) {
      interval = setInterval(() => {
        setRestTimeLeft((prev) => {
          if (prev <= 1) {
            setIsResting(false);
            // Play a sound or notification here if possible
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isResting, restTimeLeft]);

  const startSession = (rec?: any) => {
    setIsWorkoutActive(true);
    setSessionStartTime(Date.now());
    setElapsedSeconds(0);
    setIsResting(false);
    setRestTimeLeft(0);

    if (rec) {
      setWorkoutType(rec.workout_type);
      setActiveExerciseName(rec.name);
      setSessionReps(rec.reps || 12);
      setSessionSets(rec.sets || 3);
      setSelectedBodyPart(rec.body_part || "Cardio");
    } else {
      setActiveExerciseName(exerciseName || "New Exercise");
      setSessionReps(10);
      setSessionSets(3);
      setSelectedBodyPart(focusDay || "Cardio");
    }
  };

  const stopSession = async () => {
    if (!isWorkoutActive) return;

    try {
      setLoading(true);
      const durationMins = Math.max(1, Math.round(elapsedSeconds / 60));

      const response = await workoutAPI.logWorkout({
        workout_type: workoutType,
        exercise_name: activeExerciseName,
        duration_minutes: durationMins,
        intensity: intensity,
        body_part: selectedBodyPart,
        reps: sessionReps || undefined,
        sets: sessionSets || undefined,
        notes: sessionNotes || undefined,
        calories_burned: isCalorieOverride ? (parseInt(manualCalories) || undefined) : undefined,
        date: getLocalDateString(),
      });

      // Badge check
      if (response.new_badges) {
        checkNewBadges(response.new_badges);
      }

      setCompletedWorkoutName(activeExerciseName);

      // Next workout logic
      if (isPlanMode) {
        const currentIndex = recommendations.findIndex(r => r.name === activeExerciseName);
        if (currentIndex !== -1 && currentIndex < recommendations.length - 1) {
          setNextExercise(recommendations[currentIndex + 1]);
        } else {
          setNextExercise(null);
        }
      } else {
        setNextExercise(null);
      }

      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 8000);

      // Reset session
      setIsWorkoutActive(false);
      setSessionStartTime(null);
      setElapsedSeconds(0);
      setSessionNotes("");

      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to log session");
    } finally {
      setLoading(false);
    }
  };

  const startRest = (seconds: number = 60) => {
    setIsResting(true);
    setRestTimeLeft(seconds);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Prevent accidental navigation/closing
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isWorkoutActive) {
        e.preventDefault();
        e.returnValue = "You have an active workout session. Your progress will be lost if you leave.";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isWorkoutActive]);

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
      const [workoutsRes, summaryRes, recsRes, customRes, allPresetsRes] = await Promise.all([
        workoutAPI.getWorkouts(),
        summaryAPI.getDailySummary(getLocalDateString()),
        recommendationAPI.getWorkoutRecommendations(manualFocus || undefined),
        customWorkoutAPI.getAll(),
        workoutAPI.getWorkoutPresets(),
      ]);
      setWorkouts(workoutsRes);
      setDailySummary(summaryRes);
      setCustomWorkouts(customRes);
      setAllPresets(allPresetsRes);

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
      const recKey = `${rec.id}-${rec.is_custom}`;
      const overriddenDuration = recDurations[recKey];

      const response = await workoutAPI.logWorkout({
        workout_type: rec.workout_type,
        exercise_name: rec.name,
        duration_minutes: overriddenDuration ? parseInt(overriddenDuration) : rec.duration_minutes,
        intensity: rec.intensity,
        body_part: rec.body_part || "Cardio",
        date: getLocalDateString(),
      });

      // Badge check
      if (response.new_badges) {
        checkNewBadges(response.new_badges);
      }

      setCompletedWorkoutName(rec.name);

      // Next workout logic
      if (isPlanMode) {
        const currentIndex = recommendations.findIndex(r => r.id === rec.id && r.is_custom === rec.is_custom);
        if (currentIndex !== -1 && currentIndex < recommendations.length - 1) {
          setNextExercise(recommendations[currentIndex + 1]);
        } else {
          setNextExercise(null);
        }
      }

      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 8000);

      // Refresh data
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

  const handleSelectPreset = (preset: any) => {
    setExerciseName(preset.name);
    setWorkoutType(preset.workout_type);
    setSelectedBodyPart(preset.body_part || "Cardio");
    if (preset.duration_minutes) {
      setDuration(preset.duration_minutes.toString());
      setEstimatedCalories(calculateCalories(preset.workout_type, preset.duration_minutes, preset.intensity || intensity));
    }
    if (preset.intensity) {
      setIntensity(preset.intensity);
    }
    setShowPresets(false);
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
        body_part: selectedBodyPart,
        reps: sessionReps || undefined,
        sets: sessionSets || undefined,
        calories_burned: isCalorieOverride ? (parseInt(manualCalories) || undefined) : undefined,
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
      setSessionReps(null);
      setSessionSets(null);
      setIsCalorieOverride(false);
      setManualCalories("");
      setSelectedBodyPart(focusDay || "Cardio");
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
        body_part: selectedBodyPart,
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
        body_part: template.body_part || "Cardio",
        date: getLocalDateString(),
      });
      setCompletedWorkoutName(template.name);
      setNextExercise(null); // No next exercise for single template log
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
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 animate-in fade-in zoom-in slide-in-from-top-10 duration-500">
          <div className="bg-primary text-primary-foreground px-8 py-6 rounded-3xl shadow-2xl flex flex-col gap-4 border-2 border-primary-foreground/20 backdrop-blur-xl">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-2 rounded-xl">
                <Trophy className="w-8 h-8 text-yellow-300" />
              </div>
              <div>
                <div className="text-xl italic uppercase tracking-tighter font-black">Session Crushed!</div>
                <p className="text-sm font-medium opacity-90">{completedWorkoutName} logged successfully.</p>
              </div>
              <button onClick={() => setShowCelebration(false)} className="ml-4 opacity-70 hover:opacity-100"><X className="w-4 h-4" /></button>
            </div>

            {nextExercise && (
              <div className="bg-white/10 p-4 rounded-2xl flex flex-col gap-3 border border-white/10">
                <div className="text-[10px] font-bold uppercase tracking-widest opacity-70">Up Next in Your Plan:</div>
                <div className="flex items-center justify-between gap-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <Activity className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold uppercase italic">{nextExercise.name}</div>
                      <div className="text-[10px] opacity-70">{nextExercise.duration_minutes} mins • {nextExercise.intensity}</div>
                    </div>
                  </div>
                  <Button
                    onClick={() => {
                      setShowCelebration(false);
                      startSession(nextExercise);
                    }}
                    variant="secondary"
                    size="sm"
                    className="bg-white text-primary hover:bg-white/90 font-black uppercase italic text-[10px]"
                  >
                    Next Up <Plus className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </div>
            )}
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

      {/* Live Workout Session UI - Focus Mode Overlay */}
      {isWorkoutActive && (
        <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-xl flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <Card className="border-4 border-primary shadow-[0_0_50px_-12px_rgba(var(--primary),0.5)] bg-card animate-in zoom-in-95 duration-500 overflow-hidden">
              <div className="bg-primary p-6 flex flex-col md:flex-row items-center justify-between text-primary-foreground gap-6">
                <div className="flex items-center gap-4">
                  <div className="animate-pulse bg-white/20 p-3 rounded-2xl">
                    <Activity className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="font-black italic uppercase text-2xl tracking-tight leading-none mb-1">Live Session: {activeExerciseName}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 bg-white/20 rounded-full font-bold uppercase tracking-widest">{workoutType}</span>
                      <span className="text-xs px-2 py-0.5 bg-white/20 rounded-full font-bold uppercase tracking-widest">{intensity} Intensity</span>
                    </div>
                  </div>
                </div>
                <div className="text-center md:text-right bg-white/10 px-6 py-3 rounded-2xl backdrop-blur-md border border-white/20">
                  <div className="text-5xl font-black tabular-nums tracking-tighter leading-none mb-1">{formatTime(elapsedSeconds)}</div>
                  <p className="text-[10px] font-bold uppercase opacity-80 tracking-widest">Elapsed Time</p>
                </div>
              </div>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                  <div className="bg-secondary/30 p-6 rounded-2xl border-2 border-border/50 flex flex-col items-center text-center">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-4">Current Reps</Label>
                    <div className="flex items-center gap-6">
                      <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl border-2 hover:bg-primary hover:text-primary-foreground transition-all" onClick={() => setSessionReps(prev => Math.max(0, (prev || 0) - 1))}>
                        <RefreshCw className="w-5 h-5" />
                      </Button>
                      <div className="text-5xl font-black">{sessionReps}</div>
                      <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl border-2 hover:bg-primary hover:text-primary-foreground transition-all" onClick={() => setSessionReps(prev => (prev || 0) + 1)}>
                        <Plus className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                  <div className="bg-secondary/30 p-6 rounded-2xl border-2 border-border/50 flex flex-col items-center text-center">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-4">Sets Goal</Label>
                    <div className="flex items-center gap-6">
                      <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl border-2 hover:bg-primary hover:text-primary-foreground transition-all" onClick={() => setSessionSets(prev => Math.max(1, (prev || 1) - 1))}>
                        <RefreshCw className="w-5 h-5" />
                      </Button>
                      <div className="text-5xl font-black">{sessionSets}</div>
                      <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl border-2 hover:bg-primary hover:text-primary-foreground transition-all" onClick={() => setSessionSets(prev => (prev || 1) + 1)}>
                        <Plus className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                  <div className="bg-secondary/30 p-6 rounded-2xl border-2 border-border/50 flex flex-col justify-center items-center text-center overflow-hidden">
                    {isResting ? (
                      <div className="animate-in slide-in-from-bottom-4">
                        <Label className="text-[10px] font-black uppercase text-emerald-500 mb-2 tracking-widest block">Rest Active</Label>
                        <div className="text-5xl font-black tabular-nums text-emerald-500 mb-2">{restTimeLeft}s</div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-[11px] uppercase font-bold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10"
                          onClick={() => setIsResting(false)}
                        >
                          Skip Rest Cycle
                        </Button>
                      </div>
                    ) : (
                      <div className="w-full h-full flex flex-col gap-3">
                        <Button
                          className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-black italic uppercase rounded-xl text-lg shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02]"
                          onClick={() => startRest(60)}
                        >
                          <Coffee className="w-5 h-5 mr-3" /> Start Rest
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-muted/30 p-6 rounded-2xl border-2 border-dashed border-border mb-8">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-3 block">Real-time Session Notes</Label>
                  <Input
                    placeholder="Track weight used, form notes, or how you're feeling..."
                    value={sessionNotes}
                    onChange={(e) => setSessionNotes(e.target.value)}
                    className="bg-transparent border-none text-lg font-medium p-0 focus-visible:ring-0 placeholder:opacity-50 h-auto"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    variant="destructive"
                    className="flex-[2] font-black italic uppercase tracking-widest h-16 text-xl shadow-xl shadow-destructive/20 hover:scale-[1.01] transition-all"
                    onClick={stopSession}
                    disabled={loading}
                  >
                    {loading ? "Finalizing..." : "Complete & Log Session"}
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 h-16 border-2 font-black italic uppercase text-muted-foreground hover:text-destructive hover:border-destructive transition-all"
                    onClick={() => {
                      if (confirm("Are you sure you want to DISCARD this session? No data will be logged.")) {
                        setIsWorkoutActive(false);
                        setElapsedSeconds(0);
                        setIsResting(false);
                      }
                    }}
                  >
                    Discard Session
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
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
                    {isPlanMode ? `${focusDay} Workout Plan` : "AI Coach Insight"}
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
              <div className="flex bg-secondary/30 p-1 rounded-xl border border-border/50">
                <button
                  onClick={() => setIsPlanMode(false)}
                  className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg text-[10px] font-black uppercase transition-all ${!isPlanMode ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <LayoutGrid className="w-3 h-3" /> Quick Tips
                </button>
                <button
                  onClick={() => setIsPlanMode(true)}
                  className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg text-[10px] font-black uppercase transition-all ${isPlanMode ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <List className="w-3 h-3" /> Workout Plan
                </button>
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
              <div className={`${isPlanMode ? 'flex flex-col gap-3' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'}`}>
                {(isPlanMode ? recommendations : recommendations.slice(0, 3)).map((rec, idx) => (
                  <Card key={idx} className={`bg-background/60 backdrop-blur-md border-border/50 hover:border-primary/40 transition-all duration-500 group relative overflow-hidden ${isPlanMode ? 'flex flex-row items-center border-l-4 border-l-primary' : ''}`}>
                    {isPlanMode && (
                      <div className="absolute left-0 top-0 bottom-0 w-16 bg-primary/5 flex items-center justify-center text-primary/20 font-black text-4xl italic select-none">
                        {idx + 1}
                      </div>
                    )}
                    <div className={`flex-1 ${isPlanMode ? 'pl-20 pr-4 py-4' : ''}`}>
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
                              <div className="flex items-center gap-1.5 bg-secondary/30 px-2 py-1 rounded-md border border-border/50">
                                <Clock className="w-3 h-3 text-primary/60" />
                                <input
                                  type="number"
                                  value={recDurations[`${rec.id}-${rec.is_custom}`] || rec.duration_minutes}
                                  onChange={(e) => setRecDurations(prev => ({ ...prev, [`${rec.id}-${rec.is_custom}`]: e.target.value }))}
                                  className="w-8 bg-transparent border-none focus:ring-0 p-0 text-foreground font-black text-[10px] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                                <span>m</span>
                              </div>
                              <span className="flex items-center gap-1.5 uppercase"><Dumbbell className="w-3 h-3" /> {rec.intensity}</span>
                              {rec.estimated_calories && (
                                <div className="flex flex-col gap-0.5">
                                  <span className="flex items-center gap-1.5 text-orange-500"><Flame className="w-3 h-3" /> {Math.round(rec.estimated_calories * ((parseInt(recDurations[`${rec.id}-${rec.is_custom}`]) || rec.duration_minutes) / rec.duration_minutes))} kcal</span>
                                  <div className="text-[9px] font-bold text-muted-foreground/60 pl-4">
                                    {Math.round(rec.estimated_calories / rec.duration_minutes)}/min
                                    {rec.reps ? ` • ${Math.round((rec.estimated_calories / (rec.reps * (rec.sets || 1))) * 10) / 10}/rep` : ''}
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                onClick={() => startSession(rec)}
                                disabled={loading || isWorkoutActive}
                                size="sm"
                                variant="outline"
                                className="h-8 px-3 text-[10px] font-bold uppercase tracking-tighter"
                              >
                                Start
                              </Button>
                              <Button
                                onClick={() => quickLog(rec)}
                                disabled={loading || isWorkoutActive}
                                size="sm"
                                className="h-8 px-3 text-[10px] font-bold uppercase tracking-tighter shadow-md shadow-primary/10"
                              >
                                Log +
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </div>
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

      {
        dailySummary && (
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
        )
      }

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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <Label htmlFor="exercise-name">Exercise Name *</Label>
                  <Input
                    id="exercise-name"
                    placeholder="Search or type exercise name..."
                    value={exerciseName}
                    onChange={(e) => {
                      setExerciseName(e.target.value);
                      setShowPresets(true);
                    }}
                    onFocus={() => setShowPresets(true)}
                  />
                  {showPresets && exerciseName && (
                    <div className="absolute z-[60] w-full mt-1 bg-card border border-border rounded-lg shadow-2xl max-h-60 overflow-y-auto overflow-x-hidden backdrop-blur-md">
                      {allPresets
                        .filter(p => p.name.toLowerCase().includes(exerciseName.toLowerCase()))
                        .map((preset) => (
                          <button
                            key={`${preset.id}-${preset.is_custom}`}
                            className="w-full text-left px-4 py-2 hover:bg-primary/10 flex items-center justify-between border-b border-border/50 last:border-0 group"
                            onClick={() => handleSelectPreset(preset)}
                          >
                            <div>
                              <div className="font-bold text-sm group-hover:text-primary transition-colors">{preset.name}</div>
                              <div className="text-[10px] text-muted-foreground uppercase flex items-center gap-2">
                                <span>{preset.workout_type}</span>
                                {preset.body_part && <span>• {preset.body_part}</span>}
                              </div>
                            </div>
                            {preset.is_custom ? (
                              <span className="text-[9px] font-black bg-primary/20 text-primary px-1.5 py-0.5 rounded italic">CUSTOM</span>
                            ) : (
                              <span className="text-[9px] font-black bg-secondary/80 text-muted-foreground px-1.5 py-0.5 rounded italic">PRESET</span>
                            )}
                          </button>
                        ))}
                      {exerciseName && !allPresets.some(p => p.name.toLowerCase().includes(exerciseName.toLowerCase())) && (
                        <div className="px-4 py-3 text-xs text-muted-foreground italic">
                          No results found. Type to create new...
                        </div>
                      )}
                    </div>
                  )}
                  {showPresets && (
                    <div
                      className="fixed inset-0 z-50 pointer-events-auto"
                      onClick={() => setShowPresets(false)}
                    />
                  )}
                </div>
                <div>
                  <Label htmlFor="body-part">Focus Body Part / Type</Label>
                  <Select value={selectedBodyPart} onValueChange={setSelectedBodyPart}>
                    <SelectTrigger id="body-part">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SPLIT_OPTIONS.map((part) => (
                        <SelectItem key={part} value={part}>
                          {part}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="duration">Duration (min) *</Label>
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
                  <Label htmlFor="intensity">Intensity *</Label>
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

                <div>
                  <Label htmlFor="reps">Reps</Label>
                  <Input
                    id="reps"
                    type="number"
                    placeholder="12"
                    value={sessionReps || ""}
                    onChange={(e) => setSessionReps(parseInt(e.target.value) || null)}
                  />
                </div>

                <div>
                  <Label htmlFor="sets">Sets</Label>
                  <Input
                    id="sets"
                    type="number"
                    placeholder="3"
                    value={sessionSets || ""}
                    onChange={(e) => setSessionSets(parseInt(e.target.value) || null)}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="calorie-override"
                    checked={isCalorieOverride}
                    onChange={(e) => setIsCalorieOverride(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="calorie-override" className="text-sm font-medium cursor-pointer">Override Calories Burned</Label>
                </div>

                {isCalorieOverride ? (
                  <div className="animate-in fade-in slide-in-from-top-2">
                    <Label htmlFor="manual-calories">Calories Burned (kcal) *</Label>
                    <Input
                      id="manual-calories"
                      type="number"
                      placeholder="e.g., 350"
                      value={manualCalories}
                      onChange={(e) => setManualCalories(e.target.value)}
                    />
                  </div>
                ) : (
                  estimatedCalories > 0 && (
                    <div className="bg-secondary/50 p-4 rounded border border-primary/20 flex justify-between items-center">
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Estimated Fat Burn</div>
                        <div className="text-3xl font-bold text-primary">
                          {estimatedCalories}
                          <span className="text-sm ml-2 font-normal">kcal</span>
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <div className="text-[10px] font-bold uppercase text-muted-foreground">Efficiency Metrics</div>
                        <div className="text-xs font-semibold text-primary/80">
                          {Math.round(estimatedCalories / (parseInt(duration) || 1))} kcal/min
                        </div>
                        {sessionReps && sessionReps > 0 && (
                          <div className="text-xs font-semibold text-emerald-500">
                            {Math.round((estimatedCalories / (sessionReps * (sessionSets || 1))) * 10) / 10} kcal/rep
                          </div>
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={logWorkout}
                  disabled={loading || !duration || !workoutType}
                  className="flex-[2] font-black h-12 uppercase tracking-widest italic text-lg shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
                >
                  {loading ? "Logging..." : "Log Workout Now"}
                </Button>
                <Button
                  onClick={saveAsTemplate}
                  disabled={loading || !exerciseName || !duration}
                  variant="outline"
                  className="flex-1 h-12 font-bold uppercase tracking-widest italic border-2 hover:bg-secondary/50"
                >
                  <Save className="w-4 h-4 mr-2" /> Save Template
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
                        <div className="flex items-center gap-2">
                          <div className="font-bold text-foreground group-hover:text-primary transition-colors">{template.name}</div>
                          <span className="text-[8px] font-black bg-primary/20 text-primary px-1.5 py-0.5 rounded italic">CUSTOM</span>
                        </div>
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
                            {workout.body_part && (
                              <span className="text-[10px] font-black uppercase italic bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                                {workout.body_part}
                              </span>
                            )}
                            {workout.duration_minutes > 0 && (
                              <span className="text-muted-foreground text-[10px] font-bold">
                                ({Math.round(workout.calories_burned / workout.duration_minutes)}/min)
                              </span>
                            )}
                            {workout.reps && workout.reps > 0 && (
                              <span className="text-muted-foreground text-[10px] font-bold ml-1">
                                ({Math.round((workout.calories_burned / (workout.reps * (workout.sets || 1))) * 10) / 10}/rep)
                              </span>
                            )}
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
    </div >
  );
}
