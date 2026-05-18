import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';
import { ClientHeaderComponent } from './client-header/client-header.component';
import { ClientFooterComponent } from './client-footer/client-footer.component';
import { NewsletterSubscribeModalComponent } from '../../../shared/components/newsletter-subscribe-modal/newsletter-subscribe-modal.component';

@Component({
  selector: 'app-client-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    ClientHeaderComponent,
    ClientFooterComponent,
    NewsletterSubscribeModalComponent,
  ],
  templateUrl: './client-layout.component.html',
  styleUrl: './client-layout.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class ClientLayoutComponent implements OnInit, OnDestroy {
  private static readonly DEFAULT_TITLE =
    'Padel Magazine — Le padel au Sénégal et en Afrique francophone';
  private static readonly DEFAULT_DESCRIPTION =
    "Le premier magazine en ligne dédié au padel au Sénégal et en Afrique francophone. Actualités, résultats, classements, coaching et live.";
  private routerSubscription: Subscription | null = null;
  protected currentPage = 'home';

  constructor(
    @Inject(DOCUMENT) private readonly document: Document,
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly title: Title,
    private readonly meta: Meta
  ) {}

  ngOnInit(): void {
    this.setPageFromUrl(this.router.url);
    this.updateSeoFromRoute();
    this.routerSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.setPageFromUrl(event.urlAfterRedirects);
        this.updateSeoFromRoute();
      }
    });
  }

  ngOnDestroy(): void {
    this.routerSubscription?.unsubscribe();
    delete this.document.body.dataset['page'];
  }

  private setPageFromUrl(url: string): void {
    const cleanUrl = url.split('?')[0].split('#')[0];
    const segment = cleanUrl.replace(/^\/+/, '').split('/')[0] || 'home';
    this.currentPage = segment;
    this.document.body.dataset['page'] = segment;
  }

  private updateSeoFromRoute(): void {
    let route = this.activatedRoute;
    while (route.firstChild) {
      route = route.firstChild;
    }

    const data = route.snapshot.data;
    const title = data['title'] ?? ClientLayoutComponent.DEFAULT_TITLE;
    const description = data['description'] ?? ClientLayoutComponent.DEFAULT_DESCRIPTION;

    this.title.setTitle(title);
    this.meta.updateTag({ name: 'description', content: description });
  }
}
