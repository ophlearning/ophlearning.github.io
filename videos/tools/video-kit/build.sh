#!/bin/bash
# Build the mp4 of a kit video:  videos/tools/video-kit/build.sh <video dir> <output name> [page, default anim/video.html] [workers, default 4]
#   parallel render → concat → narration (loudnorm −16 LUFS) → <video dir>/out/<output name>.mp4
# Needs <video dir>/anim/timeline.js and <video dir>/out/narration.wav (tts/assemble.py).
set -e
KIT="$(cd "$(dirname "$0")" && pwd)"
VDIR="$(cd "$1" && pwd)"; NAME="$2"; PAGE="${3:-anim/video.html}"; W="${4:-4}"
[ -z "$NAME" ] && { echo "usage: build.sh <video dir> <output name> [page] [workers]"; exit 2; }
[ -f "$VDIR/anim/timeline.js" ] || { echo "missing $VDIR/anim/timeline.js (run the TTS steps first)"; exit 2; }
[ -f "$VDIR/out/narration.wav" ] || { echo "missing $VDIR/out/narration.wav (run tts/assemble.py)"; exit 2; }
FPS=30
N=$(python3 -c "import json,math; s=open('$VDIR/anim/timeline.js').read(); d=json.loads(s[s.index('{'):s.rindex('}')+1]); print(math.ceil(d['total']*$FPS))")
STEP=$(( (N + W - 1) / W ))
echo "frames $N, $W workers × $STEP"
mkdir -p "$VDIR/out"; rm -f "$VDIR"/out/part*.mp4 "$VDIR"/out/part*.log
for i in $(seq 0 $((W-1))); do
  A=$(( i * STEP )); B=$(( (i+1) * STEP )); [ $B -gt $N ] && B=$N
  node "$KIT/render.js" "$VDIR/$PAGE" "$VDIR/out/part$i.mp4" $FPS --from $A --to $B > "$VDIR/out/part$i.log" 2>&1 &
done
wait
cat "$VDIR"/out/part*.log
cd "$VDIR/out"
: > parts.txt; for i in $(seq 0 $((W-1))); do echo "file 'part$i.mp4'" >> parts.txt; done
ffmpeg -y -loglevel error -f concat -safe 0 -i parts.txt -c copy video_only.mp4
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 video_only.mp4)
ffmpeg -y -loglevel error -i video_only.mp4 -i narration.wav -map 0:v -map 1:a -c:v copy \
  -af "loudnorm=I=-16:TP=-1.5:LRA=11,aresample=48000" -ac 2 -c:a aac -b:a 192k -t "$DUR" -movflags +faststart "$NAME.mp4"
ffprobe -v error -show_entries format=duration,size -show_entries stream=codec_name,width,height,r_frame_rate,sample_rate,channels -of compact "$NAME.mp4"
echo BUILD_DONE "$VDIR/out/$NAME.mp4"
