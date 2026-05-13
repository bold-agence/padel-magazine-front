import type { LiveDto } from '../services/lives.service';

function liveClockOnEventDay(live: LiveDto, timeStr: string): Date {
  const ev = new Date(live.event.startAt);
  const parts = timeStr.trim().split(':');
  const hh = parseInt(parts[0] ?? '0', 10);
  const mm = parseInt(parts[1] ?? '0', 10);
  return new Date(ev.getFullYear(), ev.getMonth(), ev.getDate(), hh, mm, 0, 0);
}

/** Date + heure de début du live (jour de l’événement + startTime). */
export function liveBroadcastDate(live: LiveDto): Date {
  return liveClockOnEventDay(live, live.startTime);
}

/** Fin du créneau live (jour événement + endTime, ou +1 h si pas de fin). */
export function liveBroadcastEndDate(live: LiveDto): Date {
  const start = liveBroadcastDate(live);
  if (live.endTime?.trim()) {
    let end = liveClockOnEventDay(live, live.endTime);
    if (end.getTime() <= start.getTime()) {
      end = new Date(end.getTime() + 86400000);
    }
    return end;
  }
  return new Date(start.getTime() + 3600000);
}

/** Lives dont l’instant courant est dans [début, fin). */
export function findAiringLive(lives: LiveDto[]): LiveDto | null {
  const now = Date.now();
  const candidates = lives.filter((l) => {
    const s = liveBroadcastDate(l).getTime();
    const e = liveBroadcastEndDate(l).getTime();
    return now >= s && now < e;
  });
  if (candidates.length === 0) return null;
  candidates.sort(
    (a, b) => liveBroadcastDate(a).getTime() - liveBroadcastDate(b).getTime(),
  );
  return candidates[0] ?? null;
}

/** Prochains lives : heure de diffusion strictement dans le futur, tri chronologique. */
export function pickUpcoming(lives: LiveDto[], limit: number): LiveDto[] {
  const now = Date.now();
  return [...lives]
    .filter((l) => liveBroadcastDate(l).getTime() > now)
    .sort(
      (a, b) =>
        liveBroadcastDate(a).getTime() - liveBroadcastDate(b).getTime(),
    )
    .slice(0, limit);
}

/** Retire autoplay des URLs embed YouTube (lecture uniquement après action utilisateur). */
function youtubeEmbedWithoutAutoplay(pathname: string, search: string): string {
  const out = new URL(`https://www.youtube.com${pathname}${search}`);
  out.searchParams.delete('autoplay');
  return out.toString();
}

/**
 * URL utilisable en iframe (YouTube watch / live / youtu.be → embed).
 * Pas d’autoplay. Autres URLs https renvoyées telles quelles.
 */
export function toLiveEmbedUrl(liveUrl: string): string | null {
  const raw = liveUrl?.trim();
  if (!raw) return null;
  try {
    const u = new URL(raw);
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return null;
    const host = u.hostname.replace(/^www\./, '');

    if (host === 'youtu.be') {
      const id = u.pathname.replace(/^\//, '').split('/')[0];
      return id ? `https://www.youtube.com/embed/${encodeURIComponent(id)}` : null;
    }

    if (host === 'youtube.com' || host === 'm.youtube.com') {
      if (u.pathname.startsWith('/embed/')) {
        return youtubeEmbedWithoutAutoplay(u.pathname, u.search);
      }
      if (u.pathname === '/watch') {
        const id = u.searchParams.get('v');
        return id
          ? `https://www.youtube.com/embed/${encodeURIComponent(id)}`
          : null;
      }
      if (u.pathname.startsWith('/live/')) {
        const parts = u.pathname.split('/').filter(Boolean);
        const id = parts[1];
        return id
          ? `https://www.youtube.com/embed/${encodeURIComponent(id)}`
          : null;
      }
      if (u.pathname.startsWith('/shorts/')) {
        const parts = u.pathname.split('/').filter(Boolean);
        const id = parts[1];
        return id
          ? `https://www.youtube.com/embed/${encodeURIComponent(id)}`
          : null;
      }
    }
  } catch {
    return null;
  }

  if (/^https?:\/\//i.test(raw)) {
    return raw;
  }
  return null;
}
