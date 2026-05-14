import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  meta?: unknown;
};

export type ClassementSummaryDto = {
  id: string;
  slug: string;
  title: string;
  pointsNowLabel: string | null;
  pointsPrevLabel: string | null;
  podiumFirstImageUrl: string | null;
  podiumSecondImageUrl: string | null;
  podiumThirdImageUrl: string | null;
  lineCount: number;
  updatedAt: string;
};

export type ClassementLineDto = {
  id: string;
  sortOrder: number;
  rank: number;
  playerName: string;
  pointsNow: number;
  tournaments: number;
  previousRank: number;
  pointsPrev: number;
  rankDelta: string;
  pointsDelta: string;
};

export type ClassementDetailDto = {
  id: string;
  slug: string;
  title: string;
  pointsNowLabel: string | null;
  pointsPrevLabel: string | null;
  podiumFirstImageUrl: string | null;
  podiumSecondImageUrl: string | null;
  podiumThirdImageUrl: string | null;
  lines: ClassementLineDto[];
};

@Injectable({
  providedIn: 'root',
})
export class ClassementsService {
  private readonly baseUrl = `${environment.apiUrl}/classements`;

  constructor(private readonly http: HttpClient) {}

  findAllSummaries(): Observable<ClassementSummaryDto[]> {
    return this.http
      .get<ApiEnvelope<ClassementSummaryDto[]> | ClassementSummaryDto[]>(this.baseUrl)
      .pipe(map((r) => this.unwrap(r)));
  }

  findOne(id: string): Observable<ClassementDetailDto> {
    return this.http
      .get<ApiEnvelope<ClassementDetailDto> | ClassementDetailDto>(
        `${this.baseUrl}/${encodeURIComponent(id)}`,
      )
      .pipe(map((r) => this.unwrap(r)));
  }

  findBySlug(slug: string): Observable<ClassementDetailDto> {
    return this.http
      .get<ApiEnvelope<ClassementDetailDto> | ClassementDetailDto>(
        `${this.baseUrl}/by-slug/${encodeURIComponent(slug)}`,
      )
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
