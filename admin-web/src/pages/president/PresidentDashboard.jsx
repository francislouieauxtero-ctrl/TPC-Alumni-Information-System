import { useState, useEffect } from "react";
import api from "../../services/api";
import eventService from "../../services/eventService";
import announcementService from "../../services/announcementService";
import { format } from "date-fns";
import {
  Users,
  CheckCircle,
  AlertCircle,
  Briefcase,
  GraduationCap,
  Calendar,
  Megaphone,
} from "lucide-react";

export default function PresidentDasboard() {
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
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
      }
    };

    const fetchEventsAndAnnouncements = async () => {
      try {
        const [eventsRes, announcementsRes] = await Promise.all([
          eventService.getAll(),
          announcementService.getAll(),
        ]);
        
        // Take top 3 events
        if (eventsRes?.data) {
          setEvents(eventsRes.data.slice(0, 3));
        }
        
        // Take top 3 announcements
        if (announcementsRes?.data) {
          setAnnouncements(announcementsRes.data.slice(0, 3));
        }
      } catch (e) {
        console.error("Failed to fetch events or announcements:", e);
      }
    };

    Promise.all([fetchDashboard(), fetchEventsAndAnnouncements()]).finally(() => {
      setLoading(false);
    });
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
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <header className="rounded-2xl bg-gradient-to-r from-tpc-greenDeep via-tpc-green to-emerald-700 p-4 sm:p-6 text-white shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-100">
              President overview
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
              President Dashboard
            </h1>
          </div>
        </div>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <StatCard
          title="Total Departments"
          value={stats?.total_departments || 0}
          icon={<Briefcase className="h-5 w-5" />}
          color="bg-emerald-600"
          detail="Academic departments"
        />
        <StatCard
          title="Total Graduates"
          value={stats?.total_graduates || 0}
          icon={<GraduationCap className="h-5 w-5" />}
          color="bg-violet-500"
          detail="Academic completion records"
        />
        <StatCard
          title="Registered Alumni"
          value={stats?.registered_alumni ?? stats?.total_students ?? 0}
          icon={<Users className="h-5 w-5" />}
          color="bg-tpc-greenDeep"
          detail="Registered alumni accounts"
        />
        <StatCard
          title="Not Registered Alumni"
          value={stats?.not_registered_graduates || 0}
          icon={<Users className="h-5 w-5" />}
          color="bg-amber-500"
          detail="Graduates without account"
        />
        <StatCard
          title="Active Alumni"
          value={stats?.active_students || 0}
          icon={<CheckCircle className="h-5 w-5" />}
          color="bg-green-600"
          detail="Logged in within 30 days"
        />
        <StatCard
          title="Inactive Alumni"
          value={stats?.inactive_students || 0}
          icon={<AlertCircle className="h-5 w-5" />}
          color="bg-rose-500"
          detail="Not logged in for 90+ days"
        />
      </section>



      {/* Events and Announcements Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Upcoming Events */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm">
          <div className="mb-4 sm:mb-5 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-tpc-greenDeep" />
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                  Upcoming Events
                </h3>
                <p className="text-xs text-gray-500">Scheduled campus & alumni activities</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {events.length > 0 ? (
              events.map((event) => (
                <div key={event.id} className="rounded-xl border border-gray-100 bg-gray-50 p-4 flex items-start gap-4">
                  <div className="flex flex-col items-center justify-center bg-white border border-gray-200 rounded-lg p-2 min-w-[50px]">
                    <span className="text-xs font-bold text-gray-500 uppercase">{format(new Date(event.event_date), "MMM")}</span>
                    <span className="text-lg font-bold text-gray-900">{format(new Date(event.event_date), "d")}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium">
                        {event.department ? event.department.name : "TPC Community"}
                      </span>
                      <span className="text-xs text-gray-500">{format(new Date(event.event_date), "h:mm a")}</span>
                    </div>
                    <h4 className="text-sm font-semibold text-gray-900">{event.title}</h4>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">{event.location}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No upcoming events</p>
            )}
          </div>
        </div>

        {/* Recent Announcements */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm">
          <div className="mb-4 sm:mb-5 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-amber-500" />
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                  Recent Announcements
                </h3>
                <p className="text-xs text-gray-500">Latest university & alumni updates</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {announcements.length > 0 ? (
              announcements.map((announcement) => (
                <div key={announcement.id} className="rounded-xl border border-amber-100/50 bg-amber-50/30 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-medium">
                      {announcement.department ? announcement.department.name : "TPC Community"}
                    </span>
                    <span className="text-xs text-gray-500">{format(new Date(announcement.created_at), "MMM d, yyyy")}</span>
                  </div>
                  <h4 className="text-sm font-bold text-gray-900 uppercase">{announcement.title}</h4>
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">{announcement.content}</p>
                  <p className="text-[10px] text-gray-400 mt-2 uppercase">Administrator: {announcement.author?.name}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No recent announcements</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCard({ title, value, icon, color, detail }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">{title}</p>
          <p className="mt-1.5 sm:mt-2 text-2xl sm:text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div
          className={`${color} flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl text-white shadow-sm`}
        >
          {icon}
        </div>
      </div>
      <p className="mt-2 sm:mt-3 text-xs text-gray-400 line-clamp-1">{detail}</p>
    </div>
  );
}


