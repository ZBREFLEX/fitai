import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";

import Landing from "./pages/Landing";
import About from "./pages/About";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import ProfileSetup from "./pages/modules/ProfileSetup";

import BodyComposition from "./pages/modules/BodyComposition";
import CalorieEstimation from "./pages/modules/CalorieEstimation";
import NutritionRecommendation from "./pages/modules/NutritionRecommendation";
import FitnessGuidance from "./pages/modules/FitnessGuidance";
import ProgressTracking from "./pages/modules/ProgressTracking";
import Gamification from "./pages/modules/Gamification";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/about" element={<About />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/profile-setup" element={<ProfileSetup />} />

        <Route path="/body-composition" element={<BodyComposition />} />
        <Route path="/calorie-estimation" element={<CalorieEstimation />} />
        <Route path="/nutrition" element={<NutritionRecommendation />} />
        <Route path="/fitness-guidance" element={<FitnessGuidance />} />
        <Route path="/progress-tracking" element={<ProgressTracking />} />
        <Route path="/gamification" element={<Gamification />} />
      </Routes>
    </BrowserRouter>
  );
}
