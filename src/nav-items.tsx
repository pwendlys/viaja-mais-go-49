
import { HomeIcon, Users, Car, BarChart3, Settings, User, History, UserCog, DollarSign } from "lucide-react";
import Index from "./pages/Index";
import UserDashboard from "./pages/user/UserDashboard";
import RideHistory from "./pages/user/RideHistory";
import PersonalSettings from "./pages/user/PersonalSettings";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserManagement from "./pages/admin/UserManagement";
import DriverManagement from "./pages/admin/DriverManagement";
import RideManagement from "./pages/admin/RideManagement";
import AnalyticsDashboard from "./pages/admin/AnalyticsDashboard";
import PricingConfig from "./pages/admin/PricingConfig";
import DriverDashboard from "./pages/driver/DriverDashboard";
import DriverProfile from "./pages/driver/DriverProfile";
import VehicleManagement from "./pages/driver/VehicleManagement";
import EarningsReport from "./pages/driver/EarningsReport";

export const navItems = [
  {
    title: "Home",
    to: "/",
    icon: <HomeIcon className="h-4 w-4" />,
    page: <Index />,
  },
  // User Routes
  {
    title: "Dashboard do Usuário",
    to: "/user/dashboard",
    icon: <User className="h-4 w-4" />,
    page: <UserDashboard />,
  },
  {
    title: "Histórico de Transportes",
    to: "/user/history",
    icon: <History className="h-4 w-4" />,
    page: <RideHistory />,
  },
  {
    title: "Configurações Pessoais",
    to: "/user/settings",
    icon: <Settings className="h-4 w-4" />,
    page: <PersonalSettings />,
  },
  // Admin Routes
  {
    title: "Dashboard Admin",
    to: "/admin/dashboard",
    icon: <BarChart3 className="h-4 w-4" />,
    page: <AdminDashboard />,
  },
  {
    title: "Gerenciar Usuários",
    to: "/admin/users",
    icon: <Users className="h-4 w-4" />,
    page: <UserManagement />,
  },
  {
    title: "Gerenciar Motoristas",
    to: "/admin/drivers",
    icon: <Car className="h-4 w-4" />,
    page: <DriverManagement />,
  },
  {
    title: "Gerenciar Corridas",
    to: "/admin/rides",
    icon: <Car className="h-4 w-4" />,
    page: <RideManagement />,
  },
  {
    title: "Relatórios",
    to: "/admin/analytics",
    icon: <BarChart3 className="h-4 w-4" />,
    page: <AnalyticsDashboard />,
  },
  {
    title: "Configuração de Preços",
    to: "/admin/pricing",
    icon: <DollarSign className="h-4 w-4" />,
    page: <PricingConfig />,
  },
  // Driver Routes
  {
    title: "Dashboard do Motorista",
    to: "/driver/dashboard",
    icon: <Car className="h-4 w-4" />,
    page: <DriverDashboard />,
  },
  {
    title: "Perfil do Motorista",
    to: "/driver/profile",
    icon: <UserCog className="h-4 w-4" />,
    page: <DriverProfile />,
  },
  {
    title: "Gerenciar Veículo",
    to: "/driver/vehicle",
    icon: <Car className="h-4 w-4" />,
    page: <VehicleManagement />,
  },
  {
    title: "Relatório de Ganhos",
    to: "/driver/earnings",
    icon: <DollarSign className="h-4 w-4" />,
    page: <EarningsReport />,
  },
];
