import { Component, HostListener, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

const COOKIE_BANNER_DISMISSED_KEY = 'pm_cookie_banner_dismissed';

@Component({
  selector: 'app-client-footer',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './client-footer.component.html',
  styleUrl: './client-footer.component.scss',
})
export class ClientFooterComponent implements OnInit {
  protected showBackTop = false;
  protected cookieHidden = false;

  ngOnInit(): void {
    try {
      if (globalThis.localStorage?.getItem(COOKIE_BANNER_DISMISSED_KEY)) {
        this.cookieHidden = true;
      }
    } catch {
      /* navigation privée ou storage indisponible */
    }
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.showBackTop = window.scrollY > 400;
  }

  protected backTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  protected closeCookie(): void {
    this.dismissCookieBanner();
  }

  protected cookieInfo(): void {
    window.alert('Politique cookies — démo');
    this.dismissCookieBanner();
  }

  private dismissCookieBanner(): void {
    this.cookieHidden = true;
    try {
      globalThis.localStorage?.setItem(COOKIE_BANNER_DISMISSED_KEY, '1');
    } catch {
      /* ignore */
    }
  }

  protected miniNewsSubmit(event: Event): void {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const input = form.querySelector('input');
    if (input) {
      input.value = '';
    }
    window.alert('Merci ! Vous recevrez notre prochaine newsletter très bientôt.');
  }
}
