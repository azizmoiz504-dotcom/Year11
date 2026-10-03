# Class of 2027

A static yearbook site: an intro screen with music, a polaroid cover, every senior's portrait, name, university and quote, the class "In 10 years" reel, a photo gallery and the signature video.
Built with Vite + React + TypeScript + Tailwind. No backend.

**Live sites (Vercel):** boys https://msb-2027.vercel.app · boys + girls https://msb-2027-all.vercel.app
Both redeploy automatically every time this branch is pushed. The boys + girls project has the environment variable `VITE_SITE=all`.

## Two sites from one codebase
- **Boys** (default): seniors from `src/data/students.json`, database tables `students` / `gallery`.
- **Boys + girls**: build with `VITE_SITE=all` (`npm run build:all`). Seniors come from `src/data/students-all.json` and the tables are `all_students` / `all_gallery` (set up with [`supabase/setup-all.sql`](supabase/setup-all.sql)).

Per-site settings live in `src/site.ts`. Everything else (design, music, videos) is shared.
On Vercel, make two projects from this repo and set the environment variable `VITE_SITE=all` on the second one.

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

## Add photos and quotes (no setup needed)
Every senior already has a folder: `public/media/students/<their-name>/`, for example `public/media/students/aziz-hamid/`.
- Upload their current photo as **`photo.jpg`** and their childhood photo as **`baby.jpg`**. They show up automatically.
  Until then the card shows their initials, and then/now only appears once `baby.jpg` exists.
- Add their university and quote in `src/data/students.json`, in their entry's `"university"` and `"quote"`.

Easiest way, on the GitHub website:
1. Open the repo, then go into `public/media/students/<their-name>/`.
2. Click **Add file → Upload files**. Rename the photo to `photo.jpg` (or `baby.jpg`) before uploading, then click **Commit changes**.
3. To change a quote, open `src/data/students.json`, click the ✏️ pencil, edit the text between the quotes, and click **Commit changes**.
The live site updates by itself a couple of minutes later.

Photos: portrait (taller than wide) works best. Phone photos are fine, but under about 2 MB keeps the site fast.

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
Songs play in order and then loop. They start when someone presses **Enter** on the intro screen, and the player has a **Next** button when there's more than one song.
To add a song, put the mp3 in `public/media/music/` and add a line to `music.songs` in `src/config.ts`:
```ts
{ src: '/media/music/my-song.mp3', title: 'Song title', artist: 'Artist' },
```
To turn music off, set `music.enabled: false`.

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
