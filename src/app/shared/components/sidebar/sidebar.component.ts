import { Component } from '@angular/core';

type PopularItem = {
  cat: string;
  cls: string;
  title: string;
  phClass: string;
  age: string;
};

@Component({
  selector: 'app-sidebar',
  standalone: true,
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  protected readonly popular: PopularItem[] = [
    {
      cat: 'Résultats',
      cls: 'results',
      title: 'Open Dakar 2026 : Diallo et Sow sacrés champions',
      phClass: 'green',
      age: 'il y a 1j',
    },
    {
      cat: 'Coaching',
      cls: 'coaching',
      title: '5 exercices pour transformer votre vibora en arme fatale',
      phClass: 'charcoal',
      age: 'il y a 2j',
    },
    {
      cat: 'Classements',
      cls: 'classements',
      title: 'WPT 2026 : Galán et Lebrón intouchables après Mexique Open',
      phClass: 'sunset',
      age: 'il y a 3j',
    },
    {
      cat: 'Interview',
      cls: 'interview',
      title: 'Ibou Ndiaye DTN : « Dans cinq ans, top 20 africain »',
      phClass: 'violet',
      age: 'il y a 4j',
    },
    {
      cat: 'Actualités',
      cls: 'actualites',
      title: 'WPT Africa Series Dakar en juin : le padel pro débarque',
      phClass: 'blue',
      age: 'il y a 5j',
    },
  ];

  protected newsletterSubmit(event: Event): void {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const input = form.querySelector('input');
    const message = form.querySelector('.msg');

    if (input) {
      input.value = '';
    }
    if (message) {
      message.textContent =
        'Merci ! Vous recevrez notre prochaine newsletter très bientôt.';
    }
  }
}
