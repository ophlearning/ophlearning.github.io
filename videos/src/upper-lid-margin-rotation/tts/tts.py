"""Narration: display text → speech text → MeloTTS (sherpa-onnx, offline) → per-line wav → timeline.js + narration.wav.
Usage: python3 tts.py [--check]   (--check only prints the speech text and any English word missing from the lexicon)
"""
import json, re, sys, os, wave
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
MODEL = os.path.join(HERE, 'vits-melo-tts-zh_en')
ANIM = os.path.join(HERE, '..', 'anim')

# ---------------------------------------------------------------- custom pronunciations (ARPAbet + stress)
CUSTOM = {
 'orbicularis': 'AO2 R B IH2 K Y AH0 L EH1 R IH0 S', 'entropion': 'EH0 N T R OW1 P IY0 AA0 N', 'cicatricial': 'S IH2 K AH0 T R IH1 SH AH0 L',
 'lamella': 'L AH0 M EH1 L AH0', 'meibomian': 'M AY0 B OW1 M IY0 AH0 N', 'mucocutaneous': 'M Y UW2 K OW0 K Y UW0 T EY1 N IY0 AH0 S',
 'trichiasis': 'T R IH0 K AY1 AH0 S IH0 S', 'metaplastic': 'M EH2 T AH0 P L AE1 S T IH0 K', 'pemphigoid': 'P EH1 M F IH0 G OY2 D',
 'ocular': 'AA1 K Y AH0 L ER0', 'rosacea': 'R OW0 Z EY1 SH AH0', 'cryotherapy': 'K R AY2 OW0 TH EH1 R AH0 P IY0', 'tarsal': 'T AA1 R S AH0 L',
 'tarsotomy': 'T AA0 R S AA1 T AH0 M IY0', 'lagophthalmos': 'L AE2 G AA0 F TH AE1 L M AH0 S', 'habtamu': 'HH AA0 B T AA1 M UW0',
 'polyglactin': 'P AA2 L IY0 G L AE1 K T IH0 N', 'vicryl': 'V IH1 K R IH0 L', 'everting': 'IH0 V ER1 T IH0 NG', 'granuloma': 'G R AE2 N Y AH0 L OW1 M AH0',
 'lidocaine': 'L AY1 D AH0 K EY2 N', 'trabut': 'T R AH0 B UW1 T', 'pretarsal': 'P R IY0 T AA1 R S AH0 L', 'ptosis': 'T OW1 S IH0 S',
 'tetracycline': 'T EH2 T R AH0 S AY1 K L IY0 N', 'trachoma': 'T R AH0 K OW1 M AH0', 'symblepharon': 'S IH0 M B L EH1 F ER0 AA2 N',
 'kempen': 'K EH1 M P AH0 N', 'gower': 'G AW1 ER0', 'cruz': 'K R UW1 Z', 'kersten': 'K ER1 S T AH0 N', 'ei': 'EY1',
 'tarsus': 'T AA1 R S AH0 S', 'electrolysis': 'IH0 L EH2 K T R AA1 L AH0 S IH0 S', 'repositioning': 'R IY2 P AH0 Z IH1 SH AH0 N IH0 NG',
}
def lex_line(word, arpa):
    ph, tn = [], []
    for p in arpa.split():
        m = re.match(r'([A-Z]+)([012])?$', p); base, st = m.group(1).lower(), m.group(2)
        ph.append(base); tn.append({None: 7, '0': 8, '1': 9, '2': 10}[st])
    return f"{word} {' '.join(ph)} {' '.join(map(str, tn))}"

# ---------------------------------------------------------------- numbers → Chinese reading
D = '零一二三四五六七八九'
def int_zh(n):
    if n < 10: return D[n]
    if n < 20: return '十' + (D[n % 10] if n % 10 else '')
    if n < 100: return D[n // 10] + '十' + (D[n % 10] if n % 10 else '')
    if n < 1000:
        r = n % 100; return D[n // 100] + '百' + ('' if r == 0 else ('零' + D[r] if r < 10 else (D[r // 10] + '十' + (D[r % 10] if r % 10 else ''))))
    if n < 10000:
        r = n % 1000; return D[n // 1000] + '千' + ('' if r == 0 else ('零' + int_zh(r) if r < 100 else int_zh(r)))
    return ''.join(D[int(c)] for c in str(n))
def num_zh(s):
    if '.' in s: a, b = s.split('.'); return int_zh(int(a)) + '點' + ''.join(D[int(c)] for c in b)
    return int_zh(int(s))
def speech(text):
    t = text
    t = re.sub(r'(\d)-0\b', lambda m: D[int(m.group(1))] + '零', t)                       # 4-0 silk
    t = re.sub(r'(\d+(?:\.\d+)?)\s*%', lambda m: '百分之' + num_zh(m.group(1)), t)
    t = re.sub(r'\b(19\d\d|20\d\d)\b', lambda m: ''.join(D[int(c)] for c in m.group(1)), t)  # years
    t = re.sub(r'(\d+\.\d+|\d+)', lambda m: num_zh(m.group(1)), t)
    t = re.sub(r'\bmm\b', '毫米', t); t = re.sub(r'\bmL\b', '毫升', t)
    t = re.sub(r'([A-Z])(?=[一二三四五六七八九])', r'\1 ', t)                                # S3 → S 三
    t = re.sub(r'\b([A-Z]{2,5})\b', lambda m: ' '.join('ei' if c == 'A' else c.lower() for c in m.group(1)), t)  # acronyms letter by letter
    t = t.replace('-', ' ')
    t = re.sub(r'[A-Za-z]+', lambda m: ' ' + m.group(0).lower() + ' ', t)
    for a, b in (('：', '，'), ('；', '，'), ('、', '，'), ('「', ''), ('」', ''), ('（', '，'), ('）', '，'), ('→', '，')):
        t = t.replace(a, b)
    return re.sub(r'\s+', ' ', t).strip()

def main():
    import opencc
    cc = opencc.OpenCC('t2s')
    lines = json.load(open(os.path.join(HERE, 'lines.json'), encoding='utf-8'))
    lexwords = set()
    with open(os.path.join(MODEL, 'lexicon.txt'), encoding='utf-8') as fh:
        for ln in fh: lexwords.add(ln.split(' ', 1)[0])
    for w in CUSTOM: lexwords.add(w)
    missing = set()
    for L in lines:
        L['say'] = cc.convert(speech(L['text']))
        for w in re.findall(r'[a-z]+', L['say']):
            if w not in lexwords: missing.add(w)
    if '--check' in sys.argv:
        for L in lines: print(L['seg'], L['i'], L['say'])
        print('MISSING:', sorted(missing)); return
    assert not missing, f'lexicon missing: {sorted(missing)}'
    # custom lexicon = original + additions (later entries are appended; custom words are not in the original)
    lex_path = os.path.join(HERE, 'lexicon_custom.txt')
    with open(lex_path, 'w', encoding='utf-8') as out:
        out.write(open(os.path.join(MODEL, 'lexicon.txt'), encoding='utf-8').read().rstrip('\n') + '\n')
        for w, a in CUSTOM.items(): out.write(lex_line(w, a) + '\n')
    import sherpa_onnx
    cfg = sherpa_onnx.OfflineTtsConfig(
        model=sherpa_onnx.OfflineTtsModelConfig(vits=sherpa_onnx.OfflineTtsVitsModelConfig(
            model=os.path.join(MODEL, 'model.onnx'), lexicon=lex_path, tokens=os.path.join(MODEL, 'tokens.txt'), dict_dir=os.path.join(MODEL, 'dict')),
            num_threads=4),
        rule_fsts=os.path.join(MODEL, 'new_heteronym.fst'), max_num_sentences=1)
    tts = sherpa_onnx.OfflineTts(cfg)
    sr = tts.sample_rate
    os.makedirs(os.path.join(HERE, 'wav'), exist_ok=True)
    for L in lines:
        a = tts.generate(L['say'], sid=0, speed=1.0)
        x = np.array(a.samples, dtype=np.float32)
        # trim leading/trailing near-silence
        idx = np.where(np.abs(x) > 0.01)[0]
        if len(idx): x = x[max(0, idx[0] - int(0.03 * sr)): idx[-1] + int(0.08 * sr)]
        L['dur'] = len(x) / sr; L['wav'] = f"wav/{L['seg']}_{L['i']:02d}.wav"
        np.save(os.path.join(HERE, L['wav'] + '.npy'), x)
        print(f"{L['seg']:6} {L['i']:2} {L['dur']:5.2f}s  {L['say'][:40]}")
    json.dump(lines, open(os.path.join(HERE, 'lines_tts.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('sample_rate', sr)

if __name__ == '__main__':
    main()
