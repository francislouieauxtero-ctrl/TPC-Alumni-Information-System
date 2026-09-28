import React from "react";
import DashboardEventsCard from "./DashboardEventsCard";
import DashboardAnnouncementsCard from "./DashboardAnnouncementsCard";

const ROLE_ROUTES = {
  president: {
    eventsList: "/president/events",
    getEventDetail: (id) => `/president/events/${id}`,
    announcementsList: "/president/announcements",
    getAnnouncementDetail: (id) => `/president/announcements/${id}`,
  },
  "department-head": {
    eventsList: "/department-head/events",
    getEventDetail: (id) => `/department-head/events/${id}`,
    announcementsList: "/department-head/announcements",
    getAnnouncementDetail: (id) => `/department-head/announcements/${id}`,
  },
  student: {
    eventsList: "/student/events",
    getEventDetail: (id) => `/student/events`,
    announcementsList: "/student/announcements",
    getAnnouncementDetail: (id) => `/student/announcements/${id}`,
  },
};

export default function DashboardUpdatesSection({
  events = [],
  announcements = [],
  role = "president",
}) {
  const hasEvents = Array.isArray(events) && events.length > 0;
  const hasAnnouncements =
    Array.isArray(announcements) && announcements.length > 0;

  // CASE 4: Neither section has data -> Render nothing, collapse naturally
  if (!hasEvents && !hasAnnouncements) {
    return null;
  }

  const routes = ROLE_ROUTES[role] || ROLE_ROUTES.president;

  return (
    <section aria-label="TPC Alumni Updates & Activities" className="space-y-3.5 sm:space-y-4">
      {/* Polished Minimalist Section Header */}
      <div className="flex items-center justify-between gap-4 pt-1 pb-0.5">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-6 rounded-full bg-[#006400] shrink-0" />
          <div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
              TPC Alumni Updates &amp; Activities
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Latest announcements and upcoming activities
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid:
          CASE 1: Both exist -> 2-column layout (Events LEFT, Announcements RIGHT)
          CASE 2: Events only -> Single column, full width
          CASE 3: Announcements only -> Single column, full width
      */}
      <div
        className={
          hasEvents && hasAnnouncements
            ? "grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-stretch"
            : "grid grid-cols-1 gap-4 sm:gap-6"
        }
      >
        {/* Left Column: Events */}
        {hasEvents && (
          <DashboardEventsCard
            events={events}
            isFullWidth={!hasAnnouncements}
            listPath={routes.eventsList}
            getDetailPath={routes.getEventDetail}
          />
        )}

        {/* Right Column: Announcements */}
        {hasAnnouncements && (
          <DashboardAnnouncementsCard
            announcements={announcements}
            isFullWidth={!hasEvents}
            listPath={routes.announcementsList}
            getDetailPath={routes.getAnnouncementDetail}
          />
        )}
      </div>
    </section>
  );
}
