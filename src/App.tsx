import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Landing from "./pages/Landing";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import StudentOnboarding from "./pages/StudentOnboarding";
import MentorOnboarding from "./pages/MentorOnboarding";
import FacilitatorOnboarding from "./pages/FacilitatorOnboarding";
import Match from "./pages/Match";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<Register />} />
            <Route
              path="/onboarding/student"
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <StudentOnboarding />
                </ProtectedRoute>
              }
            />
            <Route
              path="/onboarding/mentor"
              element={
                <ProtectedRoute allowedRoles={['MENTOR']}>
                  <MentorOnboarding />
                </ProtectedRoute>
              }
            />
            <Route
              path="/onboarding/facilitator"
              element={
                <ProtectedRoute allowedRoles={['FACILITATOR']}>
                  <FacilitatorOnboarding />
                </ProtectedRoute>
              }
            />
            <Route
              path="/match"
              element={
                <ProtectedRoute>
                  <Match />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <Admin />
                </ProtectedRoute>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
