import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  Calendar,
  Clock,
  MapPin,
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

export default function DashboardEventsCard({
  events = [],
  isFullWidth = false,
  listPath = "/president/events",
  getDetailPath = (id) => `${listPath}/${id}`,
}) {
  if (!Array.isArray(events) || events.length === 0) {
    return null;
  }

  const featured = events[0];
  const secondary = events.slice(1, 3);

  return (
    <div className="relative rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs flex flex-col justify-between transition-all duration-200 hover:border-slate-300 hover:shadow-sm overflow-hidden">
      {/* Subtle TPC Green Top Accent Bar */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#006400] via-[#008000] to-transparent" />

      {/* Card Header */}
      <div>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 border border-emerald-100/80 text-[#006400] shadow-2xs">
              <CalendarDays className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                  Upcoming Events
                </h3>
                <span className="inline-flex items-center px-2 py-0.2 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-[#006400] border border-emerald-200/60">
                  {events.length} {events.length === 1 ? "Event" : "Events"}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500">
                Scheduled campus & alumni activities
              </p>
            </div>
          </div>

          <Link
            to={listPath}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#006400] hover:text-[#008000] hover:underline transition-colors"
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
          {/* Featured Event */}
          <div className={isFullWidth && secondary.length > 0 ? "lg:col-span-7" : ""}>
            <FeaturedEventCard
              event={featured}
              detailPath={getDetailPath(featured.id)}
              isFullWidth={isFullWidth && secondary.length === 0}
            />
          </div>

          {/* Secondary Events */}
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
                  More Upcoming Activities
                </p>
                <div className="space-y-2">
                  {secondary.map((event) => (
                    <SecondaryEventItem
                      key={event.id}
                      event={event}
                      detailPath={getDetailPath(event.id)}
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

function FeaturedEventCard({ event, detailPath, isFullWidth = false }) {
  const imageUrl = getFirstImageUrl(event);
  const [imgError, setImgError] = useState(false);
  const showImage = Boolean(imageUrl && !imgError);

  const month = safeFormat(event.event_date, "MMM");
  const day = safeFormat(event.event_date, "d");
  const fullDate = safeFormat(event.event_date, "EEEE, MMMM d, yyyy");
  const time = safeFormat(event.event_date, "h:mm a");
  const scopeLabel =
    event.department?.name ||
    (event.scope === "all" ? "All Campus" : "TPC Community");

  return (
    <Link
      to={detailPath}
      state={{ event }}
      className={`group block rounded-xl border border-slate-200/90 bg-white p-3.5 sm:p-4 transition-all duration-150 hover:border-emerald-300 hover:shadow-xs hover:-translate-y-0.5 ${
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
            alt={event.title || "Event banner"}
            onError={() => setImgError(true)}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-103"
            loading="lazy"
          />
          {/* Badge overlay on image */}
          <div className="absolute top-2.5 left-2.5">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/95 backdrop-blur-sm text-[10px] font-bold text-slate-800 shadow-2xs border border-white/60">
              <Sparkles className="w-3 h-3 text-[#006400]" />
              <span>EVENT</span>
            </span>
          </div>

          {/* Date pill overlay */}
          <div className="absolute bottom-2.5 right-2.5 bg-slate-900/90 backdrop-blur-sm text-white px-2 py-0.5 rounded-md text-[11px] font-semibold shadow-xs">
            {month} {day}
          </div>
        </div>
      ) : (
        <div
          className={`rounded-lg bg-slate-50/80 border border-slate-200/70 p-3 ${
            isFullWidth ? "md:w-52 md:shrink-0 mb-0" : "mb-3"
          }`}
        >
          <div className="flex items-center gap-3">
            {/* Architectural Date Box */}
            <div className="flex h-13 w-13 sm:h-14 sm:w-14 flex-col items-center justify-center rounded-xl bg-white border border-slate-200 shadow-2xs shrink-0 overflow-hidden">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#006400] bg-emerald-50/90 w-full text-center py-0.5 border-b border-emerald-100/70">
                {month}
              </span>
              <span className="text-lg sm:text-xl font-black text-slate-900 leading-tight py-0.5">
                {day}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200/70 px-2 py-0.5 rounded-md">
                EVENT
              </span>
              <p className="text-[11px] font-medium text-slate-600 mt-1 flex items-center gap-1 truncate">
                <Clock className="w-3 h-3 text-[#006400] shrink-0" />
                <span>{time || "Scheduled"}</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Text Content */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className="inline-flex items-center px-2 py-0.2 rounded text-[10px] font-semibold bg-emerald-50 text-[#006400] border border-emerald-200/60 truncate max-w-[200px]">
            {scopeLabel}
          </span>
          <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" />
            {time}
          </span>
        </div>

        <h4 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-[#006400] transition-colors line-clamp-2 leading-snug">
          {event.title}
        </h4>

        {/* Location & Date details */}
        <div className="mt-2 space-y-1 text-xs">
          <div className="flex items-center gap-1.5 text-slate-600">
            <Calendar className="w-3.5 h-3.5 text-[#006400] shrink-0" />
            <span className="font-medium text-slate-700 truncate">
              {fullDate}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">
              {event.location || "TPC Main Campus"}
            </span>
          </div>
        </div>

        {event.description && (
          <p className="mt-2 text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {event.description}
          </p>
        )}

        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs font-semibold text-[#006400] group-hover:text-[#008000] inline-flex items-center gap-1 transition-colors">
            View event details
          </span>
          <ArrowRight className="h-3.5 w-3.5 text-[#006400] transition-transform duration-200 group-hover:translate-x-0.5" />
        </div>
      </div>
    </Link>
  );
}

function SecondaryEventItem({ event, detailPath }) {
  const month = safeFormat(event.event_date, "MMM");
  const day = safeFormat(event.event_date, "d");
  const time = safeFormat(event.event_date, "h:mm a");
  const scopeLabel =
    event.department?.name ||
    (event.scope === "all" ? "All Campus" : "TPC Community");

  return (
    <Link
      to={detailPath}
      state={{ event }}
      className="group flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-2 sm:p-2.5 transition-all duration-150 hover:bg-white hover:border-slate-200 hover:shadow-2xs hover:-translate-y-0.5"
    >
      {/* Date badge */}
      <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-lg bg-white border border-slate-200/90 shadow-2xs overflow-hidden">
        <span className="text-[9px] font-extrabold uppercase tracking-wider text-[#006400] leading-none">
          {month}
        </span>
        <span className="text-sm font-black text-slate-900 leading-none mt-0.5">
          {day}
        </span>
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="inline-block text-[10px] font-semibold text-[#006400] bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-100 truncate max-w-[120px]">
            {scopeLabel}
          </span>
          <span className="text-[11px] text-slate-400 font-medium">
            {time}
          </span>
        </div>
        <h5 className="text-xs sm:text-sm font-semibold text-slate-900 group-hover:text-[#006400] transition-colors line-clamp-1">
          {event.title}
        </h5>
        <p className="mt-0.5 text-[11px] text-slate-500 line-clamp-1 flex items-center gap-1">
          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
          <span>{event.location || "TPC Main Campus"}</span>
        </p>
      </div>

      <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-[#006400] group-hover:translate-x-0.5 transition-all shrink-0 self-center" />
    </Link>
  );
}
