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
  ChevronRight,
} from "lucide-react";
import api from "../services/api";
import UserAvatar from "../components/shared/UserAvatar";
import TopLoadingBar from "../components/shared/TopLoadingBar";

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

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 850) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
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
    <div className="flex h-screen h-dvh bg-slate-50 text-gray-900 font-sans w-full max-w-full overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? "min-[850px]:w-[260px]" : "min-[850px]:w-20"
          } fixed inset-y-0 left-0 z-50 flex h-screen min-h-screen max-h-screen w-[260px] ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          } flex-col bg-white border-r border-slate-200/80 px-3 py-2.5 transition-all duration-300 min-[850px]:static min-[850px]:translate-x-0 shadow-sm`}
      >
        {/* Header / Branding */}
        <div className="shrink-0 px-1 pb-2.5 border-b border-slate-200/80">
          <div
            className={`flex items-center gap-2.5 ${!sidebarOpen && "min-[850px]:justify-center"}`}
          >
            {/* Circular logo */}
            <img
              src={logo}
              alt="Talibon Polytechnic College seal"
              className="h-10 w-10 rounded-full border-2 border-tpc-gold object-cover shadow-xs shrink-0 ring-2 ring-slate-100"
            />
            <div
              className={`min-w-0 flex-1 flex flex-col justify-center text-left ${
                sidebarOpen ? "" : "min-[850px]:hidden"
              }`}
            >
              <h1 className="text-[#006400] text-xs font-bold tracking-tight whitespace-nowrap">
                Talibon Polytechnic College
              </h1>
              <p className="text-slate-400 text-[10px] font-semibold tracking-wider uppercase mt-0.5 whitespace-nowrap">
                ALUMNI OFFICIAL WEBSITE
              </p>
            </div>
            {/* Mobile close button */}
            {mobileMenuOpen && (
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="min-[850px]:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0 ml-auto"
                aria-label="Close menu"
                type="button"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 min-h-0 flex flex-col gap-1 py-1.5 overflow-y-auto">
          <NavLink
            to="/department-head/dashboard"
            icon={<Home className="w-5 h-5 shrink-0" />}
            label="Dashboard"
            sidebarOpen={sidebarOpen}
            onNavigate={() => setMobileMenuOpen(false)}
          />
          <NavLink
            to="/department-head/graduates"
            icon={<GraduationCap className="w-5 h-5 shrink-0" />}
            label="Graduates"
            sidebarOpen={sidebarOpen}
            onNavigate={() => setMobileMenuOpen(false)}
          />
          <NavLink
            to="/department-head/alumni"
            icon={<UserCheck className="w-5 h-5 shrink-0" />}
            label="Alumni"
            sidebarOpen={sidebarOpen}
            onNavigate={() => setMobileMenuOpen(false)}
          />
          <NavLink
            to="/department-head/events"
            icon={<CalendarDays className="w-5 h-5 shrink-0" />}
            label="Events"
            sidebarOpen={sidebarOpen}
            onNavigate={() => setMobileMenuOpen(false)}
          />
          <NavLink
            to="/department-head/announcements"
            icon={<Megaphone className="w-5 h-5 shrink-0" />}
            label="Announcements"
            sidebarOpen={sidebarOpen}
            onNavigate={() => setMobileMenuOpen(false)}
          />
          <NavLink
            to="/department-head/analytics"
            icon={<BarChart3 className="w-5 h-5 shrink-0" />}
            label="Analytics"
            sidebarOpen={sidebarOpen}
            onNavigate={() => setMobileMenuOpen(false)}
          />
          <NavLink
            to="/department-head/profile"
            icon={<User className="w-5 h-5 shrink-0" />}
            label="My Profile"
            sidebarOpen={sidebarOpen}
            onNavigate={() => setMobileMenuOpen(false)}
          />
        </nav>

        {/* Footer: Profile + Logout + Toggle */}
        <div className="shrink-0 mt-auto border-t border-slate-200/80 pt-2 flex flex-col gap-1.5">
          {/* User Profile */}
          <div
            className={`flex items-center gap-2.5 rounded-lg border border-[#8DB600] bg-white transition-all ${sidebarOpen ? "px-2.5 py-2" : "px-2.5 py-2 min-[850px]:justify-center min-[850px]:p-2"
              }`}
          >
            <UserAvatar
              name={departmentHeadName}
              avatar={departmentHeadAvatar}
              size="sm"
              className="shrink-0"
            />
            <div
              className={`flex-1 min-w-0 flex flex-col justify-center text-left ${
                sidebarOpen ? "" : "min-[850px]:hidden"
              }`}
            >
              <p className="text-slate-900 text-sm font-semibold truncate">
                {departmentHeadName}
              </p>
              <p className="text-slate-500 text-xs font-medium truncate">
                Department Head
              </p>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            disabled={logoutLoading}
            title={!sidebarOpen ? "Logout" : undefined}
            type="button"
            className={`w-full flex items-center justify-center gap-2 rounded-lg bg-[#F5F5F5] hover:bg-[#EAEAEA] border border-slate-200/80 text-slate-900 text-xs font-medium disabled:opacity-50 transition-colors shadow-xs ${sidebarOpen ? "px-3 py-2" : "px-3 py-2 min-[850px]:p-2"
              }`}
          >
            <LogOut className="w-4 h-4 text-slate-900 shrink-0" />
            <span className={sidebarOpen ? "" : "min-[850px]:hidden"}>
              {logoutLoading ? "Logging out..." : "Logout"}
            </span>
          </button>

          {/* Toggle Sidebar Control (Desktop only) */}
          <button
            onClick={handleSidebarToggle}
            title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            type="button"
            className="hidden min-[850px]:flex w-full items-center justify-center h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
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
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        <TopLoadingBar />
        {/* Top Bar */}
        <div className="relative z-20 bg-white border-b border-gray-200 px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-2">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="min-[850px]:hidden p-2 rounded-lg text-slate-600 hover:text-[#1877F2] hover:bg-blue-50/60 transition-colors shrink-0"
            aria-label="Open menu"
            type="button"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2.5 sm:gap-4 ml-auto min-w-0">
            <span className="text-gray-500 text-xs sm:text-sm font-medium truncate max-w-[130px] xs:max-w-[180px] sm:max-w-none">
              Welcome, {departmentHeadName}!
            </span>
            <UserAvatar
              name={departmentHeadName}
              avatar={departmentHeadAvatar}
              size="sm"
              className="bg-tpc-greenDeep shrink-0"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto bg-white p-3 sm:p-4 md:p-6 min-w-0">{children}</div>
      </div>
    </div>
  );
}

function NavLink({ to, icon, label, sidebarOpen, onNavigate }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive =
    location.pathname === to ||
    (to !== "/department-head/dashboard" && location.pathname.startsWith(to + "/"));

  return (
    <button
      onClick={() => {
        navigate(to);
        if (onNavigate) onNavigate();
      }}
      title={!sidebarOpen ? label : undefined}
      type="button"
      className={`group w-full flex items-center ${
        sidebarOpen ? "gap-2.5 px-3 py-2" : "gap-2.5 px-3 py-2 min-[850px]:justify-center min-[850px]:px-2 min-[850px]:py-2"
      } rounded-lg text-sm transition-colors duration-150 ${
        isActive
          ? "bg-[#1877F2] text-white font-semibold shadow-xs hover:bg-[#1877F2]"
          : "bg-white text-[#9CA3AF] hover:bg-blue-50/60 hover:text-[#1877F2] font-medium"
      }`}
    >
      <span
        className={`shrink-0 transition-colors duration-150 ${
          isActive
            ? "text-white"
            : "text-[#9CA3AF] group-hover:text-[#1877F2]"
        }`}
      >
        {icon}
      </span>

      <span
        className={`truncate flex-1 text-left transition-colors duration-150 ${
          sidebarOpen ? "" : "min-[850px]:hidden"
        } ${
          isActive
            ? "text-white"
            : "text-[#9CA3AF] group-hover:text-[#1877F2]"
        }`}
      >
        {label}
      </span>
      <ChevronRight
        className={`w-4 h-4 shrink-0 transition-colors duration-150 ${
          sidebarOpen ? "" : "min-[850px]:hidden"
        } ${
          isActive
            ? "text-white"
            : "text-[#9CA3AF] group-hover:text-[#1877F2]"
        }`}
      />
    </button>
  );
}
