import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { ArticleModel } from '../../../core/models/article.model';
import { ArticlesService } from '../../../core/services/articles.service';

type PopularItem = {
  cat: string;
  cls: string;
  title: string;
  age: string;
  slug: string;
  bannerImage?: string;
};

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent implements OnInit, OnChanges {
  @Input() excludeSlug?: string | null;

  protected isLoadingPopular = false;
  protected popular: PopularItem[] = [];
  protected activeTab: 'trending' | 'popular' = 'trending';

  constructor(private readonly articlesService: ArticlesService) {}

  ngOnInit(): void {
    this.loadPopular();
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

  private toPopularItem(article: ArticleModel): PopularItem {
    const cls = this.normalizeCategory(article.category?.name);
    return {
      cat: article.category?.name ?? 'Actualités',
      cls,
      title: article.title,
      age: this.toRelativeAge(article.date),
      slug: article.slug,
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
