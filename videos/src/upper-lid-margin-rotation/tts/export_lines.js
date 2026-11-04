// Export narration lines and segment structure from anim/segments.js → tts/lines.json, tts/segs.json
// Usage (from this folder's parent): node tts/export_lines.js
global.document = { createElement: () => ({ getContext: () => ({ measureText: () => ({ width: 10 }) }) }) };
const fs = require('fs'), path = require('path');
const { SEGS, CHAPTERS } = require(path.join(__dirname, '..', 'anim', 'segments.js'));
const lines = []; for (const s of SEGS) (s.lines || []).forEach((l, i) => lines.push({ seg: s.id, i, text: l.replace(/\n/g, '') }));
fs.writeFileSync(path.join(__dirname, 'lines.json'), JSON.stringify(lines, null, 1));
fs.writeFileSync(path.join(__dirname, 'segs.json'), JSON.stringify({ chapters: CHAPTERS, segs: SEGS.map(s => ({ id: s.id, ch: s.ch ?? s.chapterCard, card: !!s.chapterCard, lead: s.lead, tail: s.tail, dur: s.dur, title: s.title || '', lines: s.lines || [] })) }));
if (!lines.length) throw new Error('no narration lines exported');
console.log(lines.length, 'lines');
