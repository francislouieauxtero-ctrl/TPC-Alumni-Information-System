import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import announcementService from "../../services/announcementService";
import eventService from "../../services/eventService";
import {
  User,
  Mail,
  Building,
  Hash,
  CheckCircle2,
  XCircle,
  Megaphone,
  CalendarDays,
  ArrowRight,
  MapPin,
  Clock,
} from "lucide-react";
import DashboardUpdatesSection from "../../components/dashboard/DashboardUpdatesSection";
import AlumniOnboarding from "./AlumniOnboarding";

export default function StudentDashboard() {
  const [student, setStudent] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showWelcome, setShowWelcome] = useState(() => {
    return localStorage.getItem("onboardingCompleted") === "false";
  });

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [dashRes, annRes, evtRes] = await Promise.all([
          api.get("/student/dashboard"),
          announcementService.getAll({ page: 1, limit: 3 }),
          eventService.getAll({
            include_past: false,
            page: 1,
            limit: 3,
            sort_by: "created_at",
            sort_direction: "desc",
          }),
        ]);

        const success = dashRes.data.status ?? dashRes.data.success;
        if (success) {
          const studentData = dashRes.data.data;
          setStudent(studentData);
          if (studentData?.onboarding_completed === true) {
            localStorage.setItem("onboardingCompleted", "true");
            setShowWelcome(false);
          } else if (studentData?.onboarding_completed === false) {
            setShowWelcome(true);
          }
        }

        setAnnouncements((annRes.data ?? annRes).slice(0, 3));
        setEvents((evtRes.data ?? evtRes).slice(0, 3));
      } catch (err) {
        setError("Failed to load dashboard");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  if (error) {
    return (
      <div className="p-4 sm:p-8">
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-600 flex items-center gap-3">
          <XCircle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      </div>
    );
  }

  const isActive = student?.status === "active";

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-gray-50">
      {/* ── Welcome Onboarding Modal Overlay (Floating on top of Dashboard) ── */}
      {showWelcome && (
        <AlumniOnboarding
          onComplete={() => {
            setShowWelcome(false);
            setStudent((prev) =>
              prev ? { ...prev, onboarding_completed: true } : prev
            );
          }}
        />
      )}

      {/* ── Header banner ── */}
      <div className="bg-gradient-to-r from-[#006400] via-[#008000] to-[#00A000] px-4 sm:px-8 pt-8 pb-16 text-white shadow-sm">
        <p className="text-green-100 text-xs uppercase tracking-[0.2em] font-semibold mb-1">
          Alumni Portal
        </p>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-snug break-words">
          Welcome back,{" "}
          <span className="text-green-200">{student?.name?.split(" ")[0] || "Alumni"}</span>
          !
        </h1>
        <p className="mt-1 text-green-50/90 text-sm">
          {student?.department?.name || "Talibon Polytechnic College"}
        </p>
      </div>

      {/* ── Main content ── */}
      <div className="mx-auto -mt-8 max-w-5xl px-3 pb-10 sm:px-8">
        {/* Status + ID row */}
        {/* <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
            <p className="text-xs text-gray-400 uppercase tracking-[0.18em] mb-3">
              Account
            </p>
            <div className="flex items-center gap-2">
              {isActive ? (
                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 text-red-400 shrink-0" />
              )}
              <span
                className={`text-sm font-semibold ${isActive ? "text-green-600" : "text-red-500"}`}
              >
                {isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
            <p className="text-xs text-gray-400 uppercase tracking-[0.18em] mb-3">
              Student ID
            </p>
            <p className="text-sm font-semibold text-gray-900 truncate">
              {student?.schoolId || student?.school_id || "—"}
            </p>
          </div>
        </div> */}

        {/* Profile card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6 mb-4 sm:mb-6">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-[0.18em] mb-5">
            Profile
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <ProfileField
              icon={<User className="w-4 h-4" />}
              label="Full Name"
              value={student?.name}
            />
            <ProfileField
              icon={<Mail className="w-4 h-4" />}
              label="Email"
              value={student?.email}
            />
            <ProfileField
              icon={<Building className="w-4 h-4" />}
              label="Department"
              value={student?.department?.name || "—"}
            />
            <ProfileField
              icon={<Hash className="w-4 h-4" />}
              label="Student ID"
              value={
                // student?.student_number ||
                student?.schoolId || student?.school_id || "—"
              }
            />
          </div>
        </div>

        {/* TPC Updates: Events & Announcements */}
        <div>
          <DashboardUpdatesSection
            events={events}
            announcements={announcements}
            role="student"
          />
        </div>
      </div>
    </div>
  );
}

/* ── Sub-components ─────────────────────────────────── */

function ProfileField({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 w-8 h-8 rounded-lg bg-tpc-greenDeep/8 text-tpc-greenDeep flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-medium mb-0.5">
          {label}
        </p>
        <p className="break-words text-sm font-semibold text-gray-900">
          {value}
        </p>
      </div>
    </div>
  );
}

function ScopeBadge({ scope, department }) {
  const isSchoolWide = scope === "school_wide";
  return (
    <span
      className={`mt-0.5 max-w-[45%] shrink-0 truncate rounded-full px-2 py-0.5 text-[10px] font-semibold ${isSchoolWide
          ? "bg-blue-100 text-blue-600"
          : "bg-purple-100 text-purple-600"
        }`}
    >
      {isSchoolWide ? "🌐 All" : department || "Dept"}
    </span>
  );
}

function EmptyState({ text }) {
  return (
    <div className="flex-1 flex items-center justify-center py-8 text-sm text-gray-400 border border-dashed border-gray-200 rounded-xl">
      {text}
    </div>
  );
}
