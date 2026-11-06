// Number check of the printed sheets (used by print.js; `node numcheck.js <video dir> <texts.json>` for a dry run).
// Every number in a sheet's rendered text must be registered:
//   · in the sheet's print ledger (def.ledger: number → source: a citation in REFS, 院內常規, 示意 or 結構), or
//   · in the video's number ledger (LEDGER in <video>/check.js, any segment) with a source that is not 結構 (a list number of the video
//     does not vouch for the same digit on paper) and that the sheet's footer cites (院內常規 / 示意 need no footer entry).
// Step numbers and scale bars are marked data-struct: step numbers must be integers 1 … def.steps; scale bars must read "<n> mm".
// Every citation shown on a sheet (footer included) must be one of the video's REFS; every print-ledger entry must be used.
const fs = require('fs'), path = require('path');
const CITE = /([A-Z][A-Za-zÀ-ž'\-]+(?: Glass)?) (\d{4})([a-z])?/g;
const cites = s => [...s.matchAll(CITE)].map(m => ({ who: m[1], year: m[2], all: m[0] }));
const numbers = s => s.replace(CITE, ' ').match(/(?<![A-Za-z0-9.])\d+(?:\.\d+)?(?:-\d+)?(?![A-Za-z0-9.])/g) || [];
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
    for (const [seg, nums] of Object.entries(L)) if (nums[n] && nums[n] !== '結構') cand.push([seg, nums[n]]);
    const hit = cand.find(([, s]) => s === '院內常規' || s === '示意' || foot.includes(s));
    if (hit) usedSrc.add(hit[1]);
    ok(hit, `${n}: ${hit ? `video ledger ${hit[0]} → ${hit[1]}` : cand.length ? `in the video ledger (${cand.map(c => c.join(' → ')).join(', ')}) but no such source in the footer` : 'not in the video ledger nor the print ledger'} 「${where}」`);
  }
  for (const n of Object.keys(meta.ledger)) ok(used.has(n), `print ledger number ${n} is used on the sheet`);
  for (const s of foot) if (!usedSrc.has(s)) R.push([true, `WARN footer source 「${s}」 backs no number on this sheet (it backs a statement)`]);
  return R;
}
module.exports = { check, numbers, cites, videoLedger };
