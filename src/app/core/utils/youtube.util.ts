/** Extrait l’identifiant vidéo depuis une URL YouTube classique, embed, Shorts ou youtu.be */
export function extractYouTubeVideoId(rawUrl: string): string | null {
  const url = rawUrl?.trim();
  if (!url) return null;
  try {
    const u = new URL(url);
    const host = u.hostname.toLowerCase();
    if (host.includes('youtube.com')) {
      const v = u.searchParams.get('v');
      if (v) return v;
      const embed = u.pathname.match(/\/embed\/([^/]+)/);
      if (embed?.[1]) return embed[1];
      const shorts = u.pathname.match(/\/shorts\/([^/?]+)/);
      if (shorts?.[1]) return shorts[1];
    }
    if (host === 'youtu.be' || host.endsWith('.youtu.be')) {
      const id = u.pathname.replace(/^\//, '').split('/')[0];
      return id || null;
    }
  } catch {
    return null;
  }
  return null;
}

export function youtubeThumbnailUrl(videoId: string): string {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

export function youtubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}?rel=0`;
}
