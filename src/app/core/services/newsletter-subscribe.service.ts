import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NewsletterSubscribeService {
  private readonly openSubject = new Subject<void>();
  private readonly successSubject = new Subject<string>();

  readonly open$ = this.openSubject.asObservable();
  readonly success$ = this.successSubject.asObservable();

  open(): void {
    this.openSubject.next();
  }

  notifySuccess(message: string): void {
    this.successSubject.next(message);
  }
}
