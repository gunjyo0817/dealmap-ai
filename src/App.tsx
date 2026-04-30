import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
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
              <Route path="/inbox" element={<Placeholder title="Deal Inbox" description="Triage imported notes and CRM records before they become startup profiles." />} />
              <Route path="/market-map" element={<Placeholder title="Market Map" description="Visual board, table, and opportunity matrix views across all your segments." />} />
              <Route path="/segments" element={<Placeholder title="Segments" description="Manage market categories, opportunity scores, and white-space gaps." />} />
              <Route path="/notes" element={<Placeholder title="Notes" description="Persistent library of every note across your deal flow." />} />
              <Route path="/insights" element={<Placeholder title="Insights" description="Saved AI insights with confidence and recommended actions." />} />
              <Route path="/settings" element={<Placeholder title="Settings" description="Workspace and account preferences." />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
