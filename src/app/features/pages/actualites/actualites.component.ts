import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NewsCardComponent } from '../../../shared/components/news-card/news-card.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { ArticleModel } from '../../../core/models/article.model';
import {
  ArticlesService,
  PaginatedArticlesResponse,
} from '../../../core/services/articles.service';

type NewsArticle = {
  id: string;
  slug: string;
  cat: string;
  cls: string;
  ph: string;
  title: string;
  auth: string;
  date: string;
  read: string;
  bannerImage?: string;
  cardClass: string;
};

type CategoryChip = {
  id: string;
  label: string;
  value: string;
  className: string;
};

@Component({
  selector: 'app-actualites-component',
  standalone: true,
  imports: [SidebarComponent, NewsCardComponent],
  templateUrl: './actualites.component.html',
  styleUrl: './actualites.component.scss',
})
export class ActualitesComponent implements OnInit {
  private readonly pageSize = 9;
  protected isLoading = false;
  protected errorMessage = '';
  protected activeCategory = 'all';
  protected articles: NewsArticle[] = [];
  protected filteredArticles: NewsArticle[] = [];
  protected currentPage = 1;
  protected totalPages = 1;
  protected hasPreviousPage = false;
  protected hasNextPage = false;
  protected pageNumbers: number[] = [1];
  protected categories: CategoryChip[] = [
    { id: 'all', label: 'Tout', value: 'all', className: '' },
  ];

  constructor(
    private readonly articlesService: ArticlesService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      const rawPage = Number(params.get('page') ?? '1');
      const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
      this.loadArticles(page);
    });
  }

  protected selectCategory(value: string): void {
    this.activeCategory = value;
    if (value === 'all') {
      this.filteredArticles = this.articles;
      return;
    }
    this.filteredArticles = this.articles.filter((article) => article.cls === value);
  }

  protected goToPage(page: number): void {
    if (this.isLoading || page < 1 || page > this.totalPages || page === this.currentPage) {
      return;
    }
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page },
      queryParamsHandling: 'merge',
    });
  }

  private loadArticles(page = 1): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.articlesService.findPaginated(page, this.pageSize).subscribe({
      next: (response: PaginatedArticlesResponse) => {
        this.articles = response.items.map((article) => this.toNewsArticle(article));
        this.currentPage = response.pagination.page;
        this.totalPages = response.pagination.totalPages;
        this.hasPreviousPage = response.pagination.hasPreviousPage;
        this.hasNextPage = response.pagination.hasNextPage;
        this.pageNumbers = this.buildPageNumbers(
          response.pagination.page,
          response.pagination.totalPages,
        );
        this.categories = this.buildCategoryChips(this.articles);
        this.selectCategory(this.activeCategory);
        if (!this.filteredArticles.length && this.activeCategory !== 'all') {
          this.selectCategory('all');
        }
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = "Impossible de charger les actualités.";
        this.isLoading = false;
      },
    });
  }

  private buildPageNumbers(currentPage: number, totalPages: number): number[] {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, start + 4);
    const normalizedStart = Math.max(1, end - 4);
    return Array.from(
      { length: end - normalizedStart + 1 },
      (_, index) => normalizedStart + index,
    );
  }

  private buildCategoryChips(articles: NewsArticle[]): CategoryChip[] {
    const map = new Map<string, CategoryChip>();
    for (const article of articles) {
      if (!map.has(article.cls)) {
        map.set(article.cls, {
          id: article.cls,
          value: article.cls,
          label: article.cat,
          className: this.getChipColorClass(article.cls),
        });
      }
    }
    return [{ id: 'all', label: 'Tout', value: 'all', className: '' }, ...map.values()];
  }

  private toNewsArticle(article: ArticleModel): NewsArticle {
    const normalized = this.normalizeCategory(article.category?.name);
    return {
      id: article.id,
      slug: article.slug,
      cat: article.category?.name ?? 'Actualités',
      cls: normalized,
      ph: this.getPlaceholderClass(normalized),
      title: article.title,
      auth: article.author,
      date: this.toShortDate(article.date),
      read: article.readingTime,
      bannerImage: article.bannerImage,
      cardClass: this.getCardClass(normalized),
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

  private getChipColorClass(category: string): string {
    if (category === 'results') return 'red';
    if (category === 'interview' || category === 'coaching') return 'blue';
    if (category === 'classements') return 'violet';
    if (category === 'international') return 'coral';
    return '';
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
