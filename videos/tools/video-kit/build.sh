#!/bin/bash
# Build the mp4 of a kit video:  videos/tools/video-kit/build.sh <video dir> <output name> [page, default anim/video.html] [workers, default 4]
#   parallel render → concat → narration (loudnorm −16 LUFS) → <video dir>/out/<output name>.mp4
#   The frames are cut into 4 × workers chunks so no worker is left alone on the heaviest stretch, and only one build runs at a
#   time on this machine (a lock): two builds sharing 4 cores each take twice as long.
# Needs <video dir>/anim/timeline.js and <video dir>/out/narration.wav (tts/assemble.py).
set -e
KIT="$(cd "$(dirname "$0")" && pwd)"
VDIR="$(cd "$1" && pwd)"; NAME="$2"; PAGE="${3:-anim/video.html}"; W="${4:-4}"
[ -z "$NAME" ] && { echo "usage: build.sh <video dir> <output name> [page] [workers]"; exit 2; }
# The three OR-wall sheets (videos/tools/print) come before the mp4 (CLAUDE.md): rebuild and check them, or print/SKIP gives the reason.
if [ -s "$VDIR/print/SKIP" ]; then echo "print sheets skipped: $(head -1 "$VDIR/print/SKIP")"
else [ -f "$VDIR/print/video.js" ] || { echo "missing $VDIR/print/ (make the three print sheets first, or write the reason in print/SKIP)"; exit 2; }
  node "$KIT/../print/print.js" "$VDIR" --gray || { echo "print sheets failed: fix them before building the mp4"; exit 2; }; fi
[ -f "$VDIR/anim/timeline.js" ] || { echo "missing $VDIR/anim/timeline.js (run the TTS steps first)"; exit 2; }
[ -f "$VDIR/out/narration.wav" ] || { echo "missing $VDIR/out/narration.wav (run tts/assemble.py)"; exit 2; }
FPS=30
N=$(python3 -c "import json,math; s=open('$VDIR/anim/timeline.js').read(); d=json.loads(s[s.index('{'):s.rindex('}')+1]); print(math.ceil(d['total']*$FPS))")
C=$(( W * 4 )); STEP=$(( (N + C - 1) / C ))
exec 9>/tmp/ophlearning-video-build.lock
flock -n 9 || { echo "another video build is running; waiting for it to finish"; flock 9; }
echo "frames $N, $C chunks × $STEP on $W workers"
mkdir -p "$VDIR/out"; rm -f "$VDIR"/out/part*.mp4 "$VDIR"/out/part*.log
T0=$(date +%s)
for i in $(seq 0 $((C-1))); do A=$(( i * STEP )); B=$(( (i+1) * STEP )); [ $B -gt $N ] && B=$N; [ $A -lt $B ] && echo "$i $A $B"; done |
  xargs -P "$W" -L 1 sh -c 'node "$0/render.js" "$1" "$2/out/part$3.mp4" '"$FPS"' --from "$4" --to "$5" > "$2/out/part$3.log" 2>&1' "$KIT" "$VDIR/$PAGE" "$VDIR"
cat "$VDIR"/out/part*.log
echo "render $(( $(date +%s) - T0 )) s"
cd "$VDIR/out"
: > parts.txt; for i in $(seq 0 $((C-1))); do [ -f "part$i.mp4" ] && echo "file 'part$i.mp4'" >> parts.txt; done
ffmpeg -y -loglevel error -f concat -safe 0 -i parts.txt -c copy video_only.mp4
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 video_only.mp4)
ffmpeg -y -loglevel error -i video_only.mp4 -i narration.wav -map 0:v -map 1:a -c:v copy \
  -af "loudnorm=I=-16:TP=-1.5:LRA=11,aresample=48000" -ac 2 -c:a aac -b:a 192k -t "$DUR" -movflags +faststart "$NAME.mp4"
ffprobe -v error -show_entries format=duration,size -show_entries stream=codec_name,width,height,r_frame_rate,sample_rate,channels -of compact "$NAME.mp4"
echo BUILD_DONE "$VDIR/out/$NAME.mp4"
