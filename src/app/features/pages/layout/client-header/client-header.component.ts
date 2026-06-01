import { Component, HostListener, inject, Input, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter, finalize } from 'rxjs';
import {
  AdImageItem,
  BreakingNewsItem,
  ClientContentService,
} from '../../../../core/services/client-content.service';
import { SOCIAL_LINKS } from '../../../../core/constants/social-links';
import { AdSlotMediaComponent } from '../../../../shared/components/ad-slot-media/ad-slot-media.component';

@Component({
  selector: 'app-client-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, AdSlotMediaComponent],
  templateUrl: './client-header.component.html',
  styleUrl: './client-header.component.scss',
})
export class ClientHeaderComponent implements OnInit {
  @Input() currentPage = 'home';

  private readonly router = inject(Router);

  protected isMenuOpen = false;

  protected readonly dateFr = (() => {
    const formatted = new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date());
    return formatted.charAt(0).toLocaleUpperCase('fr-FR') + formatted.slice(1);
  })();

  /** Version courte pour la topbar mobile (ex. « Mar. 26 mai »). */
  protected readonly dateFrShort = (() => {
    const formatted = new Intl.DateTimeFormat('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    }).format(new Date());
    return formatted.charAt(0).toLocaleUpperCase('fr-FR') + formatted.slice(1);
  })();

  protected readonly socialLinks = SOCIAL_LINKS;

  protected isScrolled = false;
  protected headerAd?: AdImageItem;
  protected headerAdResolved = false;
  protected breakingNews: BreakingNewsItem[] = [];

  constructor(private readonly clientContentService: ClientContentService) {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        this.closeMenu();
      });
  }

  ngOnInit(): void {
    this.clientContentService
      .findAdImages('header_main', true)
      .pipe(finalize(() => {
        this.headerAdResolved = true;
      }))
      .subscribe({
        next: (items) => {
          this.headerAd = items[0];
        },
        error: () => {
          this.headerAd = undefined;
        },
      });
    this.clientContentService.findBreakingNews(true).subscribe({
      next: (items) => {
        this.breakingNews = items;
      },
      error: () => {
        this.breakingNews = [];
      },
    });
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.isScrolled = window.scrollY > 10;
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.isMenuOpen) {
      this.closeMenu();
    }
  }

  protected toggleMenu(): void {
    this.setMenuOpen(!this.isMenuOpen);
  }

  protected closeMenu(): void {
    this.setMenuOpen(false);
  }

  private setMenuOpen(open: boolean): void {
    this.isMenuOpen = open;
    document.body.style.overflow = open ? 'hidden' : '';
  }
}
