import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

export type NewsCardBadge = {
  text: string;
  className: string;
};

@Component({
  selector: 'app-news-card',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './news-card.component.html',
  styleUrl: './news-card.component.scss',
})
export class NewsCardComponent {
  @Input({ required: true }) title = '';
  @Input({ required: true }) badgeText = '';
  @Input({ required: true }) badgeClass = '';
  @Input({ required: true }) phClass = '';
  @Input() badges: NewsCardBadge[] = [];

  @Input() author = '';
  @Input() date = '';
  @Input() read = '';
  @Input() bannerImage?: string | null;
  @Input() cardClass = '';
  @Input() link = '';
}
