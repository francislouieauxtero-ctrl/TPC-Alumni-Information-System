import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Megaphone,
  Calendar,
  User,
  ArrowRight,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { format, isValid } from "date-fns";
import { getFirstImageUrl } from "../../utils/media";

function safeFormat(dateStr, pattern, fallback = "") {
  if (!dateStr) return fallback;
  try {
    const d = new Date(dateStr);
    return isValid(d) ? format(d, pattern) : fallback;
  } catch {
    return fallback;
  }
}

export default function DashboardAnnouncementsCard({
  announcements = [],
  isFullWidth = false,
  listPath = "/president/announcements",
  getDetailPath = (id) => `${listPath}/${id}`,
}) {
  if (!Array.isArray(announcements) || announcements.length === 0) {
    return null;
  }

  const featured = announcements[0];
  const secondary = announcements.slice(1, 3);

  return (
    <div className="relative rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs flex flex-col justify-between transition-all duration-200 hover:border-slate-300 hover:shadow-sm overflow-hidden">
      {/* Subtle Apple Green / Accent Top Bar */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#8DB600] via-[#00A000] to-transparent" />

      {/* Card Header */}
      <div>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 border border-amber-100/80 text-amber-700 shadow-2xs">
              <Megaphone className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                  Recent Announcements
                </h3>
                <span className="inline-flex items-center px-2 py-0.2 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200/60">
                  {announcements.length}{" "}
                  {announcements.length === 1 ? "Notice" : "Notices"}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500">
                Official college updates & bulletins
              </p>
            </div>
          </div>

          <Link
            to={listPath}
            className="inline-flex items-center gap-1 text-xs font-semibold text-amber-800 hover:text-amber-900 hover:underline transition-colors"
          >
            <span>View all</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Content Container (adapts if full-width) */}
        <div
          className={
            isFullWidth && secondary.length > 0
              ? "grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6"
              : "space-y-3.5"
          }
        >
          {/* Featured Announcement */}
          <div className={isFullWidth && secondary.length > 0 ? "lg:col-span-7" : ""}>
            <FeaturedAnnouncementCard
              announcement={featured}
              detailPath={getDetailPath(featured.id)}
              isFullWidth={isFullWidth && secondary.length === 0}
            />
          </div>

          {/* Secondary Announcements */}
          {secondary.length > 0 && (
            <div
              className={
                isFullWidth
                  ? "lg:col-span-5 lg:border-l lg:border-slate-100 lg:pl-6 flex flex-col justify-between"
                  : "pt-2.5 border-t border-slate-100"
              }
            >
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  More College Bulletins
                </p>
                <div className="space-y-2">
                  {secondary.map((announcement) => (
                    <SecondaryAnnouncementItem
                      key={announcement.id}
                      announcement={announcement}
                      detailPath={getDetailPath(announcement.id)}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FeaturedAnnouncementCard({
  announcement,
  detailPath,
  isFullWidth = false,
}) {
  const imageUrl = getFirstImageUrl(announcement);
  const [imgError, setImgError] = useState(false);
  const showImage = Boolean(imageUrl && !imgError);

  const formattedDate = safeFormat(
    announcement.created_at || announcement.posted_at,
    "MMMM d, yyyy"
  );
  const creatorName =
    announcement.creator?.name ||
    announcement.department?.name ||
    "TPC Administration";
  const scopeLabel =
    announcement.department?.name ||
    (announcement.scope === "all" ? "All Campus" : "TPC Community");

  return (
    <Link
      to={detailPath}
      className={`group block rounded-xl border border-slate-200/90 bg-white p-3.5 sm:p-4 transition-all duration-150 hover:border-amber-300 hover:shadow-xs hover:-translate-y-0.5 ${
        isFullWidth ? "md:flex md:items-center md:gap-5" : ""
      }`}
    >
      {/* Banner / Header Image or Fallback */}
      {showImage ? (
        <div
          className={`relative overflow-hidden rounded-lg bg-slate-100 ${
            isFullWidth
              ? "md:w-56 md:shrink-0 h-44 sm:h-48"
              : "h-40 sm:h-44 w-full mb-3"
          }`}
        >
          <img
            src={imageUrl}
            alt={announcement.title || "Announcement banner"}
            onError={() => setImgError(true)}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-103"
            loading="lazy"
          />
          {/* Badge overlay on image */}
          <div className="absolute top-2.5 left-2.5">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/95 backdrop-blur-sm text-[10px] font-bold text-slate-800 shadow-2xs border border-white/60">
              <Sparkles className="w-3 h-3 text-amber-600" />
              <span>NOTICE</span>
            </span>
          </div>

          <div className="absolute bottom-2.5 right-2.5 bg-slate-900/90 backdrop-blur-sm text-white px-2 py-0.5 rounded-md text-[11px] font-semibold shadow-xs">
            {formattedDate}
          </div>
        </div>
      ) : (
        <div
          className={`rounded-lg bg-slate-50/80 border border-slate-200/70 p-3 ${
            isFullWidth ? "md:w-52 md:shrink-0 mb-0" : "mb-3"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white border border-amber-200/80 text-amber-700 shadow-2xs shrink-0">
              <Megaphone className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-md">
                ANNOUNCEMENT
              </span>
              <p className="text-[11px] font-medium text-slate-600 mt-1 flex items-center gap-1 truncate">
                <Calendar className="w-3 h-3 text-amber-700 shrink-0" />
                <span>{formattedDate}</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Text Content */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className="inline-flex items-center px-2 py-0.2 rounded text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200/60 truncate max-w-[200px]">
            {scopeLabel}
          </span>
          <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
            <Calendar className="w-3 h-3 text-slate-400" />
            {formattedDate}
          </span>
        </div>

        <h4 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-amber-800 transition-colors line-clamp-2 leading-snug">
          {announcement.title}
        </h4>

        {/* Excerpt with line clamping */}
        <p className="mt-2 text-xs text-slate-600 line-clamp-3 leading-relaxed">
          {announcement.content || announcement.body || "No content provided."}
        </p>

        {/* Author / Creator info */}
        <div className="mt-2.5 flex items-center gap-1.5 text-xs text-slate-500">
          <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">
            Posted by <span className="font-semibold text-slate-700">{creatorName}</span>
          </span>
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs font-semibold text-amber-800 group-hover:text-amber-900 inline-flex items-center gap-1 transition-colors">
            Read announcement
          </span>
          <ArrowRight className="h-3.5 w-3.5 text-amber-800 transition-transform duration-200 group-hover:translate-x-0.5" />
        </div>
      </div>
    </Link>
  );
}

function SecondaryAnnouncementItem({ announcement, detailPath }) {
  const formattedDate = safeFormat(
    announcement.created_at || announcement.posted_at,
    "MMM d, yyyy"
  );
  const creatorName =
    announcement.creator?.name ||
    announcement.department?.name ||
    "TPC Administration";
  const scopeLabel =
    announcement.department?.name ||
    (announcement.scope === "all" ? "All Campus" : "TPC Community");

  return (
    <Link
      to={detailPath}
      className="group flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-2 sm:p-2.5 transition-all duration-150 hover:bg-white hover:border-slate-200 hover:shadow-2xs hover:-translate-y-0.5"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="inline-block text-[10px] font-semibold text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-100 truncate max-w-[140px]">
            {scopeLabel}
          </span>
          <span className="text-[11px] text-slate-400 font-medium">
            {formattedDate}
          </span>
        </div>
        <h5 className="text-xs sm:text-sm font-semibold text-slate-900 group-hover:text-amber-800 transition-colors line-clamp-1">
          {announcement.title}
        </h5>
        <p className="mt-0.5 text-[11px] text-slate-500 line-clamp-1 leading-normal">
          {announcement.content || announcement.body || ""}
        </p>
        <p className="mt-1 text-[10px] text-slate-400 truncate">
          By {creatorName}
        </p>
      </div>

      <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-amber-700 group-hover:translate-x-0.5 transition-all shrink-0 self-center" />
    </Link>
  );
}
