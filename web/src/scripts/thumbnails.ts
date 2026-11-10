/**
 * Product gallery: clicking a thumbnail swaps the main (uncropped) image.
 * Markup contract:
 *   [data-gallery]
 *     img[data-gallery-main]
 *     button[data-gallery-thumb][data-src][data-srcset][data-alt][data-width][data-height]
 */
function init() {
  document.querySelectorAll<HTMLElement>('[data-gallery]').forEach((gallery) => {
    const main = gallery.querySelector<HTMLImageElement>('[data-gallery-main]');
    const thumbs = Array.from(gallery.querySelectorAll<HTMLButtonElement>('[data-gallery-thumb]'));
    if (!main || thumbs.length < 2) return;

    thumbs.forEach((thumb) => {
      thumb.addEventListener('click', () => {
        const { src, srcset, alt, width, height } = thumb.dataset;
        if (!src) return;
        main.srcset = srcset ?? '';
        main.src = src;
        main.alt = alt ?? '';
        if (width) main.width = Number(width);
        if (height) main.height = Number(height);
        thumbs.forEach((t) => t.setAttribute('aria-pressed', String(t === thumb)));
      });
    });
  });
}

init();

export {};
