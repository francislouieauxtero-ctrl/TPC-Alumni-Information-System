import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import navigationProgress from "../../services/navigationProgress";

/**
 * TopLoadingBar - In-system Horizontal Loading Indicator
 *
 * Requirements:
 * - 3–4px high, fixed to top of viewport
 * - Must NOT push content downward, cause layout shifting, or block content
 * - Refined 3-color TPC Alumni gradient:
 *     Primary Blue: #0B5CAD (dominant primary)
 *     Green:        #008000 (subtle middle transition)
 *     Gold:         #C9A84C (restrained finishing accent)
 * - Starts when in-system navigation/page loading begins
 * - Moves smoothly left to right
 * - Completes rapidly to 100% when finished, then smoothly fades out
 * - Only active inside the system; never visible when idle
 */
export default function TopLoadingBar() {
  const location = useLocation();
  const [state, setState] = useState({
    progress: 0,
    isVisible: false,
    isFading: false,
  });
  const prevPathRef = useRef(location.pathname + location.search);
  const isFirstMountRef = useRef(true);

  // Subscribe to progress controller updates
  useEffect(() => {
    const unsubscribe = navigationProgress.subscribe((newState) => {
      setState(newState);
    });
    return () => unsubscribe();
  }, []);

  // Trigger loading on in-system navigation (route changes)
  useEffect(() => {
    const currentPath = location.pathname + location.search;

    // Skip the very first initial mount so it doesn't collide with startup/splash
    if (isFirstMountRef.current) {
      isFirstMountRef.current = false;
      prevPathRef.current = currentPath;
      navigationProgress.setInitialMountComplete();
      return;
    }

    if (prevPathRef.current !== currentPath) {
      prevPathRef.current = currentPath;
      navigationProgress.start();

      // Fallback timer: if the destination page has no async fetch, complete after 300ms
      const autoDoneTimer = setTimeout(() => {
        navigationProgress.done();
      }, 350);

      return () => clearTimeout(autoDoneTimer);
    }
  }, [location.pathname, location.search]);

  if (!state.isVisible && state.progress === 0) {
    return null;
  }

  return (
    <div
      role="progressbar"
      aria-label="Page loading indicator"
      aria-valuenow={Math.round(state.progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      className={`fixed top-0 left-0 right-0 h-[3.5px] z-[9999] pointer-events-none transition-opacity duration-300 ease-out ${
        state.isFading ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Background track (subtle translucent container) */}
      <div className="absolute inset-0 bg-transparent" />

      {/* Animated gradient progress bar */}
      <div
        className="h-full relative transition-all ease-out"
        style={{
          width: `${state.progress}%`,
          transitionDuration: state.progress === 100 ? "180ms" : "260ms",
          background:
            "linear-gradient(90deg, #0B5CAD 0%, #0B5CAD 55%, #008000 80%, #C9A84C 100%)",
          boxShadow:
            "0 0 10px rgba(11, 92, 173, 0.45), 0 0 4px rgba(201, 168, 76, 0.35)",
        }}
      >
        {/* Leading edge restrained gold shimmer accent */}
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-r from-transparent to-[#C9A84C]/50 blur-[2px]" />
      </div>
    </div>
  );
}
