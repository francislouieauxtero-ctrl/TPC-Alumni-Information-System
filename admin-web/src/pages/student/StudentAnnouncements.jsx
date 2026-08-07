import { useState, useEffect } from "react";
import { CalendarClock, UserCircle2 } from "lucide-react";
import announcementService from "../../services/announcementService";

export default function StudentAnnouncements() {
  const [announcements, setAnnouncements] = useState({ data: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchAnnouncements();
  }, [search, currentPage]);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await announcementService.getAll({
        search,
        page: currentPage,
      });
      setAnnouncements(data);
    } catch (err) {
      setError(err.message || "Unable to load announcements.");
    } finally {
      setLoading(false);
    }
  };
  const [lightboxImage, setLightboxImage] = useState(null);
  return (
    <div className="px-4 py-6 sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Announcements
          </h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">
            View the latest school-wide and department announcements.
          </p>
        </div>

        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          placeholder="Search announcements..."
          className="w-full sm:w-80 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm text-gray-800 shadow-sm focus:border-tpc-green focus:outline-none focus:ring-2 focus:ring-tpc-green/20"
        />
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {loading && !announcements.data.length ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tpc-green"></div>
        </div>
      ) : announcements.data.length > 0 ? (
        <div className="space-y-4">
          {announcements.data.map((announcement) => (
            <div
              key={announcement.id}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:rounded-3xl sm:p-6"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold text-gray-900 sm:text-xl">
                      {announcement.title || "Announcement"}
                    </h2>
                    <span
                      className={`inline-flex shrink-0 items-center rounded-full px-3 py-1 text-xs font-semibold ${announcement.scope === "school_wide" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}`}
                    >
                      {announcement.scope === "school_wide"
                        ? "School-wide"
                        : announcement.department?.name || "Department"}
                    </span>
                  </div>
                  {announcement.content && (
                    <p className="mt-3 text-sm text-gray-600 whitespace-pre-line sm:text-base">
                      {announcement.content}
                    </p>
                  )}

                  <div className="mt-4 flex flex-wrap gap-3 text-sm text-gray-500">
                    {announcement.posted_at && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1">
                        <CalendarClock className="h-4 w-4" />
                        {new Date(announcement.posted_at).toLocaleString(
                          undefined,
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          },
                        )}
                      </span>
                    )}
                    {announcement.creator?.name && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1">
                        <UserCircle2 className="h-4 w-4" />
                        {announcement.creator.name}
                      </span>
                    )}
                    {announcement.department_category && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1">
                        {announcement.department_category}
                      </span>
                    )}
                  </div>

                  {announcement.images?.length > 0 && (
                    <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {announcement.images.map((image, index) => {
                        const isImage = /\.(jpg|jpeg|png|webp|gif)$/i.test(
                          image,
                        );
                        const isPdf = /\.pdf$/i.test(image);
                        const isVideo = /\.(mp4|webm|mov|avi)$/i.test(image);
                        const isDoc =
                          /\.(doc|docx|txt|xls|xlsx|ppt|pptx)$/i.test(image);

                        if (isImage) {
                          return (
                            <button
                              key={`${announcement.id}-${index}`}
                              type="button"
                              onClick={() => setLightboxImage(image)}
                              className="block"
                            >
                              <img
                                src={image}
                                alt={`${announcement.title || "Announcement"} ${index + 1}`}
                                className="h-40 w-full rounded-xl object-cover border border-gray-200 hover:shadow-lg transition cursor-zoom-in"
                              />
                            </button>
                          );
                        }

                        if (isVideo) {
                          return (
                            <video
                              key={`${announcement.id}-${index}`}
                              src={image}
                              controls
                              preload="metadata"
                              className="h-40 w-full rounded-xl object-cover border border-gray-200 bg-black"
                            />
                          );
                        }

                        return (
                          <a
                            key={`${announcement.id}-${index}`}
                            href={image}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-center h-40 bg-gray-100 rounded-xl border border-gray-200 hover:bg-gray-200 transition"
                            title={image}
                          >
                            <div className="text-center">
                              <div className="text-2xl mb-2">
                                {isPdf && "📄"}
                                {isDoc && "📋"}
                                {!isPdf && !isDoc && "📎"}
                              </div>
                              <div className="text-xs text-gray-600 px-2 break-all">
                                {isPdf && "PDF"}
                                {isDoc && "Document"}
                                {!isPdf && !isDoc && "File"}
                              </div>
                            </div>
                          </a>
                        );
                      })}
                    </div>
                  )}
                </div>
                <div className="flex flex-row flex-wrap items-center gap-x-3 gap-y-2 text-sm text-gray-500 sm:block sm:space-y-3 sm:text-right">
                  <span className="hidden text-gray-400 sm:block">
                    Posted on
                  </span>
                  <span className="font-semibold text-gray-900 sm:block">
                    {new Date(announcement.created_at).toLocaleDateString(
                      undefined,
                      {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      },
                    )}
                  </span>
                  <span className="inline-flex shrink-0 items-center rounded-full px-3 py-1 text-xs font-semibold">
                    {announcement.scope === "school_wide"
                      ? "School-wide"
                      : announcement.department?.name || "Department"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-gray-500 sm:rounded-3xl sm:p-12">
          No announcements available yet.
        </div>
      )}

      {announcements.meta?.last_page > 1 && (
        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
            className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-500">
            Page {currentPage} of {announcements.meta.last_page}
          </span>
          <button
            disabled={currentPage >= announcements.meta.last_page}
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
