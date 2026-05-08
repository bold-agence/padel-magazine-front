import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { ArticlesService } from '../../../core/services/articles.service';
import { ArticleModel, ArticleSectionModel } from '../../../core/models/article.model';
import { NewsCardComponent } from '../../../shared/components/news-card/news-card.component';

@Component({
  selector: 'app-article-component',
  standalone: true,
  imports: [SidebarComponent, RouterLink, NewsCardComponent, DatePipe],
  templateUrl: './article.component.html',
  styleUrl: './article.component.scss',
})
export class ArticleComponent implements OnInit {
  protected isLoading = false;
  protected errorMessage = '';
  protected article?: ArticleModel;
  protected relatedArticles: ArticleModel[] = [];

  constructor(
    private readonly route: ActivatedRoute,
    private readonly articlesService: ArticlesService,
  ) {}

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (!slug) {
      this.errorMessage = 'Article introuvable.';
      return;
    }
    this.loadArticle(slug);
  }

  protected getSortedSections(): ArticleSectionModel[] {
    if (!this.article?.sections?.length) return [];
    return [...this.article.sections].sort((a, b) => a.order - b.order);
  }

  protected toHeadingTag(level?: number): 'h2' | 'h3' {
    return level && level >= 3 ? 'h3' : 'h2';
  }

  protected getBadgeClass(value?: string): string {
    const source = (value ?? '').toLowerCase();
    if (source.includes('result')) return 'results';
    if (source.includes('interview')) return 'interview';
    if (source.includes('classement')) return 'classements';
    if (source.includes('coaching')) return 'coaching';
    if (source.includes('international')) return 'international';
    return 'actualites';
  }

  protected onSectionImageLoad(event: Event): void {
    const img = event.target as HTMLImageElement | null;
    if (!img) return;

    const w = img.naturalWidth || img.width;
    const h = img.naturalHeight || img.height;
    if (!w || !h) return;

    const isPortrait = h > w;
    img.classList.toggle('portrait', isPortrait);

    const figure = img.closest('figure');
    figure?.classList.toggle('portrait', isPortrait);
  }

  private loadArticle(slug: string): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.articlesService.findBySlug(slug).subscribe({
      next: (article) => {
        if (!article) {
          this.errorMessage = 'Article introuvable.';
          this.isLoading = false;
          return;
        }
        this.article = article;
        this.trackView(article.slug);
        this.loadRelatedArticles(article.slug);
      },
      error: () => {
        this.errorMessage = 'Impossible de charger cet article.';
        this.isLoading = false;
      },
    });
  }

  private loadRelatedArticles(slug: string): void {
    this.articlesService.findRelatedBySlug(slug).subscribe({
      next: (articles) => {
        this.relatedArticles = articles;
        this.isLoading = false;
      },
      error: () => {
        this.relatedArticles = [];
        this.isLoading = false;
      },
    });
  }

  private trackView(slug: string): void {
    this.articlesService.trackViewBySlug(slug).subscribe({
      next: () => {
        // no-op: metrics call should not block article rendering
      },
      error: () => {
        // no-op: ignore analytics failures
      },
    });
  }
}
