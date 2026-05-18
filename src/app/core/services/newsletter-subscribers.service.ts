import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export type NewsletterSubscriberPayload = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  acceptsEmails: boolean;
  acceptsPrintMagazine: boolean;
};

@Injectable({ providedIn: 'root' })
export class NewsletterSubscribersService {
  private readonly baseUrl = `${environment.apiUrl}/newsletter-subscribers`;

  constructor(private readonly http: HttpClient) {}

  subscribe(payload: NewsletterSubscriberPayload): Observable<unknown> {
    return this.http.post(this.baseUrl, payload);
  }
}
