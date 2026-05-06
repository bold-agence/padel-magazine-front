import { Component } from '@angular/core';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';

type PodiumEntry = {
  rank: number;
  medalClass: 'gold' | 'silver' | 'bronze';
  phClass: string;
  name: string;
  points: string;
};

type RankingRow = {
  rank: number;
  player: string;
  pointsNow: number;
  tournaments: number;
  previousRank: number;
  pointsPrev: number;
  rankDelta: string; // ex: +2, -1, -
  pointsDelta: string; // ex: +75, -90, -
};

@Component({
  selector: 'app-classements-component',
  standalone: true,
  imports: [SidebarComponent],
  templateUrl: './classements.component.html',
  styleUrl: './classements.component.scss',
})
export class ClassementsComponent {
  protected activeTab: 'men' | 'women' = 'men';

  protected selectTab(tab: 'men' | 'women'): void {
    this.activeTab = tab;
  }

  protected get currentTitle(): string {
    return this.activeTab === 'women' ? 'Classement Femmes' : 'Classement Hommes';
  }

  protected get currentPodium(): PodiumEntry[] {
    return this.activeTab === 'women' ? this.podiumWomen : this.podiumMen;
  }

  protected get currentRanking(): RankingRow[] {
    return this.activeTab === 'women' ? this.rankingWomen : this.rankingMen;
  }

  protected readonly podiumMen: PodiumEntry[] = [
    {
      rank: 1,
      medalClass: 'gold',
      phClass: 'court',
      name: 'Maher Hachem',
      points: '3 400 pts',
    },
    {
      rank: 2,
      medalClass: 'silver',
      phClass: 'charcoal',
      name: 'Youssef Ait',
      points: '2 900 pts',
    },
    {
      rank: 3,
      medalClass: 'bronze',
      phClass: 'sunset',
      name: 'Hamoude El Hadi',
      points: '2 800 pts',
    },
  ];

  protected readonly rankingMen: RankingRow[] = [
    { rank: 1, player: 'Maher Hachem', pointsNow: 3400, tournaments: 18, previousRank: 1, pointsPrev: 3300, rankDelta: '-', pointsDelta: '+100' },
    { rank: 2, player: 'Youssef Ait', pointsNow: 2900, tournaments: 19, previousRank: 3, pointsPrev: 2950, rankDelta: '+1', pointsDelta: '-50' },
    { rank: 3, player: 'Hamoude El Hadi', pointsNow: 2800, tournaments: 17, previousRank: 2, pointsPrev: 3050, rankDelta: '-1', pointsDelta: '-250' },
    { rank: 3, player: 'Omar Ka', pointsNow: 2800, tournaments: 15, previousRank: 4, pointsPrev: 2800, rankDelta: '+1', pointsDelta: '-' },
    { rank: 5, player: 'Karim Karrit', pointsNow: 2650, tournaments: 19, previousRank: 5, pointsPrev: 2650, rankDelta: '-', pointsDelta: '-' },
    { rank: 6, player: 'Yannick Languina', pointsNow: 2625, tournaments: 13, previousRank: 6, pointsPrev: 2625, rankDelta: '-', pointsDelta: '-' },
    { rank: 7, player: 'Wael Fakhry', pointsNow: 2300, tournaments: 18, previousRank: 7, pointsPrev: 2250, rankDelta: '-', pointsDelta: '+50' },
    { rank: 8, player: 'Mohamed Daffé', pointsNow: 2125, tournaments: 20, previousRank: 9, pointsPrev: 2125, rankDelta: '+1', pointsDelta: '-' },
    { rank: 8, player: 'Hugo Houedessou', pointsNow: 2125, tournaments: 14, previousRank: 9, pointsPrev: 2125, rankDelta: '+1', pointsDelta: '-' },
    { rank: 10, player: 'Mahmoud Joubaily', pointsNow: 2100, tournaments: 16, previousRank: 12, pointsPrev: 2025, rankDelta: '+2', pointsDelta: '+75' },
  ];

  protected readonly podiumWomen: PodiumEntry[] = [
    { rank: 1, medalClass: 'gold', phClass: 'violet', name: 'Marina Fakhry', points: '1 550 pts' },
    { rank: 2, medalClass: 'silver', phClass: 'sunset', name: 'Gwendoline Laurent Daw', points: '1 473 pts' },
    { rank: 3, medalClass: 'bronze', phClass: 'court', name: 'Karine Ghozayel', points: '1 450 pts' },
  ];

  protected readonly rankingWomen: RankingRow[] = [
    { rank: 1, player: 'Marina Fakhry', pointsNow: 1550, tournaments: 8, previousRank: 3, pointsPrev: 1550, rankDelta: '+2', pointsDelta: '-' },
    { rank: 2, player: 'Gwendoline Laurent Daw', pointsNow: 1473, tournaments: 8, previousRank: 2, pointsPrev: 1563, rankDelta: '-', pointsDelta: '-90' },
    { rank: 3, player: 'Karine Ghozayel', pointsNow: 1450, tournaments: 6, previousRank: 1, pointsPrev: 1700, rankDelta: '-2', pointsDelta: '-250' },
    { rank: 4, player: 'Mélina Fawaz', pointsNow: 1360, tournaments: 6, previousRank: 4, pointsPrev: 1520, rankDelta: '-', pointsDelta: '-160' },
    { rank: 5, player: 'Maya Issa', pointsNow: 1053, tournaments: 10, previousRank: 5, pointsPrev: 1053, rankDelta: '-', pointsDelta: '-' },
    { rank: 6, player: 'Sarah Sayegh', pointsNow: 1050, tournaments: 10, previousRank: 6, pointsPrev: 1050, rankDelta: '-', pointsDelta: '-' },
    { rank: 7, player: 'Fati Zahra Youssoufi', pointsNow: 1015, tournaments: 13, previousRank: 7, pointsPrev: 1015, rankDelta: '-', pointsDelta: '-' },
    { rank: 8, player: 'Dounia Fenaiche', pointsNow: 970, tournaments: 13, previousRank: 8, pointsPrev: 945, rankDelta: '-', pointsDelta: '+25' },
    { rank: 9, player: 'Sarah Salhab', pointsNow: 935, tournaments: 9, previousRank: 10, pointsPrev: 935, rankDelta: '+1', pointsDelta: '-' },
    { rank: 10, player: 'Lilia Salhab', pointsNow: 925, tournaments: 5, previousRank: 11, pointsPrev: 925, rankDelta: '+1', pointsDelta: '-' },
  ];
}
