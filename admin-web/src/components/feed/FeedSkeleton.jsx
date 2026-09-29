export default function FeedSkeleton({ count = 3 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6 shadow-xs animate-pulse space-y-4"
        >
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-200" />
            <div className="space-y-1.5 flex-1">
              <div className="h-4 w-32 bg-gray-200 rounded" />
              <div className="h-3 w-20 bg-gray-150 rounded" />
            </div>
            <div className="h-5 w-24 bg-gray-150 rounded-full" />
          </div>

          {/* Title */}
          <div className="h-6 w-3/4 bg-gray-200 rounded" />

          {/* Content */}
          <div className="space-y-2">
            <div className="h-4 w-full bg-gray-150 rounded" />
            <div className="h-4 w-5/6 bg-gray-150 rounded" />
            <div className="h-4 w-2/3 bg-gray-150 rounded" />
          </div>

          {/* Media Placeholder */}
          <div className="h-56 sm:h-64 w-full bg-gray-150 rounded-xl" />

          {/* Footer */}
          <div className="pt-3 border-t border-gray-100 flex justify-between">
            <div className="h-6 w-16 bg-gray-150 rounded" />
            <div className="h-6 w-20 bg-gray-150 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
