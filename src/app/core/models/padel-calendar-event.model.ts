/** Modèle calendrier front (alimenté par l’API `events` + mapping). */
export type PadelCalendarEvent = {
  id: string;
  title: string;
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
