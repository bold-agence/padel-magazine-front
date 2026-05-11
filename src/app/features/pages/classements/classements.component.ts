import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize, map, switchMap, tap } from 'rxjs/operators';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import {
  ClassementDetailDto,
  ClassementLineDto,
  ClassementSummaryDto,
  ClassementsService,
} from '../../../core/services/classements.service';

type PodiumEntry = {
  rank: number;
  medalClass: 'gold' | 'silver' | 'bronze';
  phClass: string;
  name: string;
  points: string;
};

export type RankingRow = {
  id: string;
  rank: number;
  player: string;
  pointsNow: number;
  tournaments: number;
  previousRank: number;
  pointsPrev: number;
  rankDelta: string;
  pointsDelta: string;
};

const PODIUM_PH = ['court', 'charcoal', 'sunset', 'violet'] as const;

/** Nombre de lignes du tableau par page (pagination uniquement côté client) */
const RANKING_PAGE_SIZE = 15;

@Component({
  selector: 'app-classements-component',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  templateUrl: './classements.component.html',
  styleUrl: './classements.component.scss',
})
export class ClassementsComponent implements OnInit {
  protected summaries: ClassementSummaryDto[] = [];
  /** Détail chargé par id (lignes incluses) */
  protected detailsById: Record<string, ClassementDetailDto> = {};
  protected activeId: string | null = null;

  protected isLoading = true;
  protected loadError = '';

  /** Page courante du tableau (1-based), réinitialisée au changement d’onglet */
  protected currentPage = 1;

  /** Exposé au template pour la condition d’affichage de la pagination */
  protected readonly rankingPageSize = RANKING_PAGE_SIZE;

  constructor(private readonly classementsService: ClassementsService) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.loadError = '';
    this.classementsService
      .findAllSummaries()
      .pipe(
        switchMap((summaries) => {
          this.summaries = summaries;
          this.detailsById = {};
          this.activeId = null;
          if (!summaries.length) {
            return of(null);
          }
          this.activeId = summaries[0].id;
          return forkJoin(
            summaries.map((s) =>
              this.classementsService.findOne(s.id).pipe(
                catchError(() => of(null)),
                map((detail) => ({ id: s.id, detail })),
              ),
            ),
          ).pipe(
            tap((pairs) => {
              for (const { id, detail } of pairs) {
                if (detail) {
                  this.detailsById[id] = detail;
                }
              }
            }),
          );
        }),
        catchError(() => {
          this.loadError = 'Impossible de charger les classements.';
          return of(null);
        }),
        finalize(() => {
          this.isLoading = false;
        }),
      )
      .subscribe();
  }

  protected selectTab(id: string): void {
    if (this.activeId !== id) {
      this.currentPage = 1;
    }
    this.activeId = id;
  }

  protected goToPage(page: number): void {
    const tp = this.totalPages;
    this.currentPage = Math.min(Math.max(1, page), tp);
  }

  /** Page affichée (borne si le classement raccourcit) */
  protected get displayedPage(): number {
    return Math.min(Math.max(1, this.currentPage), this.totalPages);
  }

  protected get totalPages(): number {
    const n = this.currentRanking.length;
    return Math.max(1, Math.ceil(n / this.rankingPageSize));
  }

  protected get pageNumbers(): number[] {
    return this.buildPageNumbers(this.displayedPage, this.totalPages);
  }

  protected get hasPreviousPage(): boolean {
    return this.displayedPage > 1;
  }

  protected get hasNextPage(): boolean {
    return this.displayedPage < this.totalPages;
  }

  /** Lignes affichées sur la page courante du tableau */
  protected get pagedRanking(): RankingRow[] {
    const all = this.currentRanking;
    const start = (this.displayedPage - 1) * this.rankingPageSize;
    return all.slice(start, start + this.rankingPageSize);
  }

  private buildPageNumbers(currentPage: number, totalPages: number): number[] {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, start + 4);
    const normalizedStart = Math.max(1, end - 4);
    return Array.from(
      { length: end - normalizedStart + 1 },
      (_, index) => normalizedStart + index,
    );
  }

  protected get currentDetail(): ClassementDetailDto | null {
    if (!this.activeId) return null;
    return this.detailsById[this.activeId] ?? null;
  }

  protected get currentTitle(): string {
    return this.currentDetail?.title ?? 'Classement';
  }

  protected get pointsNowHeader(): string {
    return this.currentDetail?.pointsNowLabel?.trim() || 'Points actuels';
  }

  protected get pointsPrevHeader(): string {
    return this.currentDetail?.pointsPrevLabel?.trim() || 'Points précédents';
  }

  protected get currentPodium(): PodiumEntry[] {
    const d = this.currentDetail;
    return d?.lines?.length ? this.buildPodium(d.lines) : [];
  }

  protected get currentRanking(): RankingRow[] {
    const d = this.currentDetail;
    return d?.lines?.length ? this.mapLines(d.lines) : [];
  }

  protected downloadCsv(): void {
    const rows = this.currentRanking;
    if (!rows.length) return;
    const sep = ';';
    const headers = [
      'Pos',
      'Joueur',
      this.pointsNowHeader,
      'Tournois',
      'Ancien pos',
      this.pointsPrevHeader,
      'Evol. pos',
      'Evol. points',
    ];
    const lines = [
      headers.join(sep),
      ...rows.map((r) =>
        [
          r.rank,
          this.escapeCsv(r.player),
          r.pointsNow,
          r.tournaments,
          r.previousRank,
          r.pointsPrev,
          this.escapeCsv(r.rankDelta),
          this.escapeCsv(r.pointsDelta),
        ].join(sep),
      ),
    ];
    const blob = new Blob(['\ufeff' + lines.join('\n')], {
      type: 'text/csv;charset=utf-8',
    });
    const slug = this.currentDetail?.slug ?? 'classement';
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `classement-${slug}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  private escapeCsv(value: string): string {
    const v = value.replace(/"/g, '""');
    return /[;\n\r"]/.test(v) ? `"${v}"` : v;
  }

  private mapLines(lines: ClassementLineDto[]): RankingRow[] {
    const sorted = [...lines].sort((a, b) => a.sortOrder - b.sortOrder);
    return sorted.map((line) => ({
      id: line.id,
      rank: line.rank,
      player: line.playerName?.trim() || '—',
      pointsNow: line.pointsNow,
      tournaments: line.tournaments,
      previousRank: line.previousRank,
      pointsPrev: line.pointsPrev,
      rankDelta: line.rankDelta ?? '-',
      pointsDelta: line.pointsDelta ?? '-',
    }));
  }

  private buildPodium(lines: ClassementLineDto[]): PodiumEntry[] {
    const sorted = [...lines].sort((a, b) => a.sortOrder - b.sortOrder);
    const medals: PodiumEntry['medalClass'][] = ['gold', 'silver', 'bronze'];
    return sorted.slice(0, 3).map((line, i) => ({
      rank: line.rank,
      medalClass: medals[i] ?? 'bronze',
      phClass: PODIUM_PH[i % PODIUM_PH.length],
      name: line.playerName?.trim() || '—',
      points: this.formatPoints(line.pointsNow),
    }));
  }

  private formatPoints(n: number): string {
    return `${n.toLocaleString('fr-FR')} pts`;
  }
}
