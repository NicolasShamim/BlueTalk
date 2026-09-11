#!/usr/bin/env bash
# ============================================================
#  SOLD ANYWAY — assemble a video from generated clips
#
#    tools/build-video.sh video/01-long-sleeve.json
#
#  Takes the clips named in the spec from video/clips/, applies
#  one consistent grade, burns the captions in, lays voice, room
#  tone and music underneath, and writes a master (at the spec's
#  own width/height, default 1440x1080) plus a 9:16 upload copy
#  to video/out/.
#
#  Missing clips become black holds, so a part-finished video
#  still assembles. Missing audio is simply skipped.
# ============================================================
set -euo pipefail
SPEC="${1:?usage: build-video.sh <spec.json>}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
FF="$(python3 -c 'import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())')"
FONT=/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf
CLIPS="$ROOT/video/clips"; OUT="$ROOT/video/out"; TMP="$(mktemp -d)"
mkdir -p "$OUT"
J(){ python3 -c "import json,sys;print(json.load(open(sys.argv[1])).get(sys.argv[2],sys.argv[3]))" "$SPEC" "$1" "$2"; }
ID=$(J id video)
W=$(J width 1440)
H=$(J height 1080)

# One grade for every shot, so a batch cuts together as one thing.
GRADE="eq=contrast=1.13:brightness=-0.030:saturation=0.82,colorbalance=rs=-0.04:gs=-0.01:bs=0.06:rm=0.03:bm=-0.03,vignette=PI/5,noise=alls=7:allf=t+u,unsharp=3:3:0.4"

python3 "$ROOT/tools/shots.py" "$SPEC" > "$TMP/shots.tsv"
node "$ROOT/tools/captions.mjs" "$SPEC" "$TMP"
n=0
while IFS=$'\t' read -r clip dur cap; do
  n=$((n+1)); pad=$(printf "%02d" $n); src="$CLIPS/$clip"
  if [ ! -f "$src" ]; then
    echo "  [$pad] missing $clip -> black hold ${dur}s"
    # The hold keeps its caption. Without it a part-finished build is just
    # black, and the whole point of holds is reading the shape early.
    if [ -f "$TMP/cap$pad.png" ]; then
      "$FF" -nostdin -y -hide_banner -loglevel error -f lavfi -i "color=c=black:s=${W}x${H}:r=30" \
        -i "$TMP/cap$pad.png" -t "$dur" \
        -filter_complex "[0:v][1:v]overlay=0:0" -r 30 -pix_fmt yuv420p "$TMP/s$pad.mp4"
    else
      "$FF" -nostdin -y -hide_banner -loglevel error -f lavfi -i "color=c=black:s=${W}x${H}:r=30" \
        -t "$dur" -pix_fmt yuv420p "$TMP/s$pad.mp4"
    fi
  else
    echo "  [$pad] $clip ${dur}s"
    VF="scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},$GRADE"
    if [ -f "$TMP/cap$pad.png" ]; then
      "$FF" -nostdin -y -hide_banner -loglevel error -i "$src" -i "$TMP/cap$pad.png" -t "$dur" \
        -filter_complex "[0:v]$VF[v];[v][1:v]overlay=0:0" -r 30 -an -pix_fmt yuv420p "$TMP/s$pad.mp4"
    else
      "$FF" -nostdin -y -hide_banner -loglevel error -i "$src" -t "$dur" -vf "$VF" -r 30 \
        -an -pix_fmt yuv420p "$TMP/s$pad.mp4"
    fi
  fi
  echo "file '$TMP/s$pad.mp4'" >> "$TMP/list.txt"
done < "$TMP/shots.tsv"

"$FF" -nostdin -y -hide_banner -loglevel error -f concat -safe 0 -i "$TMP/list.txt" -c copy "$TMP/video.mp4"

# Voice on top; room tone and music tucked underneath it.
A="$ROOT/video/audio"; INPUTS=(); FILTS=(); i=0
add(){ if [ -n "$1" ] && [ -f "$A/$1" ]; then INPUTS+=(-i "$A/$1"); FILTS+=("[$((i+1)):a]volume=$2dB[a$i]"); i=$((i+1)); fi; }
add "$(J voice '')" 0
add "$(J room  '')" "$(J roomDb -26)"
add "$(J music '')" "$(J musicDb -21)"

if [ "$i" -gt 0 ]; then
  MIX=""; for k in $(seq 0 $((i-1))); do MIX="$MIX[a$k]"; done
  CH="$(IFS=';'; echo "${FILTS[*]}")"
  "$FF" -nostdin -y -hide_banner -loglevel error -i "$TMP/video.mp4" "${INPUTS[@]}" \
    -filter_complex "$CH;${MIX}amix=inputs=$i:duration=first:dropout_transition=0[m]" \
    -map 0:v -map "[m]" -shortest -c:v copy -c:a aac -b:a 192k "$OUT/$ID-master.mp4"
else
  cp "$TMP/video.mp4" "$OUT/$ID-master.mp4"
fi

# Vertical delivery copy. If the master is already taller than wide (a
# spec built with width/height for shorts/TikTok), it just needs the
# canvas padded up to a clean 1080x1920 — never cropped, so nothing of
# the shot is lost. If the master is wider than tall (the old 4:3 specs),
# letterbox it into the vertical frame the same way as before.
if [ "$H" -ge "$W" ]; then
  "$FF" -nostdin -y -hide_banner -loglevel error -i "$OUT/$ID-master.mp4" \
    -vf "scale=1080:-2,pad=1080:1920:0:(1920-ih)/2:black" -c:a copy "$OUT/$ID-9x16.mp4"
else
  "$FF" -nostdin -y -hide_banner -loglevel error -i "$OUT/$ID-master.mp4" \
    -vf "scale=1080:810,pad=1080:1920:0:555:black" -c:a copy "$OUT/$ID-9x16.mp4"
fi

rm -rf "$TMP"
echo "written: video/out/$ID-master.mp4  and  $ID-9x16.mp4"
