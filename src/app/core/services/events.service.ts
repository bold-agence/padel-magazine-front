import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { PadelCalendarEvent } from '../models/padel-calendar-event.model';

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  meta?: unknown;
};

export type TournamentDto = {
  id: string;
  label: string;
  slug: string;
  colorCode: string;
  description?: string | null;
};

export type EventDto = {
  id: string;
  title: string;
  slug: string;
  startAt: string;
  endAt?: string | null;
  venue: string;
  descriptionHtml?: string | null;
  coverImageUrl?: string | null;
  tournament?: TournamentDto | null;
};

export function resolvePublicMediaUrl(url?: string | null): string | undefined {
  if (!url?.trim()) return undefined;
  const u = url.trim();
  if (/^https?:\/\//i.test(u)) return u;
  const base = environment.apiUrl.replace(/\/$/, '');
  if (u.startsWith('/')) return `${base}${u}`;
  return `${base}/${u}`;
}

/** Mappe une ligne `GET /events` vers le modèle utilisé par FullCalendar et le modal. */
export function mapEventDtoToPadel(dto: EventDto): PadelCalendarEvent {
  const tournamentLabel = dto.tournament?.label?.trim();
  const tier = tournamentLabel || 'Événement';
  const accent = dto.tournament?.colorCode?.trim() || '#1d9e75';
  const match = tournamentLabel ? `${tournamentLabel} — ${dto.title}` : dto.title;

  return {
    id: dto.id,
    title: dto.title,
    venue: dto.venue,
    tier,
    accent,
    debut: dto.startAt,
    fin: dto.endAt ?? null,
    coverImageUrl: resolvePublicMediaUrl(dto.coverImageUrl),
    match,
    descriptionHtml: dto.descriptionHtml ?? undefined,
  };
}

@Injectable({
  providedIn: 'root',
})
export class EventsService {
  private readonly baseUrl = `${environment.apiUrl}/events`;

  constructor(private readonly http: HttpClient) {}

  findAll(tournamentId?: string): Observable<EventDto[]> {
    const params = tournamentId?.trim()
      ? { tournamentId: tournamentId.trim() }
      : undefined;
    return this.http
      .get<ApiEnvelope<EventDto[]> | EventDto[]>(this.baseUrl, { params })
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
