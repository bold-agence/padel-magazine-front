import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, OnInit } from '@angular/core';
<<<<<<< HEAD
import {
  ArticleCategoryModel,
  ArticleModel,
} from '../../../core/models/article.model';
=======
import { RouterLink } from '@angular/router';
import { ArticleModel } from '../../../core/models/article.model';
>>>>>>> f89c5679bcb012ff50e3c2408bf9b9ecd58f9853
import { ArticlesService } from '../../../core/services/articles.service';
import {
  AdImageItem,
  ClientContentService,
} from '../../../core/services/client-content.service';
import { LiveDto, LivesService } from '../../../core/services/lives.service';
import {
  findAiringLive,
  pickUpcoming,
} from '../../../core/utils/live-scheduling.util';

type PopularItem = {
  cat: string;
  cls: string;
  badges: { text: string; className: string }[];
  title: string;
  age: string;
  slug: string;
  bannerImage?: string;
};

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent implements OnInit, OnChanges {
  @Input() excludeSlug?: string | null;

  protected isLoadingPopular = false;
  protected popular: PopularItem[] = [];
  protected activeTab: 'trending' | 'popular' = 'trending';
  protected topSidebarAd?: AdImageItem;
  protected bottomSidebarAd?: AdImageItem;

  /** Même règle que l’accueil / page Live : en direct si créneau en cours, sinon prochain live. */
  protected sidebarNextLive: LiveDto | null = null;
  protected sidebarNextLiveIsAiring = false;
  protected sidebarLiveLoading = true;
  protected sidebarLiveError = false;

  constructor(
    private readonly articlesService: ArticlesService,
    private readonly clientContentService: ClientContentService,
    private readonly livesService: LivesService,
  ) {}

  ngOnInit(): void {
    this.loadPopular();
    this.loadAds();
    this.loadSidebarNextLive();
  }

  ngOnChanges(): void {
    this.loadPopular();
  }

  protected selectTab(tab: 'trending' | 'popular'): void {
    if (this.activeTab === tab) {
      return;
    }
    this.activeTab = tab;
    this.loadPopular();
  }

  private loadPopular(): void {
    this.isLoadingPopular = true;
    this.articlesService
      .findPopular(5, 'all', this.excludeSlug ?? undefined, this.activeTab)
      .subscribe({
      next: (articles) => {
        this.popular = articles.map((article) => this.toPopularItem(article));
        this.isLoadingPopular = false;
      },
      error: () => {
        this.popular = [];
        this.isLoadingPopular = false;
      },
    });
  }

  private loadSidebarNextLive(): void {
    this.sidebarLiveLoading = true;
    this.sidebarLiveError = false;
    this.livesService.findAll().subscribe({
      next: (lives) => {
        const airing = findAiringLive(lives);
        if (airing) {
          this.sidebarNextLive = airing;
          this.sidebarNextLiveIsAiring = true;
        } else {
          this.sidebarNextLive = pickUpcoming(lives, 1)[0] ?? null;
          this.sidebarNextLiveIsAiring = false;
        }
        this.sidebarLiveLoading = false;
      },
      error: () => {
        this.sidebarNextLive = null;
        this.sidebarNextLiveIsAiring = false;
        this.sidebarLiveError = true;
        this.sidebarLiveLoading = false;
      },
    });
  }

  protected formatSidebarEventDates(live: LiveDto): string {
    const start = new Date(live.event.startAt);
    const endRaw = live.event.endAt;
    const end = endRaw ? new Date(endRaw) : null;
    if (!end || Number.isNaN(end.getTime())) {
      return new Intl.DateTimeFormat('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(start);
    }
    const sameCalendarDay =
      start.getFullYear() === end.getFullYear() &&
      start.getMonth() === end.getMonth() &&
      start.getDate() === end.getDate();
    if (sameCalendarDay) {
      return new Intl.DateTimeFormat('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(start);
    }
    const shortDay = new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
    });
    const withYear = new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    return `${shortDay.format(start)}–${withYear.format(end)}`;
  }

  protected formatSidebarLiveClock(startTime: string): string {
    const parts = startTime.trim().split(':');
    const h = parts[0] ?? '0';
    const m = (parts[1] ?? '00').padStart(2, '0');
    return `${h}h${m}`;
  }

  protected formatSidebarProgramLiveTime(live: LiveDto): string {
    const start = this.formatSidebarLiveClock(live.startTime);
    const end = live.endTime?.trim();
    if (!end) return start;
    return `${start} – ${this.formatSidebarLiveClock(end)}`;
  }

  private loadAds(): void {
    this.clientContentService.findAdImages('sidebar_top', true).subscribe({
      next: (items) => {
        this.topSidebarAd = items[0];
      },
      error: () => {
        this.topSidebarAd = undefined;
      },
    });
    this.clientContentService.findAdImages('sidebar_bottom', true).subscribe({
      next: (items) => {
        this.bottomSidebarAd = items[0];
      },
      error: () => {
        this.bottomSidebarAd = undefined;
      },
    });
  }

  private toPopularItem(article: ArticleModel): PopularItem {
    const categories = this.getArticleCategories(article);
    const primaryCategory = categories[0] ?? null;
    const cls = this.normalizeCategory(primaryCategory?.name);
    return {
      cat: primaryCategory?.name ?? 'Actualités',
      cls,
      badges: categories.map((category) => ({
        text: category.name,
        className: this.normalizeCategory(category.name),
      })),
      title: article.title,
      age: this.toRelativeAge(article.date),
      slug: article.slug,
      bannerImage: article.bannerImage,
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

  private normalizeCategory(value?: string): string {
    const source = (value ?? 'actualites').toLowerCase();
    if (source.includes('result')) return 'results';
    if (source.includes('interview')) return 'interview';
    if (source.includes('coaching')) return 'coaching';
    if (source.includes('classement')) return 'classements';
    if (source.includes('international')) return 'international';
    return 'actualites';
  }

  private toRelativeAge(dateStr: string): string {
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) {
      return '';
    }
    const diffMs = Date.now() - date.getTime();
    const diffDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
    if (diffDays <= 0) return "aujourd'hui";
    if (diffDays === 1) return 'il y a 1j';
    return `il y a ${diffDays}j`;
  }

  protected newsletterSubmit(event: Event): void {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const input = form.querySelector('input');
    const message = form.querySelector('.msg');

    if (input) {
      input.value = '';
    }
    if (message) {
      message.textContent =
        'Merci ! Vous recevrez notre prochaine newsletter très bientôt.';
    }
  }
}
