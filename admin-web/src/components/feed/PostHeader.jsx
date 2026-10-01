import { useState, useRef, useEffect } from "react";
import { Globe, Users, MoreHorizontal, Edit, Trash2, ExternalLink } from "lucide-react";
import UserAvatar from "../shared/UserAvatar";
import { getCreatorRoleLabel, formatPostDate } from "../../utils/media";

export default function PostHeader({
  creator,
  createdAt,
  scope,
  department,
  canManage = false,
  onEdit,
  onDelete,
  onView,
  extraBadge,
  isEvent = false,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isSchoolWide = scope === "school_wide";
  const departmentName = department?.name || "Department";

  return (
    <div className="flex items-start justify-between gap-3">
      {/* Creator Info */}
      <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
        <UserAvatar
          name={creator?.name || "TPC Alumni"}
          avatar={creator?.avatar}
          size="sm"
          className="shrink-0 bg-tpc-navy text-white ring-1 ring-[#008000]/30 shadow-2xs"
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h4 className="font-bold text-gray-900 text-sm sm:text-base hover:text-[#006400] transition-colors leading-tight">
              {creator?.name || "Official Bulletin"}
            </h4>

            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Scope Badge */}
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  isSchoolWide
                    ? "bg-emerald-50 text-[#006400] border border-emerald-200/90 shadow-2xs"
                    : "bg-purple-50 text-purple-700 border border-purple-200/90 shadow-2xs"
                }`}
              >
                {isSchoolWide ? (
                  <>
                    <Globe className="w-3 h-3 text-[#008000] shrink-0" />
                    <span>{isEvent ? "All Departments" : "All Users"}</span>
                  </>
                ) : (
                  <>
                    <Users className="w-3 h-3 text-purple-600 shrink-0" />
                    <span>{departmentName}</span>
                  </>
                )}
              </span>

              {extraBadge}
            </div>
          </div>

          {/* Author Role directly underneath Author Name */}
          <div className="flex items-center gap-1.5 flex-wrap text-xs text-gray-500 mt-1">
            <span className="font-medium text-gray-700">
              {getCreatorRoleLabel(creator)}
            </span>
            <span className="text-gray-300">•</span>
            <time title={createdAt} className="text-gray-600 font-medium">
              {formatPostDate(createdAt)}
            </time>
          </div>
        </div>
      </div>

      {/* Admin Actions Menu */}
      {canManage && (
        <div className="relative shrink-0" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors focus:outline-none"
            aria-label="Post actions"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-1 w-40 origin-top-right rounded-xl bg-white p-1.5 shadow-lg ring-1 ring-black/5 border border-gray-100 z-20 animate-in fade-in duration-100">
              {onView && (
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onView();
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:text-tpc-navy transition-colors text-left"
                >
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                  View Details
                </button>
              )}

              {onEdit && (
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onEdit();
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:text-tpc-green transition-colors text-left"
                >
                  <Edit className="w-4 h-4 text-gray-400" />
                  Edit Post
                </button>
              )}

              {onDelete && (
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete();
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors text-left"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                  Delete Post
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
