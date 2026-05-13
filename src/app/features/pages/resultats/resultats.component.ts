import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  LatestResult,
  LatestResultCategory,
  LatestResultsService,
} from '../../../core/services/latest-results.service';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';

type ResultRow = LatestResult & {
  periodLabel: string;
  dotColor: string;
};

@Component({
  selector: 'app-resultats-component',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  templateUrl: './resultats.component.html',
  styleUrl: './resultats.component.scss',
})
export class ResultatsComponent implements OnInit {
  protected readonly categoryChips: {
    label: string;
    value: LatestResultCategory;
  }[] = [
    { label: 'Tous', value: 'all' },
    { label: 'Hommes', value: 'men' },
    { label: 'Femmes', value: 'women' },
  ];

  protected results: ResultRow[] = [];
  protected isLoading = false;
  protected loadError = '';
  protected activeCategory: LatestResultCategory = 'all';
  protected currentPage = 1;
  protected readonly pageSize = 8;
  protected totalPages = 1;
  protected hasNextPage = false;
  protected hasPreviousPage = false;

  constructor(private readonly latestResultsService: LatestResultsService) {}

  ngOnInit(): void {
    this.loadResults();
  }

  protected setCategory(category: LatestResultCategory): void {
    if (this.activeCategory === category || this.isLoading) return;
    this.activeCategory = category;
    this.currentPage = 1;
    this.loadResults();
  }

  protected goToPage(page: number): void {
    if (
      page < 1 ||
      page > this.totalPages ||
      page === this.currentPage ||
      this.isLoading
    ) {
      return;
    }

    this.currentPage = page;
    this.loadResults();
  }

  protected get pageNumbers(): number[] {
    const maxVisiblePages = 5;
    const visibleCount = Math.min(maxVisiblePages, this.totalPages);
    const start = Math.max(
      1,
      Math.min(this.currentPage - 2, this.totalPages - visibleCount + 1),
    );

    return Array.from({ length: visibleCount }, (_, index) => start + index);
  }

  private loadResults(): void {
    this.isLoading = true;
    this.loadError = '';

    this.latestResultsService
      .findPaginated(this.currentPage, this.pageSize, this.activeCategory)
      .subscribe({
        next: ({ items, pagination }) => {
          this.results = items.map((item) => ({
            ...item,
            periodLabel: this.formatPeriodLabel(
              item.startDate,
              item.endDate,
              item.resultDate,
            ),
            dotColor: this.categoryColor(item.category),
          }));
          this.totalPages = pagination.totalPages;
          this.hasNextPage = pagination.hasNextPage;
          this.hasPreviousPage = pagination.hasPreviousPage;
          this.isLoading = false;
        },
        error: () => {
          this.results = [];
          this.totalPages = 1;
          this.hasNextPage = false;
          this.hasPreviousPage = false;
          this.loadError =
            'Les derniers résultats sont actuellement indisponibles.';
          this.isLoading = false;
        },
      });
  }

  private formatPeriodLabel(
    startDate?: string | null,
    endDate?: string | null,
    fallbackDate?: string,
  ): string {
    if (!startDate || !endDate) {
      return fallbackDate ? this.formatDateLabel(fallbackDate) : '';
    }

    const start = this.parseDate(startDate);
    const end = this.parseDate(endDate);
    if (!start || !end) return `${startDate} - ${endDate}`;

    if (
      start.getMonth() === end.getMonth() &&
      start.getFullYear() === end.getFullYear()
    ) {
      return `${start.getDate()}-${this.formatDateLabel(endDate)}`;
    }

    return `${this.formatDateLabel(startDate)} - ${this.formatDateLabel(endDate)}`;
  }

  private formatDateLabel(value: string): string {
    const date = this.parseDate(value);
    if (!date) return value;

    const monthLabel = new Intl.DateTimeFormat('fr-FR', {
      month: 'short',
    })
      .format(date)
      .replace('.', '');

    return `${date.getDate()} ${monthLabel.charAt(0).toUpperCase()}${monthLabel.slice(1)}`;
  }

  private parseDate(value: string): Date | null {
    const [year, month, day] = value.split('-').map(Number);
    if (!year || !month || !day) return null;
    return new Date(year, month - 1, day);
  }

  private categoryColor(category: LatestResult['category']): string {
    const colors: Record<LatestResult['category'], string> = {
      men: '#df4548',
      women: '#f59e1b',
    };
    return colors[category] ?? colors.men;
  }
}
