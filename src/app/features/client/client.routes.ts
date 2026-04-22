import { Routes } from '@angular/router';

export const CLIENT_ROUTES: Routes = [
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
          import('./home/pages/home.page').then((m) => m.HomePage),
      },
      {
        path: 'actualites',
        data: {
          title: 'Actualités — Padel Magazine',
          description:
            "Toute l'actualité du padel au Sénégal et en Afrique francophone : tournois, clubs, transferts et fédération.",
        },
        loadComponent: () =>
          import('./actualites/pages/actualites.page').then((m) => m.ActualitesPage),
      },
      {
        path: 'actualites/:slug',
        data: {
          title: 'Article — Padel Magazine',
          description:
            "Consultez le détail d'un article Padel Magazine : analyses, résultats et actualités du padel.",
        },
        loadComponent: () =>
          import('./actualites/pages/article.page').then((m) => m.ArticlePage),
      },
      {
        path: 'resultats',
        data: {
          title: 'Résultats — Padel Magazine',
          description:
            'Scores complets des tournois sénégalais et internationaux : Open Dakar, circuits régionaux, WPT et APP Tour.',
        },
        loadComponent: () =>
          import('./resultats/pages/resultats.page').then((m) => m.ResultatsPage),
      },
      {
        path: 'classements',
        data: {
          title: 'Classements — Padel Magazine',
          description:
            'Rankings officiels : Fédération Sénégalaise de Padel, WPT Mondial et APP Tour, mis à jour après chaque tournoi.',
        },
        loadComponent: () =>
          import('./classements/pages/classements.page').then((m) => m.ClassementsPage),
      },
      {
        path: 'coaching',
        data: {
          title: 'Coaching & Technique — Padel Magazine',
          description:
            'Conseils, exercices et tactiques pour progresser au padel, par nos coachs et experts internationaux.',
        },
        loadComponent: () =>
          import('./coaching/pages/coaching.page').then((m) => m.CoachingPage),
      },
      {
        path: 'portraits',
        data: {
          title: 'Portraits — Padel Magazine',
          description:
            'Les figures du padel sénégalais et international : parcours, statistiques et coups signature.',
        },
        loadComponent: () =>
          import('./portraits/pages/portraits.page').then((m) => m.PortraitsPage),
      },
      {
        path: 'international',
        data: {
          title: 'International — Padel Magazine',
          description:
            'Le padel pro vu du Sénégal : résultats, calendrier et analyses des circuits mondiaux WPT et APP Tour.',
        },
        loadComponent: () =>
          import('./international/pages/international.page').then((m) => m.InternationalPage),
      },
      {
        path: 'live',
        data: {
          title: 'Live Stream — Padel Magazine',
          description:
            'Tous les matchs diffusés en direct sur la chaîne YouTube Padel Magazine Sénégal, avec replays et programmation.',
        },
        loadComponent: () => import('./live/pages/live.page').then((m) => m.LivePage),
      },
      {
        path: 'videos',
        data: {
          title: 'Vidéos — Padel Magazine',
          description:
            'Replays de matchs, interviews, coaching vidéo et highlights : tout le contenu vidéo Padel Magazine.',
        },
        loadComponent: () => import('./videos/pages/videos.page').then((m) => m.VideosPage),
      },
      {
        path: 'apropos',
        data: {
          title: 'À propos & Contact — Padel Magazine',
          description:
            "Découvrez l'équipe éditoriale de Padel Magazine, nos offres publicitaires et les moyens de nous contacter.",
        },
        loadComponent: () => import('./apropos/pages/apropos.page').then((m) => m.AproposPage),
      },
    ],
  },
];
