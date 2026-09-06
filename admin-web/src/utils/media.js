import React from "react";

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

export function renderTextWithLinks(text, className = "") {
  if (typeof text !== "string" || !text.trim()) {
    return null;
  }

  const defaultLinkClass =
    "text-tpc-green underline underline-offset-2 break-all hover:text-tpc-greenDeep";

  const escapeHtml = (value) =>
    value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#039;");

  const html = escapeHtml(text).replace(
    /(https?:\/\/[^\s]+|www\.[^\s]+)/gi,
    (match) => {
      const href = /^www\./i.test(match) ? `https://${match}` : match;
      const safeHref = href.replace(/"/g, "&quot;");
      const linkClass = className || defaultLinkClass;

      return `<a href="${safeHref}" target="_blank" rel="noreferrer noopener" class="${linkClass}">${match}</a>`;
    },
  );

  return React.createElement("span", {
    dangerouslySetInnerHTML: { __html: html },
    className: "break-words",
  });
}

export function getCreatorRoleLabel(creator) {
  if (creator?.role === "super_admin") return "Alumni President";
  if (creator?.role === "admin") return "Department Head";
  if (creator?.role === "user") return "Student";
  return "User";
}

export default { getAttachmentUrls, renderTextWithLinks, getCreatorRoleLabel };
