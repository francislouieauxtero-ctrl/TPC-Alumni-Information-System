import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, X, Megaphone, ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { toast } from "react-toastify";
import announcementService from "../../services/announcementService";
import AnnouncementFeedPost from "../../components/feed/AnnouncementFeedPost";
import MediaLightbox from "../../components/feed/MediaLightbox";
import FeedSkeleton from "../../components/feed/FeedSkeleton";
import useDebounce from "../../components/feed/useDebounce";

export default function DepartmentHeadAnnouncementList({
  basePath = "/department-head/announcements",
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 350);
  const [currentPage, setCurrentPage] = useState(1);
  const [lightboxData, setLightboxData] = useState(null);

  // React Query fetching with 5-minute staleTime and fast cached placeholderData
  const { data: response, isLoading, isError, error } = useQuery({
    queryKey: ["dept_announcements", { basePath, search: debouncedSearch, page: currentPage }],
    queryFn: () =>
      announcementService.getAll({
        search: debouncedSearch,
        page: currentPage,
      }),
    placeholderData: (previousData) => {
      if (previousData) return previousData;
      const cached = queryClient.getQueriesData({
        predicate: (q) =>
          typeof q.queryKey[0] === "string" &&
          (q.queryKey[0].includes("announcement") || q.queryKey[0] === "announcements"),
      });
      for (const [_, res] of cached) {
        if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
          return res;
        }
      }
      return undefined;
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });

  const announcements = response?.data || [];
  const meta = response?.meta || {};

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this announcement?")) return;

    try {
      await announcementService.delete(id);
      toast.success("Announcement deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["dept_announcements"] });
    } catch (err) {
      toast.error(err.message || "Failed to delete announcement");
    }
  };

  const handleOpenLightbox = (images, index, title) => {
    setLightboxData({ images, index, title });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <header className="rounded-2xl bg-gradient-to-r from-[#006400] via-[#008000] to-[#00A000] p-4 sm:p-6 text-white shadow-sm max-w-2xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-green-100 flex items-center gap-1.5">
              <Megaphone className="w-3.5 h-3.5" />
              Department Bulletins
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl text-white">
              Announcements
            </h1>
            <p className="mt-1 text-sm text-green-50/90">
              Manage department announcements and school updates.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate(`${basePath}/create`)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white hover:bg-green-50 text-[#006400] px-4 py-2.5 text-sm font-semibold transition shadow-sm self-start sm:self-auto shrink-0 hover:scale-[1.02] active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#006400]" />
            <span>Create Announcement</span>
          </button>
        </div>
      </header>

      {/* Centered Single-Column Feed */}
      <div className="max-w-2xl mx-auto space-y-5">
        {/* Search Toolbar */}
        <div className="relative bg-white p-3 sm:p-3.5 rounded-2xl shadow-xs border border-gray-200/80">
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search announcements..."
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
        </div>

        {/* Error message */}
        {isError && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error?.message || "Failed to load announcements."}
          </div>
        )}

        {/* Loading Skeletons */}
        {isLoading && !announcements.length ? (
          <FeedSkeleton count={3} />
        ) : announcements.length > 0 ? (
          <div className="space-y-4 sm:space-y-5">
            {announcements.map((announcement) => (
              <AnnouncementFeedPost
                key={announcement.id}
                announcement={announcement}
                canManage={true}
                onEdit={() => navigate(`${basePath}/${announcement.id}/edit`)}
                onDelete={() => handleDelete(announcement.id)}
                onView={() =>
                  navigate(`${basePath}/${announcement.id}`, {
                    state: { announcement },
                  })
                }
                onOpenLightbox={handleOpenLightbox}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white p-12 rounded-2xl shadow-xs border border-gray-200/80 text-center">
            <Megaphone className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="font-semibold text-gray-700">No announcements found</p>
            <p className="text-sm text-gray-500 mt-1">
              {search
                ? `No announcements matching "${search}".`
                : "No announcements created yet. Click '+ Create Announcement' to publish one."}
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
    </div>
  );
}
