import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ArticleModel } from '../../../core/models/article.model';
import { ArticlesService } from '../../../core/services/articles.service';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';

type CoachingCard = {
  badge: string;
  bannerImage?: string;
  title: string;
  sub: string;
  author: string;
  date: string;
  read: string;
  slug: string;
  tags: string[];
};

type TagChip = {
  id: string;
  label: string;
  value: string;
};

@Component({
  selector: 'app-coaching-component',
  standalone: true,
  imports: [SidebarComponent],
  templateUrl: './coaching.component.html',
  styleUrl: './coaching.component.scss',
})
export class CoachingComponent implements OnInit {
  private readonly pageSize = 9;
  protected isLoading = false;
  protected errorMessage = '';
  protected activeTag = 'all';
  protected cards: CoachingCard[] = [];
  protected filteredCards: CoachingCard[] = [];
  protected tagChips: TagChip[] = [{ id: 'all', label: 'Tout', value: 'all' }];
  protected currentPage = 1;
  protected totalPages = 1;
  protected hasPreviousPage = false;
  protected hasNextPage = false;
  protected pageNumbers: number[] = [1];
  private requestedTag = 'all';

  constructor(
    private readonly articlesService: ArticlesService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      const rawPage = Number(params.get('page') ?? '1');
      const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
      this.requestedTag = params.get('tag') ?? 'all';
      this.activeTag = this.requestedTag;
      this.loadCoachingArticles(page);
    });
  }

  protected selectTag(tag: string): void {
    if (this.isLoading || tag === this.activeTag) {
      return;
    }
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tag: tag === 'all' ? null : tag, page: 1 },
      queryParamsHandling: 'merge',
    });
  }

  protected goToPage(page: number): void {
    if (this.isLoading || page < 1 || page > this.totalPages || page === this.currentPage) {
      return;
    }
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page, tag: this.activeTag === 'all' ? null : this.activeTag },
      queryParamsHandling: 'merge',
    });
  }

  private loadCoachingArticles(page = 1): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.articlesService.findPaginated(page, this.pageSize, 'coaching').subscribe({
      next: (response) => {
        const visibleItems = response.items.filter(
          (article) => article.isVisible !== false,
        );
        this.cards = visibleItems.map((article) => this.toCard(article));
        this.currentPage = response.pagination.page;
        this.totalPages = response.pagination.totalPages;
        this.hasPreviousPage = response.pagination.hasPreviousPage;
        this.hasNextPage = response.pagination.hasNextPage;
        this.pageNumbers = this.buildPageNumbers(
          response.pagination.page,
          response.pagination.totalPages,
        );
        this.tagChips = this.buildTagChips(this.cards);
        this.activeTag = this.requestedTag;
        this.ensureActiveTagIsValid();
        this.applyTagFilter();
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Impossible de charger les articles coaching.';
        this.currentPage = 1;
        this.totalPages = 1;
        this.hasPreviousPage = false;
        this.hasNextPage = false;
        this.pageNumbers = [1];
        this.isLoading = false;
      },
    });
  }

  private applyTagFilter(): void {
    const source =
      this.activeTag === 'all'
        ? this.cards
        : this.cards.filter((card) => card.tags.includes(this.activeTag));
    this.filteredCards = source;
  }

  private buildTagChips(cards: CoachingCard[]): TagChip[] {
    const tags = new Set<string>();
    for (const card of cards) {
      for (const tag of card.tags) {
        tags.add(tag);
      }
    }
    return [
      { id: 'all', label: 'Tout', value: 'all' },
      ...Array.from(tags).map((tag) => ({
        id: tag,
        label: tag,
        value: tag,
      })),
    ];
  }

  private ensureActiveTagIsValid(): void {
    const valid = this.tagChips.some((chip) => chip.value === this.activeTag);
    if (!valid) {
      this.activeTag = 'all';
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { tag: null },
        queryParamsHandling: 'merge',
      });
    }
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

  private toCard(article: ArticleModel): CoachingCard {
    const tags = (article.tags ?? []).map((tag) => tag.name).filter(Boolean);
    const bodyParagraph =
      article.sections?.find((section) => section.type === 'paragraph')?.content ??
      article.sections?.[0]?.content ??
      '';

    return {
      badge: tags[0] ?? 'Coaching',
      bannerImage: article.bannerImage,
      title: article.title,
      sub: bodyParagraph,
      author: article.author,
      date: this.formatDate(article.date),
      read: article.readingTime,
      slug: article.slug,
      tags,
    };
  }

  private formatDate(rawDate: string): string {
    const date = new Date(rawDate);
    if (Number.isNaN(date.getTime())) {
      return rawDate;
    }
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  }
}
