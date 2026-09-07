import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import announcementService from "../../services/announcementService";
import {
  getAttachmentUrls,
  getCreatorRoleLabel,
  renderTextWithLinks,
} from "../../utils/media";
import UserAvatar from "../../components/shared/UserAvatar";

export default function AnnouncementView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const userRole = localStorage.getItem("userRole");
  const basePath =
    userRole === "user"
      ? "/student/announcements"
      : userRole === "admin"
        ? "/department-head/announcements"
        : "/president/announcements";
  const canManage = userRole === "admin" || userRole === "super_admin";
  const [announcement, setAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lightboxImage, setLightboxImage] = useState(null);

  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        setLoading(true);
        setAnnouncement(await announcementService.getById(id));
      } catch (error) {
        toast.error("Failed to load announcement");
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncement();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-tpc-green" />
      </div>
    );
  }

  if (!announcement) return null;

  const attachments = getAttachmentUrls(announcement);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => navigate(basePath)}
          className="text-sm text-gray-500 transition hover:text-gray-800"
        >
          ← Back to Announcements
        </button>
        {canManage && (
          <button
            type="button"
            onClick={() => navigate(`${basePath}/${id}/edit`)}
            className="rounded-full bg-tpc-greenDeep px-5 py-2 text-sm text-white transition hover:bg-tpc-green"
          >
            Edit
          </button>
        )}
      </div>

      <article className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <header className="border-b border-gray-200 px-6 py-6 sm:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {announcement.title || "Announcement"}
              </h1>
              <div className="mt-3 space-y-2 text-sm text-gray-500">
                <p>
                  Posted:{" "}
                  <span className="font-medium text-gray-700">
                    {formatDate(
                      announcement.created_at || announcement.posted_at,
                    )}
                  </span>
                </p>
                <p className="flex items-center gap-2">
                  By:
                  <UserAvatar
                    name={announcement.creator?.name || "Unknown user"}
                    avatar={announcement.creator?.avatar}
                    size="sm"
                    className="h-8 w-8 bg-tpc-navy ring-0"
                  />
                  <span className="font-medium text-gray-700">
                    {announcement.creator?.name || "Unknown user"}
                    <span className="ml-2 text-xs font-normal text-gray-500">
                      ({getCreatorRoleLabel(announcement.creator)})
                    </span>
                  </span>
                </p>
              </div>
            </div>
            <span
              className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${
                announcement.scope === "school_wide"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-purple-100 text-purple-700"
              }`}
            >
              {announcement.scope === "school_wide"
                ? "School-wide"
                : announcement.department?.name || "Department-specific"}
            </span>
          </div>
        </header>

        <section className="px-6 py-6 sm:px-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400">
            Content
          </p>
          <div className="whitespace-pre-wrap break-words leading-relaxed text-gray-700">
            {renderTextWithLinks(
              announcement.content || announcement.body || "",
            )}
          </div>
        </section>

        {attachments.length > 0 && (
          <section className="border-t border-gray-200 px-6 py-6 sm:px-8">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400">
              Attachments
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {attachments.map((attachment, index) => {
                const isImage = /\.(jpg|jpeg|png|webp|gif)$/i.test(attachment);
                const isVideo = /\.(mp4|webm|mov|avi)$/i.test(attachment);

                if (isImage) {
                  return (
                    <button
                      key={`${attachment}-${index}`}
                      type="button"
                      onClick={() => setLightboxImage(attachment)}
                      className="block"
                    >
                      <img
                        src={attachment}
                        alt={`Attachment ${index + 1}`}
                        className="h-40 w-full rounded-xl border border-gray-200 object-cover transition hover:shadow-lg"
                      />
                    </button>
                  );
                }

                if (isVideo) {
                  return (
                    <video
                      key={`${attachment}-${index}`}
                      src={attachment}
                      controls
                      preload="metadata"
                      className="h-40 w-full rounded-xl border border-gray-200 bg-black object-cover"
                    />
                  );
                }

                return (
                  <a
                    key={`${attachment}-${index}`}
                    href={attachment}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-40 items-center justify-center rounded-xl border border-gray-200 bg-gray-100 text-center transition hover:bg-gray-200"
                  >
                    <span className="break-all px-2 text-xs text-gray-600">
                      {attachment.split("/").pop()}
                    </span>
                  </a>
                );
              })}
            </div>
          </section>
        )}
      </article>

      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setLightboxImage(null)}
        >
          <button
            type="button"
            onClick={() => setLightboxImage(null)}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-2xl leading-none text-white hover:bg-white/20"
            aria-label="Close"
          >
            ×
          </button>
          <img
            src={lightboxImage}
            alt="Full size attachment"
            className="max-h-full max-w-full rounded-lg object-contain"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
