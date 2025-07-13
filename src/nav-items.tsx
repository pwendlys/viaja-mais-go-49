
import { HomeIcon, Car, Users, Settings, BarChart3, User, History, CreditCard, MapPin, LogIn, UserPlus } from "lucide-react";
import Index from "./pages/Index";
import Login from "./pages/auth/Login";
import PatientRegister from "./pages/auth/PatientRegister";
import DriverRegister from "./pages/auth/DriverRegister";
import UserDashboard from "./pages/user/UserDashboard";
import DriverDashboard from "./pages/driver/DriverDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import RideHistory from "./pages/user/RideHistory";
import PersonalSettings from "./pages/user/PersonalSettings";
import PaymentMethods from "./pages/user/PaymentMethods";
import DriverProfile from "./pages/driver/DriverProfile";
import EarningsReport from "./pages/driver/EarningsReport";
import VehicleManagement from "./pages/driver/VehicleManagement";
import NotFound from "./pages/NotFound";

export const navItems = [
  {
    title: "Home",
    to: "/",
    icon: <HomeIcon className="h-4 w-4" />,
    page: <Index />,
  },
  {
    title: "Login",
    to: "/login",
    icon: <LogIn className="h-4 w-4" />,
    page: <Login />,
  },
  {
    title: "Cadastro Paciente",
    to: "/auth/register/patient",
    icon: <UserPlus className="h-4 w-4" />,
    page: <PatientRegister />,
  },
  {
    title: "Cadastro Motorista",
    to: "/auth/register/driver",
    icon: <Car className="h-4 w-4" />,
    page: <DriverRegister />,
  },
  {
    title: "Dashboard do Usuário",
    to: "/user/dashboard",
    icon: <User className="h-4 w-4" />,
    page: <UserDashboard />,
  },
  {
    title: "Histórico de Viagens",
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
  {
    title: "Métodos de Pagamento",
    to: "/user/payments",
    icon: <CreditCard className="h-4 w-4" />,
    page: <PaymentMethods />,
  },
  {
    title: "Dashboard do Motorista",
    to: "/driver/dashboard",
    icon: <Car className="h-4 w-4" />,
    page: <DriverDashboard />,
  },
  {
    title: "Perfil do Motorista",
    to: "/driver/profile",
    icon: <User className="h-4 w-4" />,
    page: <DriverProfile />,
  },
  {
    title: "Relatório de Ganhos",
    to: "/driver/earnings",
    icon: <BarChart3 className="h-4 w-4" />,
    page: <EarningsReport />,
  },
  {
    title: "Gerenciar Veículo",
    to: "/driver/vehicle",
    icon: <Car className="h-4 w-4" />,
    page: <VehicleManagement />,
  },
  {
    title: "Dashboard Admin",
    to: "/admin/dashboard",
    icon: <Settings className="h-4 w-4" />,
    page: <AdminDashboard />,
  },
  {
    title: "Página Não Encontrada",
    to: "*",
    icon: <HomeIcon className="h-4 w-4" />,
    page: <NotFound />,
  },
];
