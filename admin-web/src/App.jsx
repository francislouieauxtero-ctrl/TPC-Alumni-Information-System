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
import TermsAndPrivacy from "./pages/landingpage/Termsandprivacy";

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

// Component to check user on app load
const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const response = await api.get("/auth/user");
          if (response.data.status) {
            setUser(response.data.data);
            localStorage.setItem("userRole", response.data.data.role);
            localStorage.setItem("userAvatar", response.data.data.avatar || "");
            // store department id and name for frontend scoping
            localStorage.setItem(
              "userDepartment",
              response.data.data.department?.id || "",
            );
            localStorage.setItem(
              "userDepartmentName",
              response.data.data.department?.name || "",
            );
            localStorage.setItem("userName", response.data.data.name || "");
          }
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("userRole");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-brand-bg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-accent1 mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  return children;
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
