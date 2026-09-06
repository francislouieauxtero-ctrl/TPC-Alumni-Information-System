import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import eventService from "../../../services/eventService";
import { toast } from "react-toastify";
import {
  getAttachmentUrls,
  getCreatorRoleLabel,
  renderTextWithLinks,
} from "../../../utils/media";
import UserAvatar from "../../../components/shared/UserAvatar";

export default function EventList() {
  const navigate = useNavigate();
  const [events, setEvents] = useState({ data: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [filters, setFilters] = useState({ search: "", include_past: false });
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchEvents();
  }, [currentPage, filters]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const reqFilters = { ...filters, page: currentPage };
      const userRole = localStorage.getItem("userRole");
      if (userRole === "admin") {
        const deptId = localStorage.getItem("departmentId");
        if (deptId) {
          // Request department-specific events for this admin
          reqFilters.department_id = deptId;
          // Also request school-wide events so admins see public events
          reqFilters.include_school_wide = true;
        }
      }
      const data = await eventService.getAll(reqFilters);
      setEvents(data);
    } catch (err) {
      setError(err.message || "Failed to fetch events");
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;

    try {
      await eventService.delete(id);
      toast.success("Event deleted successfully");
      fetchEvents();
    } catch (err) {
      toast.error(err.message || "Failed to delete event");
    }
  };

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters({
      ...filters,
      [name]: type === "checkbox" ? checked : value,
    });
    setCurrentPage(1);
  };

  if (loading && !events.data?.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tpc-green"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Events</h1>
        <button
          onClick={() => navigate("create")}
          className="px-6 py-2 bg-tpc-greenDeep hover:bg-tpc-green text-white rounded-full transition"
        >
          + Create Event
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            name="search"
            placeholder="Search events..."
            value={filters.search}
            onChange={handleFilterChange}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tpc-green"
          />
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="include_past"
              checked={filters.include_past}
              onChange={handleFilterChange}
              className="w-4 h-4"
            />
            <span className="text-sm text-gray-700">Include past events</span>
          </label>
        </div>
      </div>

      {/* Events Grid */}
      {events.data && events.data.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.data.map((event) => (
            <div
              key={event.id}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4"
            >
              {/* Header */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {event.title}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2 whitespace-pre-line">
                  {renderTextWithLinks(event.description || "")}
                </p>
              </div>

              {/* Details */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium text-gray-800">
                    {new Date(event.event_date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Posted:</span>
                  <span className="font-medium text-gray-800">
                    {new Date(event.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">By:</span>
                  <span className="flex items-center gap-2 text-right">
                    <UserAvatar
                      name={event.creator?.name || "Unknown user"}
                      avatar={event.creator?.avatar}
                      size="sm"
                      className="h-8 w-8 bg-tpc-navy ring-0"
                    />
                    <span>
                      <span className="block font-medium text-gray-800">
                        {event.creator?.name || "Unknown user"}
                      </span>
                      <span className="block text-xs text-gray-500">
                        {getCreatorRoleLabel(event.creator)}
                      </span>
                    </span>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Location:</span>
                  <span className="font-medium text-gray-800">
                    {event.location || "-"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Scope:</span>
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      event.scope === "school_wide"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-purple-100 text-purple-700"
                    }`}
                  >
                    {event.scope === "school_wide"
                      ? "School-wide"
                      : "Department-specific"}
                  </span>
                </div>
              </div>

              {/* Status */}
              <div className="flex gap-2 pt-2 border-t border-gray-200">
                {event.is_future ? (
                  <span className="text-xs font-semibold px-2 py-1 bg-amber-100 text-amber-700 rounded">
                    Upcoming
                  </span>
                ) : (
                  <span className="text-xs font-semibold px-2 py-1 bg-gray-100 text-gray-700 rounded">
                    Past
                  </span>
                )}
              </div>

              {getAttachmentUrls(event).length > 0 && (
                <div className="mt-2">
                  <div className="grid grid-cols-2 gap-2">
                    {getAttachmentUrls(event).map((image, idx) => {
                      const isImage = /\.(jpg|jpeg|png|webp|gif)$/i.test(image);
                      const isVideo = /\.(mp4|webm|mov|avi)$/i.test(image);

                      if (isImage) {
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setLightboxImage(image)}
                            className="block"
                          >
                            <img
                              src={image}
                              alt={`Event ${idx + 1}`}
                              className="w-full h-24 object-cover rounded-lg border border-gray-200 cursor-zoom-in"
                            />
                          </button>
                        );
                      }

                      if (isVideo) {
                        return (
                          <video
                            key={idx}
                            src={image}
                            controls
                            preload="metadata"
                            className="w-full h-24 rounded-lg object-cover border border-gray-200 bg-black"
                          />
                        );
                      }

                      return (
                        <a
                          key={idx}
                          href={image}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-center h-24 bg-gray-100 rounded-lg border border-gray-200"
                        >
                          <div className="text-xs text-gray-600 px-2 break-all">
                            File
                          </div>
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-gray-200">
                <button
                  onClick={() => navigate(`${event.id}`)}
                  className="flex-1 px-4 py-2 text-tpc-green border border-tpc-green rounded-lg hover:bg-tpc-green hover:text-white transition"
                >
                  View
                </button>
                <button
                  onClick={() => navigate(`${event.id}/edit`)}
                  className="flex-1 px-4 py-2 text-tpc-green border border-tpc-green rounded-lg hover:bg-tpc-green hover:text-white transition"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(event.id)}
                  className="flex-1 px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-600 hover:text-white transition"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-lg shadow-sm border border-gray-200 text-center">
          <p className="text-gray-500">No events found</p>
        </div>
      )}

      {/* Pagination */}
      {events.meta?.last_page > 1 && (
        <div className="flex justify-center gap-2">
          {currentPage > 1 && (
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Previous
            </button>
          )}
          {currentPage < events.meta?.last_page && (
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Next
            </button>
          )}
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
