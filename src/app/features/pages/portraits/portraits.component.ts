import { Component, OnInit } from '@angular/core';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import {
  PortraitCategoryItem,
  PortraitItem,
  PortraitsService,
} from '../../../core/services/portraits.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-portraits-component',
  standalone: true,
  imports: [SidebarComponent],
  templateUrl: './portraits.component.html',
  styleUrl: './portraits.component.scss',
})
export class PortraitsComponent implements OnInit {
  protected isLoading = false;
  protected errorMessage = '';

  protected categories: PortraitCategoryItem[] = [];
  protected activeCategoryId: string | 'all' = 'all';
  protected portraits: PortraitItem[] = [];
  protected filteredPortraits: PortraitItem[] = [];

  constructor(private readonly portraitsService: PortraitsService) {}

  ngOnInit(): void {
    this.load();
  }

  protected selectCategory(value: string | 'all'): void {
    this.activeCategoryId = value;
    this.applyFilter();
  }

  protected getPlayerPhotoUrl(portrait: PortraitItem): string | null {
    const photo = portrait.player?.profilePhoto ?? null;
    if (!photo) return null;
    if (photo.startsWith('http://') || photo.startsWith('https://')) return photo;
    const normalized = photo.startsWith('/') ? photo : `/${photo}`;
    return `${environment.apiUrl}${normalized}`;
  }

  protected getPortraitArticleLink(portrait: PortraitItem): string | null {
    const slug = portrait.article?.slug;
    if (!slug) return null;
    return `/actualites/${slug}`;
  }

  protected onPortraitClick(event: MouseEvent, portrait: PortraitItem): void {
    if (!this.getPortraitArticleLink(portrait)) {
      event.preventDefault();
    }
  }

  private load(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.portraitsService.findAllCategories().subscribe({
      next: (cats) => {
        this.categories = cats;
      },
      error: () => {
        this.categories = [];
      },
    });

    this.portraitsService.findAllPortraits().subscribe({
      next: (items) => {
        this.portraits = items;
        this.applyFilter();
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Impossible de charger les portraits.';
        this.portraits = [];
        this.filteredPortraits = [];
        this.isLoading = false;
      },
    });
  }

  private applyFilter(): void {
    if (this.activeCategoryId === 'all') {
      this.filteredPortraits = this.portraits;
      return;
    }
    this.filteredPortraits = this.portraits.filter(
      (p) => p.category?.id === this.activeCategoryId,
    );
  }
}
