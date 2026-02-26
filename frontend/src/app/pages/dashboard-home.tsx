import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Activity, TrendingUp, Target, Flame, Lightbulb, Scale, Ruler, Settings, RefreshCw, Brain } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useTheme } from "../contexts/theme-context";
import { useState, useEffect } from "react";
import { summaryAPI, tokenService, recommendationAPI, bodyMeasurementAPI, settingsAPI } from "../../services/api";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

interface DailySummary {
  date: string;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fats: number;
  total_calories_burned: number;
  tdee: number;
  recommended_calories?: number;
  target_macros?: {
    protein: number;
    carbs: number;
    fats: number;
  };
  net_calories: number;
  meals_count: number;
  workouts_count: number;
}

interface Streak {
  current_streak: number;
  longest_streak: number;
  last_activity_date: string;
}

interface RecommendedFood {
  id: number;
  food_name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  serving_size: string;
  ingredients: string;
  food_type: string;
}

export function DashboardHome() {
  const { theme } = useTheme();
  const navigate = useNavigate();

  const getLocalDateString = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };
  const [dailySummary, setDailySummary] = useState<DailySummary | null>(null);
  const [streak, setStreak] = useState<Streak | null>(null);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [recommendedFoods, setRecommendedFoods] = useState<RecommendedFood[]>([]);
  const [recommendedWorkouts, setRecommendedWorkouts] = useState<any[]>([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);

  // Quick update states
  const [quickWeight, setQuickWeight] = useState("");
  const [quickHeight, setQuickHeight] = useState("");
  const [quickLoading, setQuickLoading] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        if (!tokenService.isTokenValid()) {
          navigate("/login");
          return;
        }

        // Fetch full profile data
        const profile = await settingsAPI.getUserFullData();
        setProfileData(profile);

        // Redirect if user is staff
        if (profile.is_staff) {
          navigate("/dashboard/admin");
          return;
        }

        if (profile.profile?.latest_measurement) {
          setQuickWeight(profile.profile.latest_measurement.weight.toString());
          setQuickHeight(profile.profile.latest_measurement.height.toString());
        }

        // Fetch today's summary, streak, and weekly stats
        const [todaysummary, streakData, weeklyRes] = await Promise.all([
          summaryAPI.getDailySummary(getLocalDateString()),
          summaryAPI.getStreak(),
          summaryAPI.getWeeklyStats(),
        ]);

        setDailySummary(todaysummary);
        setStreak(streakData);

        // Fetch recommendations
        try {
          setRecommendationsLoading(true);
          const [foodRecRes, workoutRecRes] = await Promise.all([
            recommendationAPI.getMealRecommendations(4),
            recommendationAPI.getWorkoutRecommendations(),
          ]);
          setRecommendedFoods(foodRecRes?.recommendations || []);
          setRecommendedWorkouts(workoutRecRes?.recommendations?.slice(0, 3) || []);
        } catch (err) {
          console.error("Failed to load recommendations:", err);
        } finally {
          setRecommendationsLoading(false);
        }

        // Map weekly stats for chart
        if (weeklyRes?.history) {
          const chartData = weeklyRes.history.map((h: any) => ({
            day: h.day,
            calories: h.total_calories,
            target: h.recommended_calories || h.tdee || 2000,
          }));
          setWeeklyData(chartData);
        }
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [navigate]);

  const handleQuickUpdate = async () => {
    try {
      setQuickLoading(true);
      if (!profileData) return;

      await bodyMeasurementAPI.save({
        weight: parseFloat(quickWeight),
        height: parseFloat(quickHeight),
        age: profileData.profile?.age || 25,
        gender: profileData.profile?.gender || "male",
        activityLevel: profileData.profile?.latest_measurement?.activity_level || "moderate",
      });

      window.location.reload();
    } catch (err) {
      console.error("Failed to update measurements:", err);
    } finally {
      setQuickLoading(false);
    }
  };

  // Theme colors
  const colors = {
    grid: theme === "dark" ? "#2a2a2a" : "#e0e0e0",
    text: theme === "dark" ? "#a0a0a0" : "#606060",
    primary: theme === "dark" ? "#ffffff" : "#000000",
    secondary: theme === "dark" ? "#606060" : "#a0a0a0",
    background: theme === "dark" ? "#1a1a1a" : "#ffffff",
    border: theme === "dark" ? "#2a2a2a" : "#e0e0e0",
    tooltipText: theme === "dark" ? "#ffffff" : "#000000",
  };

  const bmi = profileData?.profile?.latest_measurement?.bmi || "N/A";
  const bmiStatus = profileData?.profile?.latest_measurement?.bmi_status || "Update metrics";

  return (
    <div className="p-8">
      <div className="mb-8 font-poppins">
        <h1 className="text-3xl font-bold mb-2 text-foreground tracking-tight">Dashboard Overview</h1>
        <p className="text-muted-foreground">Welcome back, {profileData?.first_name || profileData?.username || "Athlete"}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Quick Update */}
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Quick Metrics</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Weight (kg)"
                value={quickWeight}
                onChange={(e) => setQuickWeight(e.target.value)}
                className="h-8 text-xs font-semibold"
              />
              <Input
                type="number"
                placeholder="Height (cm)"
                value={quickHeight}
                onChange={(e) => setQuickHeight(e.target.value)}
                className="h-8 text-xs font-semibold"
              />
              <Button size="sm" className="h-8 px-3" onClick={handleQuickUpdate} disabled={quickLoading}>
                {quickLoading ? "..." : <RefreshCw className="w-3 h-3" />}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* BMI Status */}
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">BMI Status</CardTitle>
            <Scale className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bmi}</div>
            <p className="text-xs text-muted-foreground mt-1">{bmiStatus}</p>
            <div className="mt-4 flex gap-1">
              <div className={`flex-1 h-1 rounded-full ${parseFloat(bmi) < 18.5 ? "bg-primary" : "bg-secondary"}`} />
              <div className={`flex-1 h-1 rounded-full ${parseFloat(bmi) >= 18.5 && parseFloat(bmi) < 25 ? "bg-primary" : "bg-secondary"}`} />
              <div className={`flex-1 h-1 rounded-full ${parseFloat(bmi) >= 25 && parseFloat(bmi) < 30 ? "bg-primary" : "bg-secondary"}`} />
              <div className={`flex-1 h-1 rounded-full ${parseFloat(bmi) >= 30 ? "bg-primary" : "bg-secondary"}`} />
            </div>
          </CardContent>
        </Card>

        {/* Daily Progress */}
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Daily Progress</CardTitle>
            <Flame className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dailySummary?.total_calories || 0} kcal</div>
            <div className="flex items-center gap-1.5 mt-1">
              <p className="text-xs text-muted-foreground">Goal: {(dailySummary as any)?.recommended_calories || dailySummary?.tdee || 2000} kcal</p>
              <div className="flex items-center gap-0.5 bg-primary/10 text-primary px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider">
                <Brain className="w-2 h-2" /> FitAI Recommended
              </div>
            </div>
            <div className="h-1.5 bg-secondary rounded-full overflow-hidden mt-4">
              <div
                className="h-full bg-primary"
                style={{ width: `${Math.min(((dailySummary?.total_calories || 0) / ((dailySummary as any)?.recommended_calories || dailySummary?.tdee || 2000)) * 100, 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Streak */}
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Streak</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{streak?.current_streak || 0} Days</div>
            <p className="text-xs text-muted-foreground mt-1">Keep it up! Best: {streak?.longest_streak || 0}</p>
            <div className="mt-4 flex items-center gap-2">
              <div className="text-xl">🔥</div>
              <div className="text-[10px] font-bold text-primary uppercase bg-primary/10 px-2 py-0.5 rounded-full">
                Momentum
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        {/* Weekly Chart (Span 8) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <Card className="bg-card border-border shadow-sm flex-1">
            <CardHeader>
              <CardTitle className="text-foreground">Weekly Calorie Intake</CardTitle>
              <p className="text-sm text-muted-foreground">Daily consumption vs target</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} vertical={false} />
                  <XAxis dataKey="day" stroke={colors.text} axisLine={false} tickLine={false} />
                  <YAxis stroke={colors.text} axisLine={false} tickLine={false} tickFormatter={(val) => `${val / 1000}k`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: colors.background,
                      border: `1px solid ${colors.border}`,
                      borderRadius: "8px",
                    }}
                  />
                  <Line type="monotone" dataKey="calories" stroke={colors.primary} strokeWidth={3} dot={{ fill: colors.primary, r: 4 }} />
                  <Line type="monotone" dataKey="target" stroke={colors.secondary} strokeWidth={2} strokeDasharray="5 5" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* AI Workout Picks (New Section) */}
          <Card className="bg-card border-primary/20 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg">AI Workout Picks</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {recommendedWorkouts.map((workout, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-primary/5 border border-primary/10 hover:border-primary/30 transition-all cursor-pointer group"
                    onClick={() => navigate('/dashboard/workout')}
                  >
                    <div className="font-bold text-sm mb-1 group-hover:text-primary transition-colors">{workout.name}</div>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold uppercase">
                      <span>⏱️ {workout.duration_minutes}m</span>
                      <span>💪 {workout.intensity}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar: Energy Balance & Macro Distribution (Span 4) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <Card className="bg-card border-border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Today's Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4 bg-primary/5 rounded-xl border border-primary/10 mb-4">
                <div className="text-4xl font-bold text-foreground">{dailySummary?.net_calories || 0}</div>
                <div className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Net kcal</div>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-bold uppercase mb-1">
                    <span className="text-muted-foreground">Burned</span>
                    <span className="text-orange-500">{dailySummary?.total_calories_burned || 0} kcal</span>
                  </div>
                  <div className="h-1.5 bg-secondary/30 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500" style={{ width: `${Math.min(((dailySummary?.total_calories_burned || 0) / 500) * 100, 100)}%` }} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-sm flex-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Macros</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: "P", current: dailySummary?.total_protein || 0, goal: dailySummary?.target_macros?.protein || 150, color: "bg-blue-500" },
                { label: "C", current: dailySummary?.total_carbs || 0, goal: dailySummary?.target_macros?.carbs || 250, color: "bg-green-500" },
                { label: "F", current: dailySummary?.total_fats || 0, goal: dailySummary?.target_macros?.fats || 80, color: "bg-orange-500" },
              ].map((macro) => (
                <div key={macro.label} className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold">
                    <span>{macro.label}</span>
                    <span>{Math.round(macro.current)}g / {Math.round(macro.goal)}g</span>
                  </div>
                  <div className="h-1.5 bg-secondary/30 rounded-full overflow-hidden">
                    <div className={`h-full ${macro.color}`} style={{ width: `${Math.min((macro.current / macro.goal) * 100, 100)}%` }} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Food Recommendations (Wide Card) */}
      <Card className="bg-card border-border shadow-sm mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              <CardTitle className="text-lg">Top AI Meals</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard/recommendations")}>
              View More
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recommendedFoods.map((food) => (
              <div
                key={food.id}
                className="p-4 rounded-xl bg-secondary/10 hover:bg-secondary/20 transition-all cursor-pointer border border-transparent hover:border-border group"
                onClick={() => navigate("/dashboard/nutrition")}
              >
                <div className="font-bold text-sm mb-1 group-hover:text-primary transition-colors">{food.food_name}</div>
                <div className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded inline-block mb-2">
                  {food.calories} kcal
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bottom Grid for Macros & Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg text-foreground">Macro Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              {[
                { label: "Protein", current: dailySummary?.total_protein || 0, goal: dailySummary?.target_macros?.protein || 150, color: "bg-blue-500" },
                { label: "Carbs", current: dailySummary?.total_carbs || 0, goal: dailySummary?.target_macros?.carbs || 250, color: "bg-green-500" },
                { label: "Fats", current: dailySummary?.total_fats || 0, goal: dailySummary?.target_macros?.fats || 80, color: "bg-orange-500" },
              ].map((macro) => (
                <div key={macro.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-muted-foreground">{macro.label}</span>
                    <span className="text-sm font-bold text-foreground">{Math.round(macro.current)}g / {Math.round(macro.goal)}g</span>
                  </div>
                  <div className="h-2 bg-secondary/30 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${macro.color}`}
                      style={{ width: `${Math.min((macro.current / macro.goal) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg text-foreground">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Button
                variant="secondary"
                className="flex flex-col h-auto py-4 gap-2 border border-transparent hover:border-primary/20 min-w-0"
                onClick={() => navigate("/dashboard/nutrition")}
              >
                <div className="text-xl">📊</div>
                <div className="font-bold">Log Meal</div>
              </Button>
              <Button
                variant="secondary"
                className="flex flex-col h-auto py-4 gap-2 border border-transparent hover:border-primary/20 min-w-0"
                onClick={() => navigate("/dashboard/workout")}
              >
                <div className="text-xl">💪</div>
                <div className="font-bold">Log Workout</div>
              </Button>
              <Button
                variant="secondary"
                className="flex flex-col h-auto py-4 gap-2 border border-transparent hover:border-primary/20 min-w-0"
                onClick={() => navigate("/dashboard/settings")}
              >
                <div className="text-xl">⚙️</div>
                <div className="font-bold">Settings</div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div >
  );
}
