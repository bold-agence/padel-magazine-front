import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';
import { ClientHeaderComponent } from './components/client-header/client-header.component';
import { ClientFooterComponent } from './components/client-footer/client-footer.component';

@Component({
  selector: 'app-client-layout',
  standalone: true,
  imports: [RouterOutlet, ClientHeaderComponent, ClientFooterComponent],
  templateUrl: './client-layout.component.html',
  styleUrl: './client-layout.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class ClientLayoutComponent implements OnInit, OnDestroy {
  private routerSubscription: Subscription | null = null;
  protected currentPage = 'home';

  constructor(
    @Inject(DOCUMENT) private readonly document: Document,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.setPageFromUrl(this.router.url);
    this.routerSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.setPageFromUrl(event.urlAfterRedirects);
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
}
