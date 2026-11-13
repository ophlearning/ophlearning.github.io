// ============================================================================
// Drawing of every segment, keyed by segment id (text is in segments.js). DRAW2[id](T) returns { L, R } (dual) or { F } (full):
// { svg (clipped to the panel), extra (labels, from VIEWS.lab2), P: { title, orient } }. Panels are PW × PH px (video-kit/kit.js).
// Surgical segments show two synced views of the socket model (videos/models/socket, through views-socket.js): the mechanism section
// (left) and the surgeon's view of the left socket, surgeon at 12 (right); both come from the same state (checked in ../check.js).
// ============================================================================
const DRAW2 = {};
const lab = VIEWS.lab2;
const note = (s, op, y = PH - 14) => htext(PW - 12, y, s, { size: 13, color: COL.sub, anchor: 'end', op });
const tag = (s, op, col = COL.accent, y = 34) => htext(PW / 2, y, s, { size: 17, bold: true, color: col, anchor: 'middle', op });
const RED = { bold: true, color: COL.red, lc: COL.red }, GRN = { bold: true, color: COL.accent, lc: COL.accent };
const ST = VS.ST, EH = VS.EXPO_H;
const fr = (st, id = 'fR', win = VS.WIN.front) => VS.front(st, PW, PH, win, id);
const se = (st, h = EH, id = 'sL', win = VS.WIN.secR) => VS.sec(st, PW, PH, win, id, h);
const OF = VS.ORIENT.front, OS_ = VS.ORIENT.sec;
// clock-hour names around the surgeon's view (12 / 3 / 6 / 9), placed on the model's own clock directions
function clocks(fv, op = 1, r = 16.6) {
  const names = { 12: '12 點 上方', 3: '3 點 temporal', 6: '6 點 下方', 9: '9 點 nasal' };
  return [12, 3, 6, 9].map(h => { const p = fv.P(SOCKET.fpt(h, r)), an = h === 3 ? 'start' : h === 9 ? 'end' : 'middle', x = h === 3 ? Math.max(8, p[0] - 30) : h === 9 ? Math.min(PW - 8, p[0] + 30) : p[0];
    return htext(x, p[1] + 5, names[h], { size: 14, bold: true, color: '#0b4f8a', anchor: an, op }); }).join('');
}
const pathOf = q => 'M' + q.map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('L');
// cotton-tip applicator (示意): shaft from outside the panel to a tip at p (panel px), tip pressing toward dir
const cottonTip = (p, from, op = 1) => `<g opacity="${op}"><path d="M${from[0]} ${from[1]}L${p[0].toFixed(1)} ${p[1].toFixed(1)}" stroke="#d9cfb8" stroke-width="5" stroke-linecap="round"/>`
  + `<ellipse cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" rx="9" ry="7" fill="#fbfaf6" stroke="#b9ae95" stroke-width="1.2"/></g>`;
// info card inside a panel: rows of [text, options]
function infoCard(x, y, w, rows, op, o = {}) {
  const h = o.h || 22 + rows.length * 28;
  let s = `<g opacity="${op}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="${o.fill || '#fff'}" stroke="${o.stroke || '#d3dae1'}"/>`;
  rows.forEach(([t, ro = {}], i) => { s += text(x + 16, y + 30 + i * 28, t, { size: ro.size || 16, bold: ro.bold, color: ro.color || COL.ink }); });
  return s + `</g>`;
}

// ---------------------------------------------------------------- 片頭
DRAW2['title'] = T => {
  const fv = fr(ST.expo, 'tR'), A = fv.A;
  let ex = clocks(fv, 0.9);
  ex += lab('暴露的 band', 'exposed band', PW - 12, PH - 24, A.expose, { side: 'R', bold: true, color: COL.red, lc: COL.red });
  ex += lab('肉芽組織', 'granulation', 14, PH - 62, A.gran, { color: COL.red, lc: COL.red });
  ex += note('暴露位置為示意', 1, 30);
  return { R: { svg: fv.svg, extra: ex, P: OF } };
};

// ---------------------------------------------------------------- 1 這台刀的地圖
DRAW2['1-1'] = T => {
  const sv = VS.sec(ST.hidden, PW, PH, VS.WIN.sec, 'sL', 3), S = sv.A, fv = fr(ST.hidden), A = fv.A;
  let exL = lab('外直肌', 'lateral rectus', PW - 12, 54, S.rectus, { side: 'R', bold: true });
  exL += lab('環扣帶', 'encircling band', PW - 12, 300, S.band, { side: 'R', bold: true, color: COL.suture, lc: COL.suture, op: T.on(0, 0.8) });
  exL += lab('鞏膜殼', 'scleral shell', 14, PH - 30, S.shell, { op: T.on(2, 0.8) });
  exL += lab('纖維組織', 'fibrous tissue', 14, PH - 72, S.fibrous, { op: T.on(2, 0.8) });
  exL += lab('內直肌', 'medial rectus', 14, 54, sv.P([-sv.M.rectus[0], sv.M.rectus[1]]), { bold: true });
  exL += note('切面經 3 點與 9 點　大小為示意', 1, PH - 12);
  let ex = clocks(fv, 1);
  ex += lab('環扣帶在直肌下', 'band under the recti', 14, 60, A.band || fv.P(SOCKET.fpt(10.5, SOCKET.profile().sEq)), { bold: true, color: COL.suture, lc: COL.suture, op: T.on(1, 0.8) });
  ex += lab('Dacron 縫線', 'suture', PW - 12, PH - 24, A.sut[4.5], { side: 'R', ...GRN, op: T.on(1, 0.8, 0.6) });
  ex += note('縫線位置為示意', T.on(1, 0.8, 0.6), 30);
  return { L: { svg: sv.svg, extra: exL, P: { title: '切面經 3 點（右）與 9 點（左）', orient: '上＝前（術者側）　下＝眶尖' } },
    R: { svg: fv.svg, extra: ex, P: OF } };
};
DRAW2['1-2'] = T => {
  const sv = se(ST.expo), S = sv.A, fv = fr(ST.expo), A = fv.A;
  let exL = lab('暴露的 band', 'exposed band', PW - 12, 54, S.expose, { side: 'R', ...RED });
  exL += lab('肉芽組織', 'granulation', PW - 12, 100, S.gran, { side: 'R', color: COL.red, lc: COL.red });
  exL += lab('纖維囊', 'capsule', PW - 12, PH - 64, S.capsule, { side: 'R', op: T.on(2, 0.8) });
  exL += tag('異物表面的 biofilm 擋住抗生素', T.on(2, 0.8), COL.red, PH - 18);
  let ex = clocks(fv, 1);
  ex += lab('暴露的 band', 'exposed band', PW - 12, PH - 24, A.expose, { side: 'R', ...RED });
  ex += lab('肉芽組織', 'granulation', 14, PH - 62, A.gran, { color: COL.red, lc: COL.red });
  ex += note('暴露位置為示意', 1, 30);
  return { L: { svg: sv.svg, extra: exL, P: OS_(EH) }, R: { svg: fv.svg, extra: ex, P: OF } };
};

// ---------------------------------------------------------------- 2 暴露
DRAW2['2-1'] = T => {
  const conf = 1 - T.on(1, 1.0), st = conf > 0.02 ? { ...ST.expo, conformer: 1 } : ST.expo;
  const sv = se(st), S = sv.A, fv = fr(st), A = fv.A;
  let exL = conf > 0.02 ? lab('眼窩模型', 'conformer', 14, 54, S.conformer, { op: conf }) : '';
  exL += lab('暴露的 band', 'exposed band', PW - 12, 54, S.expose, { side: 'R', ...RED, op: T.on(3, 0.8) });
  exL += lab('結膜', 'conjunctiva', 14, PH - 30, S.conj);
  let ex = clocks(fv, T.on(1, 0.8));
  if (conf > 0.02) ex += lab('眼窩模型', 'conformer', 14, 54, A.conformer, { op: conf });
  const mus = [['SR', '上直肌', 'SR', 14, PH - 104], ['LR', '外直肌', 'LR', 14, 92], ['IR', '下直肌', 'IR', PW - 12, 54], ['MR', '內直肌', 'MR', PW - 12, PH - 104]];
  for (const [k, zh, en, x, y] of mus) ex += lab(zh, en, x, y, A.rect[k], { side: x > PW / 2 ? 'R' : undefined, bold: true, op: T.on(2, 0.8) * (1 - T.on(3, 0.6)) });
  ex += lab('暴露處 1 點半', 'exposure (示意)', 14, PH - 24, A.expose, { ...RED, op: T.on(3, 0.8) });
  return { L: { svg: sv.svg, extra: exL, P: OS_(EH) }, R: { svg: fv.svg, extra: ex, P: OF } };
};
DRAW2['2-2'] = T => {
  const a = T.p(0, 0.1, 0.9), st = a > 0.01 ? { ...ST.expo, open: VS.openAt(a) } : ST.expo;
  const sv = se(st), S = sv.A, fv = fr(st), A = fv.A;
  let exL = lab('結膜', 'conjunctiva', 14, 54, S.conj) + lab('Tenon 囊', "Tenon's capsule", 14, 150, S.tenon || S.conj);
  exL += lab('纖維囊', 'fibrous capsule', PW - 12, PH - 30, S.capsule, { side: 'R', bold: true, op: T.on(1, 0.8) });
  exL += lab('環扣帶', 'band', PW - 12, 54, S.band, { side: 'R', color: COL.suture, lc: COL.suture });
  let ex = clocks(fv, 1);
  if (A.open && a > 0.6) ex += lab('結膜切開', 'incision', PW - 12, 54, fv.P(SOCKET.fpt(7.4, SOCKET.profile().sOpen)), { side: 'R', bold: true, op: T.on(0, 0.8) });
  ex += lab('Dacron 縫線', 'suture', 14, PH - 24, A.sut[1.5], { ...GRN, op: T.on(2, 0.8) });
  const tip = A.open ? [A.open[0] + 6, A.open[1] - 4] : null;
  const ct = A.sut[10.5] ? [A.sut[10.5][0] + 14, A.sut[10.5][1] + 22] : null;
  ex += ct ? cottonTip(ct, [PW + 10, PH - 40], T.on(2, 0.8)) + lab('棉棒', 'cotton tip', PW - 12, PH - 24, ct, { side: 'R', op: T.on(2, 0.8) }) : '';
  ex += note('打開範圍依主刀決定（示意）', T.on(3, 0.8), 30);
  return { L: { svg: sv.svg, extra: exL, P: OS_(EH) }, R: { svg: fv.svg, extra: ex, P: OF } };
};

// ---------------------------------------------------------------- 3 剪斷與抽出
DRAW2['3-1'] = T => {
  const order = [1.5, 4.5, 7.5, 10.5], cut = order.filter((h, i) => T.u >= T.st(2) + 0.6 + i * 0.7);
  const st = { ...ST.open, sutCut: cut }, sv = se(st), S = sv.A, fv = fr(st), A = fv.A;
  let exL = lab('Dacron 縫線', 'mattress suture', PW - 12, 54, S.sut, { side: 'R', ...GRN });
  exL += lab('環扣帶', 'band', PW - 12, PH - 30, S.band, { side: 'R', color: COL.suture, lc: COL.suture });
  exL += lab('鞏膜殼', 'scleral shell', 14, PH - 30, S.shell);
  let ex = clocks(fv, 1);
  const pos = { 1.5: [14, PH - 24], 4.5: [14, 54], 7.5: [PW - 12, 54], 10.5: [PW - 12, PH - 24] };
  for (const h of order) { const done = cut.includes(h), [x, y] = pos[h];
    ex += lab(done ? '已剪斷' : 'Dacron 縫線', done ? 'cut' : 'suture', x, y, A.sut[h], { side: x > PW / 2 ? 'R' : undefined, ...(done ? RED : GRN), op: T.on(0, 0.8) }); }
  ex += note('四條縫線的位置為示意', T.on(3, 0.8), 30);
  return { L: { svg: sv.svg, extra: exL, P: OS_(EH) }, R: { svg: fv.svg, extra: ex, P: OF } };
};
DRAW2['3-2'] = T => {
  const c = T.on(0, 1.0, 0.6), st = c > 0.5 ? ST.cut : ST.sutCut, sv = se(st), S = sv.A, fv = fr(st), A = fv.A;
  let exL = lab('剪斷處', 'cut', PW - 12, 54, S.cut || S.band, { side: 'R', ...RED, op: c });
  exL += lab('環扣帶', 'band', PW - 12, PH - 30, S.band, { side: 'R', color: COL.suture, lc: COL.suture, op: 1 - c });
  let ex = clocks(fv, 1);
  ex += lab('剪斷處', 'cut', 14, PH - 24, A.cut || A.expose, { ...RED, op: c });
  ex += lab('先抓好要拉的一端', 'hold one end', 14, PH - 64, A.cut || A.expose, { bold: true, op: T.on(1, 0.8) });
  ex += note('先剪縫線或先剪 band：依主刀決定', T.on(2, 0.8), 30);
  return { L: { svg: sv.svg, extra: exL, P: OS_(EH) }, R: { svg: fv.svg, extra: ex, P: OF } };
};
DRAW2['3-3'] = T => {
  const demo = T.on(2, 0.6) * (1 - T.on(3, 0.6, 0.0));                        // line 2: one suture left uncut (示範)
  const p = T.p(0, 0.15, 1) * 0.55 + T.p(1, 0, 1) * 0.45;                      // lines 0–1: the band slides out
  let st = { ...ST.cut, pull: p }; const hk = VS.nextRectus(st); if (hk != null && T.u >= T.st(1)) st.hook = hk;
  if (demo > 0.5) st = ST.stuckDemo;
  const sh = demo > 0.5 ? 7.5 : (st.hook != null ? st.hook : EH);
  const sv = se(st, sh), S = sv.A, fv = fr(st), A = fv.A;
  let exL = '', ex = clocks(fv, 1);
  if (demo > 0.5) {
    exL += lab('沒剪的縫線卡住 band', 'uncut suture', PW - 12, 54, S.stuck || S.sut, { side: 'R', ...RED });
    ex += lab('卡住', 'stuck', PW - 12, 54, A.stuck, { side: 'R', ...RED });
    exL += tag('示範：還有一條縫線沒剪（示意）', 1, COL.red, PH - 18);
  } else {
    if (S.hook) exL += lab('肌肉鉤', 'muscle hook', PW - 12, 54, S.hook, { side: 'R', bold: true });
    if (S.rectus) exL += lab('直肌', 'rectus', PW - 12, 100, S.rectus, { side: 'R' });
    const bc = sv.r.sides[1] && sv.r.sides[1].bandC;   // centre of the band's cross-section, right half
    if (bc) exL += lab('band 在肌肉下滑出', 'band slides out', 14, PH - 30, sv.P(bc), { color: COL.suture, lc: COL.suture, bold: true });
    if (A.pulled) ex += lab('拉出的 band', 'pulled out', 14, PH - 24, A.pulled, { bold: true });
    if (A.bandEnd) ex += lab('另一端', 'free end', 14, 54, A.bandEnd, { bold: true, color: COL.suture, lc: COL.suture });
    if (A.hook) ex += lab('助手：肌肉鉤勾起直肌', 'hook the rectus', 14, 100, A.hook, GRN);
  }
  return { L: { svg: sv.svg, extra: exL, P: OS_(sh) }, R: { svg: fv.svg, extra: ex, P: OF } };
};

// ---------------------------------------------------------------- 4 核對、檢體、清創
// the removed band laid out straight (示意): both ends, whole length, sutures beside it
function laidOut(op, hl) {
  const x0 = 70, x1 = PW - 70, y = PH - 92;
  let s = `<g opacity="${op}"><rect x="${x0 - 30}" y="${y - 54}" width="${x1 - x0 + 60}" height="110" rx="10" fill="#fff" stroke="#d3dae1"/>`;
  s += `<rect x="${x0}" y="${y - 8}" width="${x1 - x0}" height="16" rx="3" fill="#dfe9f2" stroke="#536b82" stroke-width="1.6"/>`;
  for (const x of [x0, x1]) s += `<circle cx="${x}" cy="${y}" r="13" fill="none" stroke="${COL.accent}" stroke-width="2.6" opacity="${hl}"/>`;
  for (let i = 0; i < 4; i++) s += `<path d="M${x0 + 40 + i * 40} ${y + 30}q8 -10 16 0q8 10 16 0" stroke="#2c6e3a" stroke-width="2.2" fill="none"/>`;
  s += text(PW / 2, y - 26, '拿出來的 band 拉直：兩端都在、完整一圈（示意）', { size: 15, bold: true, anchor: 'middle' });
  s += text(x0 + 220, y + 40, '縫線也都拿出來', { size: 14, color: COL.sub });
  return s + '</g>';
}
DRAW2['4-1'] = T => {
  const sv = se(ST.out), S = sv.A, fv = fr(ST.out, 'fR', VS.WIN.front), A = fv.A;
  const pr = SOCKET.profile(), q = pr.at(pr.sEq), off = SOCKET.P.CAPS_T + SOCKET.P.BAND_T / 2;
  let exL = lab('band 原本的位置', 'empty capsule', PW - 12, 54, sv.P([q.p[0] + q.n[0] * off, q.p[1] + q.n[1] * off]), { side: 'R', bold: true });
  exL += lab('鞏膜殼', 'scleral shell', 14, PH - 30, S.shell);
  const svgR = `<g opacity="${1 - 0.75 * T.on(0, 0.8)}">${fv.svg}</g>` + laidOut(T.on(0, 0.8), T.on(0, 0.6, 0.8));
  let ex = clocks(fv, 1 - 0.75 * T.on(0, 0.8));
  ex += note('拿乾淨：全身用藥可能短一點（作者意見）', T.on(2, 0.8), 30);
  return { L: { svg: sv.svg, extra: exL, P: OS_(EH) }, R: { svg: svgR, extra: ex, P: OF } };
};
// sterile specimen container with its label
function jar(x, y, op) {
  return `<g opacity="${op}"><rect x="${x}" y="${y}" width="120" height="132" rx="12" fill="#f4f8fb" stroke="#7c8b99" stroke-width="2"/>`
    + `<rect x="${x - 6}" y="${y - 18}" width="132" height="22" rx="5" fill="#c7d3de" stroke="#7c8b99" stroke-width="2"/>`
    + `<path d="M${x + 24} ${y + 92}q18 -16 36 0q18 16 36 0" stroke="#536b82" stroke-width="7" fill="none" stroke-linecap="round"/>`
    + `<path d="M${x + 30} ${y + 112}q8 -8 16 0q8 8 16 0" stroke="#2c6e3a" stroke-width="2.4" fill="none"/>`
    + `<circle cx="${x + 88}" cy="${y + 112}" r="7" fill="#c8403c"/></g>`;
}
DRAW2['4-2'] = T => {
  const d = T.p(3, 0.1, 0.9), st = { ...ST.out, debride: d }, sv = se(st), S = sv.A, fv = fr(st), A = fv.A;
  const jop = T.on(0, 0.8) * (1 - T.on(3, 0.6));
  let exL = '';
  if (S.gran && d < 0.9) exL += lab('肉芽組織', 'granulation', PW - 12, 54, S.gran, { side: 'R', color: COL.red, lc: COL.red });
  exL += lab('鞏膜殼', 'scleral shell', 14, PH - 30, S.shell);
  const svgR = `<g opacity="${1 - 0.8 * jop}">${fv.svg}</g>` + jar(PW / 2 - 60, 120, jop)
    + infoCard(PW / 2 - 250, 290, 500, [['無菌容器：band＋縫線＋肉芽組織', { bold: true }], ['抗酸染色＋mycobacteria 培養；菌種到亞種']], jop);
  let ex = clocks(fv, 1 - 0.8 * jop);
  ex += htext(PW / 2, 96, '培養檢體不泡 formalin（依院內常規）', { size: 15, bold: true, color: COL.red, anchor: 'middle', op: T.on(2, 0.8) * jop });
  if (A.gran && d < 0.9) ex += lab('清除肉芽組織', 'debridement', 14, PH - 24, A.gran, { color: COL.red, lc: COL.red, bold: true, op: T.on(3, 0.6) });
  ex += note('沖洗液依主刀決定', T.on(3, 0.8), 30);
  return { L: { svg: sv.svg, extra: exL, P: OS_(EH) }, R: { svg: svgR, extra: ex, P: OF } };
};

// ---------------------------------------------------------------- 5 收尾與術後
DRAW2['5-1'] = T => {
  const c = T.p(0, 0.1, 0.9), cf = T.on(1, 0.8);
  const st = { ...ST.clean, close: c, ...(cf > 0.5 ? { conformer: 1 } : {}) }, sv = se(st), S = sv.A, fv = fr(st), A = fv.A;
  let exL = '';
  if (S.close) exL += lab('結膜縫合', 'closure', PW - 12, 54, S.close, { side: 'R', bold: true });
  if (cf > 0.5 && S.conformer) exL += lab('眼窩模型', 'conformer', PW - 12, 100, S.conformer, { side: 'R', bold: true, color: COL.suture, lc: COL.suture });
  exL += lab('鞏膜殼', 'scleral shell', 14, PH - 30, S.shell);
  let ex = clocks(fv, 1);
  if (A.close) ex += lab('結膜縫合（依主刀）', 'closure', 14, PH - 24, A.close, { bold: true, op: 1 - cf });
  if (cf > 0.5 && A.conformer) ex += lab('眼窩模型', 'conformer', 14, 54, A.conformer, { bold: true, color: COL.suture, lc: COL.suture });
  ex += note('撐住結膜囊、防止縮小', T.on(2, 0.8), 30);
  return { L: { svg: sv.svg, extra: exL, P: OS_(EH) }, R: { svg: fv.svg, extra: ex, P: OF } };
};
DRAW2['5-2'] = T => {
  const fv = fr(ST.end), A = fv.A;
  let s = infoCard(24, 20, PW - 48, [['感染時能不能同時放植入物？', { bold: true, size: 17 }], ['避免：Lai 2023（眼內炎）'], ['一期就放：Alrashed 2026'],
    ['研究多是一般細菌，不是 NTM', { color: COL.sub }]], T.on(0, 0.8));
  s += infoCard(24, 196, PW - 48, [['沒察覺 NTM 就修補暴露的植入物', { bold: true }], ['→ 很快又復發（Choi 2018）']], T.on(2, 0.8));
  s += infoCard(24, 300, PW - 48, [['先拿掉 band、控制感染，再談重建', { bold: true, color: COL.accent }], ['推論，不是文獻建議', { color: COL.sub }]], T.on(3, 0.8));
  let ex = clocks(fv, 1);
  ex += lab('這次不放植入物', 'no implant', PW - 12, 54, A.shell || fv.P([0, 0]), { side: 'R', bold: true });
  return { L: { svg: s, P: { title: '文獻怎麼說', orient: '出處見右下來源' } }, R: { svg: fv.svg, extra: ex, P: OF } };
};
DRAW2['5-3'] = T => {
  const W = PW - 48;
  let L = infoCard(24, 24, W, [['NTM 眼部感染的藥敏（139 例）', { bold: true, size: 17 }], ['amikacin 敏感 81%'], ['clarithromycin 敏感 93%'],
    ['M. abscessus 可能對 clarithromycin 抗藥', { color: COL.red }]], T.on(0, 0.8));
  L += infoCard(24, 210, W, [['菌種鑑定到亞種，依藥敏調整', { bold: true }]], T.on(0, 0.8, 1.2));
  // course bar: clinical resolution, then 4 weeks to 6 months more (Das 2024)
  const x0 = 40, x1 = PW - 40, y = 170, xm = x0 + (x1 - x0) * 0.32;
  let R = `<g opacity="${T.on(1, 0.8)}"><rect x="${x0}" y="${y - 12}" width="${xm - x0}" height="24" rx="4" fill="#c7d3de"/>`
    + `<rect x="${xm}" y="${y - 12}" width="${x1 - xm}" height="24" rx="4" fill="#9fd3c7"/>`
    + `<path d="M${xm} ${y - 26}v52" stroke="${COL.ink}" stroke-width="2"/>`
    + text(x0, y - 24, '至少兩種藥', { size: 16, bold: true }) + text(xm + 8, y - 24, '症狀消失', { size: 15, color: COL.sub })
    + text((xm + x1) / 2, y + 44, '再續 4 週到 6 個月', { size: 17, bold: true, anchor: 'middle', color: COL.accent }) + '</g>';
  R += infoCard(24, 268, W, [['有眼窩侵犯：通常要更久', { bold: true }], ['藥物與療程：依培養、藥敏與感染科']], T.on(2, 0.8));
  return { L: { svg: L, P: { title: '藥敏', orient: 'Girgis 2012　Rujkorakarn 2025' } }, R: { svg: R, P: { title: '療程', orient: 'Das 2024' } } };
};

// ---------------------------------------------------------------- 6 助手清單
DRAW2['6'] = T => {
  const items = [['方位：術者坐 12 點，下＝12 點', 'temporal（3 點）在左'], ['暴露：拉開、吸乾淨、止血', '讓主刀看得到 band 和縫線'],
    ['經過直肌：muscle hook 勾起', '拉不動就說，先找縫線或纖維囊'], ['核對：兩端都在、完整一圈', '縫線也拿乾淨'],
    ['檢體：無菌容器、不泡 formalin', '抗酸染色＋mycobacteria 培養'], ['術後：用藥依培養與感染科', '重建等感染控制後再談']];
  let s = '';
  items.forEach((it, i) => { const col = i < 3 ? 0 : 1, row = i % 3, x = 18 + col * 606, y = 14 + row * 130, op = Math.max(0.3 * T.on(0, 0.8, i * 0.12), T.on(i + 1, 0.5)),
      now = (T.u >= T.st(i + 1) && (i === 5 || T.u < T.st(i + 2))) ? 1 : 0;
    s += card(x, y, 588, 114, { op, hl: now }) + `<circle cx="${x + 38}" cy="${y + 57}" r="19" fill="${now ? COL.accent : '#9aa7b4'}" opacity="${op}"/>` +
      text(x + 38, y + 64, String(i + 1), { size: 19, bold: true, anchor: 'middle', color: '#fff', op }) +
      text(x + 74, y + 50, it[0], { size: 18, bold: true, op }) + text(x + 74, y + 82, it[1], { size: 16.5, color: COL.sub, op }); });
  return { F: { svg: s, P: { title: '跟刀清單（助手）', orient: '藥物、器械與縫線依院內常規與主刀決定' } } };
};
