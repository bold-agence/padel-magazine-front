import { Component } from '@angular/core';
import { SidebarComponent } from '../../../../shared/components/sidebar/sidebar.component';

type Portrait = {
  name: string;
  rank: string;
  pts: string;
  club: string;
  flag: string;
  shot: string;
  ph: string;
};

@Component({
  selector: 'app-portraits-page',
  standalone: true,
  imports: [SidebarComponent],
  templateUrl: './portraits.page.html',
  styleUrl: './portraits.page.scss',
})
export class PortraitsPage {
  protected readonly players: Portrait[] = [
    { name: 'Abdoulaye Diallo', rank: 'N°1 Sénégal ♂', pts: '1 420', club: 'Club Almadies', flag: '🇸🇳', shot: 'Vibora', ph: 'court' },
    { name: 'Oumar Diallo', rank: 'Espoir U18', pts: '890', club: 'Club Almadies', flag: '🇸🇳', shot: 'Smash par trois', ph: 'charcoal' },
    { name: 'Aminata Ba', rank: 'N°1 Sénégal ♀', pts: '1 380', club: 'Club Almadies', flag: '🇸🇳', shot: 'Bandeja', ph: 'sunset' },
    { name: 'Alejandro Galán', rank: 'N°1 Mondial WPT', pts: '14 850', club: 'Espagne', flag: '🇪🇸', shot: 'Drive lifté', ph: 'orange' },
    { name: 'Moussa Sow', rank: 'N°2 Sénégal ♂', pts: '1 385', club: 'Club Almadies', flag: '🇸🇳', shot: 'Volée coupée', ph: 'violet' },
    { name: 'Fatou Mbaye', rank: 'N°2 Sénégal ♀', pts: '1 210', club: 'Yoff Padel', flag: '🇸🇳', shot: 'Globe', ph: 'blue' },
    { name: 'Arturo Coello', rank: 'N°5 Mondial WPT', pts: '11 780', club: 'Espagne', flag: '🇪🇸', shot: 'Smash x3', ph: 'red' },
    { name: 'Boubacar Fall', rank: 'N°3 Sénégal ♂', pts: '1 290', club: 'Yoff Padel', flag: '🇸🇳', shot: 'Chiquita', ph: 'green' },
    { name: 'Federico Chingotto', rank: 'N°2 Mondial WPT', pts: '13 420', club: 'Argentine', flag: '🇦🇷', shot: 'Remate', ph: 'charcoal' },
  ];
}
