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
      .replace(/"/g, "&quot;")
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

export function resolveStorageUrl(url) {
  if (!url || typeof url !== "string") return "";
  let trimmed = url.trim();
  if (!trimmed) return "";

  // Normalize any localhost/127.0.0.1 port URLs to portable root-relative /storage/...
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/storage\//i.test(trimmed)) {
    trimmed = trimmed.replace(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i, "");
  }

  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("blob:")
  ) {
    return trimmed;
  }
  let cleanPath = trimmed.replace(/^\/+/, "");
  while (cleanPath.startsWith("storage/")) {
    cleanPath = cleanPath.slice(8);
  }
  if (!cleanPath.includes("/") && /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(cleanPath)) {
    cleanPath = `avatars/${cleanPath}`;
  }
  return `/storage/${cleanPath}`;
}

export function getFirstImageUrl(item) {
  if (!item) return null;

  if (typeof item.image === "string" && item.image.trim()) {
    return resolveStorageUrl(item.image);
  }

  if (Array.isArray(item.images) && item.images.length > 0) {
    for (const img of item.images) {
      const url = typeof img === "string" ? img : img?.url || img?.path || "";
      if (url && typeof url === "string" && url.trim()) {
        return resolveStorageUrl(url);
      }
    }
  }

  const attachments = getAttachmentUrls(item);
  for (const raw of attachments) {
    if (typeof raw === "string" && raw.trim()) {
      const clean = raw.split("?")[0].toLowerCase();
      if (/\.(jpg|jpeg|png|webp|gif|svg)$/i.test(clean)) {
        return resolveStorageUrl(raw);
      }
    }
  }

  return null;
}

export function formatPostDate(dateString) {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();

    // If future by more than 45 seconds (e.g. clock drift or future dates)
    if (diffMs < -45 * 1000) {
      const month = date.toLocaleDateString("en-US", { month: "long" });
      const day = date.getDate();
      const year = date.getFullYear();
      return `Published ${month} ${day}, ${year}`;
    }

    // If under 45 seconds
    if (diffMs >= -45 * 1000 && diffMs < 45 * 1000) {
      return "Just now";
    }

    const diffMinutes = Math.floor(diffMs / (60 * 1000));
    if (diffMinutes < 60) {
      return `${diffMinutes} ${diffMinutes === 1 ? "minute" : "minutes"} ago`;
    }

    const diffHours = Math.floor(diffMs / (60 * 60 * 1000));
    if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`;
    }

    const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
    if (diffDays === 1) {
      return "1 day ago";
    }

    // Older than 1 day: "Published Month DD, YYYY"
    const month = date.toLocaleDateString("en-US", { month: "long" });
    const day = date.getDate();
    const year = date.getFullYear();
    return `Published ${month} ${day}, ${year}`;
  } catch {
    return "";
  }
}

export function getEventStatusInfo(dateString) {
  if (!dateString) {
    return {
      status: "UPCOMING",
      label: "UPCOMING",
      badgeClass: "bg-emerald-50 text-[#006400] border border-emerald-200/90",
    };
  }

  try {
    const eventDate = new Date(dateString);
    if (isNaN(eventDate.getTime())) {
      return {
        status: "UPCOMING",
        label: "UPCOMING",
        badgeClass: "bg-emerald-50 text-[#006400] border border-emerald-200/90",
      };
    }

    const now = new Date();

    const todayMidnight = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const eventMidnight = new Date(
      eventDate.getFullYear(),
      eventDate.getMonth(),
      eventDate.getDate()
    );

    const diffMs = eventMidnight.getTime() - todayMidnight.getTime();
    const dayDiff = Math.round(diffMs / (24 * 60 * 60 * 1000));

    if (dayDiff < 0) {
      return {
        status: "PAST",
        label: "PAST",
        badgeClass: "bg-gray-100 text-gray-600 border border-gray-200",
      };
    } else if (dayDiff === 0) {
      return {
        status: "TODAY",
        label: "TODAY",
        badgeClass: "bg-emerald-100 text-[#006400] border border-emerald-300 font-bold",
      };
    } else if (dayDiff === 1) {
      return {
        status: "TOMORROW",
        label: "TOMORROW",
        badgeClass: "bg-blue-50 text-blue-700 border border-blue-200 font-semibold",
      };
    } else {
      return {
        status: "UPCOMING",
        label: "UPCOMING",
        badgeClass: "bg-emerald-50 text-[#008000] border border-emerald-200 font-medium",
      };
    }
  } catch {
    return {
      status: "UPCOMING",
      label: "UPCOMING",
      badgeClass: "bg-emerald-50 text-[#006400] border border-emerald-200/90",
    };
  }
}

export default {
  getAttachmentUrls,
  renderTextWithLinks,
  getCreatorRoleLabel,
  resolveStorageUrl,
  getFirstImageUrl,
  formatPostDate,
  getEventStatusInfo,
};



