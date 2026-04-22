import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-client-footer',
  standalone: true,
  templateUrl: './client-footer.component.html',
  styleUrl: './client-footer.component.scss',
})
export class ClientFooterComponent {
  protected showBackTop = false;
  protected cookieHidden = false;

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.showBackTop = window.scrollY > 400;
  }

  protected backTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  protected closeCookie(): void {
    this.cookieHidden = true;
  }

  protected cookieInfo(): void {
    window.alert('Politique cookies — démo');
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
