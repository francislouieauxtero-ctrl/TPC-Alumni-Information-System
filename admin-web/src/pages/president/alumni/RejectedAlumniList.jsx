import { useEffect, useState } from "react";
import { XCircle, Search, Mail, Calendar, User } from "lucide-react";
import { toast } from "react-toastify";
import alumniService from "../../../services/alumniService";

export default function RejectedAlumniList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchRejected = async () => {
    try {
      setLoading(true);
      const data = await alumniService.getRejected();
      setItems(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      toast.error(err.message || "Failed to load rejected alumni");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRejected();
  }, []);

  const filteredItems = items.filter((item) => {
    const target = item.target || item.user || {};
    const actor = item.actor || {};
    const metadata = item.metadata || {};
    const userName = target.name || metadata.alumni_name || "";
    const userEmail = target.email || metadata.alumni_email || "";
    const value = `${userName} ${userEmail} ${actor.name || ""}`.toLowerCase();
    return value.includes(search.toLowerCase());
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tpc-green"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Rejected Alumni Registrations
          </h1>
          <p className="text-gray-600 mt-1">
            List of alumni accounts rejected during application review.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 border border-red-200">
          <XCircle className="h-4 w-4" />
          {filteredItems.length} rejected
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search rejected alumni by name or email"
            className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 text-sm text-gray-700 outline-none focus:border-tpc-greenDeep focus:ring-2 focus:ring-tpc-greenDeep/20"
          />
        </div>
      </div>

      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredItems.map((item) => {
            const user = item.target || item.user || {};
            const actor = item.actor || {};
            const metadata = item.metadata || {};
            const rejectedAt = item.created_at || item.createdAt;
            const reason = item.reason || "No additional reason provided.";
            const displayName =
              user.name || metadata.alumni_name || "Unknown Alumni";
            const displayEmail =
              user.email || metadata.alumni_email || "No email available";

            return (
              <div
                key={item.id}
                className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {displayName}
                    </h3>
                    <p className="text-sm text-gray-500">{displayEmail}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
                    <XCircle className="h-3.5 w-3.5" />
                    Rejected
                  </span>
                </div>

                <div className="space-y-3 text-sm text-gray-700">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span>Reviewed by: {actor.name || "System"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span>{displayEmail}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>
                      {rejectedAt ? new Date(rejectedAt).toLocaleString() : "—"}
                    </span>
                  </div>
                </div>

                <div className="rounded-lg border border-red-100 bg-red-50 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-red-600 mb-1">
                    Reason
                  </p>
                  <p className="text-sm text-red-700 leading-relaxed">
                    {reason}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-12 text-center">
          <p className="text-gray-500">
            No rejected alumni registrations found.
          </p>
        </div>
      )}
    </div>
  );
}
