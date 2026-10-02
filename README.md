# Class of 2026 · Digital Yearbook

A static yearbook site (Vite + React + TypeScript + Tailwind + Framer Motion). No backend. Deploys free on Vercel or Netlify.

## Run it
```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
```

## Add a student
1. Make a folder: `public/media/students/<student-id>/` (e.g. `aisha-khan`).
2. Put in `current.jpg` (required), plus `baby.jpg` and `reel.mp4` (vertical 9:16) if you have them.
3. Add an entry to `src/data/students.json`:
```json
{
  "id": "aisha-khan",
  "name": "Aisha Khan",
  "nickname": "Ash",
  "quote": "Their senior quote",
  "university": "University of Sharjah",
  "major": "Mechanical Engineering",
  "city": "Sharjah",
  "currentPhoto": "/media/students/aisha-khan/current.jpg",
  "babyPhoto": "/media/students/aisha-khan/baby.jpg",
  "reel": "/media/students/aisha-khan/reel.mp4",
  "tenYearsGoal": "Where they see themselves in 10 years",
  "funFacts": ["Most likely to...", "Always seen with..."]
}
```
Only `id`, `name` and `currentPhoto` are required. Leave anything else out and the page adapts.
Keep the university name spelled the same for everyone going there, so they group together.

**Keep it fast on mobile data:** photos about 1200px on the long side, JPG quality around 75 (under 300 KB). Reels 720×1280, under 15 seconds, a few MB. For example:
`ffmpeg -i in.mov -vf scale=720:-2 -c:v libx264 -crf 28 -movflags +faststart -c:a aac -b:a 96k reel.mp4`

## Swap the song
Replace `public/media/music/song.mp3` with your track, keeping the same name. Then set the title and artist in `src/config.ts` under `song`.

## Other settings (`src/config.ts`)
- `classYear`, `schoolName`, `tagline`
- `firstDay` and `graduationDay` for the hero counters
- `closing` for the goodbye message
- `password.enabled: true` turns on a password screen. It's only a light gate: the site is static, so it isn't real security.
- `universityLogos` is optional. Map a university name to a logo image; otherwise you get a monogram.

## Deploy
- **Vercel:** push to GitHub, then "Add New Project" on vercel.com and import the repo. It detects Vite. `vercel.json` is included.
- **Netlify:** "Add new site", then "Import from Git". The settings come from `netlify.toml`.

The site is `noindex`, using a meta tag, an `X-Robots-Tag` header and `robots.txt`, so search engines skip it.

## Placeholders
`npm run placeholders` regenerates the placeholder images, reels and song. It needs ImageMagick and ffmpeg. Delete the placeholder students from `students.json` once real ones are in.
