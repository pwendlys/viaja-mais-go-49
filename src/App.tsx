
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import UserDashboard from "./pages/user/UserDashboard";
import DriverDashboard from "./pages/driver/DriverDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import RideHistory from "./pages/user/RideHistory";
import PaymentMethods from "./pages/user/PaymentMethods";
import DriverProfile from "./pages/driver/DriverProfile";
import VehicleManagement from "./pages/driver/VehicleManagement";
import EarningsReport from "./pages/driver/EarningsReport";
import UserManagement from "./pages/admin/UserManagement";
import DriverManagement from "./pages/admin/DriverManagement";
import RideManagement from "./pages/admin/RideManagement";
import AnalyticsDashboard from "./pages/admin/AnalyticsDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* User Routes */}
          <Route path="/user/dashboard" element={<UserDashboard />} />
          <Route path="/user/history" element={<RideHistory />} />
          <Route path="/user/payment" element={<PaymentMethods />} />
          
          {/* Driver Routes */}
          <Route path="/driver/dashboard" element={<DriverDashboard />} />
          <Route path="/driver/profile" element={<DriverProfile />} />
          <Route path="/driver/vehicles" element={<VehicleManagement />} />
          <Route path="/driver/earnings" element={<EarningsReport />} />
          
          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/drivers" element={<DriverManagement />} />
          <Route path="/admin/rides" element={<RideManagement />} />
          <Route path="/admin/analytics" element={<AnalyticsDashboard />} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
