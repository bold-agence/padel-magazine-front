import { Routes } from '@angular/router';

export const PAGES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layout/client-layout.component').then((m) => m.ClientLayoutComponent),
    children: [
      {
        path: '',
        data: {
          title: 'Padel Magazine — Le padel au Sénégal et en Afrique francophone',
          description:
            "Le premier magazine en ligne dédié au padel au Sénégal et en Afrique francophone. Actualités, résultats, classements, coaching et live.",
        },
        loadComponent: () =>
          import('./home/home.component').then((m) => m.HomeComponent),
      },
      {
        path: 'actualites',
        data: {
          title: 'Actualités — Padel Magazine',
          description:
            "Toute l'actualité du padel au Sénégal et en Afrique francophone : tournois, clubs, transferts et fédération.",
        },
        loadComponent: () =>
          import('./actualites/actualites.component').then((m) => m.ActualitesComponent),
      },
      {
        path: 'actualites/:slug',
        data: {
          title: 'Article — Padel Magazine',
          description:
            "Consultez le détail d'un article Padel Magazine : analyses, résultats et actualités du padel.",
        },
        loadComponent: () =>
          import('./actualites/article.component').then((m) => m.ArticleComponent),
      },
      {
        path: 'resultats',
        data: {
          title: 'Résultats — Padel Magazine',
          description:
            'Scores complets des tournois sénégalais et internationaux : Open Dakar, circuits régionaux, WPT et APP Tour.',
        },
        loadComponent: () =>
          import('./resultats/resultats.component').then((m) => m.ResultatsComponent),
      },
      {
        path: 'classements',
        data: {
          title: 'Classements — Padel Magazine',
          description:
            'Rankings officiels : Fédération Sénégalaise de Padel, WPT Mondial et APP Tour, mis à jour après chaque tournoi.',
        },
        loadComponent: () =>
          import('./classements/classements.component').then((m) => m.ClassementsComponent),
      },
      {
        path: 'calendrier',
        data: {
          title: 'Calendrier — Padel Magazine',
          description:
            'Calendrier des tournois et événements padel au Sénégal et à l’international : dates, lieux et niveaux.',
        },
        loadComponent: () =>
          import('./calendrier/calendrier.component').then((m) => m.CalendrierComponent),
      },
      {
        path: 'coaching',
        data: {
          title: 'Coaching & Technique — Padel Magazine',
          description:
            'Conseils, exercices et tactiques pour progresser au padel, par nos coachs et experts internationaux.',
        },
        loadComponent: () =>
          import('./coaching/coaching.component').then((m) => m.CoachingComponent),
      },
      {
        path: 'portraits',
        data: {
          title: 'Portraits — Padel Magazine',
          description:
            'Les figures du padel sénégalais et international : parcours, statistiques et coups signature.',
        },
        loadComponent: () =>
          import('./portraits/portraits.component').then((m) => m.PortraitsComponent),
      },
      {
        path: 'international',
        data: {
          title: 'International — Padel Magazine',
          description:
            'Le padel pro vu du Sénégal : résultats, calendrier et analyses des circuits mondiaux WPT et APP Tour.',
        },
        loadComponent: () =>
          import('./international/international.component').then((m) => m.InternationalComponent),
      },
      {
        path: 'live',
        data: {
          title: 'Live Stream — Padel Magazine',
          description:
            'Tous les matchs diffusés en direct sur la chaîne YouTube Padel Magazine Sénégal, avec replays et programmation.',
        },
        loadComponent: () => import('./live/live.component').then((m) => m.LiveComponent),
      },
      {
        path: 'videos',
        data: {
          title: 'Vidéos — Padel Magazine',
          description:
            'Replays de matchs, interviews, coaching vidéo et highlights : tout le contenu vidéo Padel Magazine.',
        },
        loadComponent: () => import('./videos/videos.component').then((m) => m.VideosComponent),
      },
      {
        path: 'apropos',
        data: {
          title: 'À propos & Contact — Padel Magazine',
          description:
            "Découvrez l'équipe éditoriale de Padel Magazine, nos offres publicitaires et les moyens de nous contacter.",
        },
        loadComponent: () => import('./apropos/apropos.component').then((m) => m.AproposComponent),
      },
    ],
  },
];
