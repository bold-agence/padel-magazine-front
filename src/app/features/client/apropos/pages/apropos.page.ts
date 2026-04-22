import { Component } from '@angular/core';

@Component({
  selector: 'app-apropos-page',
  standalone: true,
  templateUrl: './apropos.page.html',
  styleUrl: './apropos.page.scss',
})
export class AproposPage {
  protected contactSubmit(event: Event): void {
    event.preventDefault();
    window.alert('Message envoyé. Merci !');
  }
}
