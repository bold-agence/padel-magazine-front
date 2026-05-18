import { Component, HostListener } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NewsletterSubscribeService } from '../../../../core/services/newsletter-subscribe.service';

@Component({
  selector: 'app-client-footer',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './client-footer.component.html',
  styleUrl: './client-footer.component.scss',
})
export class ClientFooterComponent {
  protected showBackTop = false;

  constructor(
    private readonly newsletterSubscribeService: NewsletterSubscribeService,
  ) {}

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.showBackTop = window.scrollY > 400;
  }

  protected backTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  protected openNewsletter(): void {
    this.newsletterSubscribeService.open();
  }
}
