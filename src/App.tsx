import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { CoachingDirectory, CoachProfile, CoachMatching, WhyCoaching } from "./pages/coaching";
import { BusinessHome, SportOfBusiness, LeadershipCircles, Workshops, Diagnostics } from "./pages/business";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          {/* B2C Routes */}
          <Route path="/coaching" element={<CoachingDirectory />} />
          <Route path="/coaching/:coachId" element={<CoachProfile />} />
          <Route path="/coaching/matching" element={<CoachMatching />} />
          <Route path="/coaching/why" element={<WhyCoaching />} />
          {/* B2B Routes */}
          <Route path="/business" element={<BusinessHome />} />
          <Route path="/business/sport-of-business" element={<SportOfBusiness />} />
          <Route path="/business/leadership-circles" element={<LeadershipCircles />} />
          <Route path="/business/workshops" element={<Workshops />} />
          <Route path="/business/diagnostics" element={<Diagnostics />} />
          {/* Other Routes */}
          <Route path="/compass" element={<NotFound />} />
          <Route path="/labs" element={<NotFound />} />
          <Route path="/apply" element={<NotFound />} />
          <Route path="/about" element={<NotFound />} />
          <Route path="/contact" element={<NotFound />} />
          <Route path="/login" element={<NotFound />} />
          <Route path="/signup" element={<NotFound />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
