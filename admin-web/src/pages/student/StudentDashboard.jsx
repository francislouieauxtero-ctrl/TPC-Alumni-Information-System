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
  Info,
  Megaphone,
  CalendarDays,
  ArrowRight,
  MapPin,
  Clock,
} from "lucide-react";

export default function StudentDashboard() {
  const [student, setStudent] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [dashRes, annRes, evtRes] = await Promise.all([
          api.get("/student/dashboard"),
          announcementService.getAll({ page: 1 }),
          eventService.getAll({ include_past: false, page: 1 }),
        ]);

        const success = dashRes.data.status ?? dashRes.data.success;
        if (success) setStudent(dashRes.data.data);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-tpc-greenDeep mx-auto mb-4" />
          <p className="text-sm text-gray-400 tracking-wide">
            Loading dashboard…
          </p>
        </div>
      </div>
    );
  }

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
    <div className="min-h-screen bg-gray-50">
      {/* ── Header banner ── */}
      <div className="bg-tpc-greenDeep px-4 sm:px-8 pt-8 pb-16">
        <p className="text-tpc-green text-xs uppercase tracking-[0.2em] font-medium mb-1">
          Alumni Portal
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold text-white leading-snug">
          Welcome back,{" "}
          <span className="text-green-300">{student?.name?.split(" ")[0]}</span>
          !
        </h1>
        <p className="mt-1 text-green-200 text-sm">
          {student?.department?.name || "Talibon Polytechnic College"}
        </p>
      </div>

      {/* ── Main content ── */}
      <div className="px-4 sm:px-8 -mt-8 pb-10 max-w-5xl mx-auto">
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

        {/* Announcements + Events — side by side on lg, stacked on mobile */}
        <div className="grid grid-cols-1 min-[850px]:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
          {/* Latest Announcements */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-tpc-greenDeep" />
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-[0.18em]">
                  Announcements
                </h2>
              </div>
              <Link
                to="/student/announcements"
                className="flex items-center gap-1 text-xs text-tpc-greenDeep font-medium hover:underline"
              >
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {announcements.length === 0 ? (
              <EmptyState text="No announcements yet." />
            ) : (
              <ul className="space-y-3 flex-1">
                {announcements.map((a) => (
                  <li
                    key={a.id}
                    className="flex items-start gap-3 border-b border-gray-50 pb-3 last:border-0 last:pb-0"
                  >
                    <ScopeBadge
                      scope={a.scope}
                      department={a.department?.name}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {a.title}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(a.created_at).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Upcoming Events */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-tpc-greenDeep" />
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-[0.18em]">
                  Upcoming Events
                </h2>
              </div>
              <Link
                to="/student/events"
                className="flex items-center gap-1 text-xs text-tpc-greenDeep font-medium hover:underline"
              >
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {events.length === 0 ? (
              <EmptyState text="No upcoming events." />
            ) : (
              <ul className="space-y-3 flex-1">
                {events.map((e) => (
                  <li
                    key={e.id}
                    className="flex items-start gap-3 border-b border-gray-50 pb-3 last:border-0 last:pb-0"
                  >
                    {/* Date block */}
                    <div className="shrink-0 w-10 text-center bg-tpc-greenDeep/8 rounded-lg py-1.5">
                      <p className="text-[10px] uppercase font-bold text-tpc-greenDeep leading-none">
                        {new Date(e.event_date).toLocaleDateString(undefined, {
                          month: "short",
                        })}
                      </p>
                      <p className="text-base font-bold text-tpc-greenDeep leading-tight">
                        {new Date(e.event_date).getDate()}
                      </p>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {e.title}
                      </p>
                      <div className="flex items-center gap-3 mt-0.5">
                        {e.location && (
                          <span className="flex items-center gap-1 text-xs text-gray-400 truncate">
                            <MapPin className="w-3 h-3 shrink-0" />
                            {e.location}
                          </span>
                        )}
                        {e.time && (
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <Clock className="w-3 h-3 shrink-0" />
                            {e.time}
                          </span>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Help card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-4 h-4 text-tpc-greenDeep shrink-0" />
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-[0.18em]">
              What's next?
            </h2>
          </div>
          <ul className="space-y-3">
            {[
              "Your registration is reviewed by your department head.",
              "Approved accounts can access the alumni portal immediately.",
              "Contact your department head if you need faster verification.",
            ].map((tip, i) => (
              <li
                key={i}
                className="flex items-start gap-3 text-sm text-gray-500"
              >
                <span className="mt-0.5 w-5 h-5 rounded-full bg-tpc-greenDeep/10 text-tpc-greenDeep flex items-center justify-center text-xs font-bold shrink-0">
                  {i + 1}
                </span>
                {tip}
              </li>
            ))}
          </ul>
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
        <p className="text-sm font-semibold text-gray-900 truncate">{value}</p>
      </div>
    </div>
  );
}

function ScopeBadge({ scope, department }) {
  const isSchoolWide = scope === "school_wide";
  return (
    <span
      className={`mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
        isSchoolWide
          ? "bg-blue-100 text-blue-600"
          : "bg-purple-100 text-purple-600"
      }`}
    >
      {isSchoolWide ? "School" : department || "Dept"}
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
