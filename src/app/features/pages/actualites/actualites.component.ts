import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NewsCardComponent } from '../../../shared/components/news-card/news-card.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { ArticleCategoryModel, ArticleModel } from '../../../core/models/article.model';
import {
  ArticlesService,
  PaginatedArticlesResponse,
} from '../../../core/services/articles.service';
import { NewsCardBadge } from '../../../shared/components/news-card/news-card.component';

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
  badges: NewsCardBadge[];
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
    this.loadCategoryChips();
    this.route.queryParamMap.subscribe((params) => {
      const rawPage = Number(params.get('page') ?? '1');
      const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
      const category = (params.get('category') ?? 'all').toLowerCase();
      this.activeCategory = category || 'all';
      this.loadArticles(page, this.activeCategory);
    });
  }

  protected selectCategory(value: string): void {
    if (this.isLoading || value === this.activeCategory) {
      return;
    }
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { category: value, page: 1 },
      queryParamsHandling: 'merge',
    });
  }

  protected goToPage(page: number): void {
    if (this.isLoading || page < 1 || page > this.totalPages || page === this.currentPage) {
      return;
    }
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page, category: this.activeCategory || 'all' },
      queryParamsHandling: 'merge',
    });
  }

  private loadArticles(page = 1, category = 'all'): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.articlesService.findPaginated(page, this.pageSize, category).subscribe({
      next: (response: PaginatedArticlesResponse) => {
        this.articles = response.items.map((article) => this.toNewsArticle(article));
        this.filteredArticles = this.articles;
        this.currentPage = response.pagination.page;
        this.totalPages = response.pagination.totalPages;
        this.hasPreviousPage = response.pagination.hasPreviousPage;
        this.hasNextPage = response.pagination.hasNextPage;
        this.pageNumbers = this.buildPageNumbers(
          response.pagination.page,
          response.pagination.totalPages,
        );
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

  private loadCategoryChips(): void {
    this.articlesService.findAllCategories().subscribe({
      next: (categories: ArticleCategoryModel[]) => {
        this.categories = [
          { id: 'all', label: 'Tout', value: 'all', className: '' },
          ...categories.map((category) => ({
            id: category.id,
            value: category.slug,
            label: category.name,
            className: this.getChipColorClass(this.normalizeCategory(category.name)),
          })),
        ];
      },
      error: () => {
        this.categories = [{ id: 'all', label: 'Tout', value: 'all', className: '' }];
      },
    });
  }

  private toNewsArticle(article: ArticleModel): NewsArticle {
    const categories = this.getArticleCategories(article);
    const primaryCategory = categories[0] ?? null;
    const normalized = this.normalizeCategory(primaryCategory?.name);
    return {
      id: article.id,
      slug: article.slug,
      cat: primaryCategory?.name ?? 'Actualités',
      cls: normalized,
      ph: this.getPlaceholderClass(normalized),
      title: article.title,
      auth: article.author,
      date: this.toShortDate(article.date),
      read: article.readingTime,
      bannerImage: article.bannerImage,
      cardClass: this.getCardClass(normalized),
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
