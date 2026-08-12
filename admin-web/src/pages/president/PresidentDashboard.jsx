import { useState, useEffect } from "react";
import api from "../../services/api";
import {
  Users,
  CheckCircle,
  AlertCircle,
  ToggleRight,
  Briefcase,
  GraduationCap,
} from "lucide-react";

export default function PresidentDasboard() {
  const [stats, setStats] = useState(null);
  const [recentStudents, setRecentStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get("/admin/dashboard");
        if (response.data.status) {
          setStats(response.data.data.stats);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
    // fetch a short recent students list (includes alumniProfile)
    (async () => {
      try {
        const res = await api.get("/admin/students", {
          params: { per_page: 5 },
        });
        if (res.data.status) setRecentStudents(res.data.data || []);
      } catch (e) {
        console.error("Failed to fetch recent students:", e);
      }
    })();
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

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-2xl bg-gradient-to-r from-tpc-greenDeep via-tpc-green to-emerald-700 p-6 text-white shadow-lg shadow-emerald-900/10">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-100">
                President overview
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
                President Dashboard
              </h1>
            </div>
          </div>
        </header>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Graduates"
            value={stats?.total_graduates || 0}
            icon={<GraduationCap className="h-5 w-5" />}
            color="bg-violet-500"
            detail="Academic completion"
          />
          <StatCard
            title="Total Alumni"
            value={stats?.total_students || 0}
            icon={<Users className="h-5 w-5" />}
            color="bg-tpc-greenDeep"
            detail="All tracked alumni"
          />
          <StatCard
            title="Employed"
            value={stats?.employed_alumni || 0}
            icon={<Briefcase className="h-5 w-5" />}
            color="bg-emerald-600"
            detail="Currently employed"
          />
          <StatCard
            title="Verified"
            value={stats?.verified_students || 0}
            icon={<CheckCircle className="h-5 w-5" />}
            color="bg-green-500"
            detail="Approved records"
          />
          <StatCard
            title="Pending"
            value={stats?.unverified_students || 0}
            icon={<AlertCircle className="h-5 w-5" />}
            color="bg-amber-500"
            detail="Awaiting review"
          />
          <StatCard
            title="Active"
            value={stats?.active_students || 0}
            icon={<ToggleRight className="h-5 w-5" />}
            color="bg-tpc-navy"
            detail="Currently active"
          />
          <StatCard
            title="Inactive"
            value={stats?.inactive_students || 0}
            icon={<Users className="h-5 w-5" />}
            color="bg-red-500"
            detail="Not currently active"
          />
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">
                Student overview
              </h3>
              <a
                href="/president/students"
                className="text-sm font-semibold text-tpc-greenDeep hover:text-tpc-green"
              >
                View all →
              </a>
            </div>

            <div className="space-y-4">
              <OverviewRow
                label="Verified & active"
                count={stats?.verified_students || 0}
                percent={
                  stats?.total_students > 0
                    ? Math.round(
                        ((stats?.verified_students || 0) /
                          stats.total_students) *
                          100,
                      )
                    : 0
                }
                color="bg-green-500"
              />
              <OverviewRow
                label="Pending verification"
                count={stats?.unverified_students || 0}
                percent={
                  stats?.total_students > 0
                    ? Math.round(
                        ((stats?.unverified_students || 0) /
                          stats.total_students) *
                          100,
                      )
                    : 0
                }
                color="bg-amber-500"
              />
              <OverviewRow
                label="Inactive"
                count={stats?.inactive_students || 0}
                percent={
                  stats?.total_students > 0
                    ? Math.round(
                        ((stats?.inactive_students || 0) /
                          stats.total_students) *
                          100,
                      )
                    : 0
                }
                color="bg-red-500"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800">
              Quick actions
            </h3>
            <div className="mt-5 space-y-3">
              <a
                href="/president/students"
                className="block rounded-xl bg-tpc-greenDeep px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-tpc-green"
              >
                Review student applications
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color, detail }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-3 text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div
          className={`${color} flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-sm`}
        >
          {icon}
        </div>
      </div>
      <p className="mt-3 text-xs text-gray-400">{detail}</p>
    </div>
  );
}

function OverviewRow({ label, count, percent, color }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className={`h-3 w-3 rounded-full ${color}`} />
          <span className="text-sm font-medium text-gray-700">{label}</span>
        </div>
        <span className="text-sm font-semibold text-gray-900">{count}</span>
      </div>
      <div className="h-2.5 rounded-full bg-gray-200">
        <div
          className={`${color} h-2.5 rounded-full`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="mt-2 text-right text-xs text-gray-500">{percent}%</div>
    </div>
  );
}
