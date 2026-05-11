import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import {
  VideoDto,
  VideoTypeDto,
  VideosService,
} from '../../../core/services/videos.service';
import {
  extractYouTubeVideoId,
  youtubeEmbedUrl,
  youtubeThumbnailUrl,
} from '../../../core/utils/youtube.util';

export type VideoCardVm = VideoDto & {
  thumbUrl: string | null;
  embedUrl: string | null;
  dateLabel: string;
};

@Component({
  selector: 'app-videos-component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './videos.component.html',
  styleUrl: './videos.component.scss',
})
export class VideosComponent implements OnInit {
  protected isLoading = true;
  protected loadError = '';
  protected videoTypes: VideoTypeDto[] = [];
  /** « Tout » + filtres par type */
  protected activeTypeId: 'all' | string = 'all';
  protected videos: VideoCardVm[] = [];
  protected isModalOpen = false;
  protected selectedEmbedSafe: SafeResourceUrl | null = null;
  protected selectedTitle = '';

  constructor(
    private readonly videosService: VideosService,
    private readonly sanitizer: DomSanitizer,
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.loadError = '';
    forkJoin({
      types: this.videosService.findAllTypes().pipe(catchError(() => of([] as VideoTypeDto[]))),
      videos: this.videosService.findAllVideos().pipe(catchError(() => of([] as VideoDto[]))),
    })
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: ({ types, videos }) => {
          this.videoTypes = types;
          this.videos = videos.map((v) => this.toCardVm(v));
          if (!types.length && !videos.length) {
            this.loadError = '';
          }
        },
        error: () => {
          this.loadError = 'Impossible de charger les vidéos.';
        },
      });
  }

  protected setFilter(typeId: 'all' | string): void {
    this.activeTypeId = typeId;
  }

  protected get filteredVideos(): VideoCardVm[] {
    if (this.activeTypeId === 'all') return this.videos;
    return this.videos.filter((v) => v.videoType?.id === this.activeTypeId);
  }

  protected openVideo(v: VideoCardVm): void {
    if (!v.embedUrl) return;
    this.selectedTitle = v.title;
    this.selectedEmbedSafe = this.sanitizer.bypassSecurityTrustResourceUrl(v.embedUrl);
    this.isModalOpen = true;
  }

  protected closeModal(): void {
    this.isModalOpen = false;
    this.selectedEmbedSafe = null;
    this.selectedTitle = '';
  }

  /** Fermeture au clic sur la zone assombrie (pas sur le lecteur ni la carte blanche). */
  protected onModalBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  private toCardVm(v: VideoDto): VideoCardVm {
    const id = extractYouTubeVideoId(v.youtubeLink);
    const created = v.createdAt ? new Date(v.createdAt) : null;
    const dateLabel = created
      ? created.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
      : '';
    return {
      ...v,
      thumbUrl: id ? youtubeThumbnailUrl(id) : null,
      embedUrl: id ? youtubeEmbedUrl(id) : null,
      dateLabel,
    };
  }
}
