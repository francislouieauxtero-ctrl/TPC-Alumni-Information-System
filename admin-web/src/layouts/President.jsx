import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/tpcL.jpg";
import {
  Menu,
  X,
  LogOut,
  Users,
  Building2,
  GraduationCap,
  UserCheck,
  Calendar,
  BarChart3,
  LineChart,
  Megaphone,
  UserCircle,
  XCircle,
  ChevronRight,
} from "lucide-react";
import api from "../services/api";
import UserAvatar from "../components/shared/UserAvatar";

export default function PresidentLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [userName, setUserName] = useState(
    localStorage.getItem("userName") || "User",
  );
  const [userEmail, setUserEmail] = useState(
    localStorage.getItem("userEmail") || "",
  );
  const [userAvatar, setUserAvatar] = useState(
    localStorage.getItem("userAvatar") || "",
  );

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const syncUser = () => {
      const storedName = localStorage.getItem("userName");
      const storedEmail = localStorage.getItem("userEmail");
      const storedAvatar = localStorage.getItem("userAvatar");

      if (storedName) setUserName(storedName);
      if (storedEmail !== null) setUserEmail(storedEmail || "");
      if (storedAvatar !== null) setUserAvatar(storedAvatar || "");
    };

    syncUser();
    window.addEventListener("user-profile-updated", syncUser);
    window.addEventListener("storage", syncUser);

    return () => {
      window.removeEventListener("user-profile-updated", syncUser);
      window.removeEventListener("storage", syncUser);
    };
  }, []);

  const userRole = localStorage.getItem("userRole");
  const roleLabel =
    userRole === "super_admin"
      ? "Alumni President"
      : userRole === "admin"
        ? "Department Head"
        : "Admin";
  const displayName =
    userRole === "super_admin" || userRole === "admin" ? userName : "Admin";

  const handleLogout = async () => {
    try {
      setLogoutLoading(true);
      await api.post("/auth/logout");
      localStorage.clear();
      setTimeout(() => {
        navigate("/welcome", { replace: true });
      }, 100);
    } catch (error) {
      console.error("Logout failed:", error);
      localStorage.clear();
      navigate("/welcome", { replace: true });
    } finally {
      setLogoutLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-white text-gray-900 font-sans">
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm min-[850px]:hidden transition-opacity"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "min-[850px]:w-72" : "min-[850px]:w-20"
        } fixed inset-y-0 left-0 z-50 flex h-screen min-h-screen max-h-screen w-72 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } flex-col bg-tpc-greenDeep border-r border-white/10 px-3 py-3 transition-all duration-300 min-[850px]:static min-[850px]:translate-x-0`}
      >
        {/* Header / Logo */}
        <div className="shrink-0 px-2 pb-3 border-b border-white/20">
          <div
            className={`flex items-center justify-between gap-2.5 ${!sidebarOpen && "justify-center"}`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {/* Circular logo */}
              <img
                src={logo}
                alt="Talibon Polytechnic College seal"
                className="h-10 w-10 rounded-full border-2 border-tpc-gold object-cover shadow-xs shrink-0"
              />
              {(sidebarOpen || mobileMenuOpen) && (
                <span className="text-white text-base font-bold tracking-tight truncate">
                  {roleLabel}
                </span>
              )}
            </div>
            {/* Mobile close button */}
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="min-[850px]:hidden p-1.5 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors shrink-0"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 min-h-0 flex flex-col gap-1 py-2 overflow-y-auto">
          {userRole === "super_admin" && (
            <NavLink
              to="/president/dashboard"
              icon={<BarChart3 className="w-5 h-5 shrink-0" />}
              label="Dashboard"
              sidebarOpen={sidebarOpen}
            />
          )}
          {userRole === "super_admin" && (
            <NavLink
              to="/president/DepartmentHeadManagement"
              icon={<Building2 className="w-5 h-5 shrink-0" />}
              label="Manage Departments"
              sidebarOpen={sidebarOpen}
            />
          )}
          {userRole === "super_admin" && (
            <NavLink
              to="/president/students"
              icon={<Users className="w-5 h-5 shrink-0" />}
              label="Registered Alumni"
              sidebarOpen={sidebarOpen}
            />
          )}
          {userRole === "super_admin" && (
            <NavLink
              to="/president/graduates"
              icon={<GraduationCap className="w-5 h-5 shrink-0" />}
              label="View Graduates"
              sidebarOpen={sidebarOpen}
            />
          )}
          {userRole === "super_admin" && (
            <NavLink
              to="/president/events"
              icon={<Calendar className="w-5 h-5 shrink-0" />}
              label="Events"
              sidebarOpen={sidebarOpen}
            />
          )}
          {userRole === "super_admin" && (
            <NavLink
              to="/president/announcements"
              icon={<Megaphone className="w-5 h-5 shrink-0" />}
              label="Announcements"
              sidebarOpen={sidebarOpen}
            />
          )}
          {userRole === "super_admin" && (
            <NavLink
              to="/president/analytics"
              icon={<LineChart className="w-5 h-5 shrink-0" />}
              label="Analytics"
              sidebarOpen={sidebarOpen}
            />
          )}
          {userRole === "super_admin" && (
            <NavLink
              to="/president/profile"
              icon={<UserCircle className="w-5 h-5 shrink-0" />}
              label="My Profile"
              sidebarOpen={sidebarOpen}
            />
          )}
        </nav>

        {/* Footer: Profile + Logout + Toggle */}
        <div className="shrink-0 mt-auto border-t border-white/20 pt-2 flex flex-col gap-1.5">
          {/* User Profile */}
          <div
            className={`flex items-center gap-2.5 px-1 py-1 ${!sidebarOpen && "justify-center"}`}
          >
            <UserAvatar name={displayName} avatar={userAvatar} size="sm" />
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-semibold truncate">
                  {displayName}
                </p>
                <p className="text-white/60 text-xs truncate">{userEmail}</p>
              </div>
            )}
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            disabled={logoutLoading}
            title={!sidebarOpen ? "Logout" : undefined}
            className={`w-full flex items-center justify-center gap-2 rounded-lg bg-white/10 text-white text-xs font-medium hover:bg-white/20 disabled:opacity-50 transition-colors ${
              sidebarOpen ? "px-3 py-2" : "p-2"
            }`}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {sidebarOpen && (
              <span>{logoutLoading ? "Logging out..." : "Logout"}</span>
            )}
          </button>

          {/* Toggle Sidebar (Desktop) */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            className="hidden min-[850px]:flex items-center justify-center h-8 rounded-lg text-white/60 hover:bg-white/10 hover:text-white transition-colors w-full"
            aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {sidebarOpen ? (
              <X className="w-4 h-4" />
            ) : (
              <Menu className="w-4 h-4" />
            )}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-3 py-2.5 sm:px-6 sm:py-4 flex items-center justify-between">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="min-[850px]:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            aria-label="Open mobile menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-3 sm:gap-4 ml-auto min-w-0">
            <span className="text-gray-600 text-xs sm:text-sm font-medium truncate max-w-[140px] sm:max-w-none">
              Welcome back, {userName}!
            </span>
            <UserAvatar
              name={displayName}
              avatar={userAvatar}
              size="sm"
              className="bg-tpc-greenDeep shrink-0"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto bg-slate-50 p-3 sm:p-4 md:p-6 lg:p-8">{children}</div>
      </div>
    </div>
  );
}

function NavLink({ to, icon, label, sidebarOpen }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive =
    location.pathname === to ||
    (to !== "/president/dashboard" && location.pathname.startsWith(to + "/"));

  return (
    <button
      onClick={() => navigate(to)}
      title={!sidebarOpen ? label : undefined}
      className={`group w-full flex items-center ${
        sidebarOpen ? "gap-2.5 px-3 py-2.5" : "justify-center px-2 py-2.5"
      } rounded-lg text-sm transition-colors duration-150 ${
        isActive
          ? "bg-[#006400] text-white font-semibold shadow-xs hover:bg-[#006400]"
          : "text-white/80 hover:bg-[#00A000]/40 hover:text-white font-medium"
      }`}
    >
      <span
        className={`shrink-0 transition-colors duration-150 ${
          isActive ? "text-white" : "text-white/70 group-hover:text-white"
        }`}
      >
        {icon}
      </span>
      {sidebarOpen && (
        <>
          <span
            className={`truncate flex-1 text-left transition-colors duration-150 ${
              isActive ? "text-white" : "text-white/90 group-hover:text-white"
            }`}
          >
            {label}
          </span>
          <ChevronRight
            className={`w-4 h-4 shrink-0 transition-colors duration-150 ${
              isActive ? "text-white" : "text-white/40 group-hover:text-white"
            }`}
          />
        </>
      )}
    </button>
  );
}
