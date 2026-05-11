import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  meta?: unknown;
};

export type VideoTypeDto = {
  id: string;
  title: string;
  createdAt?: string;
};

export type VideoDto = {
  id: string;
  title: string;
  youtubeLink: string;
  videoType: VideoTypeDto;
  createdAt?: string;
};

@Injectable({
  providedIn: 'root',
})
export class VideosService {
  private readonly typesUrl = `${environment.apiUrl}/video-types`;
  private readonly videosUrl = `${environment.apiUrl}/videos`;

  constructor(private readonly http: HttpClient) {}

  findAllTypes(): Observable<VideoTypeDto[]> {
    return this.http
      .get<ApiEnvelope<VideoTypeDto[]> | VideoTypeDto[]>(this.typesUrl)
      .pipe(map((r) => this.unwrap(r)));
  }

  findAllVideos(videoTypeId?: string): Observable<VideoDto[]> {
    const q = videoTypeId?.trim()
      ? `?videoTypeId=${encodeURIComponent(videoTypeId.trim())}`
      : '';
    return this.http
      .get<ApiEnvelope<VideoDto[]> | VideoDto[]>(`${this.videosUrl}${q}`)
      .pipe(map((r) => this.unwrap(r)));
  }

  private unwrap<T>(response: ApiEnvelope<T> | T): T {
    if (
      response !== null &&
      typeof response === 'object' &&
      'data' in (response as Record<string, unknown>)
    ) {
      return (response as ApiEnvelope<T>).data;
    }
    return response as T;
  }
}
