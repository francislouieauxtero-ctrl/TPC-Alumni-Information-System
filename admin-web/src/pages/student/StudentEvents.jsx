import { useState, useEffect } from "react";
import { CalendarDays, CalendarPlus, MapPin, Users } from "lucide-react";
import eventService from "../../services/eventService";
import {
  getAttachmentUrls,
  getCreatorRoleLabel,
  renderTextWithLinks,
} from "../../utils/media";
import UserAvatar from "../../components/shared/UserAvatar";

export default function StudentEvents() {
  const [events, setEvents] = useState({ data: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ search: "", include_past: false });
  const [currentPage, setCurrentPage] = useState(1);
  const [lightboxImage, setLightboxImage] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, [filters, currentPage]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await eventService.getAll({
        search: filters.search,
        include_past: filters.include_past,
        page: currentPage,
      });
      setEvents(data);
    } catch (err) {
      setError(err.message || "Unable to load events.");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setCurrentPage(1);
  };

  return (
    <div className="px-4 py-6 sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Events
          </h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">
            Browse upcoming and past events that apply to your department.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative">
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search events..."
              className="w-full sm:w-80 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm text-gray-800 shadow-sm focus:border-tpc-green focus:outline-none focus:ring-2 focus:ring-tpc-green/20"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              name="include_past"
              checked={filters.include_past}
              onChange={handleFilterChange}
              className="h-4 w-4 rounded border-gray-300 text-tpc-green focus:ring-tpc-green"
            />
            Show past events
          </label>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {loading && !events.data.length ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tpc-green"></div>
        </div>
      ) : events.data.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
          {events.data.map((event) => (
            <div
              key={event.id}
              className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm sm:rounded-3xl"
            >
              <div className="space-y-4 p-5 sm:p-6">
                <div className="flex items-center gap-3">
                  <UserAvatar
                    name={event.creator?.name || "Unknown user"}
                    avatar={event.creator?.avatar}
                    size="sm"
                    className="shrink-0 bg-tpc-navy ring-0"
                  />
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-gray-900">
                      {event.creator?.name || "Unknown user"}
                    </p>
                    <p className="text-sm text-gray-500">
                      {getCreatorRoleLabel(event.creator)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-y border-gray-200 py-3">
                  <span className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-blue-700">
                    <CalendarPlus className="h-4 w-4" />
                    Event
                  </span>
                  <span className="inline-flex items-center gap-2 text-sm text-gray-600">
                    <CalendarDays className="h-4 w-4" />
                    Posted {new Date(event.created_at).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-3">
                  <h2 className="min-w-0 text-xl font-bold text-tpc-navy break-words">
                    {event.title || "Event"}
                  </h2>
                  <span
                    className={`shrink-0 rounded-lg px-2 py-1 text-xs font-semibold ${
                      event.scope === "school_wide"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-purple-100 text-purple-700"
                    }`}
                  >
                    {event.scope === "school_wide"
                      ? "School-wide"
                      : event.department?.name || "Department"}
                  </span>
                </div>

                <div className="grid gap-2 border-t border-gray-200 pt-4 text-sm text-gray-600 sm:grid-cols-2">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 shrink-0 text-tpc-green" />
                    <span className="font-medium text-gray-900">
                      {new Date(event.event_date).toLocaleDateString(
                        undefined,
                        {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        },
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 min-w-0">
                    <MapPin className="h-4 w-4 shrink-0 text-tpc-green" />
                    <span className="truncate font-medium text-gray-900">
                      {event.location || "TBA"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 shrink-0 text-tpc-green" />
                    <span className="font-medium text-gray-900">
                      {event.is_future ? "Upcoming" : "Past"}
                    </span>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <p className="text-sm leading-7 text-gray-700 whitespace-pre-line break-words">
                    {renderTextWithLinks(
                      event.description || "No description available.",
                    )}
                  </p>
                </div>
              </div>

              {getAttachmentUrls(event).length > 0 && (
                <div className="grid gap-3 px-5 pb-5 sm:grid-cols-2 sm:px-6 sm:pb-6 lg:grid-cols-3">
                  {getAttachmentUrls(event).map((image, index) => {
                    const isImage = /\.(jpg|jpeg|png|webp|gif)$/i.test(image);
                    const isVideo = /\.(mp4|webm|mov|avi)$/i.test(image);

                    if (isImage) {
                      return (
                        <button
                          key={`${event.id}-${index}`}
                          type="button"
                          onClick={() => setLightboxImage(image)}
                          className="block"
                        >
                          <img
                            src={image}
                            alt={`${event.title || "Event"} ${index + 1}`}
                            className="h-40 w-full rounded-xl object-cover border border-gray-200 hover:shadow-lg transition cursor-zoom-in"
                          />
                        </button>
                      );
                    }

                    if (isVideo) {
                      return (
                        <video
                          key={`${event.id}-${index}`}
                          src={image}
                          controls
                          preload="metadata"
                          className="h-40 w-full rounded-xl object-cover border border-gray-200 bg-black"
                        />
                      );
                    }

                    return (
                      <a
                        key={`${event.id}-${index}`}
                        href={image}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center h-40 bg-gray-100 rounded-xl border border-gray-200 hover:bg-gray-200 transition"
                        title={image}
                      >
                        <div className="text-center">
                          <div className="text-2xl mb-2">📎</div>
                          <div className="text-xs text-gray-600 px-2 break-all">
                            File
                          </div>
                        </div>
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-gray-500 sm:rounded-3xl sm:p-12">
          No events match your current search.
        </div>
      )}

      {events.meta?.last_page > 1 && (
        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
            className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-500">
            Page {currentPage} of {events.meta.last_page}
          </span>
          <button
            disabled={currentPage >= events.meta.last_page}
            onClick={() => setCurrentPage((page) => page + 1)}
            className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setLightboxImage(null)}
        >
          <button
            type="button"
            onClick={() => setLightboxImage(null)}
            className="absolute top-4 right-4 text-white text-2xl leading-none rounded-full bg-white/10 hover:bg-white/20 w-10 h-10 flex items-center justify-center"
            aria-label="Close"
          >
            ×
          </button>
          <img
            src={lightboxImage}
            alt="Full size attachment"
            className="max-h-full max-w-full rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
