import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import {
  ArticleCategoryModel,
  ArticleModel,
} from '../../../core/models/article.model';
import { RouterLink } from '@angular/router';
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
import {
  NewsletterSubscriberPayload,
  NewsletterSubscribersService,
} from '../../../core/services/newsletter-subscribers.service';

type NewsletterFormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  acceptsEmails: boolean;
  acceptsPrintMagazine: boolean;
};

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
  imports: [CommonModule, RouterLink, FormsModule],
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

  protected newsletterModalOpen = false;
  protected newsletterSubmitting = false;
  protected newsletterFormError = '';
  protected newsletterSuccessMessage = '';
  protected newsletterForm: NewsletterFormState = this.createEmptyNewsletterForm();

  constructor(
    private readonly articlesService: ArticlesService,
    private readonly clientContentService: ClientContentService,
    private readonly livesService: LivesService,
    private readonly newsletterSubscribersService: NewsletterSubscribersService,
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

  /** Nom de l’événement + tournoi à côté si renseigné (aligné accueil / live). */
  protected sidebarEventTitleLine(live: LiveDto): string {
    const eventTitle = live.event.title?.trim() || 'Événement';
    const tournament = live.event.tournament?.label?.trim();
    if (!tournament) return eventTitle;
    return `${eventTitle} · ${tournament}`;
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

  protected openNewsletterModal(): void {
    this.newsletterFormError = '';
    this.newsletterForm = this.createEmptyNewsletterForm();
    this.newsletterModalOpen = true;
  }

  protected closeNewsletterModal(): void {
    if (this.newsletterSubmitting) {
      return;
    }
    this.newsletterModalOpen = false;
    this.newsletterFormError = '';
  }

  protected submitNewsletter(event: Event, form: NgForm): void {
    event.preventDefault();
    this.newsletterFormError = '';

    const payload: NewsletterSubscriberPayload = {
      firstName: this.newsletterForm.firstName.trim(),
      lastName: this.newsletterForm.lastName.trim(),
      email: this.newsletterForm.email.trim(),
      phone: this.newsletterForm.phone.trim(),
      acceptsEmails: this.newsletterForm.acceptsEmails,
      acceptsPrintMagazine: this.newsletterForm.acceptsPrintMagazine,
    };

    if (!payload.firstName || !payload.lastName || !payload.email || !payload.phone) {
      this.newsletterFormError = 'Veuillez remplir tous les champs obligatoires.';
      form.control.markAllAsTouched();
      return;
    }

    if (form.invalid) {
      this.newsletterFormError = 'Veuillez remplir correctement tous les champs obligatoires.';
      form.control.markAllAsTouched();
      return;
    }

    if (!this.newsletterForm.acceptsEmails) {
      this.newsletterFormError =
        'Vous devez accepter de recevoir les communications par e-mail pour vous inscrire.';
      return;
    }

    payload.acceptsEmails = true;

    this.newsletterSubmitting = true;
    this.newsletterSubscribersService.subscribe(payload).subscribe({
      next: () => {
        this.newsletterSubmitting = false;
        this.newsletterModalOpen = false;
        this.newsletterForm = this.createEmptyNewsletterForm();
        this.newsletterSuccessMessage =
          'Merci ! Votre inscription à la newsletter a bien été enregistrée.';
      },
      error: (err: HttpErrorResponse) => {
        this.newsletterSubmitting = false;
        const apiMessage =
          typeof err.error?.message === 'string'
            ? err.error.message
            : Array.isArray(err.error?.message)
              ? err.error.message.join(' ')
              : '';
        if (err.status === 409) {
          this.newsletterFormError =
            apiMessage || 'Cette adresse e-mail est déjà inscrite.';
        } else if (apiMessage) {
          this.newsletterFormError = apiMessage;
        } else {
          this.newsletterFormError =
            'Une erreur est survenue. Veuillez réessayer dans quelques instants.';
        }
      },
    });
  }

  private createEmptyNewsletterForm(): NewsletterFormState {
    return {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      acceptsEmails: false,
      acceptsPrintMagazine: false,
    };
  }
}
