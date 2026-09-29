import { useEffect, useState, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight, X, Download } from "lucide-react";
import { resolveStorageUrl } from "../../utils/media";

export default function MediaLightbox({
  images = [],
  initialIndex = 0,
  onClose,
  title = "",
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const total = images.length;

  const handleNext = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const handlePrev = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Keyboard navigation & lock background scroll
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    };

    document.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [onClose, handleNext, handlePrev]);

  // Touch swipe handlers
  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 50) {
      // Swiped left -> next
      handleNext();
    } else if (diff < -50) {
      // Swiped right -> prev
      handlePrev();
    }
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  if (!images || total === 0) return null;

  const currentImage = images[currentIndex];
  const currentUrl = resolveStorageUrl(
    typeof currentImage === "string" ? currentImage : currentImage?.url || currentImage?.path || ""
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Image gallery lightbox"
      className="fixed inset-0 z-50 flex flex-col justify-between bg-black/92 backdrop-blur-md select-none animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Top Bar */}
      <div
        className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 bg-gradient-to-b from-black/80 to-transparent z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 text-white">
          <span className="font-semibold text-sm sm:text-base tracking-wide bg-white/10 px-3 py-1 rounded-full">
            {currentIndex + 1} / {total}
          </span>
          {title && (
            <p className="hidden sm:block text-sm text-gray-300 truncate max-w-md">
              {title}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {currentUrl && (
            <a
              href={currentUrl}
              target="_blank"
              rel="noreferrer noopener"
              download
              className="p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Open full image in new tab"
              title="Open full size"
            >
              <Download className="w-5 h-5" />
            </a>
          )}
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close lightbox (Esc)"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main Image Area with Touch Support */}
      <div
        className="relative flex-1 w-full h-full min-h-0 flex items-center justify-center p-2 sm:p-6 overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Prev Arrow */}
        {total > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className="hidden sm:flex absolute left-4 z-10 w-12 h-12 items-center justify-center rounded-full bg-black/60 text-white/90 hover:text-white hover:bg-black/85 hover:scale-105 active:scale-95 transition-all shadow-xl cursor-pointer"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-7 h-7" />
          </button>
        )}

        {/* Displayed Image - Guaranteed Centered */}
        <div
          className="w-full h-full flex items-center justify-center select-none"
          onClick={(e) => e.stopPropagation()}
        >
          <img
            key={currentUrl}
            src={currentUrl}
            alt={title || `Image ${currentIndex + 1}`}
            className="max-h-[85vh] max-w-[92vw] w-auto h-auto mx-auto object-contain rounded-xl shadow-2xl transition-all duration-200 block"
          />
        </div>

        {/* Next Arrow */}
        {total > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="hidden sm:flex absolute right-4 z-10 w-12 h-12 items-center justify-center rounded-full bg-black/50 text-white/90 hover:text-white hover:bg-black/75 hover:scale-105 active:scale-95 transition-all shadow-lg"
            aria-label="Next image"
          >
            <ChevronRight className="w-7 h-7" />
          </button>
        )}
      </div>

      {/* Bottom Thumbnail Strip (for multi-image posts) */}
      {total > 1 && (
        <div
          className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-t from-black/80 to-transparent overflow-x-auto z-10"
          onClick={(e) => e.stopPropagation()}
        >
          {images.map((img, idx) => {
            const thumbUrl = resolveStorageUrl(
              typeof img === "string" ? img : img?.url || img?.path || ""
            );
            const isSelected = idx === currentIndex;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`relative shrink-0 rounded-md overflow-hidden transition-all ${
                  isSelected
                    ? "ring-2 ring-tpc-green ring-offset-2 ring-offset-black scale-105"
                    : "opacity-50 hover:opacity-100"
                }`}
              >
                <img
                  src={thumbUrl}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-12 h-12 sm:w-14 sm:h-14 object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
