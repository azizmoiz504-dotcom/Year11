# Class of 2027

A static yearbook site: an intro screen with music, a polaroid cover, every senior's portrait, name, university and quote, the class "In 10 years" reel, a photo gallery and the signature video.
Built with Vite + React + TypeScript + Tailwind. No backend.

**Live site:** https://azizmoiz504-dotcom.github.io/Year11/
It redeploys automatically (GitHub Actions → `gh-pages` branch) every time this branch is pushed.

## Let classmates add themselves
Once this is set up, anyone with the link can tap **Add yourself** on an empty card and upload their photo, childhood photo, university and quote.
They pick a PIN, which they need later to edit or remove their card. Anyone with the class code can also add photos to the gallery.

One-time setup (about 5 minutes, free):
1. Go to [supabase.com](https://supabase.com), sign up, and click **New project**. Any name and password work; pick a region near you.
2. When it's ready, open **SQL Editor → New query**. Paste in everything from [`supabase/setup.sql`](supabase/setup.sql).
   On the line marked `CHANGE ME`, replace `CHANGE-ME` with your class code (the word classmates type to add things). Press **Run**.
3. Open **Project Settings → API** (or **Data API**). Copy the **Project URL** and the **anon public** key.
4. Paste them into `src/config.ts` under `backend`, or send them to whoever maintains the site. The anon key is designed to be public, so it's safe in the code.

How it's protected:
- Adding a card or a gallery photo needs the class code. It's checked in the database, so it can't be skipped.
- Editing or removing a card needs that card's PIN.
- PINs and the class code are stored hashed, and visitors can't read them.
- The site has room for `classSize` cards (14). The database enforces the same limit (`max_students` in `setup.sql`).
- To delete anything by hand, use the Supabase dashboard (**Table Editor** → `students` or `gallery`).

To change the class code later, run this in the SQL Editor:
`update settings set class_code_hash = extensions.crypt('new-code', extensions.gen_salt('bf'));`

Without a backend configured, the site shows the cards from `src/data/students.json` instead.

## Add a student by hand
1. Add their photo at `public/media/students/<id>/photo.jpg`, for example `public/media/students/aisha-khan/photo.jpg`.
   Portrait (4:5) works best. Resize to about 1200px tall, under 300 KB.
2. Add an entry to `src/data/students.json`:
```json
{
  "id": "aisha-khan",
  "name": "Aisha Khan",
  "university": "University of Sharjah",
  "quote": "Their senior quote",
  "photo": "/media/students/aisha-khan/photo.jpg",
  "babyPhoto": "/media/students/aisha-khan/baby.jpg"
}
```
`id`, `name` and `photo` are required. `university`, `quote` and `babyPhoto` are optional.
`babyPhoto` is the "then" picture: hover over the portrait (computer) or tap it (phone) to swap between then and now.
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

## Videos
There are two videos, set in `src/config.ts` under `videos`:
- **In 10 years** (vertical, 9:16): `public/media/videos/ten-years.mp4`
- **Signatures** (landscape, 16:9): `public/media/videos/signature.mp4`

Replace the files and keep the same names. The `.jpg` next to each video is the still image shown before it plays.
Keep each video under about 50 MB. To shrink one:
`ffmpeg -i in.mov -vf scale=1280:-2 -c:v libx264 -crf 26 -movflags +faststart -c:a aac -b:a 128k out.mp4`
The music pauses while a video plays and comes back when it stops.

## Music
Replace `public/media/music/song.mp3` with your song, then set the title and artist in `src/config.ts`.
It starts when someone presses Enter on the intro screen. To remove the player, set `song.enabled: false`.

## Settings (`src/config.ts`)
- `classYear`, `schoolName`, `tagline`
- `graduationDay` for the days-left countdown on the cover (it drops by one every midnight)
- `classSize`: how many cards the seniors grid has room for
- `password.enabled: true` adds a password screen. It's a light gate, not real security.

## Run locally
```bash
npm install
npm run dev
```
