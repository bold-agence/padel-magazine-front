import { Component, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

interface TeamMember {
  name: string;
  role: string;
  imageFile: string;
}

@Component({
  selector: 'app-apropos-component',
  standalone: true,
  templateUrl: './apropos.component.html',
  styleUrl: './apropos.component.scss',
})
export class AproposComponent {
  private readonly sanitizer = inject(DomSanitizer);

  protected readonly heroImageUrl = this.publicImage(
    'Page À Propos  Le padel sénégalais mérite son magazine.jpg',
  );

  protected readonly contactAddress = '15 rue Huart, Dakar, Sénégal';

  protected readonly safeMapEmbedUrl: SafeResourceUrl =
    this.sanitizer.bypassSecurityTrustResourceUrl(
      'https://www.google.com/maps?q=' +
        encodeURIComponent(this.contactAddress) +
        '&hl=fr&z=16&output=embed',
    );

  protected readonly team: TeamMember[] = [
    { name: 'Mamadou Diop', role: 'Rédacteur en chef', imageFile: 'Mamadou Diop.jpg' },
    { name: 'Fatou Ba', role: 'Journaliste · Portraits', imageFile: 'Fatou Ba.jpg' },
    { name: 'Ibrahima Ndiaye', role: 'Journaliste · International', imageFile: 'Ibrahima Ndiaye.jpg' },
    { name: 'Carlos Vega', role: 'Coach · Technique', imageFile: 'Carlos Vega.jpg' },
  ];

  protected teamImageUrl(filename: string): string {
    return this.publicImage(filename);
  }

  private publicImage(filename: string): string {
    return '/images/' + encodeURIComponent(filename);
  }

  protected contactSubmit(event: Event): void {
    event.preventDefault();
    window.alert('Message envoyé. Merci !');
  }
}
