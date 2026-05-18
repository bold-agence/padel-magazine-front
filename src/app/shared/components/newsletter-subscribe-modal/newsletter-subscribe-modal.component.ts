import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';
import { NewsletterSubscribeService } from '../../../core/services/newsletter-subscribe.service';
import {
  NewsletterSubscriberPayload,
  NewsletterSubscribersService,
} from '../../../core/services/newsletter-subscribers.service';

type NewsletterFormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  acceptsEmails: boolean;
  acceptsPrintMagazine: boolean;
};

@Component({
  selector: 'app-newsletter-subscribe-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './newsletter-subscribe-modal.component.html',
  styleUrl: './newsletter-subscribe-modal.component.scss',
})
export class NewsletterSubscribeModalComponent implements OnInit, OnDestroy {
  protected modalOpen = false;
  protected submitting = false;
  protected formError = '';
  protected emailAlreadyRegistered = false;
  protected form: NewsletterFormState = this.createEmptyForm();

  private openSubscription?: Subscription;

  constructor(
    private readonly newsletterSubscribeService: NewsletterSubscribeService,
    private readonly newsletterSubscribersService: NewsletterSubscribersService,
  ) {}

  ngOnInit(): void {
    this.openSubscription = this.newsletterSubscribeService.open$.subscribe(() => {
      this.formError = '';
      this.emailAlreadyRegistered = false;
      this.form = this.createEmptyForm();
      this.modalOpen = true;
    });
  }

  ngOnDestroy(): void {
    this.openSubscription?.unsubscribe();
  }

  close(): void {
    if (this.submitting) {
      return;
    }
    this.modalOpen = false;
    this.formError = '';
    this.emailAlreadyRegistered = false;
  }

  submit(event: Event, ngForm: NgForm): void {
    event.preventDefault();
    this.formError = '';
    this.emailAlreadyRegistered = false;

    const payload: NewsletterSubscriberPayload = {
      firstName: this.form.firstName.trim(),
      lastName: this.form.lastName.trim(),
      email: this.form.email.trim(),
      phone: this.form.phone.trim(),
      acceptsEmails: this.form.acceptsEmails,
      acceptsPrintMagazine: this.form.acceptsPrintMagazine,
    };

    if (!payload.firstName || !payload.lastName || !payload.email || !payload.phone) {
      this.formError = 'Veuillez remplir tous les champs obligatoires.';
      ngForm.control.markAllAsTouched();
      return;
    }

    if (ngForm.invalid) {
      this.formError = 'Veuillez remplir correctement tous les champs obligatoires.';
      ngForm.control.markAllAsTouched();
      return;
    }

    if (!this.form.acceptsEmails) {
      this.formError =
        'Vous devez accepter de recevoir les communications par e-mail pour vous inscrire.';
      return;
    }

    payload.acceptsEmails = true;

    this.submitting = true;
    this.newsletterSubscribersService.subscribe(payload).subscribe({
      next: () => {
        this.submitting = false;
        this.modalOpen = false;
        this.form = this.createEmptyForm();
        this.newsletterSubscribeService.notifySuccess(
          'Merci ! Votre inscription à la newsletter a bien été enregistrée.',
        );
      },
      error: (err: HttpErrorResponse) => {
        this.submitting = false;
        const apiMessage = this.extractApiErrorMessage(err);
        if (err.status === 409) {
          this.emailAlreadyRegistered = true;
          this.formError =
            apiMessage ||
            'Cette adresse e-mail est déjà inscrite à notre newsletter.';
        } else if (apiMessage) {
          this.formError = apiMessage;
        } else {
          this.formError =
            'Une erreur est survenue. Veuillez réessayer dans quelques instants.';
        }
      },
    });
  }

  private extractApiErrorMessage(err: HttpErrorResponse): string {
    const body = err.error as { message?: string | string[] } | null;
    if (!body?.message) {
      return '';
    }
    if (typeof body.message === 'string') {
      return body.message;
    }
    if (Array.isArray(body.message)) {
      return body.message.join(' ');
    }
    return '';
  }

  private createEmptyForm(): NewsletterFormState {
    return {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      acceptsEmails: false,
      acceptsPrintMagazine: false,
    };
  }
}
