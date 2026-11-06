"""Timeline of a kit video from the real narration lengths:  python3 videos/tools/video-kit/tts/assemble.py <video dir>
Reads <video dir>/tts/segs.json, lines_tts.json → writes <video dir>/anim/timeline.js and <video dir>/out/narration.wav, captions.srt, chapters.txt.
LEAD / GAP / TAIL / CARD are the same as KIT in video-kit/kit.js (its fallback when there is no timeline.js).
"""
import json, os, sys, wave
import numpy as np
if len(sys.argv) < 2: sys.exit('usage: python3 assemble.py <video dir>')
V = os.path.abspath(sys.argv[1]); H = os.path.join(V, 'tts'); OUT = os.path.join(V, 'out'); os.makedirs(OUT, exist_ok=True)
S = json.load(open(os.path.join(H, 'segs.json'), encoding='utf-8'))
TT = json.load(open(os.path.join(H, 'lines_tts.json'), encoding='utf-8'))
SR = TT['sample_rate']; L = {(x['seg'], x['i']): x for x in TT['lines']}
LEAD, GAP, TAIL, CARD = 0.7, 0.45, 1.2, 2.8
# sanity: speech rate per line (CJK chars per second); outliers may mean dropped words
rates = sorted((sum(1 for c in x['say'] if '一' <= c <= '鿿') / x['dur'], x['seg'], x['i']) for x in L.values())
print('slowest', [f'{r:.1f}/s {s}#{i}' for r, s, i in rates[:3]], 'fastest', [f'{r:.1f}/s {s}#{i}' for r, s, i in rates[-3:]])
t, segs, place, chapters = 0.0, {}, [], []
for sg in S['segs']:
    t0 = t
    if sg['card']:
        t1 = t0 + CARD; chapters.append((t0, sg['ch'])); segs[sg['id']] = {'t0': round(t0, 3), 't1': round(t1, 3), 'lines': []}; t = t1; continue
    if not chapters: chapters.append((0.0, sg['ch']))
    tt = t0 + (sg.get('lead') if sg.get('lead') is not None else LEAD); lines = []
    for i, _ in enumerate(sg['lines']):
        x = L[(sg['id'], i)]; lines.append([round(tt, 3), round(tt + x['dur'], 3)]); place.append((tt, x)); tt += x['dur'] + GAP
    t1 = t0 + sg['dur'] if sg.get('dur') else tt - GAP + (sg.get('tail') if sg.get('tail') is not None else TAIL)
    segs[sg['id']] = {'t0': round(t0, 3), 't1': round(t1, 3), 'lines': lines}; t = t1
total = t
open(os.path.join(V, 'anim', 'timeline.js'), 'w').write('window.TIMELINE = ' + json.dumps({'segs': segs, 'total': round(total, 3)}) + ';\n')
audio = np.zeros(int((total + 0.5) * SR), dtype=np.float32)
for st, x in place:
    a = np.load(os.path.join(H, x['wav'] + '.npy')); i = int(st * SR); audio[i:i + len(a)] += a
pk = np.max(np.abs(audio)); audio = audio / pk * 0.9 if pk > 0 else audio
with wave.open(os.path.join(OUT, 'narration.wav'), 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((audio * 32767).astype(np.int16).tobytes())
def ts(s): h, r = divmod(s, 3600); m, r = divmod(r, 60); return f'{int(h):02d}:{int(m):02d}:{r:06.3f}'.replace('.', ',')
srt, n = [], 0
for sg in S['segs']:
    for i, txt in enumerate(sg['lines']):
        a, b = segs[sg['id']]['lines'][i]; n += 1; srt.append(f'{n}\n{ts(a)} --> {ts(b + 0.25)}\n{txt}\n')
open(os.path.join(OUT, 'captions.srt'), 'w', encoding='utf-8').write('\n'.join(srt))
last = len(S['chapters']) - 1
name = lambda ch: S['chapters'][ch] if ch in (0, last) else f"{ch} {S['chapters'][ch]}"
chap = '\n'.join(f'{int(c // 60)}:{int(c % 60):02d} {name(ch)}' for c, ch in chapters)
open(os.path.join(OUT, 'chapters.txt'), 'w', encoding='utf-8').write(chap + '\n')
# YouTube chapter rules: first at 0:00, ≥ 3 chapters, each ≥ 10 s; narration lines never overlap
starts = [c for c, _ in chapters] + [total]
assert chapters[0][0] == 0 and len(chapters) >= 3 and all(b - a >= 10 for a, b in zip(starts, starts[1:])), 'chapter rule'
flat = [l for s in segs.values() for l in s['lines']]
assert all(b1 <= a2 for (_, b1), (a2, _) in zip(flat, flat[1:])), 'overlap'
print(f'total {total:.1f}s = {int(total // 60)}:{int(total % 60):02d}'); print(chap)
