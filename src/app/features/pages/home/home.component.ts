import {
  AfterViewInit,
  Component,
  Inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { forkJoin } from 'rxjs';
import { ArticleModel } from '../../../core/models/article.model';
import { ArticlesService } from '../../../core/services/articles.service';
import {
  AdImageItem,
  ClientContentService,
} from '../../../core/services/client-content.service';
import { NewsCardComponent } from '../../../shared/components/news-card/news-card.component';
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
};

@Component({
  selector: 'app-home-component',
  standalone: true,
  imports: [SidebarComponent, NewsCardComponent, RouterLink],
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

  private heroTimer: ReturnType<typeof setInterval> | null = null;
  private countdownTimer: ReturnType<typeof setInterval> | null = null;
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
    @Inject(DOCUMENT) private readonly document: Document,
    private readonly articlesService: ArticlesService,
    private readonly clientContentService: ClientContentService,
  ) {}

  ngOnInit(): void {
    this.loadHomepageSections();
    this.loadHomeAds();
  }

  ngAfterViewInit(): void {
    this.startHeroAutoplay();
    this.initCountdown();
  }

  ngOnDestroy(): void {
    if (this.heroTimer) {
      clearInterval(this.heroTimer);
    }
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
    }
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
    }, 5000);
  }

  private initCountdown(): void {
    const el = this.document.getElementById('countdown');
    if (!el) {
      return;
    }

    const target = new Date('2026-04-19T15:00:00Z').getTime();
    const tick = (): void => {
      const delta = target - Date.now();
      if (delta <= 0) {
        el.textContent = 'EN DIRECT';
        return;
      }
      const days = Math.floor(delta / 86400000);
      const hrs = Math.floor((delta % 86400000) / 3600000);
      const min = Math.floor((delta % 3600000) / 60000);
      const sec = Math.floor((delta % 60000) / 1000);
      el.innerHTML = `
        <div style="text-align:center"><div style="font-size:28px;color:var(--red)">${days}</div><div style="font-size:10px;opacity:.6;letter-spacing:.1em">JOURS</div></div>
        <div style="text-align:center"><div style="font-size:28px;color:var(--red)">${String(hrs).padStart(2, '0')}</div><div style="font-size:10px;opacity:.6;letter-spacing:.1em">HRS</div></div>
        <div style="text-align:center"><div style="font-size:28px;color:var(--red)">${String(min).padStart(2, '0')}</div><div style="font-size:10px;opacity:.6;letter-spacing:.1em">MIN</div></div>
        <div style="text-align:center"><div style="font-size:28px;color:var(--red)">${String(sec).padStart(2, '0')}</div><div style="font-size:10px;opacity:.6;letter-spacing:.1em">SEC</div></div>
      `;
    };

    tick();
    this.countdownTimer = setInterval(tick, 1000);
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

  private loadHomeAds(): void {
    this.clientContentService.findAdImages('home_leaderboard', true).subscribe({
      next: (items) => {
        this.homeLeaderboardAd = items[0];
      },
      error: () => {
        this.homeLeaderboardAd = undefined;
      },
    });
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
    const normalized = this.normalizeCategory(article.category?.name);
    return {
      slug: article.slug,
      title: article.title,
      cat: article.category?.name ?? 'Actualités',
      cls: normalized,
      date: this.toLongDate(article.date),
      author: article.author,
      read: article.readingTime,
      ph: this.getPlaceholderClass(normalized),
      bannerImage: article.bannerImage,
    };
  }

  private toHomeNewsCard(article: ArticleModel): HomeNewsCard {
    const normalized = this.normalizeCategory(article.category?.name);
    return {
      slug: article.slug,
      cat: article.category?.name ?? 'Actualités',
      cls: normalized,
      ph: this.getPlaceholderClass(normalized),
      title: article.title,
      auth: article.author,
      date: this.toShortDate(article.date),
      read: article.readingTime,
      cardClass: this.getCardClass(normalized),
      bannerImage: article.bannerImage,
    };
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
}
