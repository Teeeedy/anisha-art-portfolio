/**
 * Grid tiles with a <video data-hover-video> play (muted) while hovered or
 * focused, and rewind when the pointer leaves. Only on hover-capable devices
 * and only when the user has not asked for reduced motion.
 */
function init() {
  const canHover = window.matchMedia('(hover: hover)').matches;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!canHover || reduceMotion) return;

  document.querySelectorAll<HTMLVideoElement>('video[data-hover-video]').forEach((video) => {
    if (video.dataset.hoverReady) return;
    video.dataset.hoverReady = 'true';

    const host = video.closest<HTMLElement>('.tile') ?? video;
    const play = () => {
      video.muted = true;
      video.play().catch(() => {});
    };
    const stop = () => {
      video.pause();
      try {
        video.currentTime = 0;
      } catch {
        /* metadata not loaded yet */
      }
    };

    host.addEventListener('mouseenter', play);
    host.addEventListener('mouseleave', stop);
    host.addEventListener('focusin', play);
    host.addEventListener('focusout', stop);
  });
}

init();

export {};
