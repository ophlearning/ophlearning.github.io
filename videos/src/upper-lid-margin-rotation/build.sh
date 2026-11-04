#!/bin/bash
# parallel render (4 workers) → concat → mux narration (loudnorm −16 LUFS) → final mp4
set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"; cd "$ROOT/anim"
FPS=30
N=$(python3 -c "import json,re,math; s=open('timeline.js').read(); d=json.loads(s[s.index('{'):s.rindex('}')+1]); print(math.ceil(d['total']*$FPS))")
W=4; STEP=$(( (N + W - 1) / W ))
echo "frames $N, $W workers × $STEP"
for i in $(seq 0 $((W-1))); do
  A=$(( i * STEP )); B=$(( (i+1) * STEP )); [ $B -gt $N ] && B=$N
  node render.js video.html "$ROOT/out/part$i.mp4" $FPS --from $A --to $B > "$ROOT/out/part$i.log" 2>&1 &
done
wait
cat "$ROOT"/out/part*.log
cd "$ROOT/out"
printf "file 'part0.mp4'\nfile 'part1.mp4'\nfile 'part2.mp4'\nfile 'part3.mp4'\n" > parts.txt
ffmpeg -y -loglevel error -f concat -safe 0 -i parts.txt -c copy video_only.mp4
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 video_only.mp4)
ffmpeg -y -loglevel error -i video_only.mp4 -i narration.wav -map 0:v -map 1:a -c:v copy \
  -af "loudnorm=I=-16:TP=-1.5:LRA=11,aresample=48000" -ac 2 -c:a aac -b:a 192k -t "$DUR" -movflags +faststart upper-lid-margin-rotation-PLTR.mp4
ffprobe -v error -show_entries format=duration,size -show_entries stream=codec_name,width,height,r_frame_rate,sample_rate,channels -of compact upper-lid-margin-rotation-PLTR.mp4
echo BUILD_DONE
