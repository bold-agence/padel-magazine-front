import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export type FipRankingGender = 'men' | 'women';

export type FipRankingEntryDto = {
  id: string;
  sortOrder: number;
  rank: number;
  playerName: string;
  countryCode?: string | null;
  points: number;
  playerImageUrl?: string | null;
};

export type FipRankingDto = {
  id: string;
  gender: FipRankingGender;
  title: string;
  rankingDate?: string | null;
  sourceUrl?: string | null;
  isPublished: boolean;
  entries: FipRankingEntryDto[];
};

export type FipRankingsPayload = Record<FipRankingGender, FipRankingDto | null>;

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  meta?: unknown;
};

@Injectable({
  providedIn: 'root',
})
export class FipRankingsService {
  private readonly apiUrl = `${environment.apiUrl}/fip-rankings`;

  constructor(private readonly http: HttpClient) {}

  findTop10(): Observable<FipRankingsPayload> {
    return this.http
      .get<ApiEnvelope<FipRankingsPayload> | FipRankingsPayload>(
        `${this.apiUrl}/top10`,
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

