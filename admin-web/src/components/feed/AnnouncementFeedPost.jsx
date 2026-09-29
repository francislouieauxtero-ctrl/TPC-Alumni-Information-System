import PostHeader from "./PostHeader";
import PostContent from "./PostContent";
import MediaGallery from "./MediaGallery";
import PostActions from "./PostActions";
import { getAttachmentUrls } from "../../utils/media";

export default function AnnouncementFeedPost({
  announcement,
  canManage = false,
  onEdit,
  onDelete,
  onView,
  onOpenLightbox,
}) {
  if (!announcement) return null;

  // Extract all images belonging to this post
  const images = Array.isArray(announcement.images) && announcement.images.length > 0
    ? announcement.images
    : getAttachmentUrls(announcement);

  const handleImageClick = (index) => {
    if (onOpenLightbox) {
      onOpenLightbox(images, index, announcement.title);
    }
  };

  return (
    <article className="overflow-hidden rounded-2xl border border-gray-200/90 bg-white p-4 sm:p-6 shadow-xs hover:shadow-sm hover:border-[#008000]/30 transition-all">
      {/* Header */}
      <PostHeader
        creator={announcement.creator}
        createdAt={announcement.created_at || announcement.posted_at}
        scope={announcement.scope}
        department={announcement.department}
        canManage={canManage}
        onEdit={onEdit ? () => onEdit(announcement) : undefined}
        onDelete={onDelete ? () => onDelete(announcement.id) : undefined}
        onView={onView ? () => onView(announcement) : undefined}
      />

      {/* Body: Title + Content */}
      <PostContent
        title={announcement.title}
        content={announcement.content}
      />

      {/* Media Collage Gallery */}
      {images.length > 0 && (
        <MediaGallery
          images={images}
          title={announcement.title}
          onImageClick={handleImageClick}
        />
      )}

      {/* Footer Actions */}
      <PostActions
        postId={announcement.id}
        postType="announcement"
        reactionsSummary={announcement.reactions_summary}
        onView={onView ? () => onView(announcement) : undefined}
      />
    </article>
  );
}
