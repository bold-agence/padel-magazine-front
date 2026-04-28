import { Component } from '@angular/core';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';

type ResultRow = {
  date: string;
  tournament: string;
  color: string;
  round: string;
  winners: string;
  score: string;
  losers: string;
};

@Component({
  selector: 'app-resultats-component',
  standalone: true,
  imports: [SidebarComponent],
  templateUrl: './resultats.component.html',
  styleUrl: './resultats.component.scss',
})
export class ResultatsComponent {
  protected readonly results: ResultRow[] = [
    {
      date: '12 Avr',
      tournament: 'Open Dakar',
      color: 'var(--red)',
      round: 'Finale',
      winners: 'A. Diallo / M. Sow',
      score: '6-3, 6-4',
      losers: 'B. Fall / K. Traoré',
    },
    {
      date: '11 Avr',
      tournament: 'Champ. U18',
      color: 'var(--green)',
      round: 'Finale',
      winners: 'O. Diallo',
      score: '6-2, 6-1',
      losers: 'S. Mbaye',
    },
    {
      date: '11 Avr',
      tournament: 'Champ. Féminin',
      color: 'var(--orange)',
      round: '1/2 finale',
      winners: 'F. Mbaye',
      score: '7-5, 6-2',
      losers: 'A. Diouf',
    },
    {
      date: '10 Avr',
      tournament: 'Open Dakar',
      color: 'var(--red)',
      round: '1/2 finale',
      winners: 'A. Diallo / M. Sow',
      score: '6-4, 7-5',
      losers: 'L. Gueye / P. Diop',
    },
    {
      date: '9 Avr',
      tournament: 'Circuit Dakar',
      color: 'var(--violet)',
      round: '1/4 finale',
      winners: 'O. Diallo / I. Ndiaye',
      score: '7-6, 6-3',
      losers: 'C. Ba / T. Fall',
    },
    {
      date: '7 Avr',
      tournament: 'WPT Mexico',
      color: 'var(--coral)',
      round: 'Finale',
      winners: 'Galán / Lebrón 🇪🇸',
      score: '6-4, 7-6',
      losers: 'Chingotto / Tello 🇦🇷',
    },
    {
      date: '5 Avr',
      tournament: 'APP Miami',
      color: 'var(--coral)',
      round: 'Finale',
      winners: 'Chingotto / Paquito 🇦🇷🇪🇸',
      score: '7-5, 6-4',
      losers: 'Coello / Yanguas 🇪🇸',
    },
    {
      date: '3 Avr',
      tournament: 'Open Saly',
      color: 'var(--green)',
      round: 'Finale',
      winners: 'B. Fall / K. Traoré',
      score: '6-3, 3-6, 7-5',
      losers: 'I. Camara / D. Ndiaye',
    },
  ];
}
