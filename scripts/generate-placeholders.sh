#!/usr/bin/env bash
# Generates placeholder portraits, gallery photos and a placeholder song so the design
# can be previewed before real media is added. Needs ImageMagick (`convert`) and ffmpeg.
# Only writes files that don't exist yet; pass --force to overwrite.
set -euo pipefail
cd "$(dirname "$0")/.."
FORCE=${1:-}
need() { [[ "$FORCE" == "--force" || ! -f "$1" ]]; }

# Portraits: a classic blue studio backdrop with a silhouette, one per student folder in students.json.
for id in $(grep -o '"id": *"[^"]*"' src/data/students.json | sed 's/.*"\([^"]*\)"$/\1/'); do
  out="public/media/students/$id/photo.jpg"; mkdir -p "$(dirname "$out")"
  need "$out" || continue
  convert -size 800x1000 "gradient:#6f9fcf-#1c3a5e" \( -size 800x1000 plasma:fractal -blur 0x40 -colorspace gray \) \
    -compose softlight -composite -compose over \
    \( -size 800x1000 xc:none -fill "#b9c1c9" -draw "rectangle 352,560 448,760" -draw "ellipse 400,450 128,160 0,360" \
       -fill "#141821" -draw "ellipse 400,1060 360,330 180,360" -fill "#eef0f2" -draw "polygon 345,735 455,735 400,850" -blur 0x1.5 \) \
    -composite -attenuate 0.2 +noise Gaussian -quality 72 -strip -interlace Plane "$out"
done

# Gallery: soft blurred colour fields in mixed sizes.
mkdir -p public/media/gallery
i=0
for spec in "1200x800|#d9a066-#7a4a2a" "800x1100|#8fb3c9-#2e4a5f" "1000x1000|#c97b84-#5a2a33" "1200x900|#a3b18a-#3a4a2a" \
            "800x1000|#e6c88a-#8a6a3a" "1200x800|#9a8fc9-#3a2e5f" "900x1200|#c9a98f-#5f3e2e" "1200x700|#7fb0a8-#2a4a46" \
            "1000x800|#d8b4a0-#6a3e30" "800x1100|#b0b8c9-#3a4250" "1200x900|#c9c08f-#5f582e" "1000x1000|#a0c4d8-#30506a"; do
  i=$((i+1)); out=$(printf "public/media/gallery/%02d.jpg" $i)
  need "$out" || continue
  IFS='|' read -r size grad <<<"$spec"
  convert -size "$size" "gradient:$grad" \( -size "$size" plasma:fractal -blur 0x30 -modulate 100,40 \) -compose softlight -composite \
    -attenuate 0.25 +noise Gaussian -quality 70 -strip -interlace Plane "$out"
done

# A quiet ambient chord as a stand-in until the real song is added.
SONG=public/media/music/song.mp3
if need "$SONG"; then
  ffmpeg -loglevel error -y -f lavfi -i "aevalsrc=\
'0.10*(sin(2*PI*220*t)+0.7*sin(2*PI*277.18*t)+0.6*sin(2*PI*329.63*t)+0.4*sin(2*PI*440*t))\
*(0.6+0.4*sin(2*PI*t/8))*min(1,t/3)*min(1,(48-t)/3)':s=44100:d=48" -ac 1 -b:a 64k "$SONG"
fi
echo "Placeholders ready."
