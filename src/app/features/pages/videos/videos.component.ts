import { Component } from '@angular/core';

type VideoItem = {
  title: string;
  duration: string;
  date: string;
  ph: string;
};

@Component({
  selector: 'app-videos-component',
  standalone: true,
  templateUrl: './videos.component.html',
  styleUrl: './videos.component.scss',
})
export class VideosComponent {
  protected isModalOpen = false;

  protected readonly videos: VideoItem[] = [
    { title: 'Open Dakar 2026 — Finale Diallo/Sow vs Fall/Traoré', duration: '1:48:22', date: '12 Avr', ph: 'court' },
    { title: 'Highlights Championnat U18 Sénégal', duration: '6:42', date: '11 Avr', ph: 'orange' },
    { title: 'Interview · Ibou Ndiaye, DTN Fédération Sénégalaise', duration: '18:30', date: '9 Avr', ph: 'charcoal' },
    { title: 'Coaching · La vibora en 5 exercices (Carlos Vega)', duration: '12:15', date: '8 Avr', ph: 'blue' },
    { title: 'WPT Mexico Open · Best of Galán-Lebrón', duration: '8:04', date: '7 Avr', ph: 'sunset' },
    { title: 'Coaching · Construire le point depuis le fond', duration: '9:18', date: '7 Avr', ph: 'green' },
    { title: 'Open Saly · Finale intégrale Fall/Camara', duration: '2:14:08', date: '3 Avr', ph: 'violet' },
    { title: 'Portrait vidéo · Aminata Ba, N°1 sénégalaise', duration: '7:55', date: '1 Avr', ph: 'red' },
    { title: 'Highlights APP Miami · Chingotto sacré', duration: '5:30', date: '5 Avr', ph: 'charcoal' },
  ];
}
