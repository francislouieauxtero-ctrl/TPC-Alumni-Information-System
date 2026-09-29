import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import eventService from "../../../services/eventService";
import { toast } from "react-toastify";
import {
  getAttachmentUrls,
  getCreatorRoleLabel,
  renderTextWithLinks,
  formatPostDate,
  getEventStatusInfo,
} from "../../../utils/media";
import UserAvatar from "../../../components/shared/UserAvatar";
import MediaLightbox from "../../../components/feed/MediaLightbox";
import MediaGallery from "../../../components/feed/MediaGallery";

export default function EventView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  // Fast cache resolution: Check navigation state, then React Query caches
  const getCachedEvent = () => {
    // 1. Direct navigation state
    if (location.state?.event) {
      return location.state.event;
    }

    // 2. Direct single query cache
    const direct =
      queryClient.getQueryData(["event", String(id)]) ||
      queryClient.getQueryData(["event", Number(id)]);
    if (direct) return direct;

    // 3. Search in cached event list queries (student_events, admin_events, events)
    try {
      const queries = queryClient.getQueriesData({
        predicate: (q) => {
          const key = q.queryKey[0];
          return typeof key === "string" && (key.includes("event") || key === "events");
        },
      });

      for (const [_, result] of queries) {
        const list = result?.data || (Array.isArray(result) ? result : []);
        if (Array.isArray(list)) {
          const found = list.find((item) => String(item.id) === String(id));
          if (found) return found;
        }
      }
    } catch {
      // Ignore cache lookup error if queryClient unavailable
    }

    return null;
  };

  const initialEvent = getCachedEvent();
  const [event, setEvent] = useState(initialEvent);
  const [loading, setLoading] = useState(!initialEvent);
  const [lightboxData, setLightboxData] = useState(null);

  const basePath =
    localStorage.getItem("userRole") === "admin"
      ? "/department-head/events"
      : "/president/events";

  useEffect(() => {
    let isMounted = true;
    const fetchEvent = async () => {
      try {
        // Only trigger loading spinner if we don't already have cached data
        if (!event) setLoading(true);
        const data = await eventService.getById(id);
        if (isMounted && data) {
          setEvent(data);
          queryClient.setQueryData(["event", String(id)], data);
        }
      } catch {
        if (!event) {
          toast.error("Failed to load event");
          navigate(-1);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchEvent();
    return () => {
      isMounted = false;
    };
  }, [id, navigate, queryClient]);

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

  if (loading && !event) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#008000]"></div>
      </div>
    );
  }

  if (!event) return null;

  const allAttachments = getAttachmentUrls(event);
  const imageAttachments = allAttachments.filter((att) =>
    /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(att.split("?")[0])
  );
  const otherAttachments = allAttachments.filter(
    (att) => !/\.(jpg|jpeg|png|webp|gif|svg)$/i.test(att.split("?")[0])
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-150">
      {/* Header Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(basePath)}
          className="inline-flex items-center gap-2 text-gray-500 hover:text-[#006400] transition-colors text-sm font-medium cursor-pointer"
        >
          ← Back to Events
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`${basePath}/${id}/edit`)}
            className="px-5 py-2 bg-[#008000] hover:bg-[#006400] text-white rounded-full text-sm font-semibold shadow-xs transition-colors cursor-pointer"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="px-5 py-2 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white rounded-full text-sm font-semibold transition-colors cursor-pointer"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Main card */}
      <div className="bg-white rounded-2xl shadow-xs border border-gray-200/90 overflow-hidden relative">
        {/* Subtle Minimalist TPC Green Top Line */}
        <div className="h-[3px] w-full bg-gradient-to-r from-[#006400] via-[#008000] to-emerald-300" />

        {/* Title bar */}
        <div className="px-8 py-6 border-b border-gray-100">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-1 leading-tight">
                {event.title}
              </h1>
              {/* Author Info: Author name on top, Role • Published date directly underneath */}
              <div className="mt-3 flex items-center gap-3">
                <UserAvatar
                  name={event.creator?.name || "Unknown user"}
                  avatar={event.creator?.avatar}
                  size="sm"
                  className="h-9 w-9 shrink-0 bg-tpc-navy ring-1 ring-[#008000]/30 shadow-2xs"
                />
                <div className="flex flex-col min-w-0">
                  <span className="font-semibold text-gray-900 text-sm sm:text-base leading-snug">
                    {event.creator?.name || "Unknown user"}
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap text-xs text-gray-500 mt-0.5">
                    <span className="font-medium text-gray-700">
                      {getCreatorRoleLabel(event.creator)}
                    </span>
                    <span className="text-gray-300">•</span>
                    <p className="text-gray-600 font-medium">
                      {formatPostDate(event.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Status badge */}
            <div className="flex flex-col items-end gap-2 shrink-0">
              {(() => {
                const statusInfo = getEventStatusInfo(event.event_date);
                return (
                  <span
                    className={`text-[11px] font-bold tracking-wide uppercase px-3 py-1 rounded-full shadow-2xs ${statusInfo.badgeClass}`}
                  >
                    {statusInfo.label}
                  </span>
                );
              })()}
              <span
                className={`text-xs font-semibold px-3 py-1 rounded-full shadow-2xs ${
                  event.scope === "school_wide"
                    ? "bg-emerald-50 text-[#006400] border border-emerald-200/90"
                    : "bg-purple-50 text-purple-700 border border-purple-200/90"
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
        <div className="px-8 py-6 grid grid-cols-1 sm:grid-cols-2 gap-6 border-b border-gray-100">
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
            <p className="text-xs font-bold text-[#006400] uppercase tracking-wider mb-2">
              Description
            </p>
            <div className="max-h-64 overflow-y-auto pr-2 text-gray-700 leading-relaxed whitespace-pre-wrap text-sm sm:text-base">
              {renderTextWithLinks(event.description)}
            </div>
          </div>
        )}

        {/* Media / Images Section */}
        {imageAttachments.length > 0 && (
          <div className="px-8 py-6 border-t border-gray-100">


            {/* Single Image: Centered, natural aspect ratio, clean social presentation */}
            {imageAttachments.length === 1 ? (
              <div className="w-full flex justify-center items-center py-1">
                <button
                  type="button"
                  onClick={() =>
                    setLightboxData({
                      images: imageAttachments,
                      index: 0,
                      title: event.title,
                    })
                  }
                  className="group relative max-w-2xl w-full overflow-hidden rounded-2xl border border-gray-200/80 bg-gray-50/50 shadow-xs hover:shadow-md transition-all cursor-zoom-in text-center focus:outline-none focus:ring-2 focus:ring-[#008000]/40"
                  title="Click to view full size"
                >
                  <img
                    src={imageAttachments[0]}
                    alt={event.title || "Event attachment"}
                    loading="lazy"
                    className="max-h-[500px] w-auto mx-auto object-contain transition-transform duration-300 group-hover:scale-[1.01] block rounded-xl"
                  />
                </button>
              </div>
            ) : (
              /* Multi-Image: Facebook-style collage */
              <MediaGallery
                images={imageAttachments}
                title={event.title}
                onImageClick={(idx) =>
                  setLightboxData({
                    images: imageAttachments,
                    index: idx,
                    title: event.title,
                  })
                }
              />
            )}
          </div>
        )}

        {/* Other Attachments (Documents, Videos) */}
        {otherAttachments.length > 0 && (
          <div className="px-8 py-6 border-t border-gray-100">
            <p className="text-xs font-bold text-[#006400] uppercase tracking-wider mb-3">
              Documents & Files ({otherAttachments.length})
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {otherAttachments.map((att, index) => {
                const isVideo = /\.(mp4|webm|mov|avi)$/i.test(
                  att.split("?")[0]
                );

                if (isVideo) {
                  return (
                    <video
                      key={`${index}`}
                      src={att}
                      controls
                      preload="metadata"
                      className="max-h-[360px] w-full rounded-xl border border-gray-200 bg-black object-cover"
                    />
                  );
                }

                return (
                  <a
                    key={`${index}`}
                    href={att}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-28 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-center transition hover:bg-gray-100 hover:border-[#008000]/40"
                    title={att}
                  >
                    <div className="text-center px-3">
                      <div className="text-2xl mb-1">📎</div>
                      <div className="text-xs text-gray-700 break-all font-medium">
                        {att.split("/").pop()}
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxData && (
        <MediaLightbox
          images={lightboxData.images}
          initialIndex={lightboxData.index}
          title={lightboxData.title}
          onClose={() => setLightboxData(null)}
        />
      )}
    </div>
  );
}

function Detail({ label, children }) {
  return (
    <div>
      <p className="text-xs font-bold text-[#006400] uppercase tracking-wider mb-1">
        {label}
      </p>
      <p className="text-gray-800 font-medium">{children}</p>
    </div>
  );
}
