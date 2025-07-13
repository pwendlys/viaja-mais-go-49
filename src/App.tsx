
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { navItems } from "./nav-items";
import AdminAccessButton from "./components/admin/AdminAccessButton";
import AdminDashboard from "./pages/admin/AdminDashboard";
import PaymentManagement from "./pages/admin/PaymentManagement";
import Login from "./pages/auth/Login";
import PatientRegister from "./pages/auth/PatientRegister";
import DriverRegister from "./pages/auth/DriverRegister";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <AdminAccessButton />
        <Routes>
          {navItems.map(({ to, page }) => (
            <Route key={to} path={to} element={page} />
          ))}
          <Route path="/login" element={<Login />} />
          <Route path="/auth/register/patient" element={<PatientRegister />} />
          <Route path="/auth/register/driver" element={<DriverRegister />} />
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute requiredUserType="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/payments" 
            element={
              <ProtectedRoute requiredUserType="admin">
                <PaymentManagement />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
