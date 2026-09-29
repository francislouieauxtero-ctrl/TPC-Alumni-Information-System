import { useState } from "react";
import { ImageOff } from "lucide-react";
import { resolveStorageUrl } from "../../utils/media";

export default function MediaGallery({
  images = [],
  title = "Post image",
  onImageClick,
}) {
  const [failedImages, setFailedImages] = useState({});

  if (!images || images.length === 0) return null;

  // Filter only valid image strings/objects
  const validImages = images.filter((img) => {
    const raw = typeof img === "string" ? img : img?.url || img?.path || "";
    if (!raw) return false;
    return (
      /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(raw.split("?")[0]) ||
      raw.startsWith("data:image/") ||
      raw.startsWith("blob:") ||
      typeof img === "string"
    );
  });

  const count = validImages.length;
  if (count === 0) return null;

  const getUrl = (img) =>
    resolveStorageUrl(typeof img === "string" ? img : img?.url || img?.path || "");

  const handleImageError = (index) => {
    setFailedImages((prev) => ({ ...prev, [index]: true }));
  };

  // 1 Image: Large natural view with feed-appropriate max dimensions (no aggressive cropping)
  if (count === 1) {
    const url = getUrl(validImages[0]);

    if (failedImages[0]) {
      return (
        <div className="mt-3 flex flex-col items-center justify-center p-8 rounded-2xl border border-dashed border-gray-200 bg-gray-50/70 text-gray-400">
          <ImageOff className="w-8 h-8 mb-2 text-gray-300" />
          <span className="text-xs font-medium text-gray-500">
            Image preview unavailable
          </span>
        </div>
      );
    }

    return (
      <div className="mt-3 overflow-hidden rounded-2xl border border-gray-100 bg-gray-50/60 flex items-center justify-center">
        <button
          type="button"
          onClick={() => onImageClick?.(0)}
          className="group relative block w-full overflow-hidden text-center focus:outline-none focus:ring-2 focus:ring-tpc-green/50 cursor-zoom-in"
        >
          <img
            src={url}
            alt={title}
            loading="lazy"
            onError={() => handleImageError(0)}
            className="w-full max-h-[460px] sm:max-h-[500px] object-contain mx-auto transition-transform duration-300 group-hover:scale-[1.01]"
          />
        </button>
      </div>
    );
  }

  // 2 Images: 50 / 50 side-by-side balanced layout
  if (count === 2) {
    return (
      <div className="mt-3 grid grid-cols-2 gap-1.5 overflow-hidden rounded-2xl border border-gray-100 bg-gray-100 h-64 sm:h-80 md:h-96">
        {validImages.map((img, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onImageClick?.(idx)}
            className="group relative h-full w-full overflow-hidden bg-gray-50 focus:outline-none focus:ring-2 focus:ring-tpc-green/50 cursor-zoom-in"
          >
            {failedImages[idx] ? (
              <div className="flex flex-col items-center justify-center h-full w-full bg-gray-100 text-gray-400">
                <ImageOff className="w-6 h-6 mb-1 text-gray-300" />
                <span className="text-[10px] text-gray-400">Unavailable</span>
              </div>
            ) : (
              <img
                src={getUrl(img)}
                alt={`${title} - ${idx + 1}`}
                loading="lazy"
                onError={() => handleImageError(idx)}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              />
            )}
          </button>
        ))}
      </div>
    );
  }

  // 3 Images: 1 big on left (2 cols), 2 stacked on right (1 col)
  if (count === 3) {
    return (
      <div className="mt-3 grid grid-cols-3 gap-1.5 overflow-hidden rounded-2xl border border-gray-100 bg-gray-100 h-64 sm:h-80 md:h-96">
        {/* Left prominent image */}
        <button
          type="button"
          onClick={() => onImageClick?.(0)}
          className="group relative col-span-2 h-full w-full overflow-hidden bg-gray-50 focus:outline-none focus:ring-2 focus:ring-tpc-green/50 cursor-zoom-in"
        >
          {failedImages[0] ? (
            <div className="flex flex-col items-center justify-center h-full w-full bg-gray-100 text-gray-400">
              <ImageOff className="w-8 h-8 mb-1 text-gray-300" />
              <span className="text-xs text-gray-400">Unavailable</span>
            </div>
          ) : (
            <img
              src={getUrl(validImages[0])}
              alt={`${title} - 1`}
              loading="lazy"
              onError={() => handleImageError(0)}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
          )}
        </button>

        {/* Right stacked images */}
        <div className="col-span-1 grid grid-rows-2 gap-1.5 h-full">
          {[validImages[1], validImages[2]].map((img, idx) => {
            const actualIndex = idx + 1;
            return (
              <button
                key={actualIndex}
                type="button"
                onClick={() => onImageClick?.(actualIndex)}
                className="group relative h-full w-full overflow-hidden bg-gray-50 focus:outline-none focus:ring-2 focus:ring-tpc-green/50 cursor-zoom-in"
              >
                {failedImages[actualIndex] ? (
                  <div className="flex flex-col items-center justify-center h-full w-full bg-gray-100 text-gray-400">
                    <ImageOff className="w-5 h-5 mb-1 text-gray-300" />
                    <span className="text-[10px] text-gray-400">Unavailable</span>
                  </div>
                ) : (
                  <img
                    src={getUrl(img)}
                    alt={`${title} - ${actualIndex + 1}`}
                    loading="lazy"
                    onError={() => handleImageError(actualIndex)}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // 4 Images: Clean 2x2 grid
  if (count === 4) {
    return (
      <div className="mt-3 grid grid-cols-2 gap-1.5 overflow-hidden rounded-2xl border border-gray-100 bg-gray-100 h-64 sm:h-80 md:h-96">
        {validImages.map((img, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onImageClick?.(idx)}
            className="group relative h-full w-full overflow-hidden bg-gray-50 focus:outline-none focus:ring-2 focus:ring-tpc-green/50 cursor-zoom-in"
          >
            {failedImages[idx] ? (
              <div className="flex flex-col items-center justify-center h-full w-full bg-gray-100 text-gray-400">
                <ImageOff className="w-6 h-6 mb-1 text-gray-300" />
                <span className="text-[10px] text-gray-400">Unavailable</span>
              </div>
            ) : (
              <img
                src={getUrl(img)}
                alt={`${title} - ${idx + 1}`}
                loading="lazy"
                onError={() => handleImageError(idx)}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              />
            )}
          </button>
        ))}
      </div>
    );
  }

  // 5+ Images: 2x2 preview grid with centered +N overlay on 4th image
  const displayImages = validImages.slice(0, 4);
  const remainingCount = count - 4;

  return (
    <div className="mt-3 grid grid-cols-2 gap-1.5 overflow-hidden rounded-2xl border border-gray-100 bg-gray-100 h-64 sm:h-80 md:h-96">
      {displayImages.map((img, idx) => {
        const isLast = idx === 3;
        return (
          <button
            key={idx}
            type="button"
            onClick={() => onImageClick?.(idx)}
            className="group relative h-full w-full overflow-hidden bg-gray-50 focus:outline-none focus:ring-2 focus:ring-tpc-green/50 cursor-zoom-in"
          >
            {failedImages[idx] ? (
              <div className="flex flex-col items-center justify-center h-full w-full bg-gray-100 text-gray-400">
                <ImageOff className="w-6 h-6 mb-1 text-gray-300" />
                <span className="text-[10px] text-gray-400">Unavailable</span>
              </div>
            ) : (
              <img
                src={getUrl(img)}
                alt={`${title} - ${idx + 1}`}
                loading="lazy"
                onError={() => handleImageError(idx)}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              />
            )}
            {isLast && remainingCount > 0 && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[2px] transition-colors group-hover:bg-black/70">
                <span className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-wider">
                  +{remainingCount}
                </span>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
