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
import { TrendingDown, TrendingUp, Calendar, Target } from "lucide-react";
import { useTheme } from "../contexts/theme-context";

const weightData = [
  { week: "Week 1", weight: 72, target: 70 },
  { week: "Week 2", weight: 71.5, target: 70 },
  { week: "Week 3", weight: 71.2, target: 70 },
  { week: "Week 4", weight: 70.8, target: 70 },
  { week: "Week 5", weight: 70.5, target: 70 },
  { week: "Week 6", weight: 70.2, target: 70 },
  { week: "Week 7", weight: 70.0, target: 70 },
  { week: "Week 8", weight: 69.8, target: 70 },
];

const activityData = [
  { week: "Week 1", workouts: 4, calories: 1850 },
  { week: "Week 2", workouts: 5, calories: 1920 },
  { week: "Week 3", workouts: 5, calories: 1880 },
  { week: "Week 4", workouts: 6, calories: 1950 },
  { week: "Week 5", workouts: 5, calories: 1900 },
  { week: "Week 6", workouts: 6, calories: 1980 },
  { week: "Week 7", workouts: 5, calories: 1940 },
  { week: "Week 8", workouts: 7, calories: 2000 },
];

const bodyMetricsData = [
  { week: "Week 1", bmi: 23.5, bodyFat: 18.5 },
  { week: "Week 2", bmi: 23.3, bodyFat: 18.2 },
  { week: "Week 3", bmi: 23.2, bodyFat: 18.0 },
  { week: "Week 4", bmi: 23.0, bodyFat: 17.8 },
  { week: "Week 5", bmi: 22.9, bodyFat: 17.5 },
  { week: "Week 6", bmi: 22.8, bodyFat: 17.3 },
  { week: "Week 7", bmi: 22.7, bodyFat: 17.0 },
  { week: "Week 8", bmi: 22.6, bodyFat: 16.8 },
];

const milestones = [
  {
    date: "2026-01-15",
    title: "Started Journey",
    description: "Began fitness program",
  },
  {
    date: "2026-01-22",
    title: "First Week Complete",
    description: "Completed all 5 workouts",
  },
  {
    date: "2026-02-01",
    title: "Lost 1kg",
    description: "First weight milestone achieved",
  },
  {
    date: "2026-02-10",
    title: "Consistency Streak",
    description: "14 days of hitting calorie goals",
  },
  {
    date: "2026-02-17",
    title: "Target Weight",
    description: "Reached 70kg goal weight",
  },
];

export function ProgressPage() {
  const { theme } = useTheme();

  const currentWeight = 69.8;
  const startWeight = 72;
  const targetWeight = 70;
  const weightLost = startWeight - currentWeight;
  const weightToGo = currentWeight - targetWeight;

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
          Progress Tracking
        </h1>
        <p className="text-muted-foreground">
          Monitor your fitness journey with data-driven insights
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-foreground" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">
                  -{weightLost.toFixed(1)}kg
                </div>
                <div className="text-sm text-muted-foreground">Weight Lost</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-foreground" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">
                  {Math.abs(weightToGo).toFixed(1)}kg
                </div>
                <div className="text-sm text-muted-foreground">
                  {weightToGo > 0 ? "Above Target" : "Below Target"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-foreground" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">8</div>
                <div className="text-sm text-muted-foreground">
                  Weeks Active
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-foreground" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">97%</div>
                <div className="text-sm text-muted-foreground">
                  Goal Achievement
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="weight" className="mb-8">
        <TabsList className="bg-muted mb-6">
          <TabsTrigger value="weight">Weight Progress</TabsTrigger>
          <TabsTrigger value="activity">Activity Metrics</TabsTrigger>
          <TabsTrigger value="body">Body Composition</TabsTrigger>
        </TabsList>

        <TabsContent value="weight">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Weight Tracking</CardTitle>
              <p className="text-sm text-muted-foreground">
                Weekly weight measurements vs target goal
              </p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={weightData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
                  <XAxis dataKey="week" stroke={colors.text} />
                  <YAxis stroke={colors.text} domain={[68, 73]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: colors.background,
                      border: `1px solid ${colors.border}`,
                      borderRadius: "8px",
                      color: colors.tooltipText,
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke={colors.primary}
                    strokeWidth={3}
                    dot={{ fill: colors.primary, r: 5 }}
                    name="Current Weight"
                  />
                  <Line
                    type="monotone"
                    dataKey="target"
                    stroke={colors.secondary}
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ fill: colors.secondary, r: 4 }}
                    name="Target Weight"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">
                  Weekly Workouts
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Number of training sessions per week
                </p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={activityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
                    <XAxis dataKey="week" stroke={colors.text} />
                    <YAxis stroke={colors.text} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: colors.background,
                        border: `1px solid ${colors.border}`,
                        borderRadius: "8px",
                        color: colors.tooltipText,
                      }}
                    />
                    <Bar
                      dataKey="workouts"
                      fill={colors.primary}
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">
                  Average Daily Calories
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Calorie consumption trends
                </p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={activityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
                    <XAxis dataKey="week" stroke={colors.text} />
                    <YAxis stroke={colors.text} domain={[1800, 2050]} />
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
                      strokeWidth={3}
                      dot={{ fill: colors.primary, r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="body">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">
                Body Composition Analysis
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                BMI and body fat percentage over time
              </p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={bodyMetricsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
                  <XAxis dataKey="week" stroke={colors.text} />
                  <YAxis
                    yAxisId="left"
                    stroke={colors.text}
                    domain={[22, 24]}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke={colors.text}
                    domain={[16, 19]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: colors.background,
                      border: `1px solid ${colors.border}`,
                      borderRadius: "8px",
                      color: colors.tooltipText,
                    }}
                  />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="bmi"
                    stroke={colors.primary}
                    strokeWidth={3}
                    dot={{ fill: colors.primary, r: 5 }}
                    name="BMI"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="bodyFat"
                    stroke={colors.secondary}
                    strokeWidth={3}
                    dot={{ fill: colors.secondary, r: 5 }}
                    name="Body Fat %"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Milestones */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Journey Milestones</CardTitle>
          <p className="text-sm text-muted-foreground">
            Key achievements along your fitness path
          </p>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />

            <div className="space-y-6">
              {milestones.map((milestone, index) => (
                <div key={index} className="relative pl-14">
                  {/* Dot */}
                  <div className="absolute left-4 top-1 w-5 h-5 bg-background rounded-full border-4 border-primary" />

                  <div className="bg-muted/50 border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-foreground">
                        {milestone.title}
                      </h4>
                      <span className="text-sm text-muted-foreground">
                        {milestone.date}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {milestone.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
