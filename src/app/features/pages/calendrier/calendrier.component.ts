import {
  AfterViewInit,
  Component,
  computed,
  HostListener,
  inject,
  NgZone,
  SecurityContext,
  signal,
  ViewChild,
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FullCalendarModule, FullCalendarComponent } from '@fullcalendar/angular';
import { CalendarOptions, EventContentArg, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import frLocale from '@fullcalendar/core/locales/fr';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';

export type PadelCalendarEvent = {
  id: string;
  title: string;
  venue: string;
  tier: string;
  accent: string;
  /** Début du créneau (jour inclus), ISO local YYYY-MM-DD */
  start: string;
  /** Fin exclusive pour une plage multi-jours */
  endExclusive?: string;
  /** Image de couverture (modal, cartes « prochains ») */
  coverImageUrl?: string;
  /** Heure ou créneau affiché dans le modal (ex. « 19 h 30 », « Toute la journée ») */
  timeLabel?: string;
  /** Texte libre : tableau, phase tournoi, affiche de match, etc. */
  match?: string;
  /** Texte riche (HTML) — filtré côté client (SecurityContext.HTML). */
  descriptionHtml?: string;
};

function accentToEventColor(accent: string): string {
  const map: Record<string, string> = {
    'var(--red)': '#e24b4a',
    'var(--orange)': '#ef9f27',
    'var(--blue)': '#378add',
    'var(--violet)': '#7f77dd',
    'var(--coral)': '#d85a30',
    'var(--green)': '#1d9e75',
  };
  return map[accent] ?? '#1d9e75';
}

function mapPadelToFullCalendar(events: PadelCalendarEvent[]): EventInput[] {
  return events.map((ev) => {
    const bg = accentToEventColor(ev.accent);
    return {
      id: ev.id,
      title: ev.title,
      start: ev.start,
      ...(ev.endExclusive ? { end: ev.endExclusive } : {}),
      allDay: true,
      backgroundColor: 'transparent',
      borderColor: 'transparent',
      textColor: 'transparent',
      display: 'block',
      classNames: ['cal-fc-padel-event'],
      extendedProps: {
        tier: ev.tier,
        accentHex: bg,
      },
    };
  });
}

@Component({
  selector: 'app-calendrier-component',
  standalone: true,
  imports: [SidebarComponent, FullCalendarModule],
  templateUrl: './calendrier.component.html',
  styleUrl: './calendrier.component.scss',
})
export class CalendrierComponent implements AfterViewInit {
  private readonly ngZone = inject(NgZone);
  private readonly sanitizer = inject(DomSanitizer);

  @ViewChild('fullCal') private fullCal?: FullCalendarComponent;

  protected readonly modalOpen = signal(false);
  protected readonly modalDateLabel = signal('');
  protected readonly modalEvents = signal<PadelCalendarEvent[]>([]);

  /** Mois affiché (1–12), synchronisé avec FullCalendar */
  protected readonly toolbarMonth = signal(5);
  /** Année affichée */
  protected readonly toolbarYear = signal(2026);

  protected readonly monthOptions: { value: number; label: string }[] = [
    { value: 1, label: 'Janvier' },
    { value: 2, label: 'Février' },
    { value: 3, label: 'Mars' },
    { value: 4, label: 'Avril' },
    { value: 5, label: 'Mai' },
    { value: 6, label: 'Juin' },
    { value: 7, label: 'Juillet' },
    { value: 8, label: 'Août' },
    { value: 9, label: 'Septembre' },
    { value: 10, label: 'Octobre' },
    { value: 11, label: 'Novembre' },
    { value: 12, label: 'Décembre' },
  ];

  protected readonly yearOptions: number[] = Array.from(
    { length: 12 },
    (_, i) => 2022 + i
  );

  protected readonly viewMonthYearTitle = computed(() => {
    const y = this.toolbarYear();
    const m = this.toolbarMonth();
    return new Intl.DateTimeFormat('fr-FR', {
      month: 'long',
      year: 'numeric',
    }).format(new Date(y, m - 1, 1));
  });

  protected readonly allEvents: PadelCalendarEvent[] = [
    {
      id: '1',
      title: 'Open Dakar — Finale hommes (live)',
      venue: 'TGS Arena · Almadies',
      tier: 'National',
      accent: 'var(--red)',
      start: '2026-04-19',
      coverImageUrl: 'https://picsum.photos/seed/padel-open-dakar/800/420',
      timeLabel: '20 h 45',
      match: 'Open Dakar — finale hommes · court central (retransmission live)',
      descriptionHtml:
        '<p><strong>Finale hommes</strong> en direct. Ouverture des portes dès 18&nbsp;h&nbsp;; billetterie sur place et restauration partenaires.</p>',
    },
    {
      id: '2',
      title: 'Championnat féminin — Finale',
      venue: 'Dakar Padel Center',
      tier: 'National',
      accent: 'var(--orange)',
      start: '2026-04-20',
      coverImageUrl: 'https://picsum.photos/seed/padel-finale-fem/800/420',
      timeLabel: '18 h 00',
      match: 'Championnat féminin — finale · tableau principal dames',
      descriptionHtml:
        '<p>Tableau final féminin. Retransmission des demi-finales sur écran géant dans le hall d’accueil.</p>',
    },
    {
      id: '3',
      title: 'WPT Africa Series Dakar',
      venue: 'TGS Arena · Almadies',
      tier: 'WPT',
      accent: 'var(--coral)',
      start: '2026-06-07',
      endExclusive: '2026-06-09',
      coverImageUrl: 'https://picsum.photos/seed/padel-wpt-africa/800/420',
      timeLabel: 'À partir de 9 h (3 jours)',
      match: 'WPT Africa Series Dakar — qualifications & tableau principal',
      descriptionHtml:
        '<p>Série internationale sur trois jours&nbsp;: qualifications, tableau principal et animations.</p><ul><li>Village partenaires</li><li>Restauration sur place</li></ul>',
    },
    {
      id: '4',
      title: 'Circuit régional — Étape Thiès',
      venue: 'Thiès Padel Club',
      tier: 'Régional',
      accent: 'var(--green)',
      start: '2026-06-14',
      coverImageUrl: 'https://picsum.photos/seed/padel-thies-circuit/800/420',
      timeLabel: '14 h – 22 h',
      match: 'Circuit régional — étape Thiès · Open & P250',
      descriptionHtml:
        '<p>Étape du circuit régional. Inscriptions closes la veille à minuit&nbsp;; consignes vestiaires sur le site du club.</p>',
    },
    {
      id: '5',
      title: 'Open Saly — clôture des inscriptions',
      venue: 'Saly Padel Club',
      tier: 'National',
      accent: 'var(--violet)',
      start: '2026-06-28',
      coverImageUrl: 'https://picsum.photos/seed/padel-saly/800/420',
      timeLabel: 'Jusqu’à minuit (en ligne)',
      match: 'Open Saly — clôture des inscriptions équipes & paiement',
      descriptionHtml:
        '<p>Dernier jour pour valider votre équipe pour l’Open Saly. Vérifier le règlement et les catégories sur le formulaire en ligne.</p>',
    },
    /* Mai 2026 — données de démo pour le rendu calendrier */
    {
      id: 'may-01',
      title: 'Ligue Dakar — Journée 4 (soir)',
      venue: 'Yoff Padel',
      tier: 'Ligue',
      accent: 'var(--green)',
      start: '2026-05-01',
      coverImageUrl: 'https://picsum.photos/seed/padel-may-01/800/420',
      timeLabel: '19 h 30',
      match: 'Ligue Dakar — journée 4 · rencontres par niveau (soir)',
      descriptionHtml:
        '<p>Rencontres de ligue en soirée. <em>Format</em>&nbsp;: matchs au meilleur des deux sets gagnants.</p>',
    },
    {
      id: 'may-03',
      title: 'Clinic technique — vibora & sorties de grille',
      venue: 'Club Almadies',
      tier: 'Coaching',
      accent: 'var(--blue)',
      start: '2026-05-03',
      coverImageUrl: 'https://picsum.photos/seed/padel-may-03/800/420',
      timeLabel: '10 h 00',
      match: 'Clinic technique — vibora & sorties de grille · groupe 12 joueurs',
      descriptionHtml:
        '<p>Atelier encadré (2&nbsp;h). Prévoir tenue de sport et eau. Niveau intermédiaire recommandé.</p>',
    },
    {
      id: 'may-05',
      title: 'Tournoi corporate BNP · demi-finales',
      venue: 'Dakar Padel Center',
      tier: 'Corporate',
      accent: 'var(--violet)',
      start: '2026-05-05',
      coverImageUrl: 'https://picsum.photos/seed/padel-may-05/800/420',
      timeLabel: '19 h 00',
      match: 'Tournoi corporate BNP — demi-finales messieurs',
      descriptionHtml:
        '<p>Demi-finales du tournoi entreprise. Accès réservé aux équipes qualifiées et invités badge.</p>',
    },
    {
      id: 'may-08',
      title: 'Grand Prix Jeunes U16 — phase de poules',
      venue: 'TGS Arena',
      tier: 'Jeunes',
      accent: 'var(--orange)',
      start: '2026-05-08',
      endExclusive: '2026-05-11',
      coverImageUrl: 'https://picsum.photos/seed/padel-may-jeunes/800/420',
      timeLabel: 'Toute la journée (4 jours)',
      match: 'Grand Prix Jeunes U16 — phase de poules · terrains A à D',
      descriptionHtml:
        '<p>Phase de poules sur quatre jours. <strong>Présence obligatoire</strong> au briefing du premier jour à 8&nbsp;h&nbsp;30.</p>',
    },
    {
      id: 'may-10',
      title: 'Soirée découverte padel (gratuit)',
      venue: 'Saly Padel Club',
      tier: 'Initiation',
      accent: 'var(--green)',
      start: '2026-05-10',
      coverImageUrl: 'https://picsum.photos/seed/padel-may-10/800/420',
      timeLabel: '17 h 30',
      match: 'Soirée découverte padel — rotation courts & initiations courtes',
      descriptionHtml:
        '<p>Initiation gratuite, matériel prêté. Places limitées&nbsp;: inscription sur liste à l’accueil du club.</p>',
    },
    {
      id: 'may-12a',
      title: 'Point presse Fédération — saison 2026',
      venue: 'Siège Fédération · Dakar',
      tier: 'Médias',
      accent: 'var(--blue)',
      start: '2026-05-12',
      coverImageUrl: 'https://picsum.photos/seed/padel-may-12a/800/420',
      timeLabel: '11 h 00',
      match: 'Point presse Fédération — présentation calendrier & partenaires 2026',
      descriptionHtml:
        '<p>Conférence de presse (45&nbsp;min) puis questions. <strong>Accréditation</strong> obligatoire pour les médias.</p>',
    },
    {
      id: 'may-12b',
      title: 'Match exhibition Diallo / Sow vs invités',
      venue: 'TGS Arena',
      tier: 'Show',
      accent: 'var(--red)',
      start: '2026-05-12',
      coverImageUrl: 'https://picsum.photos/seed/padel-may-12b/800/420',
      timeLabel: '21 h 00',
      match: 'Match exhibition — Diallo / Sow vs paire invitée (show)',
      descriptionHtml:
        '<p>Match exhibition en soirée. Ambiance musicale et buvette ouverte dès 19&nbsp;h.</p>',
    },
    {
      id: 'may-15',
      title: 'Circuit Thiès — tableau principal J1',
      venue: 'Thiès Padel Club',
      tier: 'Régional',
      accent: 'var(--green)',
      start: '2026-05-15',
      endExclusive: '2026-05-17',
      coverImageUrl: 'https://picsum.photos/seed/padel-may-thies/800/420',
      timeLabel: '9 h 00 (3 jours)',
      match: 'Circuit Thiès — tableau principal · journée 1',
      descriptionHtml:
        '<p>Jour 1 du tableau principal. Planning affiché au tableau d’information du club.</p>',
    },
    {
      id: 'may-17',
      title: 'Live Q&A Instagram — tirage au sort Open',
      venue: 'En ligne',
      tier: 'Digital',
      accent: 'var(--blue)',
      start: '2026-05-17',
      timeLabel: '20 h 30',
      match: 'Live Instagram — tirage au sort Open + FAQ communauté',
      descriptionHtml:
        '<p>Session live sur Instagram&nbsp;: tirage au sort et réponses aux questions. Compte officiel <strong>&#64;padeldemo</strong> (fictif).</p>',
    },
    {
      id: 'may-20',
      title: 'Padel Business Cup — finale',
      venue: 'Radisson Blu · Dakar',
      tier: 'Corporate',
      accent: 'var(--violet)',
      start: '2026-05-20',
      coverImageUrl: 'https://picsum.photos/seed/padel-may-business/800/420',
      timeLabel: '18 h 30',
      match: 'Padel Business Cup — finale & remise des trophées',
      descriptionHtml:
        '<p>Finale et cocktail networking. Tenue cocktail souhaitée après les matchs.</p>',
    },
    {
      id: 'may-22',
      title: 'Stage intensif 3 jours (niveau 4+)',
      venue: 'Mbour Beach Padel',
      tier: 'Coaching',
      accent: 'var(--blue)',
      start: '2026-05-22',
      endExclusive: '2026-05-25',
      coverImageUrl: 'https://picsum.photos/seed/padel-may-stage/800/420',
      timeLabel: '9 h 00 (stage 3 jours)',
      match: 'Stage intensif niveau 4+ — journée 1/3 (Mbour Beach Padel)',
      descriptionHtml:
        '<p>Stage résidentiel. Hébergement non inclus — liste d’hébergements partenaires envoyée après inscription.</p>',
    },
    {
      id: 'may-24',
      title: 'Championnat mixte clubs — quart de finale',
      venue: 'Yoff Padel',
      tier: 'National',
      accent: 'var(--red)',
      start: '2026-05-24',
      coverImageUrl: 'https://picsum.photos/seed/padel-may-mixte/800/420',
      timeLabel: '16 h 00',
      match: 'Championnat mixte clubs — quarts de finale',
      descriptionHtml:
        '<p>Quarts de finale du championnat mixte. Règlement complet disponible au secrétariat.</p>',
    },
    {
      id: 'may-28',
      title: 'APP Tour — retransmission finale Miami (fan zone)',
      venue: 'Club Almadies',
      tier: 'International',
      accent: 'var(--coral)',
      start: '2026-05-28',
      coverImageUrl: 'https://picsum.photos/seed/padel-may-app/800/420',
      timeLabel: '22 h 00 (retransmission)',
      match: 'APP Tour — fan zone finale Miami · écran géant',
      descriptionHtml:
        '<p>Grande fan zone avec écran géant. Snacks et boissons à la carte.</p>',
    },
    {
      id: 'may-31',
      title: 'Clôture du mois — tournoi loisirs P250',
      venue: 'Dakar Padel Center',
      tier: 'Loisirs',
      accent: 'var(--green)',
      start: '2026-05-31',
      coverImageUrl: 'https://picsum.photos/seed/padel-may-31/800/420',
      timeLabel: '9 h – 18 h',
      match: 'Tournoi loisirs P250 — phases finales & clôture du mois',
      descriptionHtml:
        '<p>Tournoi loisirs de clôture du mois. Remise des prix prévue en fin de journée.</p>',
    },
  ];

  protected readonly calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    locale: frLocale,
    firstDay: 1,
    initialDate: '2026-05-01',
    headerToolbar: false,
    height: 'auto',
    fixedWeekCount: false,
    selectable: false,
    dayMaxEvents: 4,
    events: mapPadelToFullCalendar(this.allEvents),
    datesSet: (info) => {
      const d = info.view.currentStart;
      this.ngZone.run(() => {
        this.toolbarMonth.set(d.getMonth() + 1);
        this.toolbarYear.set(d.getFullYear());
      });
    },
    dateClick: (info: DateClickArg) => {
      this.ngZone.run(() => this.openModalForDate(info.date));
    },
    eventClick: (info) => {
      const start = info.event.start;
      if (start) {
        this.ngZone.run(() =>
          this.openModalForDate(new Date(start.getFullYear(), start.getMonth(), start.getDate()))
        );
      }
    },
  };

  ngAfterViewInit(): void {
    const api = this.fullCal?.getApi();
    if (api) {
      const d = api.getDate();
      this.toolbarMonth.set(d.getMonth() + 1);
      this.toolbarYear.set(d.getFullYear());
    }
  }

  protected calendarPrev(): void {
    this.fullCal?.getApi().prev();
  }

  protected calendarNext(): void {
    this.fullCal?.getApi().next();
  }

  protected calendarToday(): void {
    this.fullCal?.getApi().today();
  }

  protected onToolbarMonthChange(event: Event): void {
    const el = event.target as HTMLSelectElement;
    const month = Number(el.value);
    const y = this.toolbarYear();
    this.fullCal?.getApi().gotoDate(new Date(y, month - 1, 1));
  }

  protected onToolbarYearChange(event: Event): void {
    const el = event.target as HTMLSelectElement;
    const y = Number(el.value);
    const m = this.toolbarMonth();
    this.fullCal?.getApi().gotoDate(new Date(y, m - 1, 1));
  }

  protected eventsForDate(date: Date): PadelCalendarEvent[] {
    return this.allEvents.filter((e) => this.isDateInEvent(date, e));
  }

  /** 3 prochains événements (par date de début), à partir d’aujourd’hui. */
  protected get nextThreeEvents(): PadelCalendarEvent[] {
    const startOfToday = this.stripTime(new Date());
    return [...this.allEvents]
      .filter((ev) => this.parseIsoLocal(ev.start).getTime() >= startOfToday.getTime())
      .sort(
        (a, b) => this.parseIsoLocal(a.start).getTime() - this.parseIsoLocal(b.start).getTime()
      )
      .slice(0, 3);
  }

  protected formatEventStartShort(ev: PadelCalendarEvent): string {
    const datePart = new Intl.DateTimeFormat('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(this.parseIsoLocal(ev.start));
    const t = ev.timeLabel?.trim();
    return t ? `${datePart} · ${t}` : datePart;
  }

  /** Date (ou plage) affichée dans le modal, indépendamment du jour cliqué. */
  protected formatModalEventDate(ev: PadelCalendarEvent): string {
    const start = this.parseIsoLocal(ev.start);
    const longFmt: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    };
    if (!ev.endExclusive) {
      return new Intl.DateTimeFormat('fr-FR', longFmt).format(start);
    }
    const endEx = this.parseIsoLocal(ev.endExclusive);
    const endIncl = new Date(endEx.getFullYear(), endEx.getMonth(), endEx.getDate() - 1);
    if (this.stripTime(start).getTime() === this.stripTime(endIncl).getTime()) {
      return new Intl.DateTimeFormat('fr-FR', longFmt).format(start);
    }
    const from = new Intl.DateTimeFormat('fr-FR', longFmt).format(start);
    const to = new Intl.DateTimeFormat('fr-FR', longFmt).format(endIncl);
    return `Du ${from} au ${to}`;
  }

  protected modalMatchLine(ev: PadelCalendarEvent): string {
    return (ev.match ?? ev.title).trim();
  }

  protected openModalFromUpcoming(ev: PadelCalendarEvent): void {
    this.ngZone.run(() => this.openModalForDate(this.parseIsoLocal(ev.start)));
  }

  protected eventBadgeAccent(arg: EventContentArg): string {
    const ext = arg.event.extendedProps as { accentHex?: string };
    return ext.accentHex ?? '#1d9e75';
  }

  protected eventBadgeTier(arg: EventContentArg): string {
    const ext = arg.event.extendedProps as { tier?: string };
    return ext.tier ?? 'Événement';
  }

  /** HTML sûr pour le modal (balises autorisées par le sanitizer Angular). */
  protected eventDescriptionSafe(ev: PadelCalendarEvent): SafeHtml | null {
    const raw = ev.descriptionHtml?.trim();
    if (!raw) return null;
    const cleaned = this.sanitizer.sanitize(SecurityContext.HTML, raw);
    if (!cleaned?.trim()) return null;
    return this.sanitizer.bypassSecurityTrustHtml(cleaned);
  }

  protected closeModal(): void {
    this.modalOpen.set(false);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.modalOpen()) {
      this.closeModal();
    }
  }

  protected openModalForDate(date: Date): void {
    const formatter = new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    this.modalDateLabel.set(formatter.format(date));
    this.modalEvents.set(this.eventsForDate(date));
    this.modalOpen.set(true);
  }

  private isDateInEvent(day: Date, ev: PadelCalendarEvent): boolean {
    const dayT = this.stripTime(day).getTime();
    const startT = this.parseIsoLocal(ev.start).getTime();
    const endT = ev.endExclusive
      ? this.parseIsoLocal(ev.endExclusive).getTime()
      : startT + 86400000;
    return dayT >= startT && dayT < endT;
  }

  private stripTime(d: Date): Date {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  private parseIsoLocal(ymd: string): Date {
    const [y, m, day] = ymd.split('-').map(Number);
    return new Date(y, m - 1, day);
  }
}
