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
import TopLoadingBar from "../components/shared/TopLoadingBar";

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

  const handleSidebarToggle = () => {
    if (window.innerWidth < 850) {
      setMobileMenuOpen(false);
      return;
    }
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-slate-50 text-gray-900 font-sans">
      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? "min-[850px]:w-[260px]" : "min-[850px]:w-20"
          } fixed inset-y-0 left-0 z-50 flex h-screen min-h-screen max-h-screen w-[260px] ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          } flex-col bg-white border-r border-slate-200/80 px-3 py-2.5 transition-all duration-300 min-[850px]:static min-[850px]:translate-x-0 shadow-sm`}
      >
        {/* Header / Branding */}
        <div className="shrink-0 px-1 pb-2.5 border-b border-slate-200/80">
          <div
            className={`flex items-center gap-2.5 ${!sidebarOpen && "justify-center"}`}
          >
            {/* Circular logo */}
            <img
              src={logo}
              alt="Talibon Polytechnic College seal"
              className="h-10 w-10 rounded-full border-2 border-tpc-gold object-cover shadow-xs shrink-0 ring-2 ring-slate-100"
            />
            {sidebarOpen && (
              <div className="min-w-0 flex-1 flex flex-col justify-center text-left">
                <h1 className="text-[#006400] text-xs font-bold tracking-tight whitespace-nowrap">
                  Talibon Polytechnic College
                </h1>
                <p className="text-slate-400 text-[10px] font-semibold tracking-wider uppercase mt-0.5 whitespace-nowrap">
                  ALUMNI OFFICIAL WEBSITE
                </p>
              </div>
            )}
            {/* Mobile close button */}
            {mobileMenuOpen && (
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="min-[850px]:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0 ml-auto"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 min-h-0 flex flex-col gap-1 py-1.5 overflow-y-auto">
          {userRole === "super_admin" && (
            <NavLink
              to="/president/dashboard"
              icon={<BarChart3 className="w-5 h-5 shrink-0" />}
              label="Dashboard"
              sidebarOpen={sidebarOpen}
              onNavigate={() => setMobileMenuOpen(false)}
            />
          )}
          {userRole === "super_admin" && (
            <NavLink
              to="/president/DepartmentHeadManagement"
              icon={<Building2 className="w-5 h-5 shrink-0" />}
              label="Manage Departments"
              sidebarOpen={sidebarOpen}
              onNavigate={() => setMobileMenuOpen(false)}
            />
          )}
          {userRole === "super_admin" && (
            <NavLink
              to="/president/students"
              icon={<Users className="w-5 h-5 shrink-0" />}
              label="Registered Alumni"
              sidebarOpen={sidebarOpen}
              onNavigate={() => setMobileMenuOpen(false)}
            />
          )}
          {userRole === "super_admin" && (
            <NavLink
              to="/president/graduates"
              icon={<GraduationCap className="w-5 h-5 shrink-0" />}
              label="View Graduates"
              sidebarOpen={sidebarOpen}
              onNavigate={() => setMobileMenuOpen(false)}
            />
          )}
          {userRole === "super_admin" && (
            <NavLink
              to="/president/events"
              icon={<Calendar className="w-5 h-5 shrink-0" />}
              label="Events"
              sidebarOpen={sidebarOpen}
              onNavigate={() => setMobileMenuOpen(false)}
            />
          )}
          {userRole === "super_admin" && (
            <NavLink
              to="/president/announcements"
              icon={<Megaphone className="w-5 h-5 shrink-0" />}
              label="Announcements"
              sidebarOpen={sidebarOpen}
              onNavigate={() => setMobileMenuOpen(false)}
            />
          )}
          {userRole === "super_admin" && (
            <NavLink
              to="/president/analytics"
              icon={<LineChart className="w-5 h-5 shrink-0" />}
              label="Analytics"
              sidebarOpen={sidebarOpen}
              onNavigate={() => setMobileMenuOpen(false)}
            />
          )}
          {userRole === "super_admin" && (
            <NavLink
              to="/president/profile"
              icon={<UserCircle className="w-5 h-5 shrink-0" />}
              label="My Profile"
              sidebarOpen={sidebarOpen}
              onNavigate={() => setMobileMenuOpen(false)}
            />
          )}
        </nav>

        {/* Footer: Profile + Logout + Toggle */}
        <div className="shrink-0 mt-auto border-t border-slate-200/80 pt-2 flex flex-col gap-1.5">
          {/* User Profile */}
          <div
            className={`flex items-center gap-2.5 rounded-lg border border-[#8DB600] bg-white transition-all ${sidebarOpen ? "px-2.5 py-2" : "justify-center p-2"
              }`}
          >
            <UserAvatar
              name={displayName}
              avatar={userAvatar}
              size="sm"
              className="shrink-0"
            />
            {sidebarOpen && (
              <div className="flex-1 min-w-0 flex flex-col justify-center text-left">
                <p className="text-slate-900 text-sm font-semibold truncate">
                  {displayName}
                </p>
                <p className="text-slate-500 text-xs font-medium truncate">
                  {roleLabel}
                </p>
              </div>
            )}
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            disabled={logoutLoading}
            title={!sidebarOpen ? "Logout" : undefined}
            className={`w-full flex items-center justify-center gap-2 rounded-lg bg-[#F5F5F5] hover:bg-[#EAEAEA] border border-slate-200/80 text-slate-900 text-xs font-medium disabled:opacity-50 transition-colors shadow-xs ${sidebarOpen ? "px-3 py-2" : "p-2"
              }`}
          >
            <LogOut className="w-4 h-4 text-slate-900 shrink-0" />
            {sidebarOpen && (
              <span>{logoutLoading ? "Logging out..." : "Logout"}</span>
            )}
          </button>

          {/* Toggle Sidebar Control (Three-line Hamburger Icon) */}
          <button
            onClick={handleSidebarToggle}
            title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            className="w-full flex items-center justify-center h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 min-[850px]:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <TopLoadingBar />
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-3 py-2.5 sm:px-6 sm:py-4 flex items-center justify-between gap-2">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="min-[850px]:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors shrink-0"
            aria-label="Open mobile menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2.5 sm:gap-4 ml-auto min-w-0">
            <span className="text-gray-600 text-xs sm:text-sm font-medium truncate max-w-[130px] xs:max-w-[180px] sm:max-w-none">
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
        <div className="flex-1 overflow-auto bg-slate-50 p-3 sm:p-4 md:p-6 lg:p-8 min-w-0">{children}</div>
      </div>
    </div>
  );
}

function NavLink({ to, icon, label, sidebarOpen, onNavigate }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive =
    location.pathname === to ||
    (to !== "/president/dashboard" && location.pathname.startsWith(to + "/"));

  return (
    <button
      onClick={() => {
        navigate(to);
        if (onNavigate) onNavigate();
      }}
      title={!sidebarOpen ? label : undefined}
      className={`group w-full flex items-center ${sidebarOpen ? "gap-2.5 px-3 py-2" : "justify-center px-2 py-2"
        } rounded-lg text-sm transition-colors duration-150 ${isActive
          ? "bg-[#006400] text-white font-semibold shadow-xs hover:bg-[#006400]"
          : "bg-white text-slate-800 hover:bg-[#00A000] hover:text-white font-medium"
        }`}
    >
      <span
        className={`shrink-0 transition-colors duration-150 ${isActive ? "text-white" : "text-slate-600 group-hover:text-white"
          }`}
      >
        {icon}
      </span>
      {sidebarOpen && (
        <>
          <span
            className={`truncate flex-1 text-left transition-colors duration-150 ${isActive ? "text-white" : "text-slate-800 group-hover:text-white"
              }`}
          >
            {label}
          </span>
          <ChevronRight
            className={`w-4 h-4 shrink-0 transition-colors duration-150 ${isActive ? "text-white" : "text-slate-400 group-hover:text-white"
              }`}
          />
        </>
      )}
    </button>
  );
}
