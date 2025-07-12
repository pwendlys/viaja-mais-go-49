
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminAccessButton from "./components/admin/AdminAccessButton";
import AdminDashboard from "./pages/admin/AdminDashboard";
import PaymentManagement from "./pages/admin/PaymentManagement";
import Login from "./pages/auth/Login";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <AdminAccessButton />
        <Routes>
          {/* Redirecionar raiz para login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* Login administrativo */}
          <Route path="/login" element={<Login />} />
          
          {/* Rotas administrativas protegidas */}
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/payments" 
            element={
              <ProtectedRoute>
                <PaymentManagement />
              </ProtectedRoute>
            } 
          />
          
          {/* Redirecionar qualquer outra rota para login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
