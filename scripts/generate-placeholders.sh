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

# Baby photos: faded film snapshot with a small silhouette.
for id in $(grep -o '"babyPhoto": *"[^"]*"' src/data/students.json | sed 's#.*/students/\([^/]*\)/.*#\1#'); do
  out="public/media/students/$id/baby.jpg"
  need "$out" || continue
  convert -size 700x700 "gradient:#dfe6ee-#9fb0c4" \
    \( -size 700x700 xc:none -fill "#c7cdd5" -draw "ellipse 350,330 150,165 0,360" -fill "#7d8ea6" -draw "ellipse 350,760 250,250 180,360" -blur 0x2 \) \
    -composite -modulate 100,60 -attenuate 0.45 +noise Gaussian -background "#5b6b82" -vignette 0x100 \
    -quality 70 -strip -interlace Plane "$out"
done

# Gallery: soft blurred colour fields in mixed sizes.
mkdir -p public/media/gallery
i=0
for spec in "1200x800|#8fb3d9-#1d2a44" "800x1100|#a9c6e8-#2f4a6f" "1000x1000|#9fa8d6-#2e3566" "1200x900|#88b9c4-#1f4450" \
            "800x1000|#c3d4ea-#4a5f82" "1200x800|#7fa3cf-#24375e" "900x1200|#b7c4dd-#3b4766" "1200x700|#8fc4cf-#244a55" \
            "1000x800|#a3b3e0-#2e3a6e" "800x1100|#b0c8dc-#33465c" "1200x900|#94aed4-#283b60" "1000x1000|#a0c4d8-#30506a"; do
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
