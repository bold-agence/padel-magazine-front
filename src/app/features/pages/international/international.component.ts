import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  ArticleCategoryModel,
  ArticleModel,
} from '../../../core/models/article.model';
import { ArticlesService } from '../../../core/services/articles.service';
import {
  FipRankingDto,
  FipRankingEntryDto,
  FipRankingsService,
} from '../../../core/services/fip-rankings.service';
import {
  LatestResult,
  LatestResultsService,
} from '../../../core/services/latest-results.service';
import {
  NewsCardBadge,
  NewsCardComponent,
} from '../../../shared/components/news-card/news-card.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';

export type PodiumTier = 'gold' | 'silver' | 'bronze' | 'default';

export type PodiumEntry = {
  rank: number;
  team: string;
  points: string;
  tier: PodiumTier;
  /** Classe placeholder : orange, sunset, violet, charcoal */
  phClass: string;
  countryCode?: string | null;
  countryFlag?: string;
  playerImageUrl?: string | null;
};

type InternationalArticleCard = {
  id: string;
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
  badges: NewsCardBadge[];
};

type InternationalResultRow = LatestResult & {
  periodLabel: string;
};

const COUNTRY_ALPHA3_TO_ALPHA2: Record<string, string> = {
  AND: 'AD',
  ARG: 'AR',
  AUS: 'AU',
  AUT: 'AT',
  BEL: 'BE',
  BRA: 'BR',
  CAN: 'CA',
  CHE: 'CH',
  CHL: 'CL',
  COL: 'CO',
  DEU: 'DE',
  DNK: 'DK',
  ESP: 'ES',
  FIN: 'FI',
  FRA: 'FR',
  GBR: 'GB',
  IRL: 'IE',
  ITA: 'IT',
  MEX: 'MX',
  NED: 'NL',
  NLD: 'NL',
  NOR: 'NO',
  POL: 'PL',
  PRT: 'PT',
  POR: 'PT',
  QAT: 'QA',
  SWE: 'SE',
  UAE: 'AE',
  USA: 'US',
  URY: 'UY',
};

@Component({
  selector: 'app-international-component',
  standalone: true,
  imports: [SidebarComponent, NewsCardComponent, RouterLink],
  templateUrl: './international.component.html',
  styleUrl: './international.component.scss',
})
export class InternationalComponent implements OnInit {
  @ViewChild('podiumTrackHommes') private podiumTrackHommes?: ElementRef<HTMLDivElement>;
  @ViewChild('podiumTrackFeminin') private podiumTrackFeminin?: ElementRef<HTMLDivElement>;

  protected internationalArticles: InternationalArticleCard[] = [];
  protected isLoadingArticles = true;
  protected articlesError = '';
  protected top10: PodiumEntry[] = [];
  protected top10Feminin: PodiumEntry[] = [];
  protected isLoadingRankings = true;
  protected rankingsError = '';
  protected latestResults: InternationalResultRow[] = [];
  protected isLoadingLatestResults = true;
  protected latestResultsError = '';

  constructor(
    private readonly articlesService: ArticlesService,
    private readonly fipRankingsService: FipRankingsService,
    private readonly latestResultsService: LatestResultsService,
  ) {}

  ngOnInit(): void {
    this.loadRankings();
    this.loadLatestResults();
    this.loadArticles();
  }

  private loadRankings(): void {
    this.isLoadingRankings = true;
    this.rankingsError = '';
    this.fipRankingsService.findTop10().subscribe({
      next: (payload) => {
        this.top10 = this.mapRanking(payload.men);
        this.top10Feminin = this.mapRanking(payload.women);
        this.isLoadingRankings = false;
      },
      error: () => {
        this.rankingsError = 'Classement actuellement indisponible.';
        this.top10 = [];
        this.top10Feminin = [];
        this.isLoadingRankings = false;
      },
    });
  }

  private loadLatestResults(): void {
    this.isLoadingLatestResults = true;
    this.latestResultsError = '';
    this.latestResultsService.findPaginated(1, 3, 'all').subscribe({
      next: ({ items }) => {
        this.latestResults = items.map((item) => ({
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
        this.latestResults = [];
        this.latestResultsError =
          'Les derniers résultats sont actuellement indisponibles.';
        this.isLoadingLatestResults = false;
      },
    });
  }

  private loadArticles(): void {
    this.isLoadingArticles = true;
    this.articlesError = '';
    this.articlesService.findPaginated(1, 4, 'international').subscribe({
      next: (res) => {
        this.internationalArticles = res.items.map((a) => this.toArticleCard(a));
        this.isLoadingArticles = false;
      },
      error: () => {
        this.articlesError = 'Impossible de charger les articles.';
        this.internationalArticles = [];
        this.isLoadingArticles = false;
      },
    });
  }

  protected scrollPodiumHommes(dir: -1 | 1): void {
    this.scrollTrack(this.podiumTrackHommes, dir);
  }

  protected scrollPodiumFeminin(dir: -1 | 1): void {
    this.scrollTrack(this.podiumTrackFeminin, dir);
  }

  protected onPodiumHommesKeydown(ev: KeyboardEvent): void {
    this.onPodiumTrackKeydown(ev, this.podiumTrackHommes);
  }

  protected onPodiumFemininKeydown(ev: KeyboardEvent): void {
    this.onPodiumTrackKeydown(ev, this.podiumTrackFeminin);
  }

  private scrollTrack(track: ElementRef<HTMLDivElement> | undefined, dir: -1 | 1): void {
    const el = track?.nativeElement;
    if (!el) return;
    const first = el.querySelector('.podium-card') as HTMLElement | null;
    const gap = 12;
    const step = (first?.getBoundingClientRect().width ?? 200) + gap;
    el.scrollBy({ left: dir * step, behavior: 'smooth' });
  }

  private onPodiumTrackKeydown(ev: KeyboardEvent, track: ElementRef<HTMLDivElement> | undefined): void {
    if (ev.key === 'ArrowLeft') {
      ev.preventDefault();
      this.scrollTrack(track, -1);
    } else if (ev.key === 'ArrowRight') {
      ev.preventDefault();
      this.scrollTrack(track, 1);
    }
  }

  private mapRanking(ranking: FipRankingDto | null): PodiumEntry[] {
    if (!ranking?.entries?.length) {
      return [];
    }
    return [...ranking.entries]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .slice(0, 10)
      .map((entry, index) => this.toPodiumEntry(entry, index));
  }

  private toPodiumEntry(entry: FipRankingEntryDto, index: number): PodiumEntry {
    return {
      rank: entry.rank,
      team: entry.playerName,
      points: this.formatPoints(entry.points),
      tier: this.getPodiumTier(entry.rank),
      phClass: this.getPodiumPlaceholder(index),
      countryCode: entry.countryCode,
      countryFlag: this.countryFlag(entry.countryCode ?? ''),
      playerImageUrl: entry.playerImageUrl,
    };
  }

  private getPodiumTier(rank: number): PodiumTier {
    if (rank === 1) return 'gold';
    if (rank === 2) return 'silver';
    if (rank === 3) return 'bronze';
    return 'default';
  }

  private getPodiumPlaceholder(index: number): string {
    const classes = ['orange', 'sunset', 'violet', 'charcoal'];
    return classes[index % classes.length];
  }

  private formatPoints(points: number): string {
    return `${points.toLocaleString('fr-FR')} pts`;
  }

  private countryFlag(countryCode: string): string {
    const code = countryCode.trim().toUpperCase();
    const alpha2 = code.length === 2 ? code : COUNTRY_ALPHA3_TO_ALPHA2[code];
    if (!alpha2 || !/^[A-Z]{2}$/.test(alpha2)) {
      return '';
    }
    return Array.from(alpha2)
      .map((char) => String.fromCodePoint(127397 + char.charCodeAt(0)))
      .join('');
  }

  private toArticleCard(article: ArticleModel): InternationalArticleCard {
    const categories = this.getArticleCategories(article);
    const primaryCategory = categories[0] ?? null;
    const normalized = this.normalizeCategory(primaryCategory?.name);
    return {
      id: article.id,
      slug: article.slug,
      cat: primaryCategory?.name ?? 'International',
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

  private formatPeriodLabel(
    startDate?: string | null,
    endDate?: string | null,
    fallbackDate?: string,
  ): string {
    if (!startDate || !endDate) {
      return fallbackDate ? this.formatDateLabel(fallbackDate) : '';
    }

    const start = this.parseDate(startDate);
    const end = this.parseDate(endDate);
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
    const date = this.parseDate(value);
    if (!date) return value;

    const monthLabel = new Intl.DateTimeFormat('fr-FR', {
      month: 'short',
    })
      .format(date)
      .replace('.', '');

    return `${date.getDate()} ${monthLabel.charAt(0).toUpperCase()}${monthLabel.slice(1)}`;
  }

  private parseDate(value: string): Date | null {
    const [year, month, day] = value.split('-').map(Number);
    if (!year || !month || !day) return null;
    return new Date(year, month - 1, day);
  }
}
