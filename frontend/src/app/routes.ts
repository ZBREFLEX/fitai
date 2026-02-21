import { createBrowserRouter } from "react-router";
import { LandingPage } from "./pages/landing-page";
import { LoginPage } from "./pages/login-page";
import { RegisterPage } from "./pages/register-page";
import { OnboardingPage } from "./pages/onboarding-page";
import { DashboardLayout } from "./pages/dashboard-layout";
import { DashboardHome } from "./pages/dashboard-home";
import { NutritionPage } from "./pages/nutrition-page";
import { WorkoutPage } from "./pages/workout-page";
import { ProgressPage } from "./pages/progress-page";
import { GamificationPage } from "./pages/gamification-page";
import { ContactPage } from "./pages/contact-page";
import { RecommendationsPage } from "./pages/recommendations-page";
import { SettingsPage } from "./pages/settings-page";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LandingPage,
  },
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/register",
    Component: RegisterPage,
  },
  {
    path: "/onboarding",
    Component: OnboardingPage,
  },
  {
    path: "/contact",
    Component: ContactPage,
  },
  {
    path: "/dashboard",
    Component: DashboardLayout,
    children: [
      {
        index: true,
        Component: DashboardHome,
      },
      {
        path: "nutrition",
        Component: NutritionPage,
      },
      {
        path: "workout",
        Component: WorkoutPage,
      },
      {
        path: "progress",
        Component: ProgressPage,
      },
      {
        path: "gamification",
        Component: GamificationPage,
      },
      {
        path: "recommendations",
        Component: RecommendationsPage,
      },
      {
        path: "settings",
        Component: SettingsPage,
      },
    ],
  },
]);
