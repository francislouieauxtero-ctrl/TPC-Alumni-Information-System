import { useState, useRef, useEffect, useCallback } from "react";
import { Heart } from "lucide-react";
import reactionService from "../../services/reactionService";
import { toast } from "react-toastify";

export const REACTION_CONFIG = {
  heart: {
    id: "heart",
    emoji: "❤️",
    label: "Heart",
    color: "text-rose-600 font-semibold",
    bg: "bg-rose-50 text-rose-600",
  },
  like: {
    id: "like",
    emoji: "👍",
    label: "Like",
    color: "text-tpc-green font-semibold",
    bg: "bg-emerald-50 text-tpc-green",
  },
  sad: {
    id: "sad",
    emoji: "😢",
    label: "Sad",
    color: "text-blue-600 font-semibold",
    bg: "bg-blue-50 text-blue-700",
  },
  wow: {
    id: "wow",
    emoji: "😮",
    label: "Wow",
    color: "text-amber-500 font-semibold",
    bg: "bg-amber-50 text-amber-600",
  },
  fire: {
    id: "fire",
    emoji: "🔥",
    label: "Fire",
    color: "text-orange-500 font-semibold",
    bg: "bg-orange-50 text-orange-600",
  },
};

// Heart is the primary/first reaction
const REACTION_LIST = [
  REACTION_CONFIG.heart,
  REACTION_CONFIG.like,
  REACTION_CONFIG.sad,
  REACTION_CONFIG.wow,
  REACTION_CONFIG.fire,
];

export default function PostReactions({
  postId,
  postType = "announcement",
  initialSummary = null,
}) {
  const [summary, setSummary] = useState(() => ({
    total: initialSummary?.total ?? 0,
    breakdown: initialSummary?.breakdown ?? {
      heart: 0,
      like: 0,
      sad: 0,
      wow: 0,
      fire: 0,
    },
    user_reaction: initialSummary?.user_reaction ?? null,
  }));

  const [pickerOpen, setPickerOpen] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);

  const containerRef = useRef(null);
  const hoverTimerRef = useRef(null);
  const longPressTimerRef = useRef(null);
  const isLongPressRef = useRef(false);
  const pointerStartPosRef = useRef({ x: 0, y: 0 });

  // Sync if initialSummary changes from parent
  useEffect(() => {
    if (initialSummary) {
      setSummary({
        total: initialSummary.total ?? 0,
        breakdown: initialSummary.breakdown ?? {
          heart: 0,
          like: 0,
          sad: 0,
          wow: 0,
          fire: 0,
        },
        user_reaction: initialSummary.user_reaction ?? null,
      });
    }
  }, [initialSummary]);

  // Click outside listener to dismiss picker and breakdown popover
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setPickerOpen(false);
        setShowBreakdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside, { passive: true });
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  // Perform optimistic update and trigger API
  const applyReaction = useCallback(
    async (reactionType) => {
      const prevSummary = {
        ...summary,
        breakdown: { ...summary.breakdown },
      };

      const currentReaction = summary.user_reaction;
      const isRemoving = currentReaction === reactionType;

      const newReaction = isRemoving ? null : reactionType;
      const newBreakdown = { ...summary.breakdown };

      if (currentReaction && newBreakdown[currentReaction] > 0) {
        newBreakdown[currentReaction]--;
      }
      if (newReaction) {
        newBreakdown[newReaction] = (newBreakdown[newReaction] || 0) + 1;
      }

      const newTotal = Math.max(
        0,
        Object.values(newBreakdown).reduce((a, b) => a + b, 0)
      );

      // Apply optimistic update immediately
      setSummary({
        total: newTotal,
        breakdown: newBreakdown,
        user_reaction: newReaction,
      });
      setPickerOpen(false);

      try {
        const result =
          postType === "event"
            ? await reactionService.reactToEvent(postId, reactionType)
            : await reactionService.reactToAnnouncement(postId, reactionType);

        if (result) {
          setSummary({
            total: result.total ?? 0,
            breakdown: result.breakdown ?? newBreakdown,
            user_reaction: result.user_reaction ?? null,
          });
        }
      } catch {
        // Rollback on failure
        setSummary(prevSummary);
        toast.error("Failed to update reaction. Please try again.");
      }
    },
    [postId, postType, summary]
  );

  // Short Click:
  // Unreacted -> Heart (primary default reaction)
  // Reacted -> Toggle off / remove reaction
  const handleMainClick = () => {
    if (isLongPressRef.current) {
      isLongPressRef.current = false;
      return;
    }
    if (pickerOpen) {
      setPickerOpen(false);
      return;
    }

    if (summary.user_reaction) {
      // Toggle off current reaction
      applyReaction(summary.user_reaction);
    } else {
      // Apply default Heart
      applyReaction("heart");
    }
  };

  // Desktop Hover handlers
  const handleMouseEnter = () => {
    hoverTimerRef.current = setTimeout(() => {
      setPickerOpen(true);
    }, 350);
  };

  const handleMouseLeave = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
  };

  // Pointer / Touch Long-Press handlers (works reliably across desktop mouse & mobile touch)
  const handlePointerDown = (e) => {
    isLongPressRef.current = false;
    pointerStartPosRef.current = { x: e.clientX, y: e.clientY };

    longPressTimerRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      setPickerOpen(true);
      if (window.navigator?.vibrate) {
        window.navigator.vibrate(40);
      }
    }, 450);
  };

  const cancelLongPress = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handlePointerMove = (e) => {
    // If pointer moves significantly, user is scrolling/dragging -> cancel
    const dx = Math.abs(e.clientX - pointerStartPosRef.current.x);
    const dy = Math.abs(e.clientY - pointerStartPosRef.current.y);
    if (dx > 8 || dy > 8) {
      cancelLongPress();
    }
  };

  const handlePointerUp = () => {
    cancelLongPress();
  };

  // Top reactions for summary (only those with count > 0)
  const activeReactions = REACTION_LIST.filter(
    (r) => (summary.breakdown?.[r.id] || 0) > 0
  ).sort((a, b) => (summary.breakdown[b.id] || 0) - (summary.breakdown[a.id] || 0));

  const currentConfig = summary.user_reaction
    ? REACTION_CONFIG[summary.user_reaction] || null
    : null;

  return (
    <div
      className="relative inline-flex items-center gap-1.5"
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Floating Animated Reaction Picker Bar (Facebook style) */}
      {pickerOpen && (
        <div
          className="absolute bottom-full mb-2 left-0 flex items-center gap-1.5 p-1.5 sm:p-2 rounded-full bg-white shadow-2xl border border-gray-200/90 z-40 animate-in fade-in zoom-in-95 duration-150 select-none"
          role="toolbar"
          aria-label="Reaction options"
        >
          {REACTION_LIST.map((r) => {
            const isSelected = summary.user_reaction === r.id;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => applyReaction(r.id)}
                className={`group relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full transition-all duration-200 hover:scale-130 active:scale-110 cursor-pointer ${
                  isSelected
                    ? "bg-rose-50 ring-2 ring-rose-500/40 scale-110"
                    : "hover:bg-gray-50"
                }`}
                title={r.label}
                aria-label={r.label}
              >
                <span className="text-xl sm:text-2xl leading-none transition-transform group-hover:-translate-y-1">
                  {r.emoji}
                </span>
                {/* Tooltip */}
                <span className="absolute -top-7 hidden group-hover:block bg-gray-900 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-sm whitespace-nowrap pointer-events-none">
                  {r.label}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Main Reaction Trigger Button: Neutral when unreacted, colored only when reacted */}
      <button
        type="button"
        onClick={handleMainClick}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerMove={handlePointerMove}
        onPointerCancel={cancelLongPress}
        onContextMenu={(e) => e.preventDefault()}
        className={`group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all select-none cursor-pointer active:scale-95 ${
          currentConfig
            ? `${currentConfig.color} ${currentConfig.bg} hover:brightness-95`
            : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"
        }`}
        aria-label={currentConfig ? `Reacted: ${currentConfig.label}` : "React with Heart"}
        title={currentConfig ? `${currentConfig.label} (Click to remove, hold to change)` : "Heart (Hold for more reactions)"}
      >
        {currentConfig ? (
          <span className="text-base sm:text-lg leading-none transition-transform group-hover:scale-115">
            {currentConfig.emoji}
          </span>
        ) : (
          <Heart className="w-4 h-4 text-gray-400 group-hover:text-rose-500 transition-colors" />
        )}
        <span>{currentConfig ? currentConfig.label : "Heart"}</span>
      </button>

      {/* Reaction Count: Grouped BESIDE the reaction button, compact & interactive */}
      {summary.total > 0 && (
        <div className="relative inline-flex items-center">
          <button
            type="button"
            onClick={() => setShowBreakdown((prev) => !prev)}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-xl text-xs font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 hover:text-gray-900 transition-colors cursor-pointer border border-gray-100"
            title="View reaction breakdown"
          >
            {/* Top 2 Active Emojis */}
            <span className="flex -space-x-1 items-center">
              {activeReactions.slice(0, 2).map((r) => (
                <span key={r.id} className="text-xs leading-none">
                  {r.emoji}
                </span>
              ))}
            </span>

            <span>{summary.total}</span>
          </button>

          {/* Breakdown Popover */}
          {showBreakdown && (
            <div className="absolute bottom-full mb-2 left-0 bg-white/95 backdrop-blur-md p-2.5 rounded-xl shadow-xl border border-gray-100 z-30 min-w-[140px] animate-in fade-in duration-100">
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5 px-1">
                Reactions ({summary.total})
              </p>
              <div className="space-y-1">
                {activeReactions.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between px-2 py-1 rounded-lg text-xs text-gray-700 bg-gray-50/70"
                  >
                    <span className="flex items-center gap-1.5 font-medium">
                      <span>{r.emoji}</span>
                      <span>{r.label}</span>
                    </span>
                    <span className="font-bold text-gray-900">
                      {summary.breakdown[r.id]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
