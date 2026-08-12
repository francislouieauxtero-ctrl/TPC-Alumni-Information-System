import { useState, useEffect } from "react";
import { CalendarClock, UserCircle2 } from "lucide-react";
import announcementService from "../../services/announcementService";
import { renderTextWithLinks } from "../../utils/media";

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {announcements.data.map((announcement) => {
            const images = Array.isArray(announcement.images)
              ? announcement.images
              : [];
            const previewImage = images.find((image) =>
              /\.(jpg|jpeg|png|webp|gif)$/i.test(image),
            );

            return (
              <div
                key={announcement.id}
                className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4"
              >
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {announcement.title || "Announcement"}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2 whitespace-pre-line">
                    {renderTextWithLinks(announcement.content || "")}
                  </p>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Posted:</span>
                    <span className="font-medium text-gray-800">
                      {new Date(
                        announcement.created_at || announcement.posted_at,
                      ).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">By:</span>
                    <span className="font-medium text-gray-800">
                      {announcement.creator?.name || "System"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Scope:</span>
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        announcement.scope === "school_wide"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-purple-100 text-purple-700"
                      }`}
                    >
                      {announcement.scope === "school_wide"
                        ? "School-wide"
                        : announcement.department?.name || "Department"}
                    </span>
                  </div>
                </div>

                {previewImage ? (
                  <button
                    type="button"
                    onClick={() => setLightboxImage(previewImage)}
                    className="block w-full"
                  >
                    <img
                      src={previewImage}
                      alt={announcement.title || "Announcement"}
                      className="w-full h-32 object-cover rounded-lg border border-gray-200 cursor-zoom-in"
                    />
                  </button>
                ) : (
                  <div className="flex items-center justify-center h-32 bg-gray-100 rounded-lg border border-gray-200 text-gray-500 text-sm">
                    No image
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-lg shadow-sm border border-gray-200 text-center">
          <p className="text-gray-500">No announcements available yet.</p>
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
