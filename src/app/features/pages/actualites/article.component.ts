import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { ArticlesService } from '../../../core/services/articles.service';
import {
  ArticleCategoryModel,
  ArticleModel,
  ArticleSectionModel,
} from '../../../core/models/article.model';
import { SOCIAL_LINKS } from '../../../core/constants/social-links';
import {
  NewsCardBadge,
  NewsCardComponent,
} from '../../../shared/components/news-card/news-card.component';

@Component({
  selector: 'app-article-component',
  standalone: true,
  imports: [SidebarComponent, RouterLink, NewsCardComponent],
  templateUrl: './article.component.html',
  styleUrl: './article.component.scss',
})
export class ArticleComponent implements OnInit {
  protected readonly socialLinks = SOCIAL_LINKS;

  protected isLoading = false;
  protected errorMessage = '';
  protected article?: ArticleModel;
  protected relatedArticles: ArticleModel[] = [];
  protected shareNotice = '';

  private shareNoticeTimer?: ReturnType<typeof setTimeout>;

  /** URL de la page (partage) — uniquement côté navigateur. */
  protected get sharePageUrl(): string {
    return typeof globalThis !== 'undefined' && 'location' in globalThis
      ? globalThis.location.href
      : '';
  }

  private get shareTitle(): string {
    return this.article?.title?.trim() ?? 'Padel Magazine';
  }

  /** Texte copié pour tous les réseaux (même contenu que Facebook). */
  private get shareClipboardBody(): string {
    const url = this.sharePageUrl.trim();
    if (!url) return `${this.shareTitle} — Padel Magazine`;
    return `${this.shareTitle} — Padel Magazine\n${url}`;
  }

  /** Facebook ignore le param `quote` depuis des années — on copie le texte avant d'ouvrir. */
  protected shareOnFacebook(): void {
    const url = this.sharePageUrl;
    if (!url) return;

    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    const open = () => window.open(facebookUrl, '_blank', 'noopener,noreferrer');

    this.copyForShare(
      this.shareClipboardBody,
      'Texte copié ! Collez-le dans votre publication Facebook.',
      open,
    );
  }

  /** Même logique que Facebook : texte dans le presse-papiers, puis fenêtre X avec l’URL. */
  protected shareOnX(): void {
    const url = this.sharePageUrl;
    if (!url) return;

    const xUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`;
    const open = () => window.open(xUrl, '_blank', 'noopener,noreferrer');

    this.copyForShare(
      this.shareClipboardBody,
      'Texte copié ! Collez-le dans votre post sur X si besoin.',
      open,
    );
  }

  /** Même logique : texte copié, puis partage LinkedIn (URL). */
  protected shareOnLinkedIn(): void {
    const url = this.sharePageUrl;
    if (!url) return;

    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    const open = () => window.open(linkedInUrl, '_blank', 'noopener,noreferrer');

    this.copyForShare(
      this.shareClipboardBody,
      'Texte copié ! Collez-le dans votre publication LinkedIn si besoin.',
      open,
    );
  }

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

  protected getCategoryBadges(article?: ArticleModel): NewsCardBadge[] {
    return this.getArticleCategories(article).map((category) => ({
      text: category.name,
      className: this.getBadgeClass(category.name),
    }));
  }

  protected getPrimaryCategory(article?: ArticleModel): ArticleCategoryModel | null {
    return this.getArticleCategories(article)[0] ?? null;
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

  /** Instagram : Web Share sur mobile, sinon même flux que Facebook (copy + notice). */
  protected shareOnInstagram(): void {
    const url = this.sharePageUrl;
    const text = this.shareClipboardBody;
    if (!url) return;

    const notice =
      'Texte copié ! Collez-le dans Instagram (story, publication ou message).';

    const nav = navigator as Navigator & { share?: (data: ShareData) => Promise<void> };
    if (typeof nav.share === 'function') {
      nav
        .share({ title: this.shareTitle, text, url })
        .catch(() => this.copyForShare(text, notice));
    } else {
      this.copyForShare(text, notice);
    }
  }

  private copyForShare(text: string, notice: string, afterCopy?: () => void): void {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(
        () => {
          this.setShareNotice(notice);
          afterCopy?.();
        },
        () => window.prompt('Copiez ce texte :', text),
      );
    } else {
      window.prompt('Copiez ce texte :', text);
    }
  }

  private setShareNotice(msg: string): void {
    this.shareNotice = msg;
    clearTimeout(this.shareNoticeTimer);
    this.shareNoticeTimer = setTimeout(() => (this.shareNotice = ''), 5000);
  }

  protected formatArticleDate(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  protected formatArticleDateShort(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  }

  private getArticleCategories(article?: ArticleModel): ArticleCategoryModel[] {
    if (!article) return [];
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
}
