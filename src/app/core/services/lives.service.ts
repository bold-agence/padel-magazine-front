import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { EventDto } from './events.service';

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  meta?: unknown;
};

export type LiveChannelSettingsDto = {
  id: string;
  channelName?: string | null;
  channelUrl?: string | null;
};

/** Réponse `GET /lives` — événement + tournoi inclus (relations API). */
export type LiveDto = {
  id: string;
  startTime: string;
  endTime?: string | null;
  liveUrl: string;
  replayUrl?: string | null;
  coverImageUrl?: string | null;
  event: EventDto;
};

@Injectable({
  providedIn: 'root',
})
export class LivesService {
  private readonly livesUrl = `${environment.apiUrl}/lives`;
  private readonly settingsUrl = `${environment.apiUrl}/live-settings`;

  constructor(private readonly http: HttpClient) {}

  getChannelSettings(): Observable<LiveChannelSettingsDto> {
    return this.http
      .get<ApiEnvelope<LiveChannelSettingsDto> | LiveChannelSettingsDto>(this.settingsUrl)
      .pipe(map((r) => this.unwrap(r)));
  }

  findAll(eventId?: string): Observable<LiveDto[]> {
    const params = eventId?.trim() ? { eventId: eventId.trim() } : undefined;
    return this.http
      .get<ApiEnvelope<LiveDto[]> | LiveDto[]>(this.livesUrl, { params })
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
