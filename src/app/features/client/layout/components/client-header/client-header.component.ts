import { Component, HostListener, Input } from '@angular/core';

@Component({
  selector: 'app-client-header',
  standalone: true,
  templateUrl: './client-header.component.html',
  styleUrl: './client-header.component.scss',
})
export class ClientHeaderComponent {
  @Input() currentPage = 'home';

  protected readonly dateFr = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  protected isScrolled = false;

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
