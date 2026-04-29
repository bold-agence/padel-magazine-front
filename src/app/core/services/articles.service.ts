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
