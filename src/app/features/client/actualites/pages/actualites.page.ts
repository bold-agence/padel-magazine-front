import { Component } from '@angular/core';
import { SidebarComponent } from '../../../../shared/components/sidebar/sidebar.component';

type NewsArticle = {
  cat: string;
  cls: string;
  ph: string;
  title: string;
  auth: string;
  date: string;
  read: string;
  cardClass: string;
};

@Component({
  selector: 'app-actualites-page',
  standalone: true,
  imports: [SidebarComponent],
  templateUrl: './actualites.page.html',
  styleUrl: './actualites.page.scss',
})
export class ActualitesPage {
  protected readonly articles: NewsArticle[] = [
    {
      cat: 'Résultats',
      cls: 'results',
      ph: 'orange',
      title: 'Championnat National U18 : Oumar Diallo survole la compétition',
      auth: 'M. Diop',
      date: '11 Avr',
      read: '5 min',
      cardClass: 'red',
    },
    {
      cat: 'Actualités',
      cls: 'actualites',
      ph: 'court',
      title: 'Le Saly Padel Club ouvre ses portes avec 6 nouvelles pistes',
      auth: 'A. Sène',
      date: '10 Avr',
      read: '3 min',
      cardClass: '',
    },
    {
      cat: 'Interview',
      cls: 'interview',
      ph: 'charcoal',
      title: 'Interview Ibou Ndiaye DTN : « Dans cinq ans, top 20 africain »',
      auth: 'F. Ba',
      date: '9 Avr',
      read: '7 min',
      cardClass: 'blue',
    },
    {
      cat: 'Actualités',
      cls: 'actualites',
      ph: 'green',
      title: 'WPT Africa Series Dakar en juin : le padel pro débarque',
      auth: 'Rédaction',
      date: '29 Mar',
      read: '4 min',
      cardClass: '',
    },
    {
      cat: 'Résultats',
      cls: 'results',
      ph: 'sunset',
      title: 'Open Dakar 2026 : Diallo et Sow sacrés champions',
      auth: 'M. Diop',
      date: '12 Avr',
      read: '6 min',
      cardClass: 'red',
    },
    {
      cat: 'Classements',
      cls: 'classements',
      ph: 'violet',
      title: 'WPT 2026 : Galán et Lebrón intouchables après Mexique Open',
      auth: 'I. Ndiaye',
      date: '10 Avr',
      read: '4 min',
      cardClass: 'violet',
    },
    {
      cat: 'Coaching',
      cls: 'coaching',
      ph: 'blue',
      title: '5 exercices pour transformer votre vibora en arme fatale',
      auth: 'C. Vega',
      date: '8 Avr',
      read: '8 min',
      cardClass: 'blue',
    },
    {
      cat: 'Actualités',
      cls: 'actualites',
      ph: 'charcoal',
      title: 'Fédération Sénégalaise : un plan stratégique 2026-2030',
      auth: 'A. Sène',
      date: '4 Avr',
      read: '5 min',
      cardClass: '',
    },
    {
      cat: 'International',
      cls: 'international',
      ph: 'sunset',
      title: 'APP Tour Miami : Chingotto sacré en finale',
      auth: 'I. Ndiaye',
      date: '8 Avr',
      read: '3 min',
      cardClass: 'coral',
    },
  ];
}
