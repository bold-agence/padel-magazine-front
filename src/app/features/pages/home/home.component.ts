import {
  AfterViewInit,
  Component,
  NgZone,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize, switchMap } from 'rxjs/operators';
import {
  ArticleCategoryModel,
  ArticleModel,
} from '../../../core/models/article.model';
import { ArticlesService } from '../../../core/services/articles.service';
import {
  ClassementDetailDto,
  ClassementLineDto,
  ClassementSummaryDto,
  ClassementsService,
} from '../../../core/services/classements.service';
import { SOCIAL_LINKS } from '../../../core/constants/social-links';
import { resolvePublicMediaUrl } from '../../../core/services/events.service';
import {
  AdImageItem,
  ClientContentService,
} from '../../../core/services/client-content.service';
import {
  LatestResult,
  LatestResultsService,
} from '../../../core/services/latest-results.service';
import {
  LiveChannelSettingsDto,
  LiveDto,
  LivesService,
} from '../../../core/services/lives.service';
import {
  PortraitItem,
  PortraitsService,
} from '../../../core/services/portraits.service';
import { environment } from '../../../../environments/environment';
import {
  findAiringLive,
  liveBroadcastDate,
  pickUpcoming,
  toLiveEmbedUrl,
} from '../../../core/utils/live-scheduling.util';
import { AdSlotMediaComponent } from '../../../shared/components/ad-slot-media/ad-slot-media.component';
import {
  NewsCardBadge,
  NewsCardComponent,
} from '../../../shared/components/news-card/news-card.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { RouterLink } from '@angular/router';

type HomeNewsCard = {
  slug: string;
  cat: string;
  cls: string;
  ph: string;
  title: string;
  auth: string;
  date: string;
  read: string;
  cardClass: string;
  bannerImage?: string;
  badges?: NewsCardBadge[];
};

type HeroItem = {
  slug: string;
  title: string;
  cat: string;
  cls: string;
  date: string;
  author?: string;
  read?: string;
  ph: string;
  bannerImage?: string;
  badges?: NewsCardBadge[];
};

const HOME_RANKING_PH = ['court', 'charcoal', 'sunset'] as const;

/** Ligne affichée dans le widget Top 3 (accueil). */
type HomeRankingRow = {
  id: string;
  rank: number;
  name: string;
  pointsLabel: string;
  subtitle: string;
  imageUrl: string | null;
  phClass: string;
};

/** Même modèle que la page International (latest-results + libellé période). */
type HomePremierPadelResultRow = LatestResult & { periodLabel: string };

@Component({
  selector: 'app-home-component',
  standalone: true,
  imports: [SidebarComponent, NewsCardComponent, RouterLink, AdSlotMediaComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  protected featuredNews: HomeNewsCard[] = [];
  protected coachingNews: HomeNewsCard[] = [];
  protected internationalNews: HomeNewsCard[] = [];
  protected heroMainNews: HeroItem[] = [];
  protected heroSideNews: HeroItem[] = [];
  protected heroActiveIndex = 0;
  protected homeLeaderboardAd?: AdImageItem;
  protected homeLeaderboardAdResolved = false;
  /** Copie logique page International — 3 derniers résultats Premier Padel (API). */
  protected premierPadelLatestResults: HomePremierPadelResultRow[] = [];
  protected isLoadingLatestResults = true;
  protected latestResultsError = '';

  protected homeRankingsLoading = true;
  protected homeRankingsError = '';
  protected homeMenTitle = 'Classement hommes';
  protected homeWomenTitle = 'Classement femmes';
  protected homeMenTop3: HomeRankingRow[] = [];
  protected homeWomenTop3: HomeRankingRow[] = [];

  /** Top 3 portraits (API), tri par points décroissant — même source que la page Portraits. */
  protected homePortraitsLoading = true;
  protected homePortraitsError = '';
  protected homeTopPortraits: PortraitItem[] = [];

  /** Section Live : même logique que la page Live (en cours sinon prochain événement le plus proche). */
  protected lives: LiveDto[] = [];
  protected channelSettings: LiveChannelSettingsDto | null = null;
  protected homeLiveLoading = true;
  protected homeLiveLoadError = false;
  protected homeLiveTimeLeft = {
    days: '00',
    hours: '00',
    minutes: '00',
    seconds: '00',
    isLive: false,
  };
  /** Iframe seulement après clic sur lecture (accueil). */
  protected homeLiveEmbedStarted = false;
  private homeLiveAiringEmbedSessionId: string | null = null;

  private heroTimer: ReturnType<typeof setInterval> | null = null;
  private homeLiveTimer: ReturnType<typeof setInterval> | null = null;
  private homeLiveCountdownTargetMs = 0;
  private readonly trustedHomeLiveEmbedByUrl = new Map<string, SafeResourceUrl>();
  private readonly heroMainFallback: HeroItem[] = [
    {
      slug: '',
      title: 'Open Dakar 2026 : Diallo et Sow sacres champions',
      cat: 'Résultats',
      cls: 'results',
      date: '12 avril 2026',
      author: 'Mamadou Diop',
      read: '6 min',
      ph: 'court',
    },
    {
      slug: '',
      title: 'WPT 2026 : Galan et Lebron intouchables apres Mexique Open',
      cat: 'Classements',
      cls: 'classements',
      date: '10 avril 2026',
      author: 'Ibrahima Ndiaye',
      read: '4 min',
      ph: 'violet',
    },
    {
      slug: '',
      title: '5 exercices pour transformer votre vibora en arme fatale',
      cat: 'Coaching',
      cls: 'coaching',
      date: '8 avril 2026',
      author: 'Carlos Vega',
      read: '8 min',
      ph: 'blue',
    },
  ];
  private readonly heroSideFallback: HeroItem[] = [
    {
      slug: '',
      title: 'WPT Africa Series Dakar en juin : le padel pro debarque',
      cat: 'Actualites',
      cls: 'actualites',
      date: '29 mars 2026',
      ph: 'sunset',
    },
    {
      slug: '',
      title: 'Championnat U18 : Oumar Diallo survole la competition',
      cat: 'Resultats',
      cls: 'results',
      date: '11 avril 2026',
      ph: 'orange',
    },
  ];

  constructor(
    private readonly articlesService: ArticlesService,
    private readonly clientContentService: ClientContentService,
    private readonly latestResultsService: LatestResultsService,
    private readonly livesService: LivesService,
    private readonly sanitizer: DomSanitizer,
    private readonly ngZone: NgZone,
    private readonly classementsService: ClassementsService,
    private readonly portraitsService: PortraitsService,
  ) {}

  ngOnInit(): void {
    this.loadHomepageSections();
    this.loadPremierPadelLatestResults();
    this.loadHomeAds();
    this.loadHomeLives();
    this.loadHomeRankings();
    this.loadHomeTopPortraits();
  }

  ngAfterViewInit(): void {
    this.startHeroAutoplay();
  }

  ngOnDestroy(): void {
    if (this.heroTimer) {
      clearInterval(this.heroTimer);
    }
    if (this.homeLiveTimer) {
      clearInterval(this.homeLiveTimer);
    }
    this.trustedHomeLiveEmbedByUrl.clear();
  }

  protected goToHero(index: number): void {
    if (!this.heroMainNews.length) {
      return;
    }
    const max = this.heroMainNews.length - 1;
    this.heroActiveIndex = Math.max(0, Math.min(index, max));
    this.startHeroAutoplay();
  }

  protected nextHero(): void {
    if (!this.heroMainNews.length) {
      return;
    }
    this.heroActiveIndex = (this.heroActiveIndex + 1) % this.heroMainNews.length;
    this.startHeroAutoplay();
  }

  protected prevHero(): void {
    if (!this.heroMainNews.length) {
      return;
    }
    this.heroActiveIndex =
      (this.heroActiveIndex - 1 + this.heroMainNews.length) % this.heroMainNews.length;
    this.startHeroAutoplay();
  }

  private startHeroAutoplay(): void {
    if (this.heroTimer) {
      clearInterval(this.heroTimer);
    }
    if (this.heroMainNews.length <= 1) {
      return;
    }
    this.heroTimer = setInterval(() => {
      this.heroActiveIndex = (this.heroActiveIndex + 1) % this.heroMainNews.length;
    }, 9500);
  }

  private loadHomeLives(): void {
    forkJoin({
      settings: this.livesService.getChannelSettings(),
      lives: this.livesService.findAll(),
    }).subscribe({
      next: ({ settings, lives }) => {
        this.channelSettings = settings;
        this.lives = lives;
        this.homeLiveLoading = false;
        this.homeLiveLoadError = false;
        this.tickHomeLive();
        this.homeLiveTimer = setInterval(() => this.tickHomeLive(), 1000);
      },
      error: () => {
        this.lives = [];
        this.channelSettings = null;
        this.homeLiveLoading = false;
        this.homeLiveLoadError = true;
      },
    });
  }

  /** Live en direct, sinon prochain live (événement le plus proche dans le temps). */
  protected displayHomeLive(): LiveDto | null {
    return findAiringLive(this.lives) ?? pickUpcoming(this.lives, 1)[0] ?? null;
  }

  protected homeLiveChannelLine(): string {
    const name = this.channelSettings?.channelName?.trim();
    if (name) return name;
    return 'Chaîne YouTube Padel Magazine Sénégal';
  }

  protected homeLiveYoutubeSubscribeHref(): string {
    const raw = this.channelSettings?.channelUrl?.trim();
    const base =
      raw && /^https?:\/\//i.test(raw) ? raw : SOCIAL_LINKS.youtube;
    if (/[?&]sub_confirmation=1(?:&|$)/.test(base)) {
      return base;
    }
    const sep = base.includes('?') ? '&' : '?';
    return `${base}${sep}sub_confirmation=1`;
  }

  protected homeLiveEmbedSrc(live: LiveDto): SafeResourceUrl | null {
    const embed = toLiveEmbedUrl(live.liveUrl);
    if (!embed) return null;
    let safe = this.trustedHomeLiveEmbedByUrl.get(embed);
    if (!safe) {
      safe = this.sanitizer.bypassSecurityTrustResourceUrl(embed);
      this.trustedHomeLiveEmbedByUrl.set(embed, safe);
    }
    return safe;
  }

  protected startHomeLivePlayback(): void {
    this.homeLiveEmbedStarted = true;
  }

  private syncHomeLivePlaybackGate(airing: LiveDto | null): void {
    const id = airing?.id ?? null;
    if (id !== this.homeLiveAiringEmbedSessionId) {
      this.homeLiveAiringEmbedSessionId = id;
      this.homeLiveEmbedStarted = false;
    }
  }

  protected homeLiveCoverUrl(live: LiveDto): string | undefined {
    return resolvePublicMediaUrl(live.coverImageUrl ?? live.event.coverImageUrl);
  }

  /** Titre affiché : nom de l’événement + tournoi à côté si renseigné. */
  protected homeLiveEventTitleLine(live: LiveDto): string {
    const eventTitle = live.event.title?.trim() || 'Événement';
    const tournament = live.event.tournament?.label?.trim();
    if (!tournament) return eventTitle;
    return `${eventTitle} · ${tournament}`;
  }

  protected formatHomeLiveEventDate(live: LiveDto): string {
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(live.event.startAt));
  }

  protected formatHomeLiveClock(startTime: string): string {
    const parts = startTime.trim().split(':');
    const h = parts[0] ?? '0';
    const m = (parts[1] ?? '00').padStart(2, '0');
    return `${h}h${m}`;
  }

  protected formatHomeLiveProgramTime(live: LiveDto): string {
    const start = this.formatHomeLiveClock(live.startTime);
    const end = live.endTime?.trim();
    if (!end) return start;
    return `${start} – ${this.formatHomeLiveClock(end)}`;
  }

  protected homeLiveDescriptionTeaser(live: LiveDto): string {
    const raw = live.event.descriptionHtml?.trim();
    if (!raw) return '';
    const text = raw.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const max = 100;
    if (text.length <= max) return text;
    return `${text.slice(0, max - 1)}…`;
  }

  private tickHomeLive(): void {
    this.ngZone.run(() => {
      const airing = findAiringLive(this.lives);
      if (airing) {
        this.syncHomeLivePlaybackGate(airing);
        this.homeLiveCountdownTargetMs = 0;
        this.homeLiveTimeLeft = {
          days: '00',
          hours: '00',
          minutes: '00',
          seconds: '00',
          isLive: true,
        };
        return;
      }

      this.syncHomeLivePlaybackGate(null);

      const upcoming = pickUpcoming(this.lives, 1);
      const next = upcoming[0] ?? null;
      this.homeLiveCountdownTargetMs = next ? liveBroadcastDate(next).getTime() : 0;

      if (!this.homeLiveCountdownTargetMs) {
        this.homeLiveTimeLeft = {
          days: '00',
          hours: '00',
          minutes: '00',
          seconds: '00',
          isLive: false,
        };
        return;
      }

      const delta = this.homeLiveCountdownTargetMs - Date.now();

      if (delta <= 0) {
        this.homeLiveTimeLeft = {
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

      this.homeLiveTimeLeft = {
        days: String(days),
        hours: String(hours).padStart(2, '0'),
        minutes: String(minutes).padStart(2, '0'),
        seconds: String(seconds).padStart(2, '0'),
        isLive: false,
      };
    });
  }

  private loadHomepageSections(): void {
    forkJoin({
      hero: this.articlesService.findPaginated(1, 5, 'all'),
      senegal: this.articlesService.findPaginated(1, 3, 'all'),
      coaching: this.articlesService.findPaginated(1, 2, 'coaching'),
      international: this.articlesService.findPaginated(1, 4, 'international'),
    }).subscribe({
      next: ({ hero, senegal, coaching, international }) => {
        const heroCards = hero.items.map((article) => this.toHeroItem(article));
        const heroMain = this.pickDistinctCategories(heroCards, 3);
        const remainingForSide = this.removeUsedItems(heroCards, heroMain);
        this.heroMainNews = this.withFallback(heroMain, 3, this.heroMainFallback);
        this.heroSideNews = this.withFallback(remainingForSide.slice(0, 2), 2, this.heroSideFallback);
        this.heroActiveIndex = 0;
        this.featuredNews = senegal.items.map((article) => this.toHomeNewsCard(article));
        this.coachingNews = coaching.items.map((article) => this.toHomeNewsCard(article));
        this.internationalNews = international.items.map((article) =>
          this.toHomeNewsCard(article),
        );
        this.startHeroAutoplay();
      },
      error: () => {
        this.heroMainNews = this.heroMainFallback;
        this.heroSideNews = this.heroSideFallback;
        this.heroActiveIndex = 0;
        this.featuredNews = [];
        this.coachingNews = [];
        this.internationalNews = [];
        this.startHeroAutoplay();
      },
    });
  }

  /** Copie du chargement « Derniers résultats Premier Padel » (page International). */
  private loadPremierPadelLatestResults(): void {
    this.isLoadingLatestResults = true;
    this.latestResultsError = '';
    this.latestResultsService.findPaginated(1, 3, 'all', 'international').subscribe({
      next: ({ items }) => {
        this.premierPadelLatestResults = items.map((item) => ({
          ...item,
          periodLabel: this.formatPeriodLabel(
            item.startDate,
            item.endDate,
            item.resultDate,
          ),
        }));
        this.isLoadingLatestResults = false;
      },
      error: () => {
        this.premierPadelLatestResults = [];
        this.latestResultsError =
          'Les derniers résultats sont actuellement indisponibles.';
        this.isLoadingLatestResults = false;
      },
    });
  }

  private loadHomeAds(): void {
    this.clientContentService
      .findAdImages('home_leaderboard', true)
      .pipe(
        finalize(() => {
          this.homeLeaderboardAdResolved = true;
        }),
      )
      .subscribe({
        next: (items) => {
          this.homeLeaderboardAd = this.clientContentService.pickAdForPage(items, 'home');
        },
        error: () => {
          this.homeLeaderboardAd = undefined;
        },
      });
  }

  /** Top 3 hommes / femmes — même API que la page Classements. */
  private loadHomeRankings(): void {
    this.homeRankingsLoading = true;
    this.homeRankingsError = '';
    this.classementsService
      .findAllSummaries()
      .pipe(
        switchMap((summaries) => {
          if (!summaries.length) {
            return of({
              men: null as ClassementDetailDto | null,
              women: null as ClassementDetailDto | null,
            });
          }
          const womenSummary = this.pickSummaryForHomeWomen(summaries);
          const menSummary = this.pickSummaryForHomeMen(summaries, womenSummary);
          return forkJoin({
            men: menSummary
              ? this.classementsService
                  .findOne(menSummary.id)
                  .pipe(catchError(() => of(null)))
              : of(null),
            women: womenSummary
              ? this.classementsService
                  .findOne(womenSummary.id)
                  .pipe(catchError(() => of(null)))
              : of(null),
          });
        }),
        catchError(() => {
          this.homeRankingsError = 'Impossible de charger les classements.';
          return of({ men: null, women: null });
        }),
        finalize(() => {
          this.homeRankingsLoading = false;
        }),
      )
      .subscribe({
        next: ({ men, women }) => {
          this.applyHomeRankingDetail(men, 'men');
          this.applyHomeRankingDetail(women, 'women');
        },
      });
  }

  private applyHomeRankingDetail(
    detail: ClassementDetailDto | null,
    side: 'men' | 'women',
  ): void {
    if (!detail) {
      if (side === 'men') {
        this.homeMenTop3 = [];
        this.homeMenTitle = 'Classement hommes';
      } else {
        this.homeWomenTop3 = [];
        this.homeWomenTitle = 'Classement femmes';
      }
      return;
    }
    const title = detail.title?.trim() || (side === 'men' ? 'Hommes' : 'Femmes');
    const rows = this.mapTop3RankingRows(detail);
    if (side === 'men') {
      this.homeMenTitle = title;
      this.homeMenTop3 = rows;
    } else {
      this.homeWomenTitle = title;
      this.homeWomenTop3 = rows;
    }
  }

  private mapTop3RankingRows(detail: ClassementDetailDto): HomeRankingRow[] {
    const sorted = [...detail.lines].sort((a, b) => a.sortOrder - b.sortOrder);
    const podiumUrls = [
      detail.podiumFirstImageUrl,
      detail.podiumSecondImageUrl,
      detail.podiumThirdImageUrl,
    ];
    return sorted.slice(0, 3).map((line, i) => {
      const rawUrl = podiumUrls[i] ?? null;
      return {
        id: line.id,
        rank: line.rank,
        name: line.playerName?.trim() || '—',
        pointsLabel: `${line.pointsNow.toLocaleString('fr-FR')} pts`,
        subtitle: this.subtitleForClassementLine(line),
        imageUrl: rawUrl ? resolvePublicMediaUrl(rawUrl) ?? null : null,
        phClass: HOME_RANKING_PH[i % HOME_RANKING_PH.length],
      };
    });
  }

  private subtitleForClassementLine(line: ClassementLineDto): string {
    const n = line.tournaments;
    return `${n} tournoi${n > 1 ? 's' : ''}`;
  }

  private normClassementText(value: string): string {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  private pickSummaryForHomeWomen(
    summaries: ClassementSummaryDto[],
  ): ClassementSummaryDto | null {
    const keys = [/\bfemmes?\b/, /\bfeminins?\b/, /\bdames\b/];
    for (const s of summaries) {
      const h = this.normClassementText(`${s.slug} ${s.title}`);
      if (keys.some((re) => re.test(h)) || h.includes('♀')) {
        return s;
      }
    }
    return null;
  }

  private pickSummaryForHomeMen(
    summaries: ClassementSummaryDto[],
    women: ClassementSummaryDto | null,
  ): ClassementSummaryDto | null {
    const others = women
      ? summaries.filter((s) => s.id !== women.id)
      : [...summaries];
    for (const s of others) {
      const h = this.normClassementText(`${s.slug} ${s.title}`);
      if (/\bfemmes?\b/.test(h) || /\bdames\b/.test(h) || /\bfeminins?\b/.test(h)) {
        continue;
      }
      if (
        /\bhommes?\b/.test(h) ||
        /\bmessieurs\b/.test(h) ||
        h.includes('♂') ||
        (h.includes('homme') && !h.includes('femme'))
      ) {
        return s;
      }
    }
    return others[0] ?? null;
  }

  private loadHomeTopPortraits(): void {
    this.homePortraitsLoading = true;
    this.homePortraitsError = '';
    this.portraitsService.findAllPortraits().subscribe({
      next: (items) => {
        this.homeTopPortraits = [...items]
          .sort((a, b) => {
            const d = b.pointNumber - a.pointNumber;
            if (d !== 0) return d;
            return (a.player?.name ?? '').localeCompare(b.player?.name ?? '', 'fr');
          })
          .slice(0, 3);
        this.homePortraitsLoading = false;
      },
      error: () => {
        this.homePortraitsError = 'Impossible de charger les portraits.';
        this.homeTopPortraits = [];
        this.homePortraitsLoading = false;
      },
    });
  }

  protected getHomePortraitPhotoUrl(portrait: PortraitItem): string | null {
    const photo = portrait.player?.profilePhoto ?? null;
    if (!photo) return null;
    if (photo.startsWith('http://') || photo.startsWith('https://')) return photo;
    const normalized = photo.startsWith('/') ? photo : `/${photo}`;
    return `${environment.apiUrl}${normalized}`;
  }

  protected getHomePortraitArticleLink(portrait: PortraitItem): string | null {
    const slug = portrait.article?.slug;
    if (!slug) return null;
    return `/actualites/${slug}`;
  }

  protected onHomePortraitClick(event: MouseEvent, portrait: PortraitItem): void {
    if (!this.getHomePortraitArticleLink(portrait)) {
      event.preventDefault();
    }
  }

  protected homePortraitPhClass(index: number): string {
    const classes = ['court', 'violet', 'sunset'];
    return classes[index % classes.length] ?? 'court';
  }

  private withFallback(
    source: HeroItem[],
    requiredCount: number,
    fallback: HeroItem[],
  ): HeroItem[] {
    if (source.length >= requiredCount) {
      return source.slice(0, requiredCount);
    }
    return [...source, ...fallback.slice(0, requiredCount - source.length)];
  }

  private pickDistinctCategories(source: HeroItem[], requiredCount: number): HeroItem[] {
    const picked: HeroItem[] = [];
    const seenCategories = new Set<string>();
    for (const item of source) {
      if (picked.length >= requiredCount) {
        break;
      }
      if (seenCategories.has(item.cls)) {
        continue;
      }
      picked.push(item);
      seenCategories.add(item.cls);
    }
    if (picked.length < requiredCount) {
      for (const item of source) {
        if (picked.length >= requiredCount) {
          break;
        }
        if (!picked.includes(item)) {
          picked.push(item);
        }
      }
    }
    return picked;
  }

  private removeUsedItems(source: HeroItem[], used: HeroItem[]): HeroItem[] {
    const usedSet = new Set(used);
    return source.filter((item) => !usedSet.has(item));
  }

  private toHeroItem(article: ArticleModel): HeroItem {
    const categories = this.getArticleCategories(article);
    const primaryCategory = categories[0] ?? null;
    const normalized = this.normalizeCategory(primaryCategory?.name);
    return {
      slug: article.slug,
      title: article.title,
      cat: primaryCategory?.name ?? 'Actualités',
      cls: normalized,
      date: this.toLongDate(article.date),
      author: article.author,
      read: article.readingTime,
      ph: this.getPlaceholderClass(normalized),
      bannerImage: article.bannerImage,
      badges: this.toCategoryBadges(categories),
    };
  }

  private toHomeNewsCard(article: ArticleModel): HomeNewsCard {
    const categories = this.getArticleCategories(article);
    const primaryCategory = categories[0] ?? null;
    const normalized = this.normalizeCategory(primaryCategory?.name);
    return {
      slug: article.slug,
      cat: primaryCategory?.name ?? 'Actualités',
      cls: normalized,
      ph: this.getPlaceholderClass(normalized),
      title: article.title,
      auth: article.author,
      date: this.toShortDate(article.date),
      read: article.readingTime,
      cardClass: this.getCardClass(normalized),
      bannerImage: article.bannerImage,
      badges: this.toCategoryBadges(categories),
    };
  }

  private getArticleCategories(article: ArticleModel): ArticleCategoryModel[] {
    const categories = article.categories?.length
      ? article.categories
      : article.category
        ? [article.category]
        : [];
    const seen = new Set<string>();
    return categories.filter((category) => {
      if (seen.has(category.id)) return false;
      seen.add(category.id);
      return true;
    });
  }

  private toCategoryBadges(categories: ArticleCategoryModel[]): NewsCardBadge[] {
    return categories.map((category) => ({
      text: category.name,
      className: this.normalizeCategory(category.name),
    }));
  }

  private normalizeCategory(value?: string): string {
    const source = (value ?? 'actualites').toLowerCase();
    if (source.includes('result')) return 'results';
    if (source.includes('interview')) return 'interview';
    if (source.includes('coaching')) return 'coaching';
    if (source.includes('classement')) return 'classements';
    if (source.includes('international')) return 'international';
    return 'actualites';
  }

  private getCardClass(category: string): string {
    if (category === 'results') return 'red';
    if (category === 'interview' || category === 'coaching') return 'blue';
    if (category === 'classements') return 'violet';
    if (category === 'international') return 'coral';
    return '';
  }

  private getPlaceholderClass(category: string): string {
    if (category === 'results') return 'sunset';
    if (category === 'interview') return 'charcoal';
    if (category === 'coaching') return 'blue';
    if (category === 'classements') return 'violet';
    if (category === 'international') return 'sunset';
    return 'court';
  }

  private toShortDate(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  }

  private toLongDate(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  }

  /** Aligné sur `InternationalComponent.formatPeriodLabel`. */
  private formatPeriodLabel(
    startDate?: string | null,
    endDate?: string | null,
    fallbackDate?: string,
  ): string {
    if (!startDate || !endDate) {
      return fallbackDate ? this.formatDateLabel(fallbackDate) : '';
    }

    const start = this.parseIsoDate(startDate);
    const end = this.parseIsoDate(endDate);
    if (!start || !end) return `${startDate} - ${endDate}`;

    if (
      start.getMonth() === end.getMonth() &&
      start.getFullYear() === end.getFullYear()
    ) {
      return `${start.getDate()}-${this.formatDateLabel(endDate)}`;
    }

    return `${this.formatDateLabel(startDate)} - ${this.formatDateLabel(endDate)}`;
  }

  private formatDateLabel(value: string): string {
    const date = this.parseIsoDate(value);
    if (!date) return value;

    const monthLabel = new Intl.DateTimeFormat('fr-FR', {
      month: 'short',
    })
      .format(date)
      .replace('.', '');

    return `${date.getDate()} ${monthLabel.charAt(0).toUpperCase()}${monthLabel.slice(1)}`;
  }

  private parseIsoDate(value: string): Date | null {
    const [year, month, day] = value.split('-').map(Number);
    if (!year || !month || !day) return null;
    return new Date(year, month - 1, day);
  }
}
