"""Build the timeline from real narration lengths → anim/timeline.js, narration.wav, captions.srt, chapters.txt."""
import json, os, numpy as np, wave
H = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(H, '..', 'out'); os.makedirs(OUT, exist_ok=True)
S = json.load(open(os.path.join(H, 'segs.json'), encoding='utf-8'))
L = {(x['seg'], x['i']): x for x in json.load(open(os.path.join(H, 'lines_tts.json'), encoding='utf-8'))}
SR, LEAD, GAP, TAIL, CARD = 44100, 0.7, 0.45, 1.2, 2.8
# sanity: speech rate per line (CJK chars per second); flag outliers that may mean dropped words
rates = []
for x in L.values():
    n = sum(1 for c in x['say'] if '一' <= c <= '鿿') + 1.5 * len(x['say'].split()) * 0  # CJK only
    rates.append((n / x['dur'], x['seg'], x['i'], x['dur']))
rs = sorted(rates); print('slowest', [f'{r:.1f}/s {s}#{i}' for r, s, i, _ in rs[:3]], 'fastest', [f'{r:.1f}/s {s}#{i}' for r, s, i, _ in rs[-3:]])
t, segs, place, chapters = 0.0, {}, [], []
for sg in S['segs']:
    t0 = t
    if sg['card']:
        t1 = t0 + CARD; chapters.append((t0, S['chapters'][sg['ch']])); segs[sg['id']] = {'t0': t0, 't1': t1, 'lines': []}; t = t1; continue
    if sg['id'] == 'title': chapters.append((0.0, S['chapters'][0]))
    tt = t0 + (sg.get('lead') if sg.get('lead') is not None else LEAD); lines = []
    for i, _ in enumerate(sg['lines']):
        x = L[(sg['id'], i)]; lines.append([round(tt, 3), round(tt + x['dur'], 3)]); place.append((tt, x)); tt += x['dur'] + GAP
    t1 = t0 + sg['dur'] if sg.get('dur') else tt - GAP + (sg.get('tail') if sg.get('tail') is not None else TAIL)
    segs[sg['id']] = {'t0': round(t0, 3), 't1': round(t1, 3), 'lines': lines}; t = t1
total = t
open(os.path.join(H, '..', 'anim', 'timeline.js'), 'w').write('window.TIMELINE = ' + json.dumps({'segs': segs, 'total': total}) + ';\n')
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
chap = '\n'.join(f'{int(c // 60)}:{int(c % 60):02d} {name}' for c, name in chapters)
open(os.path.join(OUT, 'chapters.txt'), 'w', encoding='utf-8').write(chap + '\n')
# self-check: chapters start at 0:00, ≥3 chapters, each ≥10 s (YouTube rules); lines never overlap
starts = [c for c, _ in chapters] + [total]
assert chapters[0][0] == 0 and len(chapters) >= 3 and all(b - a >= 10 for a, b in zip(starts, starts[1:])), 'chapter rule'
assert all(b1 <= a2 for (_, b1), (a2, _) in zip([l for s in segs.values() for l in s['lines']], [l for s in segs.values() for l in s['lines']][1:])), 'overlap'
print(f'total {total:.1f}s = {int(total // 60)}:{int(total % 60):02d}'); print(chap)
