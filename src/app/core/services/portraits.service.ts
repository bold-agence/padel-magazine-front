import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  meta?: unknown;
};

export type PortraitCategoryItem = {
  id: string;
  libelle: string;
};

export type PortraitItem = {
  id: string;
  indice: number;
  pointNumber: number;
  signature?: string | null;
  category: PortraitCategoryItem;
  player: {
    id: string;
    slug: string;
    name: string;
    nationality: string;
    profilePhoto?: string | null;
    club?: { id: string; title: string } | null;
  };
  article?: { id: string; slug: string; title: string; isVisible: boolean } | null;
};

@Injectable({
  providedIn: 'root',
})
export class PortraitsService {
  private readonly portraitsUrl = `${environment.apiUrl}/portraits`;
  private readonly categoriesUrl = `${environment.apiUrl}/portrait-categories`;

  constructor(private readonly http: HttpClient) {}

  findAllPortraits(): Observable<PortraitItem[]> {
    return this.http
      .get<ApiEnvelope<PortraitItem[]> | PortraitItem[]>(this.portraitsUrl)
      .pipe(map((r) => this.unwrap(r)));
  }

  findAllCategories(): Observable<PortraitCategoryItem[]> {
    return this.http
      .get<ApiEnvelope<PortraitCategoryItem[]> | PortraitCategoryItem[]>(
        this.categoriesUrl,
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

