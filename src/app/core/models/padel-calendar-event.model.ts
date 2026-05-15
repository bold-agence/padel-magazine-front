/** Modèle calendrier front (alimenté par l’API `events` + mapping). */
export type PadelCalendarEvent = {
  id: string;
  /** Titre brut de l’événement (API). */
  title: string;
  /** Libellé affiché (cartes « à venir », pastilles) : « Titre | catégorie tournoi » si catégorie. */
  calendarLabel: string;
  /** Libellé du tournoi (API), si l’événement est rattaché à un tournoi. */
  tournamentLabel?: string | null;
  /** Libellé de la catégorie de tournoi (si renseignée). */
  tournamentCategoryLabel?: string | null;
  venue: string;
  tier: string;
  accent: string;
  /** Début du créneau (datetime ISO, ex. renvoyé par l’API `startAt`) */
  debut: string;
  /** Fin du créneau (datetime ISO, ex. `endAt`) — optionnel */
  fin?: string | null;
  coverImageUrl?: string;
  /** Ligne « match / tournoi » (modal) */
  match?: string;
  descriptionHtml?: string;
};
