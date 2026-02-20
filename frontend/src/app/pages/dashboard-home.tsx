import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Activity, TrendingUp, Target, Flame } from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useTheme } from "../contexts/theme-context";
import { useState, useEffect } from "react";
import { summaryAPI, tokenService } from "../../services/api";
import { useNavigate } from "react-router";

interface DailySummary {
  date: string;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fats: number;
  total_calories_burned: number;
  tdee: number;
  net_calories: number;
  meals_count: number;
  workouts_count: number;
}

interface Streak {
  current_streak: number;
  longest_streak: number;
  last_activity_date: string;
}

export function DashboardHome() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [dailySummary, setDailySummary] = useState<DailySummary | null>(null);
  const [streak, setStreak] = useState<Streak | null>(null);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Get user data from localStorage
  const userData = JSON.parse(
    localStorage.getItem("userData") ||
      '{"age": "25", "height": "175", "weight": "70"}',
  );

  // Calculate BMI
  const heightInMeters = parseFloat(userData.height || "175") / 100;
  const weight = parseFloat(userData.weight || "70");
  const bmi = (weight / (heightInMeters * heightInMeters)).toFixed(1);

  // Estimate daily calories (simplified formula)
  const age = parseInt(userData.age || "25");
  const bmr =
    userData.gender === "female"
      ? 655 +
        9.6 * weight +
        1.8 * parseFloat(userData.height || "175") -
        4.7 * age
      : 66 +
        13.7 * weight +
        5 * parseFloat(userData.height || "175") -
        6.8 * age;

  const activityMultiplier =
    {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      very: 1.725,
      extreme: 1.9,
    }[userData.activityLevel || "moderate"] || 1.55;

  const dailyCalorieTarget = Math.round(bmr * activityMultiplier);

  useEffect(() => {
    const loadData = async () => {
      try {
        if (!tokenService.isTokenValid()) {
          navigate("/login");
          return;
        }

        // Fetch today's summary and streak
        const [todaysummary, streakData] = await Promise.all([
          summaryAPI.getDailySummary(),
          summaryAPI.getStreak(),
        ]);

        setDailySummary(todaysummary);
        setStreak(streakData);

        // Fetch last 7 days of data for weekly chart
        const weekData = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split("T")[0];

          try {
            const summary = await summaryAPI.getDailySummary(dateStr);
            weekData.push({
              day: date.toLocaleDateString("en-US", { weekday: "short" }),
              calories: summary.total_calories,
              target: dailyCalorieTarget,
            });
          } catch (e) {
            weekData.push({
              day: date.toLocaleDateString("en-US", { weekday: "short" }),
              calories: 0,
              target: dailyCalorieTarget,
            });
          }
        }
        setWeeklyData(weekData);
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate]);

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

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-foreground">
          Welcome back, John!
        </h1>
        <p className="text-muted-foreground">
          Here's your fitness overview for today
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Daily Calories
            </CardTitle>
            <Flame className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {dailyCalorieTarget}
            </div>
            <p className="text-xs text-muted-foreground mt-1">kcal target</p>
            <div className="mt-4 h-1 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{
                  width: `${Math.min(
                    (((dailySummary?.total_calories || 0) +
                      (dailySummary?.total_calories_burned || 0)) /
                      dailyCalorieTarget) *
                      100,
                    100
                  )}%`,
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {(dailySummary?.total_calories || 0) +
                (dailySummary?.total_calories_burned || 0)} /{" "}
              {dailyCalorieTarget} consumed
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Body Mass Index
            </CardTitle>
            <Activity className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{bmi}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {parseFloat(bmi) < 18.5
                ? "Underweight"
                : parseFloat(bmi) < 25
                  ? "Normal"
                  : parseFloat(bmi) < 30
                    ? "Overweight"
                    : "Obese"}
            </p>
            <div className="mt-4 flex gap-1">
              <div className="flex-1 h-1 bg-secondary rounded-full" />
              <div className="flex-1 h-1 bg-primary rounded-full" />
              <div className="flex-1 h-1 bg-secondary rounded-full" />
              <div className="flex-1 h-1 bg-secondary rounded-full" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Target: 18.5 - 24.9
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Weekly Workouts
            </CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {dailySummary?.workouts_count || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              today's sessions
            </p>
            <div className="mt-4 h-1 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary"
                style={{ width: `${((dailySummary?.workouts_count || 0) * 14) % 100}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Keep up the momentum!
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Current Streak
            </CardTitle>
            <Target className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {streak?.current_streak || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">days active</p>
            <div className="mt-4 flex gap-1">
              {[...Array(7)].map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 h-8 rounded ${
                    i < (streak?.current_streak || 0) ? "bg-primary" : "bg-secondary"
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Personal best: {streak?.longest_streak || 0} days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">
              Weekly Calorie Intake
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Daily consumption vs target
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyData.length > 0 ? weeklyData : []}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
                <XAxis dataKey="day" stroke={colors.text} />
                <YAxis stroke={colors.text} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: colors.background,
                    border: `1px solid ${colors.border}`,
                    borderRadius: "8px",
                    color: colors.tooltipText,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="calories"
                  stroke={colors.primary}
                  strokeWidth={2}
                  dot={{ fill: colors.primary }}
                />
                <Line
                  type="monotone"
                  dataKey="target"
                  stroke={colors.secondary}
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: colors.secondary }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">
              Today's Macros Burned
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Calories burned through workouts
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-muted-foreground text-sm">Total Burned</span>
                  <span className="font-semibold text-foreground">
                    {dailySummary?.total_calories_burned || 0} kcal
                  </span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-500"
                    style={{
                      width: `${Math.min(
                        ((dailySummary?.total_calories_burned || 0) /
                          dailyCalorieTarget) *
                          100,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>
              <div className="text-center py-4 bg-secondary/50 rounded">
                <div className="text-2xl font-bold text-foreground">
                  {dailySummary?.net_calories || 0}
                </div>
                <div className="text-xs text-muted-foreground">Net Calories</div>
                <div className="text-xs text-muted-foreground mt-1">
                  ({dailySummary?.total_calories || 0} consumed -{" "}
                  {dailySummary?.total_calories_burned || 0} burned)
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg text-foreground">
              Today's Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Meals Logged</span>
                <span className="font-semibold text-foreground">
                  {dailySummary?.meals_count || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Workouts Done</span>
                <span className="font-semibold text-foreground">
                  {dailySummary?.workouts_count || 0}
                </span>
              </div>
              <div className="border-t border-border pt-3" />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Streak</span>
                <span className="font-semibold text-foreground text-lg">
                  🔥 {streak?.current_streak || 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg text-foreground">
              Macro Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-muted-foreground">Protein</span>
                  <span className="font-semibold text-foreground">
                    {dailySummary?.total_protein || 0}g
                  </span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary"
                    style={{
                      width: `${Math.min(
                        ((dailySummary?.total_protein || 0) / 150) * 100,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-muted-foreground">Carbs</span>
                  <span className="font-semibold text-foreground">
                    {dailySummary?.total_carbs || 0}g
                  </span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary"
                    style={{
                      width: `${Math.min(
                        ((dailySummary?.total_carbs || 0) / 300) * 100,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-muted-foreground">Fats</span>
                  <span className="font-semibold text-foreground">
                    {dailySummary?.total_fats || 0}g
                  </span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary"
                    style={{
                      width: `${Math.min(
                        ((dailySummary?.total_fats || 0) / 80) * 100,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg text-foreground">
              Quick Links
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <button
                onClick={() => navigate("/dashboard/nutrition")}
                className="w-full text-left px-3 py-2 rounded hover:bg-secondary/50 transition-colors"
              >
                <div className="font-semibold text-foreground">📊 Log Meal</div>
                <div className="text-xs text-muted-foreground">
                  Track your nutrition
                </div>
              </button>
              <button
                onClick={() => navigate("/dashboard/workout")}
                className="w-full text-left px-3 py-2 rounded hover:bg-secondary/50 transition-colors"
              >
                <div className="font-semibold text-foreground">💪 Log Workout</div>
                <div className="text-xs text-muted-foreground">
                  Record your exercise
                </div>
              </button>
              <button
                onClick={() => navigate("/dashboard/progress")}
                className="w-full text-left px-3 py-2 rounded hover:bg-secondary/50 transition-colors"
              >
                <div className="font-semibold text-foreground">📈 View Progress</div>
                <div className="text-xs text-muted-foreground">
                  See your improvements
                </div>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
