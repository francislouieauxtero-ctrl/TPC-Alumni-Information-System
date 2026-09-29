import { Calendar, Clock, MapPin, FileText, Download } from "lucide-react";
import PostHeader from "./PostHeader";
import PostContent from "./PostContent";
import MediaGallery from "./MediaGallery";
import PostActions from "./PostActions";
import { resolveStorageUrl, getEventStatusInfo } from "../../utils/media";

export default function EventFeedPost({
  event,
  canManage = false,
  onEdit,
  onDelete,
  onView,
  onOpenLightbox,
}) {
  if (!event) return null;

  // Process attachments
  const rawAttachments = Array.isArray(event.attachments) ? event.attachments : [];
  
  const imageAttachments = [];
  const docAttachments = [];

  rawAttachments.forEach((att) => {
    const url = typeof att === "string" ? att : att?.url || att?.path || "";
    const name = typeof att === "object" ? att?.name || "Document" : "Attachment";
    if (/\.(jpg|jpeg|png|webp|gif|svg)$/i.test(url.split("?")[0])) {
      imageAttachments.push(url);
    } else if (url) {
      docAttachments.push({ url: resolveStorageUrl(url), name });
    }
  });

  const handleImageClick = (index) => {
    if (onOpenLightbox) {
      onOpenLightbox(imageAttachments, index, event.title);
    }
  };

  // Format event date & time
  const formatEventSchedule = (dateString) => {
    if (!dateString) return { date: "TBA", time: "", isPast: false };
    try {
      const d = new Date(dateString);
      const isPast = d.getTime() < Date.now();
      const date = d.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      const time = d.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
      return { date, time, isPast };
    } catch {
      return { date: dateString, time: "", isPast: false };
    }
  };

  const schedule = formatEventSchedule(event.event_date);
  const statusInfo = getEventStatusInfo(event.event_date);

  const statusBadge = (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase ${statusInfo.badgeClass} shadow-2xs`}
    >
      {statusInfo.label}
    </span>
  );

  return (
    <article className="overflow-hidden rounded-2xl border border-gray-200/90 bg-white p-4 sm:p-6 shadow-xs hover:shadow-sm hover:border-[#008000]/30 transition-all">
      {/* Header */}
      <PostHeader
        creator={event.creator}
        createdAt={event.created_at}
        scope={event.scope}
        department={event.department}
        extraBadge={statusBadge}
        canManage={canManage}
        onEdit={onEdit ? () => onEdit(event) : undefined}
        onDelete={onDelete ? () => onDelete(event.id) : undefined}
        onView={onView ? () => onView(event) : undefined}
      />

      {/* Event Details Banner */}
      <div className="mt-3.5 flex flex-wrap items-center gap-2 sm:gap-3 rounded-xl bg-gray-50/80 border border-gray-100 p-3 text-xs sm:text-sm text-gray-700">
        <div className="flex items-center gap-1.5 font-semibold text-tpc-navy">
          <Calendar className="w-4 h-4 text-[#008000]" />
          <span>{schedule.date}</span>
        </div>

        {schedule.time && (
          <div className="flex items-center gap-1.5 text-gray-600">
            <Clock className="w-4 h-4 text-gray-400" />
            <span>{schedule.time}</span>
          </div>
        )}

        {event.location && (
          <div className="flex items-center gap-1.5 text-gray-600">
            <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
            <span className="truncate max-w-[200px] sm:max-w-xs">{event.location}</span>
          </div>
        )}
      </div>

      {/* Body: Title + Description */}
      <PostContent
        title={event.title}
        content={event.description}
      />

      {/* Media Collage for Event Images */}
      {imageAttachments.length > 0 && (
        <MediaGallery
          images={imageAttachments}
          title={event.title}
          onImageClick={handleImageClick}
        />
      )}

      {/* Document Attachments (PDFs, spreadsheets, etc.) */}
      {docAttachments.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {docAttachments.map((doc, idx) => (
            <a
              key={idx}
              href={doc.url}
              target="_blank"
              rel="noreferrer noopener"
              download
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 text-xs font-medium text-gray-700 hover:text-tpc-navy transition-colors"
            >
              <FileText className="w-4 h-4 text-tpc-green" />
              <span className="truncate max-w-[180px]">{doc.name}</span>
              <Download className="w-3.5 h-3.5 text-gray-400" />
            </a>
          ))}
        </div>
      )}

      {/* Footer Actions */}
      <PostActions
        postId={event.id}
        postType="event"
        reactionsSummary={event.reactions_summary}
        onView={onView ? () => onView(event) : undefined}
      />
    </article>
  );
}
