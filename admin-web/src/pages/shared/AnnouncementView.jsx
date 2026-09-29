import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import announcementService from "../../services/announcementService";
import {
  getAttachmentUrls,
  getCreatorRoleLabel,
  renderTextWithLinks,
  formatPostDate,
} from "../../utils/media";
import UserAvatar from "../../components/shared/UserAvatar";
import MediaLightbox from "../../components/feed/MediaLightbox";
import MediaGallery from "../../components/feed/MediaGallery";

export default function AnnouncementView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  // Fast cache resolution: Check navigation state, then React Query caches
  const getCachedAnnouncement = () => {
    // 1. Direct navigation state
    if (location.state?.announcement) {
      return location.state.announcement;
    }

    // 2. Direct single query cache
    const direct =
      queryClient.getQueryData(["announcement", String(id)]) ||
      queryClient.getQueryData(["announcement", Number(id)]);
    if (direct) return direct;

    // 3. Search in cached list queries (student_announcements, admin_announcements, dept_announcements)
    try {
      const queries = queryClient.getQueriesData({
        predicate: (q) => {
          const key = q.queryKey[0];
          return typeof key === "string" && (key.includes("announcement") || key === "announcements");
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

  const initialAnnouncement = getCachedAnnouncement();
  const [announcement, setAnnouncement] = useState(initialAnnouncement);
  const [loading, setLoading] = useState(!initialAnnouncement);
  const [lightboxData, setLightboxData] = useState(null);

  const userRole = localStorage.getItem("userRole");
  const basePath =
    userRole === "user"
      ? "/student/announcements"
      : userRole === "admin"
        ? "/department-head/announcements"
        : "/president/announcements";
  const canManage = userRole === "admin" || userRole === "super_admin";

  useEffect(() => {
    let isMounted = true;
    const fetchAnnouncement = async () => {
      try {
        // Only trigger loading spinner if we don't already have cached data
        if (!announcement) setLoading(true);
        const data = await announcementService.getById(id);
        if (isMounted && data) {
          setAnnouncement(data);
          // Sync into React Query single cache
          queryClient.setQueryData(["announcement", String(id)], data);
        }
      } catch {
        if (!announcement) {
          toast.error("Failed to load announcement");
          navigate(-1);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAnnouncement();
    return () => {
      isMounted = false;
    };
  }, [id, navigate, queryClient]);

  if (loading && !announcement) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-[#008000]" />
      </div>
    );
  }

  if (!announcement) return null;

  const allAttachments = getAttachmentUrls(announcement);
  const imageAttachments = allAttachments.filter((att) =>
    /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(att.split("?")[0])
  );
  const otherAttachments = allAttachments.filter(
    (att) => !/\.(jpg|jpeg|png|webp|gif|svg)$/i.test(att.split("?")[0])
  );

  return (
    <div className="mx-auto max-w-5xl space-y-6 animate-in fade-in duration-150">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => navigate(basePath)}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-[#006400] transition-colors cursor-pointer"
        >
          <span>← Back to Announcements</span>
        </button>
        {canManage && (
          <button
            type="button"
            onClick={() => navigate(`${basePath}/${id}/edit`)}
            className="rounded-full bg-[#008000] hover:bg-[#006400] px-5 py-2 text-sm font-semibold text-white shadow-xs transition-colors cursor-pointer"
          >
            Edit
          </button>
        )}
      </div>

      <article className="overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-xs relative">
        {/* Subtle Minimalist TPC Green Top Line */}
        <div className="h-[3px] w-full bg-gradient-to-r from-[#006400] via-[#008000] to-emerald-300" />

        {/* Header */}
        <header className="border-b border-gray-100 px-6 py-6 sm:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                {announcement.title || "Announcement"}
              </h1>
              {/* Author Info: Author name on top, Role • Published date directly underneath */}
              <div className="mt-3 flex items-center gap-3">
                <UserAvatar
                  name={announcement.creator?.name || "Unknown user"}
                  avatar={announcement.creator?.avatar}
                  size="sm"
                  className="h-9 w-9 shrink-0 bg-tpc-navy ring-1 ring-[#008000]/30 shadow-2xs"
                />
                <div className="flex flex-col min-w-0">
                  <span className="font-semibold text-gray-900 text-sm sm:text-base leading-snug">
                    {announcement.creator?.name || "Unknown user"}
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap text-xs text-gray-500 mt-0.5">
                    <span className="font-medium text-gray-700">
                      {getCreatorRoleLabel(announcement.creator)}
                    </span>
                    <span className="text-gray-300">•</span>
                    <p className="text-gray-600 font-medium">
                      {formatPostDate(
                        announcement.created_at || announcement.posted_at
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <span
              className={`w-fit rounded-full px-3 py-1 text-xs font-semibold shrink-0 shadow-2xs ${
                announcement.scope === "school_wide"
                  ? "bg-emerald-50 text-[#006400] border border-emerald-200/90"
                  : "bg-purple-50 text-purple-700 border border-purple-200/90"
              }`}
            >
              {announcement.scope === "school_wide"
                ? "School-wide"
                : announcement.department?.name || "Department-specific"}
            </span>
          </div>
        </header>

        {/* Body Content */}
        <section className="px-6 py-6 sm:px-8">
          <p className="mb-2.5 text-xs font-bold uppercase tracking-wider text-[#006400]">
            Content
          </p>
          <div className="whitespace-pre-wrap break-words leading-relaxed text-gray-700 text-sm sm:text-base">
            {renderTextWithLinks(
              announcement.content || announcement.body || ""
            )}
          </div>
        </section>

        {/* Media / Images Section */}
        {imageAttachments.length > 0 && (
          <section className="border-t border-gray-100 px-6 py-6 sm:px-8">


            {/* Single Image: Centered, natural aspect ratio, clean social presentation */}
            {imageAttachments.length === 1 ? (
              <div className="w-full flex justify-center items-center py-1">
                <button
                  type="button"
                  onClick={() =>
                    setLightboxData({
                      images: imageAttachments,
                      index: 0,
                      title: announcement.title,
                    })
                  }
                  className="group relative max-w-2xl w-full overflow-hidden rounded-2xl border border-gray-200/80 bg-gray-50/50 shadow-xs hover:shadow-md transition-all cursor-zoom-in text-center focus:outline-none focus:ring-2 focus:ring-[#008000]/40"
                  title="Click to view full size"
                >
                  <img
                    src={imageAttachments[0]}
                    alt={announcement.title || "Announcement attachment"}
                    loading="lazy"
                    className="max-h-[500px] w-auto mx-auto object-contain transition-transform duration-300 group-hover:scale-[1.01] block rounded-xl"
                  />
                </button>
              </div>
            ) : (
              /* Multi-Image: Facebook-style collage */
              <MediaGallery
                images={imageAttachments}
                title={announcement.title}
                onImageClick={(idx) =>
                  setLightboxData({
                    images: imageAttachments,
                    index: idx,
                    title: announcement.title,
                  })
                }
              />
            )}
          </section>
        )}

        {/* Other Attachments (Documents, Videos) */}
        {otherAttachments.length > 0 && (
          <section className="border-t border-gray-100 px-6 py-6 sm:px-8">
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-[#006400]">
              Documents & Files ({otherAttachments.length})
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {otherAttachments.map((attachment, index) => {
                const isVideo = /\.(mp4|webm|mov|avi)$/i.test(
                  attachment.split("?")[0]
                );

                if (isVideo) {
                  return (
                    <video
                      key={`${attachment}-${index}`}
                      src={attachment}
                      controls
                      preload="metadata"
                      className="max-h-[360px] w-full rounded-xl border border-gray-200 bg-black object-cover"
                    />
                  );
                }

                return (
                  <a
                    key={`${attachment}-${index}`}
                    href={attachment}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-28 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-center transition hover:bg-gray-100 hover:border-[#008000]/40"
                  >
                    <span className="break-all px-3 text-xs text-gray-700 font-medium">
                      📎 {attachment.split("/").pop()}
                    </span>
                  </a>
                );
              })}
            </div>
          </section>
        )}
      </article>

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
