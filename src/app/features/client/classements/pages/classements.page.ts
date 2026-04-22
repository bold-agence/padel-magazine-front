import { Component } from '@angular/core';
import { SidebarComponent } from '../../../../shared/components/sidebar/sidebar.component';

type PodiumEntry = {
  rank: number;
  medalClass: 'gold' | 'silver' | 'bronze';
  phClass: string;
  name: string;
  points: string;
};

type RankingEntry = {
  rank: string;
  rankColor?: string;
  player: string;
  club: string;
  points: string;
  evolution: string;
  evolutionColor: string;
};

@Component({
  selector: 'app-classements-page',
  standalone: true,
  imports: [SidebarComponent],
  templateUrl: './classements.page.html',
  styleUrl: './classements.page.scss',
})
export class ClassementsPage {
  protected readonly podium: PodiumEntry[] = [
    {
      rank: 1,
      medalClass: 'gold',
      phClass: 'court',
      name: 'Abdoulaye Diallo',
      points: '1 420 pts · Club Almadies',
    },
    {
      rank: 2,
      medalClass: 'silver',
      phClass: 'charcoal',
      name: 'Moussa Sow',
      points: '1 385 pts · Club Almadies',
    },
    {
      rank: 3,
      medalClass: 'bronze',
      phClass: 'sunset',
      name: 'Boubacar Fall',
      points: '1 290 pts · Yoff Padel',
    },
  ];

  protected readonly ranking: RankingEntry[] = [
    { rank: '1', rankColor: '#D4AF37', player: 'A. Diallo', club: 'Club Almadies · 🇸🇳', points: '1 420', evolution: '▲ +2', evolutionColor: 'var(--green)' },
    { rank: '2', rankColor: '#A8A8A8', player: 'M. Sow', club: 'Club Almadies · 🇸🇳', points: '1 385', evolution: '● =', evolutionColor: 'var(--gray)' },
    { rank: '3', rankColor: '#B87333', player: 'B. Fall', club: 'Yoff Padel · 🇸🇳', points: '1 290', evolution: '▼ -1', evolutionColor: 'var(--red)' },
    { rank: '4', player: 'I. Camara', club: 'Dakar Padel Center · 🇸🇳', points: '1 240', evolution: '▲ +1', evolutionColor: 'var(--green)' },
    { rank: '5', player: 'K. Traoré', club: 'Club Almadies · 🇸🇳', points: '1 190', evolution: '● =', evolutionColor: 'var(--gray)' },
    { rank: '6', player: 'O. Diallo', club: 'Club Almadies · 🇸🇳', points: '1 120', evolution: '▲ +3', evolutionColor: 'var(--green)' },
    { rank: '7', player: 'L. Gueye', club: 'Saly Padel · 🇸🇳', points: '1 045', evolution: '▼ -2', evolutionColor: 'var(--red)' },
    { rank: '8', player: 'P. Diop', club: 'Yoff Padel · 🇸🇳', points: '980', evolution: '● =', evolutionColor: 'var(--gray)' },
    { rank: '9', player: 'D. Ndiaye', club: 'TGS Arena · 🇸🇳', points: '925', evolution: '▲ +1', evolutionColor: 'var(--green)' },
    { rank: '10', player: 'T. Fall', club: 'Dakar Padel Center · 🇸🇳', points: '880', evolution: '▼ -3', evolutionColor: 'var(--red)' },
  ];
}
