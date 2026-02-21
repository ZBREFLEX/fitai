import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { TrendingDown, TrendingUp, Calendar, Target, Loader2 } from "lucide-react";
import { useTheme } from "../contexts/theme-context";
import { useState, useEffect } from "react";
import { bodyMeasurementAPI, summaryAPI, tokenService } from "../../services/api";
import { useNavigate } from "react-router";

export function ProgressPage() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [measurements, setMeasurements] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [weeklyCalories, setWeeklyCalories] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!tokenService.isTokenValid()) {
          navigate("/login");
          return;
        }

        const [history, measurementStats] = await Promise.all([
          bodyMeasurementAPI.getHistory(30),
          bodyMeasurementAPI.getStats()
        ]);

        // Process history for charts (reverse because history is likely newest first)
        const processedHistory = [...history].reverse().map((m: any) => ({
          date: new Date(m.date_recorded).toLocaleDateString("en-US", { month: 'short', day: 'numeric' }),
          weight: m.weight,
          bmi: m.bmi,
          bodyFat: m.body_fat_percentage,
          target: 70 // Placeholder for real target from Goal model
        }));

        setMeasurements(processedHistory);
        setStats(measurementStats);

        // Fetch last 7 days of calorie data
        const calData = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split("T")[0];
          try {
            const summary = await summaryAPI.getDailySummary(dateStr);
            calData.push({
              day: date.toLocaleDateString("en-US", { weekday: "short" }),
              calories: summary.total_calories,
              workouts: summary.workouts_count
            });
          } catch (e) {
            calData.push({
              day: date.toLocaleDateString("en-US", { weekday: "short" }),
              calories: 0,
              workouts: 0
            });
          }
        }
        setWeeklyCalories(calData);

      } catch (err) {
        console.error("Failed to fetch progress data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const weightLost30d = (stats?.weight_change_30d || 0);
  const weightLostTotal = (stats?.weight_change_total || 0);
  const weightLostRecent = (stats?.weight_change_recent || 0);

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
      <div className="mb-8 font-poppins">
        <h1 className="text-3xl font-bold mb-2 text-foreground tracking-tight">
          Progress Tracking
        </h1>
        <p className="text-muted-foreground">
          Your fitness journey transformation in data
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-card border-border shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">
                  {Math.abs(weightLost30d).toFixed(1)}kg
                </div>
                <div className="text-[10px] text-muted-foreground font-bold uppercase">
                  {weightLost30d <= 0 ? "Lost (Last 30 days)" : "Gained (Last 30 days)"}
                </div>
                <div className="text-[10px] text-primary font-medium">
                  {Math.abs(weightLostTotal).toFixed(1)}kg {weightLostTotal <= 0 ? "Total Loss" : "Total Gain"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">
                  {measurements[measurements.length - 1]?.weight || 'N/A'}kg
                </div>
                <div className="text-sm text-muted-foreground font-medium">Current Weight</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{stats?.total_measurements || 0}</div>
                <div className="text-sm text-muted-foreground font-medium">
                  Check-ins
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{stats?.current_streak || 0}d</div>
                <div className="text-sm text-muted-foreground font-medium">
                  Recent Consistency
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="weight" className="mb-8">
        <TabsList className="bg-secondary/50 p-1 mb-6 rounded-xl">
          <TabsTrigger value="weight" className="rounded-lg px-6">Weight History</TabsTrigger>
          <TabsTrigger value="activity" className="rounded-lg px-6">Calorie Intake</TabsTrigger>
          <TabsTrigger value="body" className="rounded-lg px-6">Calculated Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="weight">
          <Card className="bg-card border-border shadow-md">
            <CardHeader>
              <CardTitle className="text-foreground">Weight Tracking</CardTitle>
              <p className="text-sm text-muted-foreground">
                Trend of weight measurements over the last 30 entries
              </p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={380}>
                <LineChart data={measurements}>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} vertical={false} />
                  <XAxis dataKey="date" stroke={colors.text} axisLine={false} tickLine={false} />
                  <YAxis stroke={colors.text} axisLine={false} tickLine={false} domain={['dataMin - 1', 'dataMax + 1']} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: colors.background,
                      border: `1px solid ${colors.border}`,
                      borderRadius: "12px",
                      boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)"
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke={colors.primary}
                    strokeWidth={4}
                    dot={{ fill: colors.primary, r: 6, strokeWidth: 2, stroke: "#fff" }}
                    activeDot={{ r: 8 }}
                    name="Weight (kg)"
                    animationDuration={1500}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-card border-border shadow-md">
              <CardHeader>
                <CardTitle className="text-foreground">Daily Calorie Consumption</CardTitle>
                <p className="text-sm text-muted-foreground">Last 7 days energy intake</p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={weeklyCalories}>
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} vertical={false} />
                    <XAxis dataKey="day" stroke={colors.text} axisLine={false} tickLine={false} />
                    <YAxis stroke={colors.text} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: colors.background,
                        border: `1px solid ${colors.border}`,
                        borderRadius: "12px",
                      }}
                    />
                    <Bar
                      dataKey="calories"
                      fill={colors.primary}
                      radius={[6, 6, 0, 0]}
                      name="Calories"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-card border-border shadow-md">
              <CardHeader>
                <CardTitle className="text-foreground">Workout Frequency</CardTitle>
                <p className="text-sm text-muted-foreground">Sessions recorded per day</p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={weeklyCalories}>
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} vertical={false} />
                    <XAxis dataKey="day" stroke={colors.text} axisLine={false} tickLine={false} />
                    <YAxis stroke={colors.text} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: colors.background,
                        border: `1px solid ${colors.border}`,
                        borderRadius: "12px",
                      }}
                    />
                    <Line
                      type="stepAfter"
                      dataKey="workouts"
                      stroke="#f97316"
                      strokeWidth={3}
                      dot={{ fill: "#f97316", r: 4 }}
                      name="Workouts"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="body">
          <Card className="bg-card border-border shadow-md">
            <CardHeader>
              <CardTitle className="text-foreground">Body Composition Analysis</CardTitle>
              <p className="text-sm text-muted-foreground">BMI and Body Fat % trends</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={380}>
                <LineChart data={measurements}>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} vertical={false} />
                  <XAxis dataKey="date" stroke={colors.text} />
                  <YAxis yAxisId="left" stroke={colors.text} domain={['dataMin - 1', 'dataMax + 1']} />
                  <YAxis yAxisId="right" orientation="right" stroke={colors.text} domain={['dataMin - 1', 'dataMax + 1']} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: colors.background,
                      border: `1px solid ${colors.border}`,
                      borderRadius: "12px",
                    }}
                  />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="bmi"
                    stroke="#8b5cf6"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    name="BMI"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="bodyFat"
                    stroke="#ec4899"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    name="Body Fat %"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Simple Information Banner */}
      <Card className="bg-primary/5 border-primary/10 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 blur-3xl" />
        <CardContent className="p-8 flex flex-col md:flex-row items-center gap-6">
          <div className="text-4xl">🚀</div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-foreground mb-1">Consistency is Key!</h3>
            <p className="text-muted-foreground max-w-2xl">
              You've recorded {stats?.total_measurements || 0} measurements since joining.
              Every data point helps our AI model better understand your unique biology to provide more accurate recommendations.
            </p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20"
          >
            Back to Dashboard
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
