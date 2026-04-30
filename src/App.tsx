import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "./pages/NotFound.tsx";
import { AuthProvider } from "@/contexts/AuthContext";
import AuthPage from "./pages/Auth";
import AppLayout from "@/components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import StartupsPage from "./pages/Startups";
import StartupDetail from "./pages/StartupDetail";
import Placeholder from "./pages/Placeholder";
import MarketMap from "./pages/MarketMap";
import Segments from "./pages/Segments";
import Notes from "./pages/Notes";
import SocialSourcing from "./pages/SocialSourcing";
import Settings from "./pages/Settings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route element={<AppLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/startups" element={<StartupsPage />} />
              <Route path="/startups/:id" element={<StartupDetail />} />
              <Route path="/inbox" element={<Notes />} />
              <Route path="/market-map" element={<MarketMap />} />
              <Route path="/segments" element={<Segments />} />
              <Route path="/notes" element={<Navigate to="/inbox" replace />} />
              <Route path="/social-sourcing" element={<SocialSourcing />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
