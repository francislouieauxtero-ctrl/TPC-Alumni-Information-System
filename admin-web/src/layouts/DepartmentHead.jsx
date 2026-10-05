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
  MoreHorizontal,
} from "lucide-react";
import api from "../services/api";
import UserAvatar from "../components/shared/UserAvatar";
import TopLoadingBar from "../components/shared/TopLoadingBar";

export default function DepartmentHeadLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [moreOpen, setMoreOpen] = useState(false);
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
    setMoreOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!moreOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setMoreOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [moreOpen]);

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
      return;
    }

    setSidebarOpen(!sidebarOpen);
  };

  const isDashboardActive = location.pathname === "/department-head/dashboard";
  const isGraduatesActive = location.pathname.startsWith("/department-head/graduates");
  const isAlumniActive = location.pathname.startsWith("/department-head/alumni");
  const isAnnouncementsActive = location.pathname.startsWith("/department-head/announcements");
  const isMoreActive =
    moreOpen ||
    location.pathname.startsWith("/department-head/events") ||
    location.pathname.startsWith("/department-head/analytics") ||
    location.pathname.startsWith("/department-head/profile") ||
    location.pathname.startsWith("/department-head/PrintableReport");

  return (
    <div className="flex h-screen bg-slate-50 text-gray-900 font-sans">
      {/* Sidebar (Desktop / Laptop >= 850px) */}
      <aside
        className={`${sidebarOpen ? "min-[850px]:w-[260px]" : "min-[850px]:w-20"
          } fixed inset-y-0 left-0 z-50 flex h-screen min-h-screen max-h-screen w-[260px] -translate-x-full flex-col bg-white border-r border-slate-200/80 px-3 py-2.5 transition-all duration-300 min-[850px]:static min-[850px]:translate-x-0 shadow-sm`}
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
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 min-h-0 flex flex-col gap-1 py-1.5 overflow-y-auto">
          <NavLink
            to="/department-head/dashboard"
            icon={<Home className="w-5 h-5 shrink-0" />}
            label="Dashboard"
            sidebarOpen={sidebarOpen}
          />
          <NavLink
            to="/department-head/graduates"
            icon={<GraduationCap className="w-5 h-5 shrink-0" />}
            label="Graduates"
            sidebarOpen={sidebarOpen}
          />
          <NavLink
            to="/department-head/alumni"
            icon={<UserCheck className="w-5 h-5 shrink-0" />}
            label="Alumni"
            sidebarOpen={sidebarOpen}
          />
          <NavLink
            to="/department-head/events"
            icon={<CalendarDays className="w-5 h-5 shrink-0" />}
            label="Events"
            sidebarOpen={sidebarOpen}
          />
          <NavLink
            to="/department-head/announcements"
            icon={<Megaphone className="w-5 h-5 shrink-0" />}
            label="Announcements"
            sidebarOpen={sidebarOpen}
          />
          <NavLink
            to="/department-head/analytics"
            icon={<BarChart3 className="w-5 h-5 shrink-0" />}
            label="Analytics"
            sidebarOpen={sidebarOpen}
          />
          <NavLink
            to="/department-head/profile"
            icon={<User className="w-5 h-5 shrink-0" />}
            label="My Profile"
            sidebarOpen={sidebarOpen}
          />
        </nav>

        {/* Footer: Profile + Logout + Toggle */}
        <div className="shrink-0 mt-auto border-t border-slate-200/80 pt-2 flex flex-col gap-1.5">
          {/* User Profile */}
          <div
            className={`flex items-center gap-2.5 rounded-lg border border-[#8DB600] bg-white transition-all ${sidebarOpen ? "px-2.5 py-2" : "justify-center p-2"
              }`}
          >
            <UserAvatar
              name={departmentHeadName}
              avatar={departmentHeadAvatar}
              size="sm"
              className="shrink-0"
            />
            {sidebarOpen && (
              <div className="flex-1 min-w-0 flex flex-col justify-center text-left">
                <p className="text-slate-900 text-sm font-semibold truncate">
                  {departmentHeadName}
                </p>
                <p className="text-slate-500 text-xs font-medium truncate">
                  Department Head
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

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        <TopLoadingBar />
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-2">
          {/* Mobile brand badge (left) */}
          <div className="flex items-center gap-2 min-[850px]:hidden min-w-0">
            <img
              src={logo}
              alt="Talibon Polytechnic College seal"
              className="h-7 w-7 shrink-0 rounded-full border border-tpc-gold object-cover shadow-xs"
            />
            <span className="text-sm font-semibold text-gray-800 truncate">
              Department Head
            </span>
          </div>

          {/* User greeting and avatar (right) */}
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

        {/* ── More Action Sheet (Mobile / Tablet < 850px) ── */}
        {moreOpen && (
          <>
            <div
              className="fixed inset-0 z-50 bg-black/40 min-[850px]:hidden transition-opacity"
              onClick={() => setMoreOpen(false)}
              aria-hidden="true"
            />
            <div
              className="fixed inset-x-0 bottom-0 z-50 min-[850px]:hidden flex flex-col bg-white rounded-t-2xl shadow-2xl border-t border-gray-200 pb-[calc(env(safe-area-inset-bottom,0.5rem)+0.5rem)] max-w-lg mx-auto"
              role="dialog"
              aria-label="More navigation options"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 pt-4 pb-2.5 border-b border-gray-100">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  More Options
                </span>
                <button
                  onClick={() => setMoreOpen(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                  aria-label="Close more options"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Secondary Navigation Items */}
              <div className="py-1">
                <button
                  onClick={() => {
                    navigate("/department-head/events");
                    setMoreOpen(false);
                  }}
                  className={`w-full flex items-center gap-3.5 px-5 py-3 text-sm font-medium transition-colors ${
                    location.pathname.startsWith("/department-head/events")
                      ? "text-[#1877F2] bg-blue-50/60 font-semibold"
                      : "text-gray-700 hover:bg-gray-50 active:bg-gray-100"
                  }`}
                >
                  <span
                    className={`p-2 rounded-xl shrink-0 ${
                      location.pathname.startsWith("/department-head/events")
                        ? "bg-[#1877F2]/10 text-[#1877F2]"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    <CalendarDays className="w-5 h-5" />
                  </span>
                  <span className="flex-1 text-left truncate">Events</span>
                  <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
                </button>

                <button
                  onClick={() => {
                    navigate("/department-head/analytics");
                    setMoreOpen(false);
                  }}
                  className={`w-full flex items-center gap-3.5 px-5 py-3 text-sm font-medium transition-colors ${
                    location.pathname.startsWith("/department-head/analytics")
                      ? "text-[#1877F2] bg-blue-50/60 font-semibold"
                      : "text-gray-700 hover:bg-gray-50 active:bg-gray-100"
                  }`}
                >
                  <span
                    className={`p-2 rounded-xl shrink-0 ${
                      location.pathname.startsWith("/department-head/analytics")
                        ? "bg-[#1877F2]/10 text-[#1877F2]"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    <BarChart3 className="w-5 h-5" />
                  </span>
                  <span className="flex-1 text-left truncate">Analytics</span>
                  <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
                </button>

                <button
                  onClick={() => {
                    navigate("/department-head/profile");
                    setMoreOpen(false);
                  }}
                  className={`w-full flex items-center gap-3.5 px-5 py-3 text-sm font-medium transition-colors ${
                    location.pathname.startsWith("/department-head/profile")
                      ? "text-[#1877F2] bg-blue-50/60 font-semibold"
                      : "text-gray-700 hover:bg-gray-50 active:bg-gray-100"
                  }`}
                >
                  <span
                    className={`p-2 rounded-xl shrink-0 ${
                      location.pathname.startsWith("/department-head/profile")
                        ? "bg-[#1877F2]/10 text-[#1877F2]"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    <User className="w-5 h-5" />
                  </span>
                  <span className="flex-1 text-left truncate">My Profile</span>
                  <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
                </button>
              </div>

              {/* Logout Row */}
              <div className="pt-2 mt-1 border-t border-gray-100 px-4">
                <button
                  onClick={() => {
                    setMoreOpen(false);
                    handleLogout();
                  }}
                  disabled={logoutLoading}
                  className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold transition-colors disabled:opacity-50"
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                  <span>{logoutLoading ? "Logging out..." : "Logout"}</span>
                </button>
              </div>
            </div>
          </>
        )}

        {/* ── Mobile / Tablet Bottom Navigation (5 slots) ── */}
        <nav className="flex border-t border-gray-200 bg-white min-[850px]:hidden shrink-0 z-40 pb-[env(safe-area-inset-bottom,0.25rem)]">
          <button
            onClick={() => navigate("/department-head/dashboard")}
            className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-2 sm:py-2.5 text-[10px] sm:text-xs font-medium transition-colors min-w-0 ${
              isDashboardActive ? "text-[#1877F2] font-semibold" : "text-[#9CA3AF] hover:text-gray-600"
            }`}
          >
            <Home className={`w-5 h-5 ${isDashboardActive ? "text-[#1877F2] stroke-[2.5]" : "text-[#9CA3AF]"}`} />
            <span className="truncate max-w-full px-0.5">Dashboard</span>
          </button>

          <button
            onClick={() => navigate("/department-head/graduates")}
            className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-2 sm:py-2.5 text-[10px] sm:text-xs font-medium transition-colors min-w-0 ${
              isGraduatesActive ? "text-[#1877F2] font-semibold" : "text-[#9CA3AF] hover:text-gray-600"
            }`}
          >
            <GraduationCap className={`w-5 h-5 ${isGraduatesActive ? "text-[#1877F2] stroke-[2.5]" : "text-[#9CA3AF]"}`} />
            <span className="truncate max-w-full px-0.5">Graduates</span>
          </button>

          <button
            onClick={() => navigate("/department-head/alumni")}
            className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-2 sm:py-2.5 text-[10px] sm:text-xs font-medium transition-colors min-w-0 ${
              isAlumniActive ? "text-[#1877F2] font-semibold" : "text-[#9CA3AF] hover:text-gray-600"
            }`}
          >
            <UserCheck className={`w-5 h-5 ${isAlumniActive ? "text-[#1877F2] stroke-[2.5]" : "text-[#9CA3AF]"}`} />
            <span className="truncate max-w-full px-0.5">Alumni</span>
          </button>

          <button
            onClick={() => navigate("/department-head/announcements")}
            className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-2 sm:py-2.5 text-[10px] sm:text-xs font-medium transition-colors min-w-0 ${
              isAnnouncementsActive ? "text-[#1877F2] font-semibold" : "text-[#9CA3AF] hover:text-gray-600"
            }`}
          >
            <Megaphone className={`w-5 h-5 ${isAnnouncementsActive ? "text-[#1877F2] stroke-[2.5]" : "text-[#9CA3AF]"}`} />
            <span className="truncate max-w-full px-0.5">Announcements</span>
          </button>

          <button
            onClick={() => setMoreOpen(!moreOpen)}
            className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-2 sm:py-2.5 text-[10px] sm:text-xs font-medium transition-colors min-w-0 ${
              isMoreActive ? "text-[#1877F2] font-semibold" : "text-[#9CA3AF] hover:text-gray-600"
            }`}
          >
            <MoreHorizontal className={`w-5 h-5 ${isMoreActive ? "text-[#1877F2] stroke-[2.5]" : "text-[#9CA3AF]"}`} />
            <span className="truncate max-w-full px-0.5">More</span>
          </button>
        </nav>
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
      className={`group w-full flex items-center ${sidebarOpen ? "gap-2.5 px-3 py-2" : "justify-center px-2 py-2"
        } rounded-lg text-sm transition-colors duration-150 ${isActive
          ? "bg-[#006400] text-white font-semibold shadow-xs hover:bg-[#006400]"
          : "bg-white text-slate-800 hover:bg-[#00A000] hover:text-white font-medium"
        }`}
    >
      <span
        className={`shrink-0 transition-colors duration-150 ${isActive
          ? "text-white"
          : "text-slate-600 group-hover:text-white"
          }`}
      >
        {icon}
      </span>

      {sidebarOpen && (
        <>
          <span
            className={`truncate flex-1 text-left transition-colors duration-150 ${isActive
              ? "text-white"
              : "text-slate-800 group-hover:text-white"
              }`}
          >
            {label}
          </span>
          <ChevronRight
            className={`w-4 h-4 shrink-0 transition-colors duration-150 ${isActive
              ? "text-white"
              : "text-slate-400 group-hover:text-white"
              }`}
          />
        </>
      )}
    </button>
  );
}
