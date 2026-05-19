import { Component, HostListener, inject, Input, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';
import {
  AdImageItem,
  BreakingNewsItem,
  ClientContentService,
} from '../../../../core/services/client-content.service';

@Component({
  selector: 'app-client-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
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

  protected isScrolled = false;
  protected headerAd?: AdImageItem;
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
    this.clientContentService.findAdImages('header_main', true).subscribe({
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

  protected search(): void {
    const q = window.prompt('Rechercher dans Padel Magazine :');
    if (q) {
      window.alert(`Résultats pour « ${q} » — (démo)`);
    }
  }
}
