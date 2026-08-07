import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import announcementService from "../../../services/announcementService";
import { toast } from "react-toastify";

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
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Announcements</h1>
        <button
          onClick={() => navigate(`${basePath}/create`)}
          className="px-6 py-2 bg-tpc-gold hover:bg-tpc-goldDeep text-black font-semibold rounded-full transition"
        >
          + Create Announcement
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <input
          type="text"
          placeholder="Search announcements by title..."
          value={search}
          onChange={handleSearchChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tpc-green"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Announcements List */}
      {announcements.data && announcements.data.length > 0 ? (
        <div className="space-y-4">
          {announcements.data.map((announcement) => (
            <div
              key={announcement.id}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition"
            >
              <div className="flex justify-between items-start gap-4">
                {/* Content */}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {announcement.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {announcement.content}
                  </p>

                  {/* Images/Attachments */}
                  {announcement.images && announcement.images.length > 0 && (
                    <div className="mb-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {announcement.images.map((image, idx) => {
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
                              key={idx}
                              type="button"
                              onClick={() => setLightboxImage(image)}
                              className="block"
                            >
                              <img
                                src={image}
                                alt={`Attachment ${idx + 1}`}
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
                          <div
                            key={idx}
                            className="flex items-center justify-center h-24 bg-gray-100 rounded-lg border border-gray-200"
                          >
                            <a
                              href={image}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-center text-tpc-green hover:underline px-2 break-all"
                              title={image}
                            >
                              {isVideo && "▶ Video"}
                              {isPdf && "📄 PDF"}
                              {isDoc && "📋 Document"}
                              {!isVideo && !isPdf && !isDoc && "📎 File"}
                            </a>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="flex items-center gap-3 flex-wrap">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        announcement.scope === "school_wide"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-purple-100 text-purple-700"
                      }`}
                    >
                      {announcement.scope === "school_wide"
                        ? "School-wide"
                        : announcement.department?.name || "Department"}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(announcement.created_at).toLocaleDateString(
                        undefined,
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        },
                      )}
                    </span>
                    <span className="text-xs text-gray-500">
                      by {announcement.creator?.name}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      navigate(`${basePath}/${announcement.id}/edit`)
                    }
                    className="px-4 py-2 text-tpc-green border border-tpc-green rounded-lg hover:bg-tpc-green hover:text-white transition text-sm font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(announcement.id)}
                    className="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-600 hover:text-white transition text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-lg shadow-sm border border-gray-200 text-center">
          <p className="text-gray-500">No announcements found</p>
        </div>
      )}

      {/* Pagination */}
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
