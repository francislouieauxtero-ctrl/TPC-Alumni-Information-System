export function getAttachmentUrls(item) {
  if (!item) return [];

  // Prefer images array (existing naming)
  if (Array.isArray(item.images) && item.images.length) {
    return item.images
      .map((i) => (typeof i === "string" ? i : i.url || ""))
      .filter(Boolean);
  }

  // Fallback to attachments which may be strings or objects
  if (Array.isArray(item.attachments) && item.attachments.length) {
    return item.attachments
      .map((a) => (typeof a === "string" ? a : a.url || a.path || a.name))
      .filter(Boolean);
  }

  // Single-file fields
  if (typeof item.image === "string" && item.image) return [item.image];
  if (typeof item.attachment === "string" && item.attachment)
    return [item.attachment];

  return [];
}

export default { getAttachmentUrls };
