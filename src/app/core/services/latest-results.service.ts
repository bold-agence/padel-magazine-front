import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export type LatestResultCategory = 'all' | 'men' | 'women';

export type LatestResultScope = {
  id: string;
  name: string;
  slug: string;
  displayOrder: number;
  isActive: boolean;
};

export type LatestResult = {
  id: string;
  tournamentName: string;
  location?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  resultDate: string;
  round: string;
  winners: string;
  score: string;
  losers: string;
  category: Exclude<LatestResultCategory, 'all'>;
  scope: LatestResultScope;
  isPublished: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type LatestResultsPagination = {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type PaginatedLatestResults = {
  items: LatestResult[];
  pagination: LatestResultsPagination;
};

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  meta?: unknown;
};

@Injectable({
  providedIn: 'root',
})
export class LatestResultsService {
  private readonly apiUrl = `${environment.apiUrl}/latest-results`;
  private readonly scopesUrl = `${environment.apiUrl}/latest-result-scopes`;

  constructor(private readonly http: HttpClient) {}

  findPaginated(
    page = 1,
    limit = 8,
    category: LatestResultCategory = 'all',
    scope = 'all',
  ): Observable<PaginatedLatestResults> {
    const params = new HttpParams()
      .set('page', page)
      .set('limit', limit)
      .set('category', category)
      .set('scope', scope);

    return this.http
      .get<ApiEnvelope<PaginatedLatestResults> | PaginatedLatestResults>(
        this.apiUrl,
        { params },
      )
      .pipe(map((response) => this.unwrap(response)));
  }

  findScopes(): Observable<LatestResultScope[]> {
    return this.http
      .get<ApiEnvelope<LatestResultScope[]> | LatestResultScope[]>(
        this.scopesUrl,
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
