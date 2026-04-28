import { Component } from '@angular/core';

@Component({
  selector: 'app-apropos-component',
  standalone: true,
  templateUrl: './apropos.component.html',
  styleUrl: './apropos.component.scss',
})
export class AproposComponent {
  protected contactSubmit(event: Event): void {
    event.preventDefault();
    window.alert('Message envoyé. Merci !');
  }
}
