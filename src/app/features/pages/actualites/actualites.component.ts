import { Component } from '@angular/core';
import { NewsCardComponent } from '../../../shared/components/news-card/news-card.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';

type NewsArticle = {
  slug: string;
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
  selector: 'app-actualites-component',
  standalone: true,
  imports: [SidebarComponent, NewsCardComponent],
  templateUrl: './actualites.component.html',
  styleUrl: './actualites.component.scss',
})
export class ActualitesComponent {
  protected readonly articles: NewsArticle[] = [
    {
      slug: 'championnat-national-u18-omar-diallo-survole-competition',
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
      slug: 'saly-padel-club-ouvre-ses-portes-6-nouvelles-pistes',
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
      slug: 'interview-ibou-ndiaye-top-20-africain-cinq-ans',
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
      slug: 'wpt-africa-series-dakar-juin-padel-pro-debarque',
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
      slug: 'open-dakar-2026-diallo-sow-sacres-champions',
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
      slug: 'wpt-2026-galan-lebron-intouchables-mexique-open',
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
      slug: '5-exercices-transformer-vibora-arme-fatale',
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
      slug: 'federation-senegalaise-plan-strategique-2026-2030',
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
      slug: 'app-tour-miami-chingotto-sacre-finale',
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
