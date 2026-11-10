import type { LightboxItem } from '../types/lightbox';

/**
 * Accessible lightbox built on <dialog>:
 * - showModal() gives us focus trapping, inert background and Esc-to-close
 * - ← / → navigate, buttons for pointer users, click outside media closes
 * - focus returns to the tile that opened it
 */
function init() {
  const dialog = document.getElementById('lightbox') as HTMLDialogElement | null;
  if (!dialog || typeof dialog.showModal !== 'function') return;

  const dataEl = dialog.querySelector<HTMLScriptElement>('[data-lightbox-items]');
  let items: LightboxItem[] = [];
  try {
    items = JSON.parse(dataEl?.textContent || '[]') as LightboxItem[];
  } catch {
    return;
  }
  if (!items.length) return;

  const stage = dialog.querySelector<HTMLElement>('[data-lightbox-stage]');
  const caption = dialog.querySelector<HTMLElement>('[data-lightbox-caption]');
  const counter = dialog.querySelector<HTMLElement>('[data-lightbox-counter]');
  const prevBtn = dialog.querySelector<HTMLButtonElement>('[data-lightbox-prev]');
  const nextBtn = dialog.querySelector<HTMLButtonElement>('[data-lightbox-next]');
  const closeBtn = dialog.querySelector<HTMLButtonElement>('[data-lightbox-close]');
  if (!stage) return;

  let index = 0;
  let opener: HTMLElement | null = null;

  const single = items.length < 2;
  if (prevBtn) prevBtn.hidden = single;
  if (nextBtn) nextBtn.hidden = single;

  function preload(i: number) {
    const item = items[(i + items.length) % items.length];
    if (item?.type === 'image') {
      const img = new Image();
      if (item.srcset) img.srcset = item.srcset;
      img.sizes = item.sizes ?? '100vw';
      img.src = item.src;
    }
  }

  function render() {
    const item = items[index];
    if (!item || !stage) return;

    stage.replaceChildren();

    if (item.type === 'video') {
      const video = document.createElement('video');
      video.src = item.src;
      if (item.poster) video.poster = item.poster;
      video.controls = true;
      video.playsInline = true;
      video.loop = true;
      video.preload = 'auto';
      video.setAttribute('aria-label', item.alt || item.title || 'Video');
      stage.append(video);
      // The dialog opened from a click, so unmuted autoplay is usually allowed;
      // fall back to muted if the browser refuses.
      video.play().catch(() => {
        video.muted = true;
        video.play().catch(() => {});
      });
    } else {
      const img = document.createElement('img');
      if (item.srcset) img.srcset = item.srcset;
      img.sizes = item.sizes ?? '100vw';
      img.src = item.src;
      img.alt = item.alt;
      img.decoding = 'async';
      if (item.width) img.width = item.width;
      if (item.height) img.height = item.height;
      stage.append(img);
    }

    if (caption) caption.textContent = [item.title, item.caption].filter(Boolean).join(' — ');
    if (counter) counter.textContent = `${index + 1} of ${items.length}${item.title ? `: ${item.title}` : ''}`;

    preload(index + 1);
    preload(index - 1);
  }

  function open(i: number, trigger: HTMLElement | null) {
    index = ((i % items.length) + items.length) % items.length;
    opener = trigger;
    render();
    if (!dialog!.open) dialog!.showModal();
    closeBtn?.focus();
  }

  function step(delta: number) {
    if (single) return;
    index = (index + delta + items.length) % items.length;
    render();
  }

  function close() {
    if (dialog!.open) dialog!.close();
  }

  dialog.addEventListener('close', () => {
    stage.replaceChildren(); // stops any playing video
    opener?.focus();
    opener = null;
  });

  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      step(1);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      step(-1);
    }
    // Esc is handled natively by <dialog>.
  });

  // Click on the dark area (anything that isn't media, caption or a button) closes.
  dialog.addEventListener('click', (event) => {
    const target = event.target as Element | null;
    if (!target) return;
    if (target.closest('img, video, figcaption, button')) return;
    close();
  });

  prevBtn?.addEventListener('click', () => step(-1));
  nextBtn?.addEventListener('click', () => step(1));
  closeBtn?.addEventListener('click', close);

  document.querySelectorAll<HTMLElement>('[data-lightbox-index]').forEach((el) => {
    el.addEventListener('click', (event) => {
      event.preventDefault();
      open(Number(el.dataset.lightboxIndex ?? 0), el);
    });
  });
}

init();
