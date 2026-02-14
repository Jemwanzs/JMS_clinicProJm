import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import AppLayout from "@/components/AppLayout";
import Dashboard from "@/pages/Dashboard";
import PatientList from "@/pages/PatientList";
import PatientRegister from "@/pages/PatientRegister";
import Visits from "@/pages/Visits";
import Vitals from "@/pages/Vitals";
import Prescriptions from "@/pages/Prescriptions";
import Laboratory from "@/pages/Laboratory";
import Billing from "@/pages/Billing";
import Reports from "@/pages/Reports";
import Documents from "@/pages/Documents";
import AuditLog from "@/pages/AuditLog";
import Assets from "@/pages/Assets";
import Settings from "@/pages/Settings";
import OrganizationSettings from "@/pages/settings/OrganizationSettings";
import BrandingSettings from "@/pages/settings/BrandingSettings";
import MasterListSettings from "@/pages/settings/MasterListSettings";
import RolesSettings from "@/pages/settings/RolesSettings";
import UsersSettings from "@/pages/settings/UsersSettings";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-primary/30 border-t-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  if (isAuthenticated) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
      <Route
        path="*"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/patients" element={<PatientList />} />
                <Route path="/patients/register" element={<PatientRegister />} />
                <Route path="/visits" element={<Visits />} />
                <Route path="/vitals" element={<Vitals />} />
                <Route path="/prescriptions" element={<Prescriptions />} />
                <Route path="/laboratory" element={<Laboratory />} />
                <Route path="/billing" element={<Billing />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/documents" element={<Documents />} />
                <Route path="/audit" element={<AuditLog />} />
                <Route path="/assets" element={<Assets />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/settings/organization" element={<OrganizationSettings />} />
                <Route path="/settings/branding" element={<BrandingSettings />} />
                <Route path="/settings/master-lists" element={<MasterListSettings />} />
                <Route path="/settings/roles" element={<RolesSettings />} />
                <Route path="/settings/users" element={<UsersSettings />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AppLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
