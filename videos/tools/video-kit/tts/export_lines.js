// Export narration lines and segment structure of a kit video:  node videos/tools/video-kit/tts/export_lines.js <video dir>
// reads <video dir>/anim/segments.js → writes <video dir>/tts/lines.json and segs.json
global.document = { createElement: () => ({ getContext: () => ({ measureText: () => ({ width: 10 }) }) }) };
const fs = require('fs'), path = require('path');
const vdir = path.resolve(process.argv[2] || '');
const segFile = path.join(vdir, 'anim', 'segments.js');
if (!fs.existsSync(segFile)) { console.error('usage: node export_lines.js <video dir>   (needs <video dir>/anim/segments.js)'); process.exit(2); }
const { SEGS, CHAPTERS } = require(segFile);
const lines = []; for (const s of SEGS) (s.lines || []).forEach((l, i) => lines.push({ seg: s.id, i, text: l.replace(/\n/g, '') }));
if (!lines.length) throw new Error('no narration lines exported');
fs.mkdirSync(path.join(vdir, 'tts'), { recursive: true });
fs.writeFileSync(path.join(vdir, 'tts', 'lines.json'), JSON.stringify(lines, null, 1));
fs.writeFileSync(path.join(vdir, 'tts', 'segs.json'), JSON.stringify({ chapters: CHAPTERS, segs: SEGS.map(s => ({ id: s.id, ch: s.ch ?? s.chapterCard, card: !!s.chapterCard, lead: s.lead, tail: s.tail, dur: s.dur, title: s.title || '', lines: s.lines || [] })) }));
console.log(lines.length, 'lines →', path.join(vdir, 'tts'));
