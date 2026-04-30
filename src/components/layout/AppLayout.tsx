import { Outlet, Navigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { TopBar } from "./TopBar";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { seedDemoDataIfEmpty } from "@/lib/seed-data";
import { toast } from "sonner";

export default function AppLayout() {
  const { user, loading } = useAuth();
  const [seeded, setSeeded] = useState(false);

  useEffect(() => {
    if (!user || seeded) return;
    seedDemoDataIfEmpty(user.id)
      .then((didSeed) => {
        setSeeded(true);
        if (didSeed) toast.success("Demo workspace ready", { description: "Loaded 8 startups, 6 segments, and AI insights." });
      })
      .catch((e) => {
        console.error(e);
        toast.error("Could not load demo data");
      });
  }, [user, seeded]);

  if (loading) {
    return <div className="flex h-screen items-center justify-center text-sm text-muted-foreground">Loading workspace…</div>;
  }
  if (!user) return <Navigate to="/auth" replace />;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar />
          <main className="flex-1 min-w-0">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
