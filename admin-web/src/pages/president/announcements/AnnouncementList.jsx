import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import announcementService from "../../../services/announcementService";
import { getCreatorRoleLabel, renderTextWithLinks } from "../../../utils/media";
import { toast } from "react-toastify";
import UserAvatar from "../../../components/shared/UserAvatar";

export default function AnnouncementList({
  basePath = "/president/announcements",
}) {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState({ data: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [lightboxImage, setLightboxImage] = useState(null);

  useEffect(() => {
    fetchAnnouncements();
  }, [currentPage, search]);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await announcementService.getAll({
        search,
        page: currentPage,
      });
      setAnnouncements(data);
    } catch (err) {
      setError(err.message || "Failed to fetch announcements");
      toast.error("Failed to load announcements");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this announcement?"))
      return;

    try {
      await announcementService.delete(id);
      toast.success("Announcement deleted successfully");
      fetchAnnouncements();
    } catch (err) {
      toast.error(err.message || "Failed to delete announcement");
    }
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  if (loading && !announcements.data?.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tpc-green"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="rounded-2xl bg-gradient-to-r from-[#006400] via-[#008000] to-[#00A000] p-4 sm:p-6 text-white shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-green-100">
              ANNOUNCEMENT MANAGEMENT
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl text-white">
              Announcements
            </h1>
            <p className="mt-1 text-sm text-green-50/90">
              Create and manage official announcements.
            </p>
          </div>

          <button
            onClick={() => navigate(`${basePath}/create`)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white hover:bg-green-50 text-[#006400] px-4 py-2.5 text-sm font-semibold transition shadow-sm self-start sm:self-auto shrink-0"
          >
            + Create Announcement
          </button>
        </div>
      </header>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <input
          type="text"
          placeholder="Search announcements by title..."
          value={search}
          onChange={handleSearchChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tpc-green"
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      )}

      {announcements.data && announcements.data.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
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
                className="flex h-full flex-col gap-4 rounded-lg border border-gray-200 bg-white p-5 shadow-sm"
              >
                <div className="min-w-0">
                  <h3 className="mb-2 break-words text-lg font-semibold text-gray-800">
                    {announcement.title}
                  </h3>
                  <p className="text-sm text-gray-600 whitespace-pre-line line-clamp-4">
                    {renderTextWithLinks(announcement.content || "")}
                  </p>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Posted:</span>
                    <span className="font-medium text-gray-800">
                      {new Date(announcement.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">By:</span>
                    <span className="flex items-center gap-2 text-right">
                      <UserAvatar
                        name={announcement.creator?.name || "Unknown user"}
                        avatar={announcement.creator?.avatar}
                        size="sm"
                        className="h-8 w-8 bg-tpc-navy ring-0"
                      />
                      <span>
                        <span className="block font-medium text-gray-800">
                          {announcement.creator?.name || "Unknown user"}
                        </span>
                        <span className="block text-xs text-gray-500">
                          {getCreatorRoleLabel(announcement.creator)}
                        </span>
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Scope:</span>
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${announcement.scope === "school_wide"
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
                      alt={announcement.title}
                      loading="lazy"
                      className="w-full h-32 object-cover rounded-lg border border-gray-200 cursor-zoom-in"
                    />
                  </button>
                ) : null}

                <div className="mt-auto grid grid-cols-3 gap-2 border-t border-gray-200 pt-4">
                  <button
                    type="button"
                    onClick={() => navigate(`${basePath}/${announcement.id}`)}
                    className="min-w-0 rounded-lg border border-tpc-green px-2 py-2 text-xs font-medium text-tpc-green transition hover:bg-tpc-green hover:text-white sm:px-3 sm:text-sm"
                  >
                    View
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      navigate(`${basePath}/${announcement.id}/edit`)
                    }
                    className="min-w-0 rounded-lg border border-tpc-green px-2 py-2 text-xs font-medium text-tpc-green transition hover:bg-tpc-green hover:text-white sm:px-3 sm:text-sm"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(announcement.id)}
                    className="min-w-0 rounded-lg border border-red-600 px-2 py-2 text-xs font-medium text-red-600 transition hover:bg-red-600 hover:text-white sm:px-3 sm:text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-lg shadow-sm border border-gray-200 text-center">
          <p className="text-gray-500">No announcements found</p>
        </div>
      )}

      {announcements.meta?.last_page > 1 && (
        <div className="flex justify-center gap-3">
          <button
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage(currentPage - 1)}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-gray-600">
            Page {currentPage} of {announcements.meta.last_page}
          </span>
          <button
            disabled={currentPage >= announcements.meta.last_page}
            onClick={() => setCurrentPage(currentPage + 1)}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
