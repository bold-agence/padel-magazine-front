import {
  Component,
  computed,
  inject,
  NgZone,
  OnDestroy,
  OnInit,
  SecurityContext,
  signal,
} from '@angular/core';
import { DomSanitizer, SafeHtml, SafeResourceUrl } from '@angular/platform-browser';
import { forkJoin } from 'rxjs';
import { resolvePublicMediaUrl } from '../../../core/services/events.service';
import {
  LiveChannelSettingsDto,
  LiveDto,
  LivesService,
} from '../../../core/services/lives.service';

@Component({
  selector: 'app-live-component',
  standalone: true,
  templateUrl: './live.component.html',
  styleUrl: './live.component.scss',
})
export class LiveComponent implements OnInit, OnDestroy {
  private readonly livesService = inject(LivesService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly ngZone = inject(NgZone);

  protected readonly loading = signal(true);
  protected readonly loadError = signal(false);
  protected readonly lives = signal<LiveDto[]>([]);
  protected readonly channelSettings = signal<LiveChannelSettingsDto | null>(null);
  /** Live actuellement entre heure de début et heure de fin (iframe + « À propos »). */
  protected readonly airingLive = signal<LiveDto | null>(null);

  /** Prochains lives (événement dans le futur). */
  protected readonly upcomingLives = computed(() =>
    this.pickUpcoming(this.lives(), 5),
  );

  /** Derniers replays disponibles. */
  protected readonly replayLives = computed(() =>
    this.pickReplays(this.lives(), 5),
  );

  /** Live mis en avant (countdown + « À propos »). */
  protected readonly featuredLive = computed(() => this.upcomingLives()[0] ?? null);

  protected timeLeft = {
    days: '00',
    hours: '00',
    minutes: '00',
    seconds: '00',
    isLive: false,
  };

  private timer: ReturnType<typeof setInterval> | null = null;
  /** Timestamp cible pour le compte à rebours (heure du live). */
  private countdownTargetMs = 0;
  /**
   * Même URL embed → même SafeResourceUrl : évite de recréer l’objet à chaque tick CD
   * (sinon l’iframe se recharge en boucle et l’image du direct « saute »).
   */
  private readonly trustedEmbedByUrl = new Map<string, SafeResourceUrl>();

  ngOnInit(): void {
    forkJoin({
      settings: this.livesService.getChannelSettings(),
      lives: this.livesService.findAll(),
    }).subscribe({
      next: ({ settings, lives }) => {
        this.channelSettings.set(settings);
        this.lives.set(lives);
        this.loading.set(false);
        this.loadError.set(false);
        this.tickCountdown();
        this.timer = setInterval(() => this.tickCountdown(), 1000);
      },
      error: () => {
        this.loadError.set(true);
        this.loading.set(false);
      },
    });
  }

  ngOnDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
    this.trustedEmbedByUrl.clear();
  }

  protected notifyMe(): void {
    const email = window.prompt('Votre email pour recevoir le rappel :');
    if (email) {
      window.alert('Merci ! Nous vous enverrons un rappel avant le live.');
    }
  }

  /** Date événement (programme, replays). */
  protected formatEventDateProgram(ev: LiveDto['event']): string {
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    }).format(new Date(ev.startAt));
  }

  /** Heure diffusion du live (HH:mm → 15h30). */
  protected formatLiveClock(startTime: string): string {
    const parts = startTime.trim().split(':');
    const h = parts[0] ?? '0';
    const m = (parts[1] ?? '00').padStart(2, '0');
    return `${h}h${m}`;
  }

  /** Ligne sous le titre du hero : date événement + créneau live (début [– fin]). */
  protected formatFeaturedSubtitle(live: LiveDto): string {
    const d = new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(live.event.startAt));
    return `${d} · ${this.formatProgramLiveTime(live)}`;
  }

  protected tournamentLabel(live: LiveDto): string {
    return live.event.tournament?.label?.trim() || '—';
  }

  protected coverUrl(live: LiveDto): string | undefined {
    return resolvePublicMediaUrl(live.coverImageUrl ?? live.event.coverImageUrl);
  }

  /** À propos : date événement (jour). */
  protected formatAboutEventDate(live: LiveDto): string {
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(live.event.startAt));
  }

  /** Heure(s) du live pour le programme : début [– fin]. */
  protected formatProgramLiveTime(live: LiveDto): string {
    const start = this.formatLiveClock(live.startTime);
    const end = live.endTime?.trim();
    if (!end) return start;
    return `${start} – ${this.formatLiveClock(end)}`;
  }

  /** À propos : créneau du live (début – fin si renseignée). */
  protected formatAboutLiveTime(live: LiveDto): string {
    return this.formatProgramLiveTime(live);
  }

  protected aboutDescriptionSafe(live: LiveDto): SafeHtml | null {
    const raw = live.event.descriptionHtml?.trim();
    if (!raw) return null;
    const cleaned = this.sanitizer.sanitize(SecurityContext.HTML, raw);
    if (!cleaned?.trim()) return null;
    return this.sanitizer.bypassSecurityTrustHtml(cleaned);
  }

  /** Widget « À propos » : live en cours si entre début et fin, sinon le prochain. */
  protected displayLive(): LiveDto | null {
    return this.airingLive() ?? this.featuredLive();
  }

  protected youtubeSubscribeHref(): string {
    const raw = this.channelSettings()?.channelUrl?.trim();
    const base =
      raw && /^https?:\/\//i.test(raw) ? raw : 'https://www.youtube.com/';
    if (/[?&]sub_confirmation=1(?:&|$)/.test(base)) {
      return base;
    }
    const sep = base.includes('?') ? '&' : '?';
    return `${base}${sep}sub_confirmation=1`;
  }

  /** URL sécurisée pour l’iframe quand le direct est en cours (YouTube → embed). */
  protected liveEmbedSrc(live: LiveDto): SafeResourceUrl | null {
    const embed = this.toLiveEmbedUrl(live.liveUrl);
    if (!embed) return null;
    let safe = this.trustedEmbedByUrl.get(embed);
    if (!safe) {
      safe = this.sanitizer.bypassSecurityTrustResourceUrl(embed);
      this.trustedEmbedByUrl.set(embed, safe);
    }
    return safe;
  }

  private tickCountdown(): void {
    const lives = this.lives();
    this.ngZone.run(() => {
      const airing = this.findAiringLive(lives);
      if (airing) {
        this.airingLive.set(airing);
        this.countdownTargetMs = 0;
        this.timeLeft = {
          days: '00',
          hours: '00',
          minutes: '00',
          seconds: '00',
          isLive: true,
        };
        return;
      }

      this.airingLive.set(null);
      const upcoming = this.pickUpcoming(lives, 5);
      const next = upcoming[0] ?? null;
      this.countdownTargetMs = next ? this.liveBroadcastDate(next).getTime() : 0;

      if (!this.countdownTargetMs) {
        this.timeLeft = {
          days: '00',
          hours: '00',
          minutes: '00',
          seconds: '00',
          isLive: false,
        };
        return;
      }

      const delta = this.countdownTargetMs - Date.now();

      if (delta <= 0) {
        this.timeLeft = {
          days: '00',
          hours: '00',
          minutes: '00',
          seconds: '00',
          isLive: false,
        };
        return;
      }

      const days = Math.floor(delta / 86400000);
      const hours = Math.floor((delta % 86400000) / 3600000);
      const minutes = Math.floor((delta % 3600000) / 60000);
      const seconds = Math.floor((delta % 60000) / 1000);

      this.timeLeft = {
        days: String(days),
        hours: String(hours).padStart(2, '0'),
        minutes: String(minutes).padStart(2, '0'),
        seconds: String(seconds).padStart(2, '0'),
        isLive: false,
      };
    });
  }

  /** 5 prochains : diffusion (`jour événement` + `startTime`) dans le futur. */
  private pickUpcoming(lives: LiveDto[], limit: number): LiveDto[] {
    const now = Date.now();
    return [...lives]
      .filter((l) => this.liveBroadcastDate(l).getTime() > now)
      .sort(
        (a, b) =>
          this.liveBroadcastDate(a).getTime() - this.liveBroadcastDate(b).getTime(),
      )
      .slice(0, limit);
  }

  /** 5 derniers avec replay, tri par date d’événement décroissante. */
  private pickReplays(lives: LiveDto[], limit: number): LiveDto[] {
    return [...lives]
      .filter((l) => !!l.replayUrl?.trim())
      .sort(
        (a, b) =>
          new Date(b.event.startAt).getTime() - new Date(a.event.startAt).getTime(),
      )
      .slice(0, limit);
  }

  /** Date + heure de début du live (jour de l’événement + startTime). */
  private liveBroadcastDate(live: LiveDto): Date {
    return this.liveClockOnEventDay(live, live.startTime);
  }

  /** Fin du créneau live (jour événement + endTime, ou +1 h si pas de fin). */
  private liveBroadcastEndDate(live: LiveDto): Date {
    const start = this.liveBroadcastDate(live);
    if (live.endTime?.trim()) {
      let end = this.liveClockOnEventDay(live, live.endTime);
      if (end.getTime() <= start.getTime()) {
        end = new Date(end.getTime() + 86400000);
      }
      return end;
    }
    return new Date(start.getTime() + 3600000);
  }

  private liveClockOnEventDay(live: LiveDto, timeStr: string): Date {
    const ev = new Date(live.event.startAt);
    const parts = timeStr.trim().split(':');
    const hh = parseInt(parts[0] ?? '0', 10);
    const mm = parseInt(parts[1] ?? '0', 10);
    return new Date(ev.getFullYear(), ev.getMonth(), ev.getDate(), hh, mm, 0, 0);
  }

  private findAiringLive(lives: LiveDto[]): LiveDto | null {
    const now = Date.now();
    const candidates = lives.filter((l) => {
      const s = this.liveBroadcastDate(l).getTime();
      const e = this.liveBroadcastEndDate(l).getTime();
      return now >= s && now < e;
    });
    if (candidates.length === 0) return null;
    candidates.sort(
      (a, b) => this.liveBroadcastDate(a).getTime() - this.liveBroadcastDate(b).getTime(),
    );
    return candidates[0] ?? null;
  }

  /**
   * URL utilisable en iframe (YouTube watch / live / youtu.be → embed).
   * Autres URLs https renvoyées telles quelles.
   */
  private toLiveEmbedUrl(liveUrl: string): string | null {
    const raw = liveUrl?.trim();
    if (!raw) return null;
    try {
      const u = new URL(raw);
      if (u.protocol !== 'https:' && u.protocol !== 'http:') return null;
      const host = u.hostname.replace(/^www\./, '');

      if (host === 'youtu.be') {
        const id = u.pathname.replace(/^\//, '').split('/')[0];
        return id ? `https://www.youtube.com/embed/${encodeURIComponent(id)}?autoplay=1` : null;
      }

      if (host === 'youtube.com' || host === 'm.youtube.com') {
        if (u.pathname.startsWith('/embed/')) {
          const base = `https://www.youtube.com${u.pathname}${u.search}`;
          return base.includes('autoplay=') ? base : `${base}${u.search ? '&' : '?'}autoplay=1`;
        }
        if (u.pathname === '/watch') {
          const id = u.searchParams.get('v');
          return id
            ? `https://www.youtube.com/embed/${encodeURIComponent(id)}?autoplay=1`
            : null;
        }
        if (u.pathname.startsWith('/live/')) {
          const parts = u.pathname.split('/').filter(Boolean);
          const id = parts[1];
          return id
            ? `https://www.youtube.com/embed/${encodeURIComponent(id)}?autoplay=1`
            : null;
        }
        if (u.pathname.startsWith('/shorts/')) {
          const parts = u.pathname.split('/').filter(Boolean);
          const id = parts[1];
          return id
            ? `https://www.youtube.com/embed/${encodeURIComponent(id)}?autoplay=1`
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
}
