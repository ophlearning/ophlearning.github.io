// Number check of the printed sheets (used by print.js; `node numcheck.js <video dir> <texts.json>` for a dry run).
// Every number in a sheet's rendered text must be registered:
//   · in the sheet's print ledger (def.ledger: number → source: a citation in REFS, 院內常規, 示意 or 結構), or
//   · in the video's number ledger (LEDGER in <video>/check.js, any segment) with a source that is not 結構 (a list number of the video
//     does not vouch for the same digit on paper) and that the sheet's footer cites (院內常規 / 示意 need no footer entry).
// The footer URL (https://…/#<video id>) is not a number on the sheet (an id like cataract-1-wound-ccc would read as 1).
// Step numbers and scale bars are marked data-struct: step numbers must be integers 1 … def.steps; scale bars must read "<n> mm".
// A ledger entry with two sources (「A；B」) counts each one. Every citation shown on a sheet (footer included) must be one of the video's REFS; every print-ledger entry must be used.
const fs = require('fs'), path = require('path');
const CITE = /([A-Z][A-Za-zÀ-ž'\-]+(?: Glass)?) (\d{4})([a-z])?/g;
const cites = s => [...s.matchAll(CITE)].map(m => ({ who: m[1], year: m[2], all: m[0] }));
const numbers = s => s.replace(/https?:\/\/\S+/g, ' ').replace(CITE, ' ').match(/(?<![A-Za-z0-9.])\d+(?:\.\d+)?(?:-\d+)?(?![A-Za-z0-9.])/g) || [];
const FREE = ['院內常規', '示意', '結構'];

// the video's ledger, read from check.js without running it (check.js starts a browser when required)
function videoLedger(dir) {
  const src = fs.readFileSync(path.join(dir, 'check.js'), 'utf8'), i = src.indexOf('const LEDGER = {');
  if (i < 0) throw new Error('no LEDGER in ' + dir + '/check.js');
  let d = 0, j = src.indexOf('{', i);
  for (let k = j; k < src.length; k++) { if (src[k] === '{') d++; else if (src[k] === '}' && --d === 0) { j = [j, k + 1]; break; } }
  return Function('"use strict"; return (' + src.slice(j[0], j[1]) + ')')();
}
function videoRefs(dir) { global.document = global.document || {}; return require(path.join(dir, 'anim', 'segments.js')).REFS; }

// texts: [{ t, struct }] from the page; meta: window.SHEET_META. Returns [[ok, message], ...]
function check(dir, texts, meta) {
  const L = videoLedger(dir), REFS = videoRefs(dir), R = [], ok = (c, m) => R.push([!!c, m]);
  const inRefs = c => REFS.some(r => r.startsWith(c.who) && r.includes(c.year + ';'));
  const foot = meta.sources.map(s => s.trim());
  for (const s of foot) ok(cites(s).length === 1 && inRefs(cites(s)[0]), `footer source 「${s}」 is a reference of the video`);
  const used = new Set(), found = new Map();
  for (const { t, struct } of texts) {
    for (const c of cites(t)) ok(inRefs(c), `citation 「${c.all}」 on the sheet is in REFS`);
    if (struct === 'step') { ok(/^\d+$/.test(t.trim()) && +t >= 1 && +t <= meta.steps, `step marker 「${t}」 is a step 1–${meta.steps}`); continue; }
    if (struct === 'scale') { ok(/^\d+(\.\d+)? mm$/.test(t.trim()), `scale bar 「${t}」`); continue; }
    for (const n of numbers(t)) if (!found.has(n)) found.set(n, t.replace(/\s+/g, ' ').slice(0, 60));
  }
  const usedSrc = new Set();
  for (const [n, where] of found) {
    const pl = meta.ledger[n];
    if (pl) { used.add(n);
      const c = cites(pl), good = FREE.includes(pl) || (c.length === 1 && inRefs(c[0]) && foot.includes(pl));
      ok(good, `${n}: print ledger → ${pl}${good ? '' : ' (must be 院內常規 / 示意 / 結構, or a REFS citation listed in the footer)'} 「${where}」`);
      if (c.length) usedSrc.add(pl); continue; }
    const cand = [];
    for (const [seg, nums] of Object.entries(L)) if (nums[n]) for (const s of String(nums[n]).split('；').map(x => x.trim())) if (s && s !== '結構') cand.push([seg, s]);
    const hit = cand.find(([, s]) => s === '院內常規' || s === '示意' || foot.includes(s));
    if (hit) usedSrc.add(hit[1]);
    ok(hit, `${n}: ${hit ? `video ledger ${hit[0]} → ${hit[1]}` : cand.length ? `in the video ledger (${cand.map(c => c.join(' → ')).join(', ')}) but no such source in the footer` : 'not in the video ledger nor the print ledger'} 「${where}」`);
  }
  for (const n of Object.keys(meta.ledger)) ok(used.has(n), `print ledger number ${n} is used on the sheet`);
  for (const s of foot) if (!usedSrc.has(s)) R.push([true, `WARN footer source 「${s}」 backs no number on this sheet (it backs a statement)`]);
  return R;
}
// Each rule broken once on purpose (print.js --selftest): every case must give the expected verdict. Inputs come from the video's own
// ledger, so the test runs on any video.
function selftest(dir) {
  const L = videoLedger(dir), REFS = videoRefs(dir), all = Object.values(L).flatMap(o => Object.entries(o));
  const split = s => String(s).split('；').map(x => x.trim());
  const free = n => all.some(([m, s]) => m === n && split(s).some(x => x === '院內常規' || x === '示意'));
  const cited = all.find(([n, s]) => split(s).some(x => cites(x).length) && !free(n)), local = all.find(([n, s]) => split(s).includes('院內常規'));
  const structOnly = all.map(([n]) => n).find(n => all.filter(([m]) => m === n).every(([, s]) => split(s).every(x => x === '結構')));
  const unknown = ['3.7', '13.13', '987'].find(n => !all.some(([m]) => m === n));
  const src = cited && split(cited[1]).find(x => cites(x).length), ref = REFS[0].match(/^([^\s,]+)/)[1];
  const meta = (o = {}) => ({ sources: [], ledger: {}, steps: 8, ...o }), T = (t, struct = null) => ({ t, struct });
  const cases = [
    ['院內常規 number passes', true, [T(`${local[0]} mm`)], meta()],
    ['cited number with its source in the footer passes', true, [T(`${cited[0]} mm`)], meta({ sources: [src] })],
    ['number not in the ledger fails', false, [T(`${unknown} mm`)], meta()],
    ['cited number without its source in the footer fails', false, [T(`${cited[0]} mm`)], meta()],
    ['citation not in REFS fails', false, [T('Smith 1901')], meta()],
    ['footer source not in REFS fails', false, [], meta({ sources: ['Smith 1901'] })],
    ['step marker outside 1–steps fails', false, [T('9', 'step')], meta()],
    ['unused print-ledger entry fails', false, [], meta({ ledger: { '42': '示意' } })],
    ['print-ledger source that is not a reference fails', false, [T('42 mm')], meta({ ledger: { '42': `${ref} 1901` } })],
  ];
  if (structOnly) cases.push(['a number the ledger knows only as 結構 fails', false, [T(`${structOnly} mm`)], meta()]);
  return cases.map(([name, pass, texts, m]) => { const r = check(dir, texts, m), ok = r.every(x => x[0]) === pass; return [ok, `selftest: ${name} → ${r.every(x => x[0]) ? 'passes' : 'fails'}`]; });
}
module.exports = { check, selftest, numbers, cites, videoLedger };
