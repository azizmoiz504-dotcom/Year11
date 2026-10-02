#!/usr/bin/env bash
# Generates placeholder photos, reels and a placeholder song so the design can be
# previewed before real media is added. Requires ImageMagick (`convert`) and ffmpeg.
# Safe to re-run: it only writes files that don't exist yet (pass --force to overwrite).
set -euo pipefail
cd "$(dirname "$0")/.."

FORCE=${1:-}
OUT=public/media/students
SERIF=$(fc-match -f '%{file}' 'DejaVu Serif:style=Bold' 2>/dev/null || echo DejaVu-Serif-Bold)
SANS=$(fc-match -f '%{file}' 'DejaVu Sans' 2>/dev/null || echo DejaVu-Sans)

need() { [[ "$FORCE" == "--force" || ! -f "$1" ]]; }

# id | initials | bg-top | bg-bottom | has-baby | has-reel | goal text for the reel
STUDENTS=(
  "aisha-khan|AK|#c98b5e|#5b3a29|1|1|Designing cleaner engines"
  "omar-haddad|OH|#7d8c6a|#2f3a2a|1|1|Building homes that breathe"
  "layla-mansour|LM|#b46a6a|#3d2228|1|1|Running my own fund"
  "yusuf-rahman|YR|#6d7f99|#232c3a|1|0|"
  "maya-fernandes|MF|#d0a35a|#5a4120|1|1|Helping people heal"
  "zayd-ali|ZA|#5f8a8b|#1f3335|1|1|Shipping something millions use"
  "sara-ibrahim|SI|#a77ca6|#3b2840|0|1|My name on a gallery wall"
  "adam-chen|AC|#8f7b66|#2e2620|1|0|"
)

for row in "${STUDENTS[@]}"; do
  IFS='|' read -r id ini top bottom baby reel goal <<<"$row"
  dir="$OUT/$id"; mkdir -p "$dir"

  if need "$dir/current.jpg"; then
    convert -size 800x1000 "gradient:$top-$bottom" \
      \( -size 800x1000 xc:none -fill "rgba(20,14,10,0.55)" \
         -draw "circle 400,400 400,560" \
         -draw "ellipse 400,1010 300,300 180,360" \) -composite \
      -font "$SERIF" -pointsize 96 -fill "rgba(255,246,232,0.85)" -gravity center -annotate +0-100 "$ini" \
      -attenuate 0.35 +noise Gaussian -modulate 100,90 \
      -quality 72 -strip -interlace Plane "$dir/current.jpg"
  fi

  if [[ "$baby" == "1" ]] && need "$dir/baby.jpg"; then
    convert -size 700x700 "gradient:#efe0c4-#b99a72" \
      \( -size 700x700 xc:none -fill "rgba(90,62,40,0.55)" \
         -draw "circle 350,300 350,470" \
         -draw "ellipse 350,720 230,200 180,360" \) -composite \
      -font "$SERIF" -pointsize 64 -fill "rgba(255,248,236,0.9)" -gravity center -annotate +0-50 "$ini" \
      -modulate 100,45 -fill "#8a6a45" -colorize 12% -attenuate 0.5 +noise Gaussian -background "#4a3624" -vignette 0x90 \
      -quality 70 -strip -interlace Plane "$dir/baby.jpg"
  fi

  if [[ "$reel" == "1" ]] && need "$dir/reel.mp4"; then
    ffmpeg -loglevel error -y -loop 1 -i "$dir/current.jpg" -t 6 \
      -vf "scale=-2:1920,crop=1080:1920,zoompan=z='min(zoom+0.0012,1.2)':d=144:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=540x960:fps=24,\
drawtext=fontfile=$SANS:text='IN 10 YEARS':fontcolor=white@0.8:fontsize=26:x=(w-text_w)/2:y=h*0.70:alpha='min(1,t/1)',\
drawtext=fontfile=$SERIF:text='$goal':fontcolor=white:fontsize=30:x=(w-text_w)/2:y=h*0.75:alpha='min(1,max(0,t-0.8))',\
format=yuv420p" \
      -c:v libx264 -preset slow -crf 30 -movflags +faststart -an "$dir/reel.mp4"
  fi
done

# A soft, quiet ambient chord as a stand-in until you add the real song.
SONG=public/media/music/song.mp3
if need "$SONG"; then
  ffmpeg -loglevel error -y -f lavfi -i "aevalsrc=\
'0.10*(sin(2*PI*220*t)+0.7*sin(2*PI*277.18*t)+0.6*sin(2*PI*329.63*t)+0.4*sin(2*PI*440*t*(1+0.002*sin(t))))\
*(0.6+0.4*sin(2*PI*t/8))*min(1,t/3)*min(1,(48-t)/3)':s=44100:d=48" \
    -ac 1 -b:a 64k "$SONG"
fi

echo "Placeholders ready in $OUT and $SONG"
