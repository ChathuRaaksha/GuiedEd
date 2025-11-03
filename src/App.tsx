import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import StudentOnboarding from "./pages/StudentOnboarding";
import MentorOnboarding from "./pages/MentorOnboarding";
import FacilitatorOnboarding from "./pages/FacilitatorOnboarding";
import Match from "./pages/Match";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/onboarding/student" element={<StudentOnboarding />} />
          <Route path="/onboarding/mentor" element={<MentorOnboarding />} />
          <Route path="/onboarding/facilitator" element={<FacilitatorOnboarding />} />
          <Route path="/match" element={<Match />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
