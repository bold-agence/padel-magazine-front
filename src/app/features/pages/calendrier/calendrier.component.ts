import { NgTemplateOutlet } from '@angular/common';
import {
  AfterViewInit,
  Component,
  computed,
  HostListener,
  inject,
  NgZone,
  OnInit,
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
import type { PadelCalendarEvent } from '../../../core/models/padel-calendar-event.model';
import {
  EventTagDto,
  EventsService,
  mapEventDtoToPadel,
} from '../../../core/services/events.service';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';

function resolveAccentHex(accent: string): string {
  const t = accent.trim();
  if (/^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(t)) {
    return t;
  }
  const map: Record<string, string> = {
    'var(--red)': '#e24b4a',
    'var(--orange)': '#ff5502',
    'var(--blue)': '#378add',
    'var(--violet)': '#7f77dd',
    'var(--coral)': '#d85a30',
    'var(--green)': '#1d9e75',
  };
  return map[t] ?? '#1d9e75';
}

function mapPadelToFullCalendar(events: PadelCalendarEvent[]): EventInput[] {
  return events.map((ev) => {
    const bg = resolveAccentHex(ev.accent);
    const endIso = fcTimedEndForCalendar(ev.debut, ev.fin);
    return {
      id: ev.id,
      title: ev.calendarLabel,
      start: ev.debut,
      end: endIso,
      allDay: false,
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

/** FullCalendar exige une fin pour les événements horaires ; si l’API n’envoie pas `fin`, on prolonge d’1 h (affichage seulement). */
function fcTimedEndForCalendar(debutIso: string, finIso?: string | null): string {
  if (finIso?.trim()) return finIso.trim();
  const d = new Date(debutIso);
  d.setTime(d.getTime() + 60 * 60 * 1000);
  return d.toISOString();
}

@Component({
  selector: 'app-calendrier-component',
  standalone: true,
  imports: [NgTemplateOutlet, SidebarComponent, FullCalendarModule],
  templateUrl: './calendrier.component.html',
  styleUrl: './calendrier.component.scss',
})
export class CalendrierComponent implements OnInit, AfterViewInit {
  private readonly ngZone = inject(NgZone);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly eventsService = inject(EventsService);

  @ViewChild('fullCal') private fullCal?: FullCalendarComponent;

  protected readonly modalOpen = signal(false);
  protected readonly modalDateLabel = signal('');
  protected readonly modalEvents = signal<PadelCalendarEvent[]>([]);

  /** Données issues de `GET /events` */
  protected readonly allEvents = signal<PadelCalendarEvent[]>([]);
  protected readonly eventTags = signal<EventTagDto[]>([]);
  protected readonly selectedTagId = signal<string | null>(null);
  protected readonly eventsLoading = signal(true);
  protected readonly eventsLoadError = signal(false);

  protected readonly filteredEvents = computed(() => {
    const tagId = this.selectedTagId();
    const all = this.allEvents();
    if (!tagId) {
      return all;
    }
    return all.filter((ev) => ev.tagIds?.includes(tagId));
  });

  protected readonly nextThreeEvents = computed(() => {
    const list = this.filteredEvents();
    const startOfToday = this.stripTime(new Date());
    const t0 = startOfToday.getTime();
    return [...list]
      .filter((ev) => {
        const startsTodayOrLater = this.eventDebut(ev).getTime() >= t0;
        const spansToday = this.isDateInEvent(startOfToday, ev);
        return startsTodayOrLater || spansToday;
      })
      .sort((a, b) => this.eventDebut(a).getTime() - this.eventDebut(b).getTime())
      .slice(0, 3);
  });

  /** Mois affiché (1–12), synchronisé avec FullCalendar — mois civil courant par défaut. */
  protected readonly toolbarMonth = signal(new Date().getMonth() + 1);
  /** Année affichée — année courante par défaut. */
  protected readonly toolbarYear = signal(new Date().getFullYear());

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

  /** Années proposées : à partir de 2014 jusqu’à au moins l’année courante + 2. */
  protected readonly yearOptions: number[] = CalendrierComponent.buildYearOptions();

  protected readonly viewMonthYearTitle = computed(() => {
    const y = this.toolbarYear();
    const m = this.toolbarMonth();
    return new Intl.DateTimeFormat('fr-FR', {
      month: 'long',
      year: 'numeric',
    }).format(new Date(y, m - 1, 1));
  });

  protected calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    locale: frLocale,
    firstDay: 1,
    /** 1er jour du mois courant (évite toute ambiguïté fuseau / « milieu de mois »). */
    initialDate: CalendrierComponent.startOfCurrentMonth(),
    headerToolbar: false,
    height: 'auto',
    fixedWeekCount: false,
    selectable: false,
    dayMaxEvents: 4,
    events: mapPadelToFullCalendar([]),
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

  ngOnInit(): void {
    this.eventsService.findAllTags().subscribe({
      next: (tags) => {
        this.ngZone.run(() => this.eventTags.set(tags));
      },
      error: () => {
        this.ngZone.run(() => this.eventTags.set([]));
      },
    });

    this.eventsService.findAll().subscribe({
      next: (rows) => {
        const mapped = rows.map((dto) => mapEventDtoToPadel(dto));
        this.ngZone.run(() => {
          this.allEvents.set(mapped);
          this.eventsLoading.set(false);
          this.eventsLoadError.set(false);
          this.syncCalendarEvents();
        });
      },
      error: () => {
        this.ngZone.run(() => {
          this.eventsLoadError.set(true);
          this.eventsLoading.set(false);
        });
      },
    });
  }

  protected setTagFilter(tagId: string | null): void {
    this.selectedTagId.set(tagId);
    this.syncCalendarEvents();
  }

  private syncCalendarEvents(): void {
    const mapped = mapPadelToFullCalendar(this.filteredEvents());
    this.calendarOptions = {
      ...this.calendarOptions,
      events: mapped,
    };
    queueMicrotask(() => {
      try {
        this.fullCal?.getApi().refetchEvents();
      } catch {
        /* composant pas encore prêt */
      }
    });
  }

  ngAfterViewInit(): void {
    const api = this.fullCal?.getApi();
    if (api) {
      const d = api.getDate();
      this.toolbarMonth.set(d.getMonth() + 1);
      this.toolbarYear.set(d.getFullYear());
      if (this.allEvents().length > 0) {
        queueMicrotask(() => this.fullCal?.getApi().refetchEvents());
      }
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
    return this.filteredEvents().filter((e) => this.isDateInEvent(date, e));
  }

  private modalDateFr(d: Date): string {
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(d);
  }

  private modalHeureFr(d: Date): string {
    return new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  }

  protected formatEventStartShort(ev: PadelCalendarEvent): string {
    const d = this.eventDebut(ev);
    const datePart = new Intl.DateTimeFormat('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(d);
    const heure = this.modalHeureFr(d);
    return `${datePart} · ${heure}`;
  }

  /** Modal : `Debut : <date> - <heure>` */
  protected formatModalDebutLine(ev: PadelCalendarEvent): string {
    const d = this.eventDebut(ev);
    return `Debut : ${this.modalDateFr(d)} - ${this.modalHeureFr(d)}`;
  }

  /** Modal : `Fin : <date> - <heure>` ou tiret si pas de fin. */
  protected formatModalFinLine(ev: PadelCalendarEvent): string {
    const f = ev.fin?.trim();
    if (!f) {
      return 'Fin : —';
    }
    const d = new Date(f);
    return `Fin : ${this.modalDateFr(d)} - ${this.modalHeureFr(d)}`;
  }

  protected modalMatchLine(ev: PadelCalendarEvent): string {
    return (ev.match ?? ev.title).trim();
  }

  protected openModalFromUpcoming(ev: PadelCalendarEvent): void {
    this.ngZone.run(() => this.openModalForDate(this.stripTime(this.eventDebut(ev))));
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
    const ds = this.stripTime(day).getTime();
    const de = ds + 86400000;
    const evStart = this.eventDebut(ev).getTime();
    const fin = ev.fin?.trim();
    if (!fin) {
      return evStart >= ds && evStart < de;
    }
    const evEnd = new Date(fin).getTime();
    return evStart < de && evEnd > ds;
  }

  private stripTime(d: Date): Date {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  private eventDebut(ev: PadelCalendarEvent): Date {
    return new Date(ev.debut);
  }

  private static startOfCurrentMonth(): Date {
    const n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), 1);
  }

  private static buildYearOptions(): number[] {
    const start = 2014;
    const end = Math.max(start + 21, new Date().getFullYear() + 2);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }
}
