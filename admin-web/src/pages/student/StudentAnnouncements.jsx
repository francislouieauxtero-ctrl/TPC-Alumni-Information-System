import { useState, useEffect } from "react";
import { CalendarDays, Megaphone, Users } from "lucide-react";
import announcementService from "../../services/announcementService";
import { getCreatorRoleLabel, renderTextWithLinks } from "../../utils/media";
import UserAvatar from "../../components/shared/UserAvatar";

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
                className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
              >
                <div className="space-y-4 p-5 sm:p-6">
                  <div className="flex items-center gap-3">
                    <UserAvatar
                      name={announcement.creator?.name || "Unknown user"}
                      avatar={announcement.creator?.avatar}
                      size="sm"
                      className="shrink-0 bg-tpc-navy ring-0"
                    />
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-gray-900">
                        {announcement.creator?.name || "Unknown user"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {getCreatorRoleLabel(announcement.creator)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 border-y border-gray-200 py-3">
                    <span className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-blue-700">
                      <Megaphone className="h-4 w-4" />
                      Announcement
                    </span>
                    <span className="inline-flex items-center gap-2 text-sm text-gray-600">
                      <CalendarDays className="h-4 w-4" />
                      {new Date(
                        announcement.created_at || announcement.posted_at,
                      ).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-3">
                    <h3 className="min-w-0 text-xl font-bold text-tpc-navy break-words">
                      {announcement.title || "Announcement"}
                    </h3>
                    <span
                      className={`shrink-0 rounded-lg px-2 py-1 text-xs font-semibold ${
                        announcement.scope === "school_wide"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-purple-100 text-purple-700"
                      }`}
                    >
                      <Users className="mr-1 inline h-3.5 w-3.5" />
                      {announcement.scope === "school_wide"
                        ? "School-wide"
                        : announcement.department?.name || "Department"}
                    </span>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <p className="text-sm leading-7 text-gray-700 whitespace-pre-line break-words">
                      {renderTextWithLinks(announcement.content || "")}
                    </p>
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
