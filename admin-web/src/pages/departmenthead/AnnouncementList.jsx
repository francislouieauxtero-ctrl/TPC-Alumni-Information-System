import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import announcementService from "../../services/announcementService";
import { getCreatorRoleLabel, renderTextWithLinks } from "../../utils/media";
import { toast } from "react-toastify";
import UserAvatar from "../../components/shared/UserAvatar";

export default function DepartmentHeadAnnouncementList({
  basePath = "/department-head/announcements",
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
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Announcements</h1>
        <button
          onClick={() => navigate(`${basePath}/create`)}
          className="px-6 py-2 bg-tpc-greenDeep hover:bg-tpc-green text-white rounded-full transition"
        >
          + Create Announcement
        </button>
      </div>

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {announcements.data.map((announcement) => {
            const images = Array.isArray(announcement.images)
              ? announcement.images
              : [];
            const previewImage = images.find((image) =>
              /\.(jpg|jpeg|png|webp|gif)$/i.test(image),
            );
            const isOwner =
              announcement.creator?.id ===
              parseInt(localStorage.getItem("userId"));

            return (
              <div
                key={announcement.id}
                className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4"
              >
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {announcement.title}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2 whitespace-pre-line">
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
                      alt={announcement.title}
                      className="w-full h-32 object-cover rounded-lg border border-gray-200 cursor-zoom-in"
                    />
                  </button>
                ) : (
                  <div className="flex items-center justify-center h-32 bg-gray-100 rounded-lg border border-gray-200 text-gray-500 text-sm">
                    No image
                  </div>
                )}

                <div className="flex gap-2 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      if (previewImage) {
                        setLightboxImage(previewImage);
                        return;
                      }
                      toast.info("No preview available for this announcement");
                    }}
                    className="flex-1 px-4 py-2 text-tpc-green border border-tpc-green rounded-lg hover:bg-tpc-green hover:text-white transition"
                  >
                    View
                  </button>
                  {isOwner && (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          navigate(`${basePath}/${announcement.id}/edit`)
                        }
                        className="flex-1 px-4 py-2 text-tpc-green border border-tpc-green rounded-lg hover:bg-tpc-green hover:text-white transition"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(announcement.id)}
                        className="flex-1 px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-600 hover:text-white transition"
                      >
                        Delete
                      </button>
                    </>
                  )}
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
