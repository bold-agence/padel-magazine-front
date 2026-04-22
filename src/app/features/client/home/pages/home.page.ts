import {
  AfterViewInit,
  Component,
  Inject,
  OnDestroy,
  OnInit,
  Renderer2,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { NewsCardComponent } from '../../../../shared/components/news-card/news-card.component';
import { SidebarComponent } from '../../../../shared/components/sidebar/sidebar.component';
import { RouterLink } from '@angular/router';

type HomeNewsCard = {
  slug: string;
  cat: string;
  cls: string;
  ph: string;
  title: string;
  auth: string;
  date: string;
  read: string;
  cardClass: string;
};

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [SidebarComponent, NewsCardComponent, RouterLink],
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss',
})
export class HomePage implements OnInit, AfterViewInit, OnDestroy {
  protected readonly featuredNews: HomeNewsCard[] = [
    {
      slug: 'championnat-national-u18-omar-diallo-survole-competition',
      cat: 'Résultats',
      cls: 'results',
      ph: 'orange',
      title: 'Championnat National U18 : Oumar Diallo survole la compétition',
      auth: 'M. Diop',
      date: '11 Avr',
      read: '5 min',
      cardClass: 'red',
    },
    {
      slug: 'saly-padel-club-ouvre-ses-portes-6-nouvelles-pistes',
      cat: 'Actualités',
      cls: 'actualites',
      ph: 'court',
      title: 'Le Saly Padel Club ouvre ses portes avec 6 nouvelles pistes',
      auth: 'A. Sène',
      date: '10 Avr',
      read: '3 min',
      cardClass: '',
    },
    {
      slug: 'interview-ibou-ndiaye-top-20-africain-cinq-ans',
      cat: 'Interview',
      cls: 'interview',
      ph: 'charcoal',
      title: 'Interview Ibou Ndiaye DTN : « Dans cinq ans, top 20 africain »',
      auth: 'F. Ba',
      date: '9 Avr',
      read: '7 min',
      cardClass: 'blue',
    },
  ];

  private heroIndex = 0;
  private heroTimer: ReturnType<typeof setInterval> | null = null;
  private countdownTimer: ReturnType<typeof setInterval> | null = null;
  private unlisteners: Array<() => void> = [];

  constructor(
    @Inject(DOCUMENT) private readonly document: Document,
    private readonly renderer: Renderer2
  ) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.initHeroSlider();
    this.initCountdown();
  }

  ngOnDestroy(): void {
    if (this.heroTimer) {
      clearInterval(this.heroTimer);
    }
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
    }
    this.unlisteners.forEach((unlisten) => unlisten());
  }

  private initHeroSlider(): void {
    const slides = Array.from(
      this.document.querySelectorAll<HTMLElement>('.hero-main .slide')
    );
    const dots = Array.from(
      this.document.querySelectorAll<HTMLButtonElement>('.hero-dots button')
    );
    const nextBtn = this.document.querySelector<HTMLButtonElement>(
      '.hero-arrow.next'
    );
    const prevBtn = this.document.querySelector<HTMLButtonElement>(
      '.hero-arrow.prev'
    );

    if (!slides.length || !dots.length || !nextBtn || !prevBtn) {
      return;
    }

    const go = (nextIndex: number): void => {
      slides.forEach((slide, i) => {
        slide.hidden = i !== nextIndex;
        slide.classList.toggle('active', i === nextIndex);
      });
      dots.forEach((dot, i) => dot.classList.toggle('active', i === nextIndex));
      this.heroIndex = nextIndex;
    };

    const next = (): void => go((this.heroIndex + 1) % slides.length);
    const prev = (): void => go((this.heroIndex - 1 + slides.length) % slides.length);
    const reset = (): void => {
      if (this.heroTimer) {
        clearInterval(this.heroTimer);
      }
      this.heroTimer = setInterval(next, 5000);
    };

    dots.forEach((dot, i) => {
      this.unlisteners.push(
        this.renderer.listen(dot, 'click', () => {
          go(i);
          reset();
        })
      );
    });
    this.unlisteners.push(
      this.renderer.listen(nextBtn, 'click', () => {
        next();
        reset();
      })
    );
    this.unlisteners.push(
      this.renderer.listen(prevBtn, 'click', () => {
        prev();
        reset();
      })
    );

    go(0);
    reset();
  }

  private initCountdown(): void {
    const el = this.document.getElementById('countdown');
    if (!el) {
      return;
    }

    const target = new Date('2026-04-19T15:00:00Z').getTime();
    const tick = (): void => {
      const delta = target - Date.now();
      if (delta <= 0) {
        el.textContent = 'EN DIRECT';
        return;
      }
      const days = Math.floor(delta / 86400000);
      const hrs = Math.floor((delta % 86400000) / 3600000);
      const min = Math.floor((delta % 3600000) / 60000);
      const sec = Math.floor((delta % 60000) / 1000);
      el.innerHTML = `
        <div style="text-align:center"><div style="font-size:28px;color:var(--red)">${days}</div><div style="font-size:10px;opacity:.6;letter-spacing:.1em">JOURS</div></div>
        <div style="text-align:center"><div style="font-size:28px;color:var(--red)">${String(hrs).padStart(2, '0')}</div><div style="font-size:10px;opacity:.6;letter-spacing:.1em">HRS</div></div>
        <div style="text-align:center"><div style="font-size:28px;color:var(--red)">${String(min).padStart(2, '0')}</div><div style="font-size:10px;opacity:.6;letter-spacing:.1em">MIN</div></div>
        <div style="text-align:center"><div style="font-size:28px;color:var(--red)">${String(sec).padStart(2, '0')}</div><div style="font-size:10px;opacity:.6;letter-spacing:.1em">SEC</div></div>
      `;
    };

    tick();
    this.countdownTimer = setInterval(tick, 1000);
  }

}
