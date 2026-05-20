import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, shareReplay } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  DEFAULT_PUBLIC_PAGE_KEY,
  PublicPageKey,
} from '../constants/public-page-keys';
import { resolvePublicMediaUrl } from './events.service';

export type AdSlot =
  | 'header_main'
  | 'home_leaderboard'
  | 'sidebar_top'
  | 'sidebar_bottom';

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
  pageKey: PublicPageKey;
  imageUrl: string;
  mobileImageUrl?: string | null;
  targetUrl?: string | null;
  isActive: boolean;
};

export type ResolvedSidebarAds = {
  top: AdImageItem | null;
  bottom: AdImageItem | null;
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
  private readonly cacheTtlMs = 60_000;
  private readonly requestCache = new Map<
    string,
    { expiresAt: number; stream$: Observable<unknown> }
  >();

  constructor(private readonly http: HttpClient) {}

  findBreakingNews(activeOnly = true): Observable<BreakingNewsItem[]> {
    const key = `breaking-news:${activeOnly}`;
    return this.getCachedRequest(key, () =>
      this.http
        .get<ApiEnvelope<BreakingNewsItem[]> | BreakingNewsItem[]>(
          `${this.apiUrl}/breaking-news?activeOnly=${activeOnly}`,
        )
        .pipe(map((response) => this.unwrap(response))),
    );
  }

  resolveSidebarAds(pageKey: PublicPageKey): Observable<ResolvedSidebarAds> {
    const key = `sidebar-ads:${pageKey}`;
    return this.getCachedRequest(key, () =>
      this.http
        .get<ApiEnvelope<ResolvedSidebarAds> | ResolvedSidebarAds>(
          `${this.apiUrl}/sidebar-ads?pageKey=${encodeURIComponent(pageKey)}`,
        )
        .pipe(map((response) => this.normalizeSidebarAds(this.unwrap(response)))),
    );
  }

  findAdImages(slot?: AdSlot, activeOnly = true): Observable<AdImageItem[]> {
    const params = new URLSearchParams();
    if (slot) {
      params.set('slot', slot);
    }
    params.set('activeOnly', String(activeOnly));
    const key = `ad-images:${slot ?? 'all'}:${activeOnly}`;
    return this.getCachedRequest(key, () =>
      this.http
        .get<ApiEnvelope<AdImageItem[]> | AdImageItem[]>(
          `${this.apiUrl}/ad-images?${params.toString()}`,
        )
        .pipe(
          map((response) =>
            this.unwrap(response).map((item) => this.normalizeAdImage(item)),
          ),
        ),
    );
  }

  pickAdForPage(items: AdImageItem[], pageKey: PublicPageKey): AdImageItem | undefined {
    const match =
      items.find((item) => item.pageKey === pageKey) ??
      items.find((item) => item.pageKey === DEFAULT_PUBLIC_PAGE_KEY) ??
      items[0];
    return match ? this.normalizeAdImage(match) : undefined;
  }

  private getCachedRequest<T>(
    key: string,
    producer: () => Observable<T>,
  ): Observable<T> {
    const now = Date.now();
    const cachedEntry = this.requestCache.get(key);
    if (cachedEntry && cachedEntry.expiresAt > now) {
      return cachedEntry.stream$ as Observable<T>;
    }

    const stream$ = producer().pipe(shareReplay(1));
    this.requestCache.set(key, {
      expiresAt: now + this.cacheTtlMs,
      stream$: stream$ as Observable<unknown>,
    });
    return stream$;
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

  private normalizeSidebarAds(payload: ResolvedSidebarAds | null | undefined): ResolvedSidebarAds {
    return {
      top: payload?.top ? this.normalizeAdImage(payload.top) : null,
      bottom: payload?.bottom ? this.normalizeAdImage(payload.bottom) : null,
    };
  }

  private normalizeAdImage(item: AdImageItem): AdImageItem {
    const imageUrl = resolvePublicMediaUrl(item.imageUrl) ?? item.imageUrl;
    const mobileRaw = item.mobileImageUrl?.trim();
    const mobileImageUrl = mobileRaw
      ? resolvePublicMediaUrl(mobileRaw) ?? mobileRaw
      : null;
    return {
      ...item,
      pageKey: item.pageKey ?? DEFAULT_PUBLIC_PAGE_KEY,
      imageUrl,
      mobileImageUrl,
    };
  }
}
