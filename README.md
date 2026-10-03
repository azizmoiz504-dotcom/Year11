# Class of 2026

A simple static yearbook site: every senior's portrait, name, university and quote, plus a gallery of the year.
Built with Vite + React + TypeScript + Tailwind. No backend.

**Live site:** https://azizmoiz504-dotcom.github.io/Year11/
It redeploys automatically (GitHub Actions → `gh-pages` branch) every time this branch is pushed.

## Add a student
1. Add their photo at `public/media/students/<id>/photo.jpg`, for example `public/media/students/aisha-khan/photo.jpg`.
   Portrait (4:5) works best. Resize to about 1200px tall, under 300 KB.
2. Add an entry to `src/data/students.json`:
```json
{
  "id": "aisha-khan",
  "name": "Aisha Khan",
  "university": "University of Sharjah",
  "quote": "Their senior quote",
  "photo": "/media/students/aisha-khan/photo.jpg"
}
```
`id`, `name` and `photo` are required. `university` and `quote` are optional.
Spell each university the same way for everyone so the filter groups them together.

You can do all of this in the GitHub website (Add file → Upload files, then edit `students.json`). The live site updates a minute or two later.

## Gallery
Put photos in `public/media/gallery/` and list them in `src/data/gallery.json`:
```json
[
  { "src": "/media/gallery/sports-day.jpg", "caption": "Sports day" }
]
```
Captions are optional. Resize photos to about 1600px on the long side so the page stays fast.

## Music
Replace `public/media/music/song.mp3` with your song, then set the title and artist in `src/config.ts`.
The player starts paused, and visitors tap play. To remove the player, set `song.enabled: false`.

## Settings (`src/config.ts`)
- `classYear`, `schoolName`
- `password.enabled: true` adds a password screen. It's a light gate, not real security.

## Run locally
```bash
npm install
npm run dev
```
