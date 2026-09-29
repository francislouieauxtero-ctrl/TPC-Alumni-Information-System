import { useState } from "react";
import { renderTextWithLinks } from "../../utils/media";

export default function PostContent({
  title = "",
  content = "",
  titleClassName = "",
  contentClassName = "",
  maxChars = 280,
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const cleanContent = typeof content === "string" ? content.trim() : "";
  const isLong = cleanContent.length > maxChars;

  const displayedContent = isLong && !isExpanded
    ? `${cleanContent.slice(0, maxChars)}...`
    : cleanContent;

  return (
    <div className="mt-3 space-y-2">
      {/* Title */}
      {title && (
        <h3
          className={`text-lg sm:text-xl font-bold text-gray-900 leading-snug break-words tracking-tight ${titleClassName}`}
        >
          {title}
        </h3>
      )}

      {/* Content */}
      {cleanContent && (
        <div className={`text-sm sm:text-[15px] leading-relaxed text-gray-700 whitespace-pre-line break-words ${contentClassName}`}>
          {renderTextWithLinks(displayedContent)}

          {isLong && (
            <button
              type="button"
              onClick={() => setIsExpanded((prev) => !prev)}
              className="inline-block font-semibold text-tpc-green hover:text-tpc-greenDeep hover:underline focus:outline-none ml-1 cursor-pointer transition-colors"
            >
              {isExpanded ? "See less" : "See more"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
