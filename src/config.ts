/**
 * Site settings. Student content lives in src/data/students.json.
 */
export const config = {
  classYear: 2026,
  schoolName: 'Our School',

  /** Background song: put the file at public/media/music/song.mp3. Set `enabled: false` to hide the player. */
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
    value: 'classof2026',
    hint: 'Ask the group chat',
  },
} as const
