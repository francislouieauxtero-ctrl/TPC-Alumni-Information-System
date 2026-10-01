import { useState } from "react";
import { Search, X, CalendarPlus, ChevronLeft, ChevronRight, Calendar, MapPin, Download, FileText } from "lucide-react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import eventService from "../../services/eventService";
import EventFeedPost from "../../components/feed/EventFeedPost";
import MediaLightbox from "../../components/feed/MediaLightbox";
import FeedSkeleton from "../../components/feed/FeedSkeleton";
import useDebounce from "../../components/feed/useDebounce";
import {
  renderTextWithLinks,
  resolveStorageUrl,
  formatPostDate,
  getCreatorRoleLabel,
  getEventStatusInfo,
} from "../../utils/media";

export default function StudentEvents() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 350);
  const [includePast, setIncludePast] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [lightboxData, setLightboxData] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // React Query fetching with 30s staleTime
  const queryParams = {
    search: debouncedSearch,
    include_past: includePast,
    page: currentPage,
    sort_by: "created_at",
    sort_direction: "desc",
  };

  const { data: response, isLoading, isError, error } = useQuery({
    queryKey: ["student_events", queryParams],
    queryFn: () => eventService.getAll(queryParams),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 30,
  });

  const rawEvents = response?.data || [];
  const events = [...rawEvents].sort((a, b) => {
    const timeA = new Date(a.created_at || a.published_at || 0).getTime();
    const timeB = new Date(b.created_at || b.published_at || 0).getTime();
    return timeB - timeA;
  });
  const meta = response?.meta || {};

  const handleOpenLightbox = (images, index, title) => {
    setLightboxData({ images, index, title });
  };

  return (
    <div className="px-4 py-6 sm:p-8 space-y-6">
      {/* Top Banner Header */}
      <header className="rounded-2xl bg-gradient-to-r from-[#006400] via-[#008000] to-[#00A000] p-4 sm:p-6 text-white shadow-sm max-w-2xl mx-auto">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-green-100 flex items-center gap-1.5">
            <CalendarPlus className="w-3.5 h-3.5" />
            Campus Activities
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl text-white">
            Events
          </h1>
          <p className="mt-1 text-sm text-green-50/90">
            Browse upcoming school activities and alumni gatherings.
          </p>
        </div>
      </header>

      {/* Centered Social Feed Container */}
      <div className="max-w-2xl mx-auto space-y-5">
        {/* Filters Toolbar */}
        <div className="bg-white p-3 sm:p-3.5 rounded-2xl shadow-xs border border-gray-200/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search events by title or location..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50/60 pl-10 pr-9 py-2 text-sm text-gray-900 placeholder-gray-400 focus:bg-white focus:border-tpc-green focus:outline-none focus:ring-2 focus:ring-tpc-green/20 transition-all"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setCurrentPage(1);
                }}
                className="absolute right-3 p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-700 cursor-pointer self-start sm:self-auto px-1 select-none">
            <input
              type="checkbox"
              checked={includePast}
              onChange={(e) => {
                setIncludePast(e.target.checked);
                setCurrentPage(1);
              }}
              className="w-4 h-4 rounded border-gray-300 text-tpc-green focus:ring-tpc-green/20 cursor-pointer accent-tpc-green"
            />
            <span>Show past events</span>
          </label>
        </div>

        {/* Error State */}
        {isError && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error?.message || "Unable to load events. Please check your connection."}
          </div>
        )}

        {/* Loading Skeletons */}
        {isLoading && !events.length ? (
          <FeedSkeleton count={3} />
        ) : events.length > 0 ? (
          <div className="space-y-4 sm:space-y-5">
            {events.map((event) => (
              <EventFeedPost
                key={event.id}
                event={event}
                onView={() => setSelectedEvent(event)}
                onOpenLightbox={handleOpenLightbox}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white p-12 rounded-2xl shadow-xs border border-gray-200/80 text-center">
            <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="font-semibold text-gray-700">No events found</p>
            <p className="text-sm text-gray-500 mt-1">
              {search
                ? `No events matching "${search}". Try another keyword.`
                : includePast
                ? "No events found in the archives."
                : "There are no upcoming events scheduled at this moment."}
            </p>
          </div>
        )}

        {/* Pagination Bar */}
        {meta?.last_page > 1 && (
          <div className="pt-2 flex items-center justify-between bg-white px-4 py-3 rounded-2xl border border-gray-200/80 shadow-xs">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <span className="text-xs font-medium text-gray-500">
              Page <span className="font-bold text-gray-800">{currentPage}</span> of{" "}
              <span className="font-bold text-gray-800">{meta.last_page}</span>
            </span>

            <button
              disabled={currentPage >= meta.last_page}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, meta.last_page))}
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Fullscreen Lightbox Modal */}
      {lightboxData && (
        <MediaLightbox
          images={lightboxData.images}
          initialIndex={lightboxData.index}
          title={lightboxData.title}
          onClose={() => setLightboxData(null)}
        />
      )}

      {/* Event Details Modal */}
      {selectedEvent && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150"
          onClick={() => setSelectedEvent(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="event-modal-title"
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl border border-gray-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-gray-100 p-5 sm:p-6 sticky top-0 bg-white/95 backdrop-blur-md z-10">
              <div className="min-w-0">
                <h2 id="event-modal-title" className="break-words text-xl sm:text-2xl font-bold text-tpc-navy">
                  {selectedEvent.title}
                </h2>
                <div className="mt-1 flex flex-col">
                  <span className="text-sm font-semibold text-gray-800">
                    {selectedEvent.creator?.name || "Administrator"}
                  </span>
                  <span className="text-xs text-gray-500 mt-0.5">
                    {getCreatorRoleLabel(selectedEvent.creator)} • {formatPostDate(selectedEvent.created_at)}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="space-y-4 p-5 sm:p-6 text-sm">
              <div className="grid gap-3 rounded-xl border border-gray-100 bg-gray-50/80 p-3.5 sm:grid-cols-2">
                <div className="flex items-center gap-2 text-gray-700">
                  <Calendar className="w-4 h-4 text-tpc-green shrink-0" />
                  <div>
                    <span className="block text-xs text-gray-500 font-medium">Date & Time</span>
                    <span className="font-semibold text-gray-900">
                      {new Date(selectedEvent.event_date).toLocaleString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-gray-700">
                  <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                  <div>
                    <span className="block text-xs text-gray-500 font-medium">Location</span>
                    <span className="font-semibold text-gray-900">{selectedEvent.location || "TBA"}</span>
                  </div>
                </div>
              </div>

              {selectedEvent.description && (
                <div className="space-y-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">Description</h4>
                  <div className="text-gray-700 whitespace-pre-line leading-relaxed">
                    {renderTextWithLinks(selectedEvent.description)}
                  </div>
                </div>
              )}

              {/* Attachments inside modal */}
              {Array.isArray(selectedEvent.attachments) && selectedEvent.attachments.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-gray-100">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">Attachments</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedEvent.attachments.map((att, idx) => {
                      const url = typeof att === "string" ? att : att?.url || att?.path || "";
                      const name = typeof att === "object" ? att?.name || `Attachment ${idx + 1}` : `Attachment ${idx + 1}`;
                      return (
                        <a
                          key={idx}
                          href={resolveStorageUrl(url)}
                          target="_blank"
                          rel="noreferrer noopener"
                          download
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 text-xs font-medium text-gray-700 hover:text-tpc-navy transition-colors"
                        >
                          <FileText className="w-4 h-4 text-tpc-green" />
                          <span className="truncate max-w-[200px]">{name}</span>
                          <Download className="w-3.5 h-3.5 text-gray-400" />
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
