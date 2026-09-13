import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/tpcL.jpg";
import {
  Menu,
  X,
  LogOut,
  Home,
  User,
  GraduationCap,
  UserCheck,
  CalendarDays,
  BarChart3,
  Megaphone,
} from "lucide-react";
import api from "../services/api";
import UserAvatar from "../components/shared/UserAvatar";

export default function DepartmentHeadLayout({ children }) {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const [departmentHeadName, setDepartmentHeadName] = useState(
    localStorage.getItem("userName") || "Department Head",
  );
  const [departmentHeadEmail, setDepartmentHeadEmail] = useState(
    localStorage.getItem("userEmail") || "",
  );
  const [departmentHeadAvatar, setDepartmentHeadAvatar] = useState(
    localStorage.getItem("userAvatar") || "",
  );
  const [departmentHeadDept, setDepartmentHeadDept] = useState(
    localStorage.getItem("userDepartmentName") || "",
  );

  useEffect(() => {
    const syncUser = () => {
      const storedName = localStorage.getItem("userName");
      const storedEmail = localStorage.getItem("userEmail");
      const storedAvatar = localStorage.getItem("userAvatar");
      const storedDept = localStorage.getItem("userDepartmentName");

      if (storedName) setDepartmentHeadName(storedName);
      if (storedEmail !== null) setDepartmentHeadEmail(storedEmail || "");
      if (storedAvatar !== null) setDepartmentHeadAvatar(storedAvatar || "");
      if (storedDept !== null) setDepartmentHeadDept(storedDept || "");
    };

    syncUser();
    window.addEventListener("user-profile-updated", syncUser);
    window.addEventListener("storage", syncUser);

    return () => {
      window.removeEventListener("user-profile-updated", syncUser);
      window.removeEventListener("storage", syncUser);
    };
  }, []);

  const handleLogout = async () => {
    try {
      setLogoutLoading(true);
      await api.post("/auth/logout");
      localStorage.removeItem("token");
      localStorage.removeItem("userRole");
      localStorage.removeItem("userName");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userAvatar");
      navigate("/welcome", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setLogoutLoading(false);
    }
  };

  const handleSidebarToggle = () => {
    if (window.innerWidth < 850) {
      setMobileMenuOpen(false);
      return;
    }

    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-white text-gray-900 font-sans">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "min-[850px]:w-[280px]" : "min-[850px]:w-20"
        } fixed inset-y-0 left-0 z-50 flex w-[280px] ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } flex-col bg-tpc-greenDeep border-r border-white/10 px-3 py-6 transition-all duration-300 min-[850px]:static min-[850px]:translate-x-0`}
      >
        {/* Logo */}
        <div className="px-3 pb-5 border-b border-white/20">
          <div
            className={`flex items-center gap-2.5 ${!sidebarOpen && "justify-center"}`}
          >
            {/* Circular logo */}
            <img
              src={logo}
              alt="Talibon Polytechnic College seal"
              className="h-12 w-12 rounded-full border-2 border-tpc-gold object-cover shadow-md md:h-12 md:w-12"
            />
            {sidebarOpen && (
              <span className="text-white text-base font-bold tracking-tight whitespace-nowrap">
                Department Head
              </span>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col gap-1 py-5">
          <NavLink
            to="/department-head/dashboard"
            icon={<Home className="w-5 h-5" />}
            label="Dashboard"
            sidebarOpen={sidebarOpen}
          />
          <NavLink
            to="/department-head/graduates"
            icon={<GraduationCap className="w-5 h-5" />}
            label="Graduates"
            sidebarOpen={sidebarOpen}
          />

          <NavLink
            to="/department-head/alumni"
            icon={<UserCheck className="w-5 h-5" />}
            label="Alumni"
            sidebarOpen={sidebarOpen}
          />
          <NavLink
            to="/department-head/events"
            icon={<CalendarDays className="w-5 h-5" />}
            label="Events"
            sidebarOpen={sidebarOpen}
          />
          <NavLink
            to="/department-head/announcements"
            icon={<Megaphone className="w-5 h-5" />}
            label="Announcements"
            sidebarOpen={sidebarOpen}
          />
          <NavLink
            to="/department-head/analytics"
            icon={<BarChart3 className="w-5 h-5" />}
            label="Analytics"
            sidebarOpen={sidebarOpen}
          />
          <NavLink
            to="/department-head/profile"
            icon={<User className="w-5 h-5" />}
            label="My Profile"
            sidebarOpen={sidebarOpen}
          />
        </nav>

        {/* User Profile */}
        <div className="border-t border-white/20 pt-4">
          <div
            className={`flex items-center gap-3 ${!sidebarOpen && "justify-center"}`}
          >
            <UserAvatar
              name={departmentHeadName}
              avatar={departmentHeadAvatar}
              size="sm"
            />
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-semibold truncate">
                  {departmentHeadName}
                </p>
                <p className="text-white/60 text-xs truncate">
                  {departmentHeadEmail}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Logout Button */}
        <div className="pt-4 mt-4 border-t border-white/20">
          <button
            onClick={handleLogout}
            disabled={logoutLoading}
            className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-white/10 text-white text-sm font-medium hover:bg-white/20 disabled:opacity-50 transition-colors ${
              !sidebarOpen && "p-2"
            }`}
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && (
              <span>{logoutLoading ? "Logging out..." : "Logout"}</span>
            )}
          </button>
        </div>

        {/* Toggle Sidebar */}
        <button
          onClick={handleSidebarToggle}
          className="flex min-[850px]:flex items-center justify-center h-12 mt-4 border-t border-white/20 text-white/60 hover:bg-white/10 hover:text-white transition-colors"
        >
          {sidebarOpen || mobileMenuOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>
      </aside>

      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 min-[850px]:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="min-[850px]:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-4 ml-auto">
            <span className="text-gray-500 text-sm font-medium">
              Welcome, {departmentHeadName}!
            </span>
            <UserAvatar
              name={departmentHeadName}
              avatar={departmentHeadAvatar}
              size="sm"
              className="bg-tpc-greenDeep"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto bg-white p-6">{children}</div>
      </div>
    </div>
  );
}

function NavLink({ to, icon, label, sidebarOpen }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <button
      onClick={() => navigate(to)}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        isActive
          ? "bg-white/20 text-white"
          : "text-white/70 hover:bg-white/10 hover:text-white"
      }`}
    >
      {icon}
      {sidebarOpen && <span>{label}</span>}
    </button>
  );
}
