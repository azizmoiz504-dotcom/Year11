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

  /** "Our years" timeline. Add, remove or rewrite rows freely; `photo` is optional. */
  timeline: [
    { year: '2014', title: 'Day one', text: 'Tiny backpacks, huge nerves, and someone crying at the gate.' },
    { year: '2016', title: 'The first field trip', text: 'The bus sing-along that nobody has ever lived down.' },
    { year: '2018', title: 'Middle school', text: 'Lockers, group chats, and very questionable haircuts.' },
    { year: '2020', title: 'The screen years', text: 'Cameras off, mics muted, still somehow together.' },
    { year: '2023', title: 'Back in the hallways', text: 'Sports day, late-night projects, the canteen queue.' },
    { year: '2025', title: 'The last first day', text: 'We said it would go slowly. It did not.' },
    { year: '2026', title: 'Graduation', text: 'Caps in the air. The end of the beginning.' },
  ] as { year: string; title: string; text: string; photo?: string }[],

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
