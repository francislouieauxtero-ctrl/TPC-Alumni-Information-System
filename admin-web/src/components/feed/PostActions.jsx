import { Eye } from "lucide-react";
import PostReactions from "./PostReactions";

export default function PostActions({
  onView,
  postType = "announcement",
  postId,
  reactionsSummary,
}) {
  return (
    <div className="mt-3.5 pt-2.5 border-t border-gray-100 flex items-center justify-between text-xs sm:text-sm">
      {/* Reaction Control + Grouped Beside Count */}
      <PostReactions
        postId={postId}
        postType={postType}
        initialSummary={reactionsSummary}
      />

      {/* Action View Button */}
      {onView && (
        <button
          type="button"
          onClick={onView}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium text-gray-500 hover:text-tpc-navy hover:bg-gray-100/80 transition-colors cursor-pointer"
          title="View full post"
        >
          <Eye className="w-4 h-4 text-gray-400" />
          <span>View</span>
        </button>
      )}
    </div>
  );
}
