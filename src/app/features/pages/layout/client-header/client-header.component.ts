import { Component, HostListener, Input, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
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

  protected readonly dateFr = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  protected isScrolled = false;
  protected headerAd?: AdImageItem;
  protected breakingNews: BreakingNewsItem[] = [];

  constructor(private readonly clientContentService: ClientContentService) {}

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

  protected toggleMenu(): void {
    const navLinks = document.getElementById('navLinks');
    navLinks?.classList.toggle('open');
  }

  protected search(): void {
    const q = window.prompt('Rechercher dans Padel Magazine :');
    if (q) {
      window.alert(`Résultats pour « ${q} » — (démo)`);
    }
  }
}
