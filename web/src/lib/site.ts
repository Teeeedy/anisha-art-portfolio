import type { SiteSettings } from '../types/siteSettings';
import { siteSettingsQuery } from './queries';
import { sanityFetch } from './sanity';

export const DEFAULT_SITE_TITLE = 'Blends by A';
export const DEFAULT_DESCRIPTION =
  'Blends by A — original artwork and make up artistry by Anisha.';

export const NAV_ITEMS = [
  { label: 'Art', href: '/art' },
  { label: 'Make Up', href: '/makeup' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
] as const;

export const ENQUIRY_TYPES = ['Commission', 'Collaboration', 'General'] as const;

let settingsPromise: Promise<SiteSettings> | undefined;

/** Fetched once per build and shared by every page/layout. */
export function getSiteSettings(): Promise<SiteSettings> {
  settingsPromise ??= sanityFetch<SiteSettings>(siteSettingsQuery, {}, {});
  return settingsPromise;
}

export function isActivePath(current: string, href: string): boolean {
  const path = current.replace(/\/+$/, '') || '/';
  return path === href || path.startsWith(`${href}/`);
}
