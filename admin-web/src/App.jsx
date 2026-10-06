import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Welcome from "./pages/landingpage/Welcome";
import Login from "./pages/auth/Login";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import About from "./pages/landingpage/About";
import StudentRegister from "./pages/auth/StudentRegister";
import PresidentDashboard from "./pages/president/PresidentDashboard";
import PrintableReport from "./pages/president/PrintableReport";
import EditDepartment from "./pages/president/Department/EditDeparment";
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentProfile from "./pages/student/StudentProfile";
import StudentAnnouncements from "./pages/student/StudentAnnouncements";
import StudentEvents from "./pages/student/StudentEvents";
import StudentEmployment from "./pages/student/StudentEmployment";
import StudentManagement from "./pages/president/StudentManagement";
import DepartmentHeadManagement from "./pages/president/Department/DepartmentHeadManagement";
import CreateDepartment from "./pages/president/Department/CreateDepartment";
import CreateDepartmentHead from "./pages/president/Department/CreateDepartmentHead";
import DepartmentHeadDashboard from "./pages/departmenthead/DepartmentHeadDashboard";
import Analytics from "./pages/president/Analytics";
import GraduateList from "./pages/president/graduates/GraduateList";
import GraduateCreate from "./pages/president/graduates/GraduateCreate";
import AlumniApproval from "./pages/president/alumni/AlumniApproval";
import RejectedAlumniList from "./pages/president/alumni/RejectedAlumniList";
import EventList from "./pages/president/events/EventList";
import GraduateEdit from "./pages/president/graduates/GraduateEdit";
import DepartmentHeadGraduateList from "./pages/departmenthead/GraduateList";
import DepartmentHeadGraduateCreate from "./pages/departmenthead/CreateGraduate";
import DeptAnalytics from "./pages/departmenthead/DeptAnalytics";
import DepartmentHeadAlumniList from "./pages/departmenthead/AlumniList";
import DepartmentHeadAlumniApproval from "./pages/departmenthead/AlumniApproval";
import DepartmentHeadProfile from "./pages/departmenthead/DepartmentHeadProfile";
import EditGraduate from "./pages/departmenthead/EditGraduate";
import PresidentProfile from "./pages/president/PresidentProfile";
import EventCreate from "./pages/president/events/EventCreate";
import EventView from "./pages/president/events/EventView";
import EventEdit from "./pages/president/events/EventEdit";
import PresidentAnnouncementList from "./pages/president/announcements/AnnouncementList";
import PresidentAnnouncementCreate from "./pages/president/announcements/AnnouncementCreate";
import PresidentAnnouncementEdit from "./pages/president/announcements/AnnouncementEdit";
import DepartmentHeadAnnouncementList from "./pages/departmenthead/AnnouncementList";
import DepartmentHeadAnnouncementCreate from "./pages/departmenthead/AnnouncementCreate";
import DepartmentHeadAnnouncementEdit from "./pages/departmenthead/AnnouncementEdit";
import AnnouncementView from "./pages/shared/AnnouncementView";
import PresidentLayout from "./layouts/President";
import DepartmentHeadLayout from "./layouts/DepartmentHead";
import StudentLayout from "./layouts/StudentLayout";
import api from "./services/api";
import { getDashboardPath } from "./utils/roleRedirect";
import {
  extractAuthSession,
  storeAuthSession,
} from "./utils/authSession";
import TermsAndPrivacy from "./pages/landingpage/Termsandprivacy";
import tpcLogo from "./assets/tpcL.jpg";

const queryClient = new QueryClient();

// Protected route that checks token and role
const ProtectedRoute = ({ children, requiredRole }) => {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("userRole");

  if (!token) {
    return <Navigate to="/home" />;
  }

  const allowedRoles = Array.isArray(requiredRole)
    ? requiredRole
    : [requiredRole];

  if (requiredRole && !allowedRoles.includes(userRole)) {
    return <Navigate to={getDashboardPath(userRole)} replace />;
  }

  return children;
};

const DashboardRedirect = () => {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("userRole");

  if (!token) {
    return <Navigate to="/home" replace />;
  }

  return <Navigate to={getDashboardPath(userRole)} replace />;
};

// Authoritative splash screen controller using the official TPC logo and tagline
const SplashScreen = ({ stage, isFadingOut }) => {
  const isBrandStage = stage === "brand";

  return (
    <div
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-white px-6 select-none transition-opacity duration-300 ease-out ${
        isFadingOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      style={{
        paddingTop: "max(1.5rem, env(safe-area-inset-top))",
        paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))",
      }}
      aria-label="Talibon Polytechnic College Initializing"
      role="status"
    >
      <div
        className={`flex flex-col items-center text-center max-w-[380px] w-full transition-transform duration-300 ease-out ${
          isFadingOut ? "scale-[1.01]" : "scale-100"
        }`}
      >
        {/* Brand Reveal: Official TPC Seal + Existing Tagline */}
        <div
          className={`flex flex-col items-center transition-all duration-500 ease-out ${
            isBrandStage
              ? "opacity-100 max-h-[260px] translate-y-0 mb-6 sm:mb-7"
              : "opacity-0 max-h-0 -translate-y-2 pointer-events-none overflow-hidden mb-0"
          }`}
        >
          {/* Official TPC Seal */}
          <div className={isBrandStage ? "relative splash-logo-enter" : "relative"}>
            <img
              src={tpcLogo}
              alt="Talibon Polytechnic College Seal"
              className="w-[clamp(84px,14vw,112px)] h-[clamp(84px,14vw,112px)] rounded-full border-[2.5px] border-[#c9a84c] object-cover shadow-[0_8px_24px_rgba(15,58,92,0.08)] ring-4 ring-[#0f3a5c]/5 aspect-square"
            />
          </div>

          {/* Tagline */}
          <h2
            className={`mt-5 sm:mt-6 text-[clamp(16px,2.5vw,20px)] font-semibold text-[#0f3a5c] tracking-tight leading-[1.45] ${
              isBrandStage ? "splash-tagline-enter" : ""
            }`}
          >
            Reconnect, Reminisce,
            <span className="block sm:inline sm:ml-1">Reunite.</span>
          </h2>
        </div>

        {/* Institutional Loading Line */}
        <div className="w-[clamp(120px,18vw,160px)] h-[2.5px] bg-slate-100 rounded-full overflow-hidden relative">
          <div className="absolute inset-y-0 w-2/5 rounded-full bg-gradient-to-r from-[#0f3a5c] via-[#0f3a5c] to-[#c9a84c] splash-progress-line" />
        </div>
      </div>
    </div>
  );
};

// Authoritative splash and authentication controller
const AuthProvider = ({ children }) => {
  const [authChecked, setAuthChecked] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [splashStage, setSplashStage] = useState("loading"); // "loading" | "brand"
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const startTime = performance.now();
    const MIN_SPLASH_DURATION = 3000; // Minimum 3 seconds display time
    const BRAND_REVEAL_DELAY = 700; // Stage 1 (loading) -> Stage 2 (brand reveal)

    // Stage 1 (loading) -> Stage 2 (brand reveal)
    const brandTimer = setTimeout(() => {
      if (isMounted) {
        setSplashStage("brand");
      }
    }, BRAND_REVEAL_DELAY);

    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const response = await api.get("/auth/user");
          if (response.data?.status || response.data?.success) {
            const { user: sessionUser } = extractAuthSession(response.data);
            if (!sessionUser?.role) {
              throw new Error("Authenticated session is missing a role");
            }
            if (isMounted) setUser(sessionUser);
            storeAuthSession(token, sessionUser);
          }
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("userRole");
      } finally {
        if (!isMounted) return;

        // CRUCIAL: Mount verified destination immediately underneath the splash overlay
        // so routes & dashboard fetch their initial data in the background
        setAuthChecked(true);

        const prefersReducedMotion =
          typeof window !== "undefined" &&
          window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        if (prefersReducedMotion) {
          setShowSplash(false);
          return;
        }

        const elapsed = performance.now() - startTime;
        const remainingDelay = Math.max(0, MIN_SPLASH_DURATION - elapsed);

        setTimeout(() => {
          if (!isMounted) return;
          // Softly fade out splash screen after minimum duration
          setIsFadingOut(true);

          setTimeout(() => {
            if (!isMounted) return;
            setShowSplash(false);
          }, 320);
        }, remainingDelay);
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
      clearTimeout(brandTimer);
    };
  }, []);

  return (
    <>
      {authChecked && children}
      {showSplash && (
        <SplashScreen stage={splashStage} isFadingOut={isFadingOut} />
      )}
    </>
  );
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<DashboardRedirect />} />
            <Route path="/dashboard" element={<DashboardRedirect />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<StudentRegister />} />
            <Route path="/home" element={<Welcome />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/terms-privacy" element={<TermsAndPrivacy />} />
            {/* President Routes */}
            <Route
              path="/president/dashboard"
              element={
                <ProtectedRoute requiredRole={["super_admin"]}>
                  <PresidentLayout>
                    <PresidentDashboard />
                  </PresidentLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/president/DepartmentHeadManagement"
              element={
                <ProtectedRoute requiredRole="super_admin">
                  <PresidentLayout>
                    <DepartmentHeadManagement />
                  </PresidentLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/president/departments/create"
              element={
                <ProtectedRoute requiredRole="super_admin">
                  <PresidentLayout>
                    <CreateDepartment />
                  </PresidentLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/president/department-heads/create"
              element={
                <ProtectedRoute requiredRole="super_admin">
                  <PresidentLayout>
                    <CreateDepartmentHead />
                  </PresidentLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/president/PrintableReport"
              element={
                <ProtectedRoute requiredRole="super_admin">
                  <PresidentLayout>
                    <PrintableReport />
                  </PresidentLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/president/departments/:id/edit"
              element={
                <ProtectedRoute requiredRole="super_admin">
                  <PresidentLayout>
                    <EditDepartment />
                  </PresidentLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/president/analytics"
              element={
                <ProtectedRoute requiredRole={["super_admin"]}>
                  <PresidentLayout>
                    <Analytics />
                  </PresidentLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/president/profile"
              element={
                <ProtectedRoute requiredRole={"super_admin"}>
                  <PresidentLayout>
                    <PresidentProfile />
                  </PresidentLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/president/students"
              element={
                <ProtectedRoute requiredRole={["super_admin"]}>
                  <PresidentLayout>
                    <StudentManagement />
                  </PresidentLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/president/graduates"
              element={
                <ProtectedRoute requiredRole={["super_admin"]}>
                  <PresidentLayout>
                    <GraduateList />
                  </PresidentLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/president/graduates/edit"
              element={
                <ProtectedRoute requiredRole={["super_admin"]}>
                  <PresidentLayout>
                    <GraduateEdit />
                  </PresidentLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/president/graduates/create"
              element={
                <ProtectedRoute requiredRole={["super_admin"]}>
                  <PresidentLayout>
                    <GraduateCreate />
                  </PresidentLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/president/alumni"
              element={<Navigate to="/president/students" replace />}
            />
            <Route
              path="/president/alumni/rejected"
              element={<Navigate to="/president/students" replace />}
            />
            <Route
              path="/president/events"
              element={
                <ProtectedRoute requiredRole={["super_admin"]}>
                  <PresidentLayout>
                    <EventList />
                  </PresidentLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/president/events/create"
              element={
                <ProtectedRoute requiredRole={["super_admin"]}>
                  <PresidentLayout>
                    <EventCreate />
                  </PresidentLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/president/events/:id"
              element={
                <ProtectedRoute requiredRole={["super_admin"]}>
                  <PresidentLayout>
                    <EventView />
                  </PresidentLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/president/events/:id/edit"
              element={
                <ProtectedRoute requiredRole={["super_admin"]}>
                  <PresidentLayout>
                    <EventEdit />
                  </PresidentLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/president/announcements"
              element={
                <ProtectedRoute requiredRole={["super_admin"]}>
                  <PresidentLayout>
                    <PresidentAnnouncementList basePath="/president/announcements" />
                  </PresidentLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/president/announcements/create"
              element={
                <ProtectedRoute requiredRole={["super_admin"]}>
                  <PresidentLayout>
                    <PresidentAnnouncementCreate basePath="/president/announcements" />
                  </PresidentLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/president/announcements/:id"
              element={
                <ProtectedRoute requiredRole={["super_admin"]}>
                  <PresidentLayout>
                    <AnnouncementView />
                  </PresidentLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/president/announcements/:id/edit"
              element={
                <ProtectedRoute requiredRole={["super_admin"]}>
                  <PresidentLayout>
                    <PresidentAnnouncementEdit basePath="/president/announcements" />
                  </PresidentLayout>
                </ProtectedRoute>
              }
            />
            {/* Department Head Routes */}
            <Route
              path="/department-head/dashboard"
              element={
                <ProtectedRoute requiredRole="admin">
                  <DepartmentHeadLayout>
                    <DepartmentHeadDashboard />
                  </DepartmentHeadLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/department-head/PrintableReport"
              element={
                <ProtectedRoute requiredRole="admin">
                  <DepartmentHeadLayout>
                    <PrintableReport />
                  </DepartmentHeadLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/department-head/students"
              element={
                <ProtectedRoute requiredRole="admin">
                  <DepartmentHeadLayout>
                    <StudentManagement />
                  </DepartmentHeadLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/department-head/graduates"
              element={
                <ProtectedRoute requiredRole="admin">
                  <DepartmentHeadLayout>
                    <DepartmentHeadGraduateList />
                  </DepartmentHeadLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/department-head/graduates/edit"
              element={
                <ProtectedRoute requiredRole="admin">
                  <DepartmentHeadLayout>
                    <EditGraduate />
                  </DepartmentHeadLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/department-head/graduates/create"
              element={
                <ProtectedRoute requiredRole="admin">
                  <DepartmentHeadLayout>
                    <DepartmentHeadGraduateCreate />
                  </DepartmentHeadLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/department-head/alumni"
              element={
                <ProtectedRoute requiredRole="admin">
                  <DepartmentHeadLayout>
                    <DepartmentHeadAlumniList />
                  </DepartmentHeadLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/department-head/events"
              element={
                <ProtectedRoute requiredRole="admin">
                  <DepartmentHeadLayout>
                    <EventList />
                  </DepartmentHeadLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/department-head/events/create"
              element={
                <ProtectedRoute requiredRole="admin">
                  <DepartmentHeadLayout>
                    <EventCreate />
                  </DepartmentHeadLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/department-head/events/:id"
              element={
                <ProtectedRoute requiredRole="admin">
                  <DepartmentHeadLayout>
                    <EventView />
                  </DepartmentHeadLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/department-head/events/:id/edit"
              element={
                <ProtectedRoute requiredRole="admin">
                  <DepartmentHeadLayout>
                    <EventEdit />
                  </DepartmentHeadLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/department-head/announcements"
              element={
                <ProtectedRoute requiredRole="admin">
                  <DepartmentHeadLayout>
                    <DepartmentHeadAnnouncementList basePath="/department-head/announcements" />
                  </DepartmentHeadLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/department-head/announcements/create"
              element={
                <ProtectedRoute requiredRole="admin">
                  <DepartmentHeadLayout>
                    <DepartmentHeadAnnouncementCreate basePath="/department-head/announcements" />
                  </DepartmentHeadLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/department-head/announcements/:id"
              element={
                <ProtectedRoute requiredRole="admin">
                  <DepartmentHeadLayout>
                    <AnnouncementView />
                  </DepartmentHeadLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/department-head/announcements/:id/edit"
              element={
                <ProtectedRoute requiredRole="admin">
                  <DepartmentHeadLayout>
                    <DepartmentHeadAnnouncementEdit basePath="/department-head/announcements" />
                  </DepartmentHeadLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/department-head/analytics"
              element={
                <ProtectedRoute requiredRole="admin">
                  <DepartmentHeadLayout>
                    <DeptAnalytics />
                  </DepartmentHeadLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/department-head/profile"
              element={
                <ProtectedRoute requiredRole="admin">
                  <DepartmentHeadLayout>
                    <DepartmentHeadProfile />
                  </DepartmentHeadLayout>
                </ProtectedRoute>
              }
            />

            {/* Student Routes */}
            <Route
              path="/student/onboarding"
              element={<Navigate to="/student/dashboard" replace />}
            />
            <Route
              path="/student/dashboard"
              element={
                <ProtectedRoute requiredRole="user">
                  <StudentLayout>
                    <StudentDashboard />
                  </StudentLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/profile"
              element={
                <ProtectedRoute requiredRole="user">
                  <StudentLayout>
                    <StudentProfile />
                  </StudentLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/events"
              element={
                <ProtectedRoute requiredRole="user">
                  <StudentLayout>
                    <StudentEvents />
                  </StudentLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/announcements"
              element={
                <ProtectedRoute requiredRole="user">
                  <StudentLayout>
                    <StudentAnnouncements />
                  </StudentLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/announcements/:id"
              element={
                <ProtectedRoute requiredRole="user">
                  <StudentLayout>
                    <AnnouncementView />
                  </StudentLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/employment"
              element={
                <ProtectedRoute requiredRole="user">
                  <StudentLayout>
                    <StudentEmployment />
                  </StudentLayout>
                </ProtectedRoute>
              }
            />

            {/* Catch all - redirect to the correct dashboard when signed in */}
            <Route path="*" element={<DashboardRedirect />} />
          </Routes>
        </AuthProvider>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
