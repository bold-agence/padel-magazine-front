import { Component, Input } from '@angular/core';
import { AdImageItem } from '../../../core/services/client-content.service';

@Component({
  selector: 'app-ad-slot-media',
  standalone: true,
  template: `
    @if (ad; as item) {
      @if (item.imageUrl) {
        @if (item.mobileImageUrl) {
          <img
            class="ad-slot-media__img ad-slot-media__img--desktop"
            [src]="item.imageUrl"
            [alt]="alt"
            loading="lazy"
          />
          <img
            class="ad-slot-media__img ad-slot-media__img--mobile"
            [src]="item.mobileImageUrl"
            [alt]="alt"
            loading="lazy"
          />
        } @else {
          <img class="ad-slot-media__img" [src]="item.imageUrl" [alt]="alt" loading="lazy" />
        }
      }
    }
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }

    .ad-slot-media__img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center;
    }

    :host(.ad-slot-media--bp-640) .ad-slot-media__img--mobile {
      display: none;
    }

    @media (max-width: 640px) {
      :host(.ad-slot-media--bp-640) .ad-slot-media__img--desktop {
        display: none;
      }

      :host(.ad-slot-media--bp-640) .ad-slot-media__img--mobile {
        display: block;
      }
    }
  `,
  host: {
    class: 'ad-slot-media ad-slot-media--bp-640',
  },
})
export class AdSlotMediaComponent {
  @Input() ad?: AdImageItem;
  @Input() alt = 'Publicite';
}
