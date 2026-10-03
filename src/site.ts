/**
 * Two versions of the yearbook are built from this one codebase:
 *  - "boys" (the default): the boys' yearbook
 *  - "all": boys and girls together
 * Pick one at build time with VITE_SITE=all (see package.json scripts). Each version has its
 * own seniors, passwords and gallery, stored in separate database tables.
 */
export type SiteId = 'boys' | 'all'

export const siteId: SiteId = import.meta.env.VITE_SITE === 'all' ? 'all' : 'boys'

export const site = {
  boys: {
    /** Database table/function prefix (see supabase/setup.sql and supabase/setup-all.sql). */
    tablePrefix: '',
    /** Cards shown when no backend is configured. */
    classSize: 14,
  },
  all: {
    tablePrefix: 'all_',
    classSize: 14,
  },
}[siteId]
