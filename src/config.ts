/**
 * Site settings. Seniors live in src/data/students.json, gallery photos in src/data/gallery.json.
 */
export const config = {
  classYear: 2027,
  schoolName: 'Our School',
  tagline: 'the last chapter',

  /** How many seniors there are. Empty spots show as "Add yourself" cards until everyone has joined. */
  classSize: 14,

  /**
   * Lets classmates add and edit their own cards and gallery photos (see README → "Let classmates add themselves").
   * Paste your Supabase project URL and anon public key here. Leave empty to use src/data/*.json only.
   */
  backend: {
    supabaseUrl: 'https://fadtqxuiclmfvrhvlxag.supabase.co',
    // The public "anon" key: safe to publish; the database rules decide what it can do.
    supabaseAnonKey:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhZHRxeHVpY2xtZnZyaHZseGFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEwMDg2ODksImV4cCI6MjEwNjU4NDY4OX0.ehaD6uybyyhx1WrSH_Aw27onh0SNWeuY5-M7tbQrONk',
  },

  /** Countdown on the cover. YYYY-MM-DD in the visitor's local time. */
  graduationDay: '2027-06-17',

  /** The two class videos. Remove a line (or the file) to hide that section. */
  videos: {
    tenYears: { src: '/media/videos/ten-years.mp4', poster: '/media/videos/ten-years.jpg' },
    signature: { src: '/media/videos/signature.mp4', poster: '/media/videos/signature.jpg' },
  } as Record<'tenYears' | 'signature', { src: string; poster?: string } | undefined>,

  /** Background song at public/media/music/song.mp3. It starts when someone presses Enter. */
  song: {
    enabled: true,
    src: '/media/music/song.mp3',
    title: 'Our Song',
    artist: 'Placeholder Artist',
    volume: 0.6,
  },

  /**
   * Optional password screen. This is a light gate, not real security: the site is
   * static, so the password can be found in the page's code by anyone determined.
   */
  password: {
    enabled: false,
    value: 'classof2027',
    hint: 'Ask the group chat',
  },
}
