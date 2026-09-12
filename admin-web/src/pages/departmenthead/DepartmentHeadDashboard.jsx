import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import {
  Users,
  Briefcase,
  BarChart3,
  CalendarDays,
  Bell,
  CheckCircle,
  AlertCircle,
  XCircle,
  Sparkles,
  ArrowRight,
} from "lucide-react";

export default function DepartmentHeadDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsResponse, eventsResponse, announcementsResponse] =
          await Promise.all([
            api.get("/department-head/dashboard"),
            api.get("/events", { params: { limit: 2 } }),
            api.get("/announcements", { params: { limit: 2 } }),
          ]);

        const dashboardData = statsResponse.data?.data || {};
        setStats(dashboardData.stats || dashboardData);
        setActivity(
          dashboardData.activity || dashboardData.recent_activity || [],
        );

        const eventPayload =
          eventsResponse.data?.data || eventsResponse.data || [];
        setEvents(
          Array.isArray(eventPayload) ? eventPayload : eventPayload.data || [],
        );

        const announcementPayload =
          announcementsResponse.data?.data || announcementsResponse.data || [];
        setAnnouncements(
          Array.isArray(announcementPayload)
            ? announcementPayload
            : announcementPayload.data || [],
        );
      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tpc-greenDeep mx-auto mb-4"></div>
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  const departmentName =
    stats?.department_name || stats?.department?.name || "Your Department";

  const totalAlumni =
    stats?.registered_alumni ??
    stats?.total_alumni ??
    stats?.total_students ??
    0;
  const employedCount = stats?.employed_alumni ?? stats?.total_employed ?? 0;
  const selfEmployedCount = stats?.self_employed_alumni ?? 0;
  const unemployedCount = stats?.unemployed_alumni ?? 0;
  const totalEmployed = employedCount + selfEmployedCount;
  const employmentRate =
    typeof stats?.employment_rate === "number"
      ? Math.round(stats.employment_rate)
      : totalAlumni > 0
        ? Math.round((totalEmployed / totalAlumni) * 100)
        : 0;

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-3xl bg-gradient-to-r from-tpc-greenDeep via-tpc-green to-emerald-700 p-6 text-white shadow-lg shadow-emerald-900/10">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-100">
                Department dashboard
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
                {departmentName}
              </h1>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-[0.22em] text-emerald-100">
                Employment rate
              </p>
              <p className="mt-1 text-2xl font-bold">{employmentRate}%</p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Total Graduates"
            value={stats?.total_graduates ?? stats?.total_graduate_count ?? 0}
            icon={<Users className="w-5 h-5" />}
            color="bg-tpc-greenDeep"
            detail="All recorded graduates"
          />
          <StatCard
            title="Registered Alumni"
            value={totalAlumni}
            icon={<Sparkles className="w-5 h-5" />}
            color="bg-violet-500"
            detail="Verified and active alumni"
          />
          <StatCard
            title="Employed Alumni"
            value={totalEmployed}
            icon={<Briefcase className="w-5 h-5" />}
            color="bg-tpc-navy"
            detail="Employed + self-employed"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Employment Rate
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Percentage of alumni in this department currently employed.
                </p>
              </div>
              <div className="rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700">
                {totalEmployed} / {totalAlumni} employed
              </div>
            </div>

            <div className="mb-3 flex items-center justify-between text-sm text-gray-500">
              <span>Progress</span>
              <span className="font-semibold text-gray-700">
                {employmentRate}%
              </span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-tpc-greenDeep to-emerald-500"
                style={{
                  width: `${Math.min(Math.max(employmentRate, 0), 100)}%`,
                }}
              />
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <MiniStat label="Employed" value={employedCount} tone="emerald" />
              <MiniStat
                label="Self-employed"
                value={selfEmployedCount}
                tone="blue"
              />
              <MiniStat
                label="Unemployed"
                value={unemployedCount}
                tone="amber"
              />
            </div>
          </section>

          <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Quick insights
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Department snapshot
                </p>
              </div>
              <BarChart3 className="h-5 w-5 text-gray-400" />
            </div>

            <div className="space-y-4">
              <InsightRow
                label="Verified alumni"
                value={stats?.verified_students ?? 0}
                color="bg-green-500"
                percent={
                  totalAlumni > 0
                    ? Math.round(
                        ((stats?.verified_students ?? 0) / totalAlumni) * 100,
                      )
                    : 0
                }
              />
              <InsightRow
                label="Active alumni"
                value={stats?.active_students ?? 0}
                color="bg-tpc-navy"
                percent={
                  totalAlumni > 0
                    ? Math.round(
                        ((stats?.active_students ?? 0) / totalAlumni) * 100,
                      )
                    : 0
                }
              />
              <InsightRow
                label="Inactive alumni"
                value={stats?.inactive_students ?? 0}
                color="bg-red-500"
                percent={
                  totalAlumni > 0
                    ? Math.round(
                        ((stats?.inactive_students ?? 0) / totalAlumni) * 100,
                      )
                    : 0
                }
              />
            </div>
          </section>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Upcoming Events
                </h3>
                <p className="text-sm text-gray-500">
                  Latest department activities
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate("/department-head/events")}
                className="inline-flex items-center gap-1 text-sm font-semibold text-tpc-greenDeep hover:text-tpc-green"
              >
                View all
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            {events.length > 0 ? (
              <div className="space-y-4">
                {events.slice(0, 2).map((event) => (
                  <div
                    key={event.id}
                    className="rounded-2xl border border-gray-100 bg-gray-50 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-gray-900">
                        {event.title || event.name}
                      </p>
                      <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-500">
                        {event.scope || event.event_type || "Event"}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-gray-600">
                      {event.location || event.venue || "No location provided"}
                    </p>
                    <p className="mt-2 text-xs text-gray-500">
                      {formatDateTime(
                        event.date || event.event_date || event.starts_at,
                      )}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
                No upcoming events found.
              </div>
            )}
          </section>

          <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Recent Announcements
                </h3>
                <p className="text-sm text-gray-500">Department updates</p>
              </div>
              <button
                type="button"
                onClick={() => navigate("/department-head/announcements")}
                className="inline-flex items-center gap-1 text-sm font-semibold text-tpc-greenDeep hover:text-tpc-green"
              >
                View all
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            {announcements.length > 0 ? (
              <div className="space-y-4">
                {announcements.slice(0, 2).map((announcement) => (
                  <div
                    key={announcement.id}
                    className="rounded-2xl border border-gray-100 bg-gray-50 p-4"
                  >
                    <p className="font-semibold text-gray-900">
                      {announcement.title}
                    </p>
                    <p className="mt-2 text-sm text-gray-600">
                      {announcement.body || announcement.content}
                    </p>
                    <p className="mt-3 text-xs text-gray-400">
                      {formatDateTime(
                        announcement.created_at || announcement.published_at,
                      )}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
                No announcements available.
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color, detail }) {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="mt-3 text-3xl font-bold text-gray-900">{value ?? 0}</p>
        </div>
        <div
          className={`${color} flex h-12 w-12 items-center justify-center rounded-2xl text-white`}
        >
          {icon}
        </div>
      </div>
      <p className="mt-3 text-xs text-gray-400">{detail}</p>
    </div>
  );
}

function MiniStat({ label, value, tone }) {
  const tones = {
    emerald: "bg-emerald-50 text-emerald-700",
    blue: "bg-blue-50 text-blue-700",
    amber: "bg-amber-50 text-amber-700",
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-3">
      <div
        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${tones[tone]}`}
      >
        {label}
      </div>
      <p className="mt-3 text-2xl font-bold text-gray-900">{value ?? 0}</p>
    </div>
  );
}

function InsightRow({ label, value, color, percent }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className={`h-3 w-3 rounded-full ${color}`} />
          <span className="text-sm font-medium text-gray-700">{label}</span>
        </div>
        <span className="text-sm font-semibold text-gray-900">{value}</span>
      </div>
      <div className="h-2.5 rounded-full bg-gray-200">
        <div
          className={`${color} h-2.5 rounded-full`}
          style={{ width: `${Math.min(Math.max(percent, 0), 100)}%` }}
        />
      </div>
      <div className="mt-2 text-right text-xs text-gray-500">{percent}%</div>
    </div>
  );
}

function formatDateTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
