/**
 * Site settings. Seniors live in src/data/students.json, gallery photos in src/data/gallery.json.
 */
export const config = {
  classYear: 2027,
  schoolName: 'Our School',
  tagline: 'the last chapter',

  /** Hero counters. Dates are YYYY-MM-DD in the visitor's local time. */
  firstDay: '2015-09-01',
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
