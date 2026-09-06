import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import eventService from "../../../services/eventService";
import { toast } from "react-toastify";
import {
  getAttachmentUrls,
  getCreatorRoleLabel,
  renderTextWithLinks,
} from "../../../utils/media";
import UserAvatar from "../../../components/shared/UserAvatar";

export default function EventView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const basePath =
    localStorage.getItem("userRole") === "admin"
      ? "/department-head/events"
      : "/president/events";
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lightboxImage, setLightboxImage] = useState(null);

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const data = await eventService.getById(id);
      setEvent(data);
    } catch (err) {
      toast.error("Failed to load event");
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      await eventService.delete(id);
      toast.success("Event deleted successfully");
      navigate(basePath);
    } catch (err) {
      toast.error(err.message || "Failed to delete event");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tpc-green"></div>
      </div>
    );
  }

  if (!event) return null;

  const attachments = getAttachmentUrls(event);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(basePath)}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition text-sm"
        >
          ← Back to Events
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`${basePath}/${id}/edit`)}
            className="px-5 py-2 bg-tpc-greenDeep hover:bg-tpc-green text-white rounded-full text-sm transition"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="px-5 py-2 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white rounded-full text-sm transition"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Main card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Title bar */}
        <div className="px-8 py-6 border-b border-gray-200">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-1">
                {event.title}
              </h1>
              <div className="mt-2 space-y-1 text-sm text-gray-500">
                <p>
                  Posted:{" "}
                  <span className="font-medium text-gray-700">
                    {new Date(event.created_at).toLocaleDateString()}
                  </span>
                </p>
                <p>
                  By:{" "}
                  <span className="flex items-center gap-2 font-medium text-gray-700">
                    <UserAvatar
                      name={event.creator?.name || "Unknown user"}
                      avatar={event.creator?.avatar}
                      size="sm"
                      className="h-8 w-8 bg-tpc-navy ring-0"
                    />
                    <span>
                      <span className="block">
                        {event.creator?.name || "Unknown user"}
                      </span>
                      <span className="block text-xs font-normal text-gray-500">
                        {getCreatorRoleLabel(event.creator)}
                      </span>
                    </span>
                  </span>
                </p>
              </div>
            </div>

            {/* Status badge */}
            <div className="flex flex-col items-end gap-2 shrink-0">
              {event.is_future ? (
                <span className="text-xs font-semibold px-3 py-1 bg-amber-100 text-amber-700 rounded-full">
                  Upcoming
                </span>
              ) : (
                <span className="text-xs font-semibold px-3 py-1 bg-gray-100 text-gray-600 rounded-full">
                  Past
                </span>
              )}
              <span
                className={`text-xs font-semibold px-3 py-1 rounded-full ${
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
        </div>

        {/* Details grid */}
        <div className="px-8 py-6 grid grid-cols-1 sm:grid-cols-2 gap-6 border-b border-gray-200">
          <Detail label="Event Date">
            {new Date(event.event_date).toLocaleDateString("en-PH", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Detail>

          <Detail label="Location">{event.location || "—"}</Detail>

          <Detail label="Department">
            {event.department?.name ?? (
              <span className="text-gray-400 italic">
                {event.scope === "school_wide" ? "All departments" : "—"}
              </span>
            )}
          </Detail>

          <Detail label="Scope">
            {event.scope === "school_wide"
              ? "School-wide"
              : "Department-specific"}
          </Detail>
        </div>

        {/* Description */}
        {event.description && (
          <div className="px-8 py-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
              Description
            </p>
            <div className="max-h-64 overflow-y-auto pr-2 text-gray-700 leading-relaxed whitespace-pre-wrap">
              {renderTextWithLinks(event.description)}
            </div>
          </div>
        )}
        {attachments.length > 0 && (
          <div className="px-8 py-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
              Attachments
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {attachments.map((image, index) => {
                const isImage = /\.(jpg|jpeg|png|webp|gif)$/i.test(image);
                const isVideo = /\.(mp4|webm|mov|avi)$/i.test(image);

                if (isImage) {
                  return (
                    <button
                      key={`${index}`}
                      type="button"
                      onClick={() => setLightboxImage(image)}
                      className="block"
                    >
                      <img
                        src={image}
                        alt={`Attachment ${index + 1}`}
                        className="h-40 w-full rounded-xl object-cover border border-gray-200 hover:shadow-lg transition cursor-zoom-in"
                      />
                    </button>
                  );
                }

                if (isVideo) {
                  return (
                    <video
                      key={`${index}`}
                      src={image}
                      controls
                      preload="metadata"
                      className="h-40 w-full rounded-xl object-cover border border-gray-200 bg-black"
                    />
                  );
                }

                return (
                  <a
                    key={`${index}`}
                    href={image}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center h-40 bg-gray-100 rounded-xl border border-gray-200 hover:bg-gray-200 transition"
                    title={image}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">📎</div>
                      <div className="text-xs text-gray-600 px-2 break-all">
                        {image.split("/").pop()}
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
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
    </div>
  );
}

function Detail({ label, children }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">
        {label}
      </p>
      <p className="text-gray-800 font-medium">{children}</p>
    </div>
  );
}
