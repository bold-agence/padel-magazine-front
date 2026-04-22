import { Component } from '@angular/core';
import { SidebarComponent } from '../../../../shared/components/sidebar/sidebar.component';

type CoachingCard = {
  badge: string;
  ph: string;
  title: string;
  sub: string;
  author: string;
  date: string;
};

@Component({
  selector: 'app-coaching-page',
  standalone: true,
  imports: [SidebarComponent],
  templateUrl: './coaching.page.html',
  styleUrl: './coaching.page.scss',
})
export class CoachingPage {
  protected readonly cards: CoachingCard[] = [
    {
      badge: 'Tactique',
      ph: 'green',
      title: 'Construire le point depuis le fond de court',
      sub: "Les 3 déclencheurs qui font basculer l'échange.",
      author: 'C. Vega',
      date: '7 Avr',
    },
    {
      badge: 'Débutant',
      ph: 'court',
      title: 'Les 10 règles du padel à connaître',
      sub: 'Service, grillage, règle des 3 rebonds.',
      author: 'C. Vega',
      date: '5 Avr',
    },
    {
      badge: 'Physique',
      ph: 'charcoal',
      title: 'Préparation physique : 4 circuits à faire chez soi',
      sub: 'Mobilité, gainage, explosivité.',
      author: 'F. Diagne',
      date: '2 Avr',
    },
    {
      badge: 'Mental',
      ph: 'violet',
      title: 'Gérer la pression en finale : le guide complet',
      sub: 'Respiration, routines, ancrages.',
      author: 'A. Ndao',
      date: '30 Mar',
    },
    {
      badge: 'Technique',
      ph: 'blue',
      title: 'La bandeja parfaite en 6 étapes',
      sub: 'Timing, placement, effet.',
      author: 'C. Vega',
      date: '26 Mar',
    },
    {
      badge: 'Vidéo',
      ph: 'red',
      title: 'Analyse vidéo : retournement sur grille',
      sub: 'Décomposition au ralenti.',
      author: 'C. Vega',
      date: '22 Mar',
    },
  ];
}
