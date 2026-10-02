/**
 * Everything you might want to tweak lives here.
 * Student content lives in src/data/students.json.
 */
export const config = {
  /** Shown on the intro screen, hero and closing section. */
  classYear: 2026,
  schoolName: 'Our School',
  tagline: 'the last chapter',

  /** Dates are YYYY-MM-DD, interpreted in the visitor's local time. */
  firstDay: '2014-09-01',
  graduationDay: '2026-06-18',

  song: {
    src: '/media/music/song.mp3',
    title: 'Our Song',
    artist: 'Placeholder Artist',
    /** Starting volume, 0 to 1. */
    volume: 0.6,
  },

  closing: {
    title: "We'll always have these years.",
    message:
      'The hallways will be repainted and the lockers will get new names, but somewhere in all of this we grew up together. Thank you for every ordinary day.',
  },

  /**
   * Optional password screen so only the class can open the site.
   * NOTE: this is a light privacy gate, not real security. The site is static,
   * so a determined person could read the password from the JavaScript bundle.
   */
  password: {
    enabled: false,
    value: 'classof2026',
    hint: 'Hint: the name of our class, all lowercase, no spaces',
  },
} as const

/**
 * Optional university logos for the "Where we're all going" wall.
 * Key = the exact university name used in students.json, value = an image path in /public.
 * Universities without a logo get an elegant monogram instead.
 *   e.g. 'University of Sharjah': '/media/universities/uos.png'
 */
export const universityLogos: Record<string, string> = {}
