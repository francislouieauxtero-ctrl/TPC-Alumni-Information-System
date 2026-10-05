// Centralized in-system navigation & page-loading progress controller
// Coordinates the Top Horizontal Loading Indicator across route transitions and API requests.

let listeners = new Set();
let progress = 0;
let isVisible = false;
let isFading = false;
let trickleTimer = null;
let activeRequestCount = 0;
let initialMountComplete = false;

function notify() {
  listeners.forEach((fn) =>
    fn({
      progress,
      isVisible,
      isFading,
    }),
  );
}

function clearTrickle() {
  if (trickleTimer) {
    clearInterval(trickleTimer);
    trickleTimer = null;
  }
}

export const navigationProgress = {
  subscribe(listener) {
    listeners.add(listener);
    // Send initial state immediately
    listener({ progress, isVisible, isFading });
    return () => listeners.delete(listener);
  },

  start() {
    clearTrickle();
    isFading = false;
    isVisible = true;

    // Start with a smooth initial jump
    if (progress < 15) {
      progress = 18;
    }
    notify();

    // Trickle progress forward smoothly with decaying increments
    trickleTimer = setInterval(() => {
      if (progress < 90) {
        // Asymptotically slow down as it approaches 90%
        const remaining = 90 - progress;
        const step = Math.max(0.5, remaining * 0.08);
        progress = Math.min(90, progress + step);
        notify();
      }
    }, 120);
  },

  set(val) {
    progress = Math.min(100, Math.max(0, val));
    notify();
  },

  done() {
    clearTrickle();
    if (!isVisible) return;

    // Swiftly complete to 100%
    progress = 100;
    notify();

    // Fade out smoothly after completion
    setTimeout(() => {
      isFading = true;
      notify();

      setTimeout(() => {
        isVisible = false;
        isFading = false;
        progress = 0;
        notify();
      }, 300);
    }, 200);
  },

  // Track in-system API requests
  onRequestStart() {
    activeRequestCount++;
    if (activeRequestCount === 1) {
      navigationProgress.start();
    }
  },

  onRequestEnd() {
    activeRequestCount = Math.max(0, activeRequestCount - 1);
    if (activeRequestCount === 0) {
      navigationProgress.done();
    }
  },

  setInitialMountComplete() {
    initialMountComplete = true;
  },

  isInitialMountComplete() {
    return initialMountComplete;
  },
};

export default navigationProgress;
