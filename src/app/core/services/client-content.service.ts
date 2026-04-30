import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export type AdSlot = 'header_main' | 'sidebar_top' | 'sidebar_bottom';

export type BreakingNewsItem = {
  id: string;
  title: string;
  linkUrl?: string | null;
  isActive: boolean;
  displayOrder: number;
};

export type AdImageItem = {
  id: string;
  title: string;
  slot: AdSlot;
  imageUrl: string;
  targetUrl?: string | null;
  isActive: boolean;
};

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  meta?: unknown;
};

@Injectable({
  providedIn: 'root',
})
export class ClientContentService {
  private readonly apiUrl = `${environment.apiUrl}/client-content`;

  constructor(private readonly http: HttpClient) {}

  findBreakingNews(activeOnly = true): Observable<BreakingNewsItem[]> {
    return this.http
      .get<ApiEnvelope<BreakingNewsItem[]> | BreakingNewsItem[]>(
        `${this.apiUrl}/breaking-news?activeOnly=${activeOnly}`,
      )
      .pipe(map((response) => this.unwrap(response)));
  }

  findAdImages(slot?: AdSlot, activeOnly = true): Observable<AdImageItem[]> {
    const params = new URLSearchParams();
    if (slot) {
      params.set('slot', slot);
    }
    params.set('activeOnly', String(activeOnly));
    return this.http
      .get<ApiEnvelope<AdImageItem[]> | AdImageItem[]>(
        `${this.apiUrl}/ad-images?${params.toString()}`,
      )
      .pipe(map((response) => this.unwrap(response)));
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
