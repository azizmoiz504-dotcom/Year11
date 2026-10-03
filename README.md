# Class of 2027

A static yearbook site: an intro screen with music, a polaroid cover, every senior's portrait, name, university and quote, the class "In 10 years" reel, a photo gallery and the signature video.
Built with Vite + React + TypeScript + Tailwind. No backend.

**Live site:** https://azizmoiz504-dotcom.github.io/Year11/
It redeploys automatically (GitHub Actions → `gh-pages` branch) every time this branch is pushed.

## Let classmates fill in their own cards
Every senior gets a card with their name and a personal password. They open the site, tap their card,
choose **This is me**, enter their password, and add their photos (now and then), university and quote.
The same password lets them add photos to the gallery. Changes show up for everyone straight away.

One-time setup (free):
1. Create a project at [supabase.com](https://supabase.com). You may need to create an organization first: choose Personal and the Free plan.
2. Make the seed block with everyone's names. It generates one password per person:
   `python3 scripts/make-seed.py "Name One" "Name Two" ...`
   Keep the output private: it contains the passwords. Don't commit it.
3. In Supabase, open **SQL Editor → New query**. Paste [`supabase/setup.sql`](supabase/setup.sql) followed by the seed block's SQL, then press **Run**.
4. In **Project Settings → API**, copy the **Project URL** and the **anon public** key into `src/config.ts` under `backend`.
5. Send each classmate their own password.

How it's protected:
- A card can only be edited with that senior's password. It's checked inside the database, and passwords are stored hashed.
- Gallery uploads need any senior's password.
- To remove something by hand, use the Supabase dashboard (**Table Editor** → `students` or `gallery`).
- To reset someone's password, run this in the SQL Editor:
  `update students set pin_hash = extensions.crypt('new-password', extensions.gen_salt('bf')) where name = 'Their Name';`

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
