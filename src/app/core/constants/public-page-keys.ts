export const DEFAULT_PUBLIC_PAGE_KEY = 'default';

export const PUBLIC_PAGE_KEYS = [
  DEFAULT_PUBLIC_PAGE_KEY,
  'home',
  'actualites',
  'resultats',
  'classements',
  'calendrier',
  'coaching',
  'portraits',
  'international',
  'live',
  'videos',
  'apropos',
] as const;

export type PublicPageKey = (typeof PUBLIC_PAGE_KEYS)[number];

export function isPublicPageKey(value: string): value is PublicPageKey {
  return (PUBLIC_PAGE_KEYS as readonly string[]).includes(value);
}

export function resolvePageKeyFromUrl(url: string): PublicPageKey {
  const path = url.split('?')[0].split('#')[0].replace(/^\/+|\/+$/g, '');
  const segment = path.split('/')[0] || 'home';
  if ((PUBLIC_PAGE_KEYS as readonly string[]).includes(segment)) {
    return segment as PublicPageKey;
  }
  return 'home';
}
