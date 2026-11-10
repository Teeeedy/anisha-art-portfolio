/** Extracts the 11-character video id from any common YouTube URL shape. */
export function getYouTubeId(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\.|^m\./, '');
    if (host === 'youtu.be') return valid(u.pathname.slice(1));
    if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
      if (u.pathname === '/watch') return valid(u.searchParams.get('v'));
      const m = u.pathname.match(/^\/(embed|shorts|live|v)\/([^/?#]+)/);
      if (m) return valid(m[2]);
    }
  } catch {
    /* not a URL */
  }
  return null;
}

function valid(id: string | null | undefined): string | null {
  return id && /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null;
}

export function youTubeEmbedUrl(id: string): string {
  return `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1`;
}
