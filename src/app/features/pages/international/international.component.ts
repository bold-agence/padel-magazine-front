import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ArticleModel } from '../../../core/models/article.model';
import { ArticlesService } from '../../../core/services/articles.service';
import { NewsCardComponent } from '../../../shared/components/news-card/news-card.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';

export type PodiumTier = 'gold' | 'silver' | 'bronze' | 'default';

export type PodiumEntry = {
  rank: number;
  team: string;
  points: string;
  tier: PodiumTier;
  /** Classe placeholder : orange, sunset, violet, charcoal */
  phClass: string;
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

  constructor(private readonly articlesService: ArticlesService) {}

  /** Top 10 messieurs (données éditoriales — à brancher API plus tard si besoin) */
  protected readonly top10: PodiumEntry[] = [
    { rank: 1, team: 'Galán / Lebrón 🇪🇸', points: '14 850 pts', tier: 'gold', phClass: 'orange' },
    { rank: 2, team: 'Chingotto / Tello 🇦🇷', points: '13 420 pts', tier: 'silver', phClass: 'sunset' },
    { rank: 3, team: 'Lima / Tapia 🇧🇷🇦🇷', points: '12 900 pts', tier: 'bronze', phClass: 'violet' },
    { rank: 4, team: 'Coello / Yanguas 🇪🇸', points: '12 100 pts', tier: 'default', phClass: 'charcoal' },
    { rank: 5, team: 'Di Nenno / Stupaczuk 🇦🇷', points: '11 800 pts', tier: 'default', phClass: 'orange' },
    { rank: 6, team: 'Ruiz / Bergamini 🇪🇸', points: '10 200 pts', tier: 'default', phClass: 'sunset' },
    { rank: 7, team: 'Navarro / Gutiérrez 🇪🇸', points: '9 950 pts', tier: 'default', phClass: 'violet' },
    { rank: 8, team: 'Sanz / Campagnolo 🇪🇸', points: '9 100 pts', tier: 'default', phClass: 'charcoal' },
    { rank: 9, team: 'Leal / Sanz 🇪🇸', points: '8 400 pts', tier: 'default', phClass: 'orange' },
    { rank: 10, team: 'Allemandi / Castro 🇦🇷', points: '7 900 pts', tier: 'default', phClass: 'sunset' },
  ];

  /** Top 10 dames (données éditoriales) */
  protected readonly top10Feminin: PodiumEntry[] = [
    { rank: 1, team: 'Triay / Fernández 🇪🇸', points: '13 200 pts', tier: 'gold', phClass: 'orange' },
    { rank: 2, team: 'Salazar / González 🇪🇸', points: '12 450 pts', tier: 'silver', phClass: 'sunset' },
    { rank: 3, team: 'Brea / Icardo 🇪🇸🇦🇷', points: '11 900 pts', tier: 'bronze', phClass: 'violet' },
    { rank: 4, team: 'Osoro / Castelló 🇪🇸', points: '10 800 pts', tier: 'default', phClass: 'charcoal' },
    { rank: 5, team: 'Riera / Llaguno 🇪🇸', points: '10 100 pts', tier: 'default', phClass: 'orange' },
    { rank: 6, team: 'Sainz / Jensen 🇪🇸🇩🇰', points: '9 650 pts', tier: 'default', phClass: 'sunset' },
    { rank: 7, team: 'Alonso / Ustero 🇪🇸', points: '9 200 pts', tier: 'default', phClass: 'violet' },
    { rank: 8, team: 'Martínez / Caparrós 🇪🇸', points: '8 400 pts', tier: 'default', phClass: 'charcoal' },
    { rank: 9, team: 'Araujo / Vergara 🇪🇸', points: '7 950 pts', tier: 'default', phClass: 'orange' },
    { rank: 10, team: 'Navarro / Rodríguez 🇪🇸', points: '7 200 pts', tier: 'default', phClass: 'sunset' },
  ];

  ngOnInit(): void {
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

  private toArticleCard(article: ArticleModel): InternationalArticleCard {
    const normalized = this.normalizeCategory(article.category?.name);
    return {
      id: article.id,
      slug: article.slug,
      cat: article.category?.name ?? 'International',
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
}
