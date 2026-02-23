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
import { AdminDashboard } from "./pages/admin-dashboard";
import { AdminUserManagement } from "./pages/admin-user-management";
import { AdminCms } from "./pages/admin-cms";
import { ErrorPage } from "./ErrorPage";

export const router = createBrowserRouter([
    {
        path: "/",
        Component: LandingPage,
        errorElement: <ErrorPage />,
    },
    {
        path: "/login",
        Component: LoginPage,
        errorElement: <ErrorPage />,
    },
    {
        path: "/register",
        Component: RegisterPage,
        errorElement: <ErrorPage />,
    },
    {
        path: "/onboarding",
        Component: OnboardingPage,
        errorElement: <ErrorPage />,
    },
    {
        path: "/contact",
        Component: ContactPage,
        errorElement: <ErrorPage />,
    },
    {
        path: "/dashboard",
        Component: DashboardLayout,
        errorElement: <ErrorPage />,
        children: [
            {
                index: true,
                Component: DashboardHome,
            },
            {
                path: "nutrition",
                Component: NutritionPage,
                errorElement: <ErrorPage />,
            },
            {
                path: "workout",
                Component: WorkoutPage,
                errorElement: <ErrorPage />,
            },
            {
                path: "progress",
                Component: ProgressPage,
                errorElement: <ErrorPage />,
            },
            {
                path: "gamification",
                Component: GamificationPage,
                errorElement: <ErrorPage />,
            },
            {
                path: "recommendations",
                Component: RecommendationsPage,
                errorElement: <ErrorPage />,
            },
            {
                path: "settings",
                Component: SettingsPage,
                errorElement: <ErrorPage />,
            },
            {
                path: "admin",
                Component: AdminDashboard,
                errorElement: <ErrorPage />,
            },
            {
                path: "admin/users",
                Component: AdminUserManagement,
                errorElement: <ErrorPage />,
            },
            {
                path: "admin/cms",
                Component: AdminCms,
                errorElement: <ErrorPage />,
            },
            {
                path: "*",
                Component: ErrorPage,
            },
        ],
    },
    // Catch-all route for global 404s
    {
        path: "*",
        Component: ErrorPage,
    }
]);
