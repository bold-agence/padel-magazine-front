import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { ArticleCategoryModel, ArticleModel, TagModel } from '../models/article.model';
import { environment } from '../../../environments/environment';

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  meta?: unknown;
};

export type PaginatedArticlesResponse = {
  items: ArticleModel[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};

@Injectable({
  providedIn: 'root',
})
export class ArticlesService {
  private readonly apiUrl = `${environment.apiUrl}/articles`;

  constructor(private readonly http: HttpClient) {}

  findAll(): Observable<ArticleModel[]> {
    return this.http
      .get<ApiEnvelope<ArticleModel[]> | ArticleModel[]>(this.apiUrl)
      .pipe(map((response) => this.unwrap(response)));
  }

  findPaginated(
    page = 1,
    limit = 9,
    category = 'all',
  ): Observable<PaginatedArticlesResponse> {
    return this.http
      .get<ApiEnvelope<PaginatedArticlesResponse> | PaginatedArticlesResponse>(
        `${this.apiUrl}/paginated?page=${page}&limit=${limit}&category=${encodeURIComponent(category)}`,
      )
      .pipe(map((response) => this.unwrap(response)));
  }

  findBySlug(slug: string): Observable<ArticleModel | undefined> {
    return this.http
      .get<ApiEnvelope<ArticleModel> | ArticleModel>(`${this.apiUrl}/slug/${slug}`)
      .pipe(map((response) => this.unwrap(response)));
  }

  trackViewBySlug(slug: string): Observable<void> {
    return this.http
      .post<ApiEnvelope<{ success: boolean }> | { success: boolean }>(
        `${this.apiUrl}/slug/${slug}/view`,
        {},
      )
      .pipe(map(() => undefined));
  }

  findRelatedBySlug(slug: string): Observable<ArticleModel[]> {
    return this.http
      .get<ApiEnvelope<ArticleModel[]> | ArticleModel[]>(
        `${this.apiUrl}/slug/${slug}/related`,
      )
      .pipe(map((response) => this.unwrap(response)));
  }

  findPopular(
    limit = 5,
    category = 'all',
    excludeSlug?: string,
    mode: 'popular' | 'trending' = 'popular',
  ): Observable<ArticleModel[]> {
    const params = new URLSearchParams();
    params.set('limit', String(limit));
    params.set('category', category);
    params.set('mode', mode);
    if (excludeSlug) {
      params.set('excludeSlug', excludeSlug);
    }
    return this.http
      .get<ApiEnvelope<ArticleModel[]> | ArticleModel[]>(
        `${this.apiUrl}/popular?${params.toString()}`,
      )
      .pipe(map((response) => this.unwrap(response)));
  }

  findAllCategories(): Observable<ArticleCategoryModel[]> {
    return this.http
      .get<ApiEnvelope<ArticleCategoryModel[]> | ArticleCategoryModel[]>(
        `${this.apiUrl}/categories`,
      )
      .pipe(map((response) => this.unwrap(response)));
  }

  findAllTags(): Observable<TagModel[]> {
    return this.http
      .get<ApiEnvelope<TagModel[]> | TagModel[]>(`${this.apiUrl}/tags`)
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
