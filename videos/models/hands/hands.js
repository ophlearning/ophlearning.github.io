// ============================================================================
// Hands and microsurgical instruments — the surgeon's two hands and the instruments of a corneoscleral repair. Units: mm. Sources: CARD.md.
// Top views share the en-face frame of the globe model (videos/models/globe): origin at the corneal centre, x right, y down, surgeon at 12
// (bottom of the image). An instrument is given by its tip (mm) and dir = unit vector from the tip toward the hand; the microscope view
// (tips only, 10–20 mm window) and the field overview (hands, 200–300 mm window) draw the same instrument from the same numbers.
// Hand and instrument sizes are 示意 (no source); what the hands do is sourced in CARD.md.
// ============================================================================
const HANDS = (() => {
  const F = p => p[0].toFixed(2) + ' ' + p[1].toFixed(2);
  const NS = 'vector-effect="non-scaling-stroke"';
  const add = (a, b, k = 1) => [a[0] + b[0] * k, a[1] + b[1] * k];
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
  const len = a => Math.hypot(a[0], a[1]);
  const unit = a => { const l = len(a) || 1; return [a[0] / l, a[1] / l]; };
  const perp = a => [-a[1], a[0]];                       // +90° on screen (y down): the right-hand side of a forward vector
  const lerp = (a, b, k) => a + (b - a) * k;
  const rot = (a, deg) => { const r = deg * Math.PI / 180, c = Math.cos(r), s = Math.sin(r); return [a[0] * c - a[1] * s, a[0] * s + a[1] * c]; };
  const angOf = d => Math.atan2(d[1], d[0]) * 180 / Math.PI;
  const poly = (pts, close = true) => 'M' + pts.map(F).join('L') + (close ? 'Z' : '');
  // smooth closed path through points (Catmull-Rom → cubic Bézier)
  function smooth(pts, close = true) {
    const n = pts.length, P = i => pts[close ? (i + n) % n : Math.max(0, Math.min(n - 1, i))];
    let d = 'M' + F(pts[0]);
    for (let i = 0; i < (close ? n : n - 1); i++) { const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
      const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      d += 'C' + F(c1) + ' ' + F(c2) + ' ' + F(p2); }
    return d + (close ? 'Z' : '');
  }
  // sizes (mm, 示意)
  const SZ = { holderL: 140, holderJaw: 9, forcepsL: 105, tyerL: 105, needleR: 2.7, needleArc: 135 /* degrees: 3/8 circle */, handL: 185 };
  const C = { metal: '#c3cad2', metalD: '#7d8792', metalS: '#4c5560', glove: '#f0dfc6', gloveS: '#b69673', gloveD: '#dcc4a3', nail: '#e6d2b6',
    drape: '#9fc7c0', drapeD: '#86b1aa', needle: '#5b6470', suture: '#1f2a44', ovd: '#cfe3f5' };

  // ---------------------------------------------------------------- instruments, top view (mm). tip, dir (tip → hand), open 0–1
  // band along the axis: half-widths w(s) for s from 0 (tip) to L; returns the outline
  function band(tip, dir, L, w, step = 0.5) {
    const n = perp(dir), A = [], B = [];
    for (let s = 0; s <= L + 1e-9; s += step) { const c = add(tip, dir, s), h = w(s); A.push(add(c, n, h)); B.push(add(c, n, -h)); }
    return [...A, ...B.reverse()];
  }
  const metal = (pts, o = {}) => `<path d="${poly(pts)}" fill="${o.fill || C.metal}" stroke="${o.stroke || C.metalS}" stroke-width="${o.sw || 1}" stroke-linejoin="round" ${NS}/>`;
  // needle holder (Castroviejo type): fine jaws 9 mm, shank, spring handles with a ridged grip zone (示意)
  function holder(tip, dir, o = {}) {
    const L = o.L ?? SZ.holderL, J = SZ.holderJaw, n = perp(dir), op = o.op ?? 1;
    const w = s => s < J ? lerp(0.32, 0.85, s / J) : s < 28 ? lerp(0.85, 1.6, (s - J) / (28 - J)) : s < L - 6 ? lerp(3.4, 4.6, (s - 28) / (L - 34)) : 4.6 * Math.sqrt(Math.max(0, (L - s) / 6));
    let g = metal(band(tip, dir, Math.min(L, o.clip ?? L), w));
    g += `<path d="M${F(tip)}L${F(add(tip, dir, J))}" stroke="${C.metalD}" stroke-width="0.8" ${NS}/>`;                       // jaw seam
    if ((o.clip ?? L) > 40) for (let s = 45; s <= Math.min(85, o.clip ?? L); s += 2.2) { const c = add(tip, dir, s);             // ridged grip zone
      g += `<path d="M${F(add(c, n, -3.6))}L${F(add(c, n, 3.6))}" stroke="${C.metalD}" stroke-width="0.6" opacity="0.7" ${NS}/>`; }
    return `<g opacity="${op}">${g}</g>`;
  }
  // toothed forceps (0.12 mm teeth) or tying forceps (flat platforms): two tines that spread by `open` mm at the tip
  function forceps(tip, dir, o = {}) {
    const L = o.L ?? SZ.forcepsL, n = perp(dir), gap = (o.open ?? 0) * 1.0, tying = !!o.tying, op = o.op ?? 1, cl = Math.min(L, o.clip ?? L);
    const tine = sg => { const pts = [], back = [];
      for (let s = 0; s <= cl; s += 0.5) { const sep = gap * Math.max(0, 1 - s / 22) / 2 + (s > 22 ? 0 : 0), mid = sep + lerp(0.22, 1.6, Math.min(1, s / 30)) * (s < 3 && tying ? 1.6 : 1);
        const hw = s < 3 && tying ? 0.5 : lerp(0.18, 1.5, Math.min(1, s / 30)), c = add(add(tip, dir, s), n, sg * mid);
        pts.push(add(c, n, hw)); back.push(add(c, n, -hw)); }
      return metal([...pts, ...back.reverse()], { fill: sg > 0 ? C.metal : '#b2bac3' }); };
    let g = tine(1) + tine(-1);
    if (!tying) for (const sg of [1, -1]) { const t = add(add(tip, n, sg * (gap / 2 + 0.22)), dir, 0.05);                       // the tiny teeth at the very tip
      g += `<circle cx="${t[0].toFixed(2)}" cy="${t[1].toFixed(2)}" r="0.09" fill="${C.metalS}"/>`; }
    return `<g opacity="${op}">${g}</g>`;
  }
  // cannula on a syringe (OVD) and cyclodialysis spatula: thin shafts
  function cannula(tip, dir, o = {}) { const cl = o.clip ?? 60, w = s => s < 22 ? 0.23 : s < 26 ? lerp(0.23, 1.8, (s - 22) / 4) : 4.2;
    return `<g opacity="${o.op ?? 1}">${metal(band(tip, dir, cl, w))}</g>`; }
  function spatula(tip, dir, o = {}) { const cl = o.clip ?? 90, w = s => s < 3 ? 0.42 * Math.sqrt(Math.max(0.05, Math.min(1, s / 0.5))) : s < 4 ? lerp(0.42, 0.3, s - 3) : s < 40 ? 0.3 : 2.4;
    return `<g opacity="${o.op ?? 1}">${metal(band(tip, dir, cl, w, 0.25))}</g>`; }
  // Vannas-type scissors (fine blades), open 0–1
  function scissors(tip, dir, o = {}) { const n = perp(dir), a = (o.open ?? 0) * 9, op = o.op ?? 1;
    const blade = (sg, ang) => { const d = rot(dir, sg * ang), m = perp(d); return metal([add(tip, m, 0.05 * sg), add(add(tip, d, 6), m, 0.55 * sg), add(add(tip, d, 14), m, 0.7 * sg), add(add(tip, d, 14), m, -0.2 * sg), add(tip, m, -0.05 * sg)], { fill: sg > 0 ? C.metal : '#b2bac3' }); };
    return `<g opacity="${op}">${blade(1, a / 2)}${blade(-1, -a / 2)}${metal(band(add(tip, dir, 14), dir, 60, s => s < 4 ? 0.7 : 1.4))}</g>`; }

  // needle: circular arc, radius r (3/8 circle), given its tip, the tangent at the tip (direction of travel) and which side the centre is on.
  // Returns points from the tip back to the swage, the grasp point (fraction g of the length from the swage) and the tangent there.
  function needle(tip, tangent, o = {}) {
    const r = o.r ?? SZ.needleR, arc = (o.arc ?? SZ.needleArc) * Math.PI / 180, side = o.side ?? 1, t = unit(tangent), n = perp(t);
    const cC = add(tip, n, side * r), a0 = Math.atan2(tip[1] - cC[1], tip[0] - cC[0]), pts = [];
    for (let k = 0; k <= 40; k++) { const a = a0 - side * arc * k / 40; pts.push([cC[0] + r * Math.cos(a), cC[1] + r * Math.sin(a)]); }
    const gi = Math.round(40 * (1 - (o.grasp ?? 0.4))), g = pts[gi], tg = unit(sub(pts[Math.max(0, gi - 1)], pts[Math.min(40, gi + 1)]));
    return { pts, grasp: g, tanAtGrasp: tg, swage: pts[40], centre: cC };
  }
  const needleSvg = (nd, o = {}) => `<path d="M${nd.pts.map(F).join('L')}" fill="none" stroke="#fff" stroke-width="${(o.w ?? 2.2) + 2}" stroke-linecap="round" opacity="0.8" ${NS}/><path d="M${nd.pts.map(F).join('L')}" fill="none" stroke="${C.needle}" stroke-width="${o.w ?? 2.2}" stroke-linecap="round" ${NS}/>`;

  // ---------------------------------------------------------------- hand, top (dorsal) view in a pen grip
  // Local frame: origin = where the instrument rests between thumb and index; +u toward the tip; +v toward the ulnar side seen from above.
  // Right hand; the left hand is the mirror image (v → −v). Proportions 示意.
  const HAND = {
    thumb: [[-74, 10], [-46, -9], [-22, -15], [-2, -9]], thumbW: [21, 19, 17, 15],
    index: [[-46, 20], [-22, 11], [-6, 4], [9, 0]], indexW: [19, 17, 15, 13],
    middle: [[-50, 35], [-27, 27], [-12, 16], [-2, 9]], middleW: [19, 17, 15, 13],
    ring: [[-53, 49], [-34, 49], [-34, 40]], ringW: [18, 16, 14],
    little: [[-56, 61], [-40, 62], [-41, 54]], littleW: [16, 14, 12],
    dorsum: [[-46, 20], [-50, 35], [-53, 49], [-58, 66], [-78, 76], [-112, 70], [-125, 48], [-108, 22], [-80, 6]],
    wrist: [[-125, 48], [-112, 70], [-170, 82], [-182, 52]],
    rest: [-74, 74],                                       // ulnar edge of the palm resting on the drape (forehead) or a wrist rest
  };
  function finger(pts, ws, M, o = {}) {   // capsules joint to joint, outlined, with a nail at the tip if dorsal
    let s = '';
    for (let i = 1; i < pts.length; i++) { const a = M(pts[i - 1]), b = M(pts[i]);
      s += `<path d="M${F(a)}L${F(b)}" stroke="${C.gloveS}" stroke-width="${(ws[i - 1] + 1.2) * o.k}" stroke-linecap="round" fill="none"/>`; }
    for (let i = 1; i < pts.length; i++) { const a = M(pts[i - 1]), b = M(pts[i]);
      s += `<path d="M${F(a)}L${F(b)}" stroke="${C.glove}" stroke-width="${ws[i - 1] * o.k}" stroke-linecap="round" fill="none"/>`; }
    for (let i = 1; i < pts.length - 1; i++) { const p = M(pts[i]), d = unit(sub(M(pts[i + 1]), M(pts[i - 1]))), q = perp(d), h = ws[i] * o.k * 0.32;     // joint creases
      s += `<path d="M${F(add(p, q, -h))}Q${F(add(p, d, -1.2 * o.k))} ${F(add(p, q, h))}" stroke="${C.gloveD}" stroke-width="1" fill="none" ${NS}/>`; }
    if (o.nail) { const tip = M(pts[pts.length - 1]), pre = M(pts[pts.length - 2]), d = unit(sub(tip, pre)), c = add(tip, d, -ws[ws.length - 1] * o.k * 0.35);
      s += `<ellipse cx="${c[0].toFixed(2)}" cy="${c[1].toFixed(2)}" rx="${(ws[ws.length - 1] * o.k * 0.32).toFixed(2)}" ry="${(ws[ws.length - 1] * o.k * 0.26).toFixed(2)}" transform="rotate(${angOf(d).toFixed(1)} ${c[0].toFixed(2)} ${c[1].toFixed(2)})" fill="${C.nail}" stroke="${C.gloveD}" stroke-width="1" ${NS}/>`; }
    return s;
  }
  // hand + instrument in the overview. inst: { kind, tip, dir, open, grip (mm from the tip to the finger contact) }; side 'R' | 'L'
  function handTop(inst, side, o = {}) {
    const fwd = [-inst.dir[0], -inst.dir[1]], right = perp(fwd), mir = side === 'L' ? -1 : 1, k = 1;
    const at = add(inst.tip, inst.dir, inst.grip ?? 52);
    const M = p => add(add(at, fwd, p[0]), right, p[1] * mir);
    const tool = drawInst(inst, { clip: undefined });
    const shadow = M(HAND.rest);
    let s = `<ellipse cx="${shadow[0].toFixed(1)}" cy="${shadow[1].toFixed(1)}" rx="30" ry="16" transform="rotate(${angOf(fwd).toFixed(1)} ${shadow[0].toFixed(1)} ${shadow[1].toFixed(1)})" fill="#000" opacity="0.10"/>`;
    s += `<path d="${smooth(HAND.wrist.map(M))}" fill="${C.glove}" stroke="${C.gloveS}" stroke-width="1.2" ${NS}/>`;
    s += finger(HAND.ring, HAND.ringW, M, { k }) + finger(HAND.little, HAND.littleW, M, { k });
    s += `<path d="${smooth(HAND.dorsum.map(M))}" fill="${C.glove}" stroke="${C.gloveS}" stroke-width="1.2" ${NS}/>`;
    s += finger(HAND.middle, HAND.middleW, M, { k, nail: false });
    s += finger(HAND.thumb, HAND.thumbW, M, { k, nail: true });
    s += tool;
    s += finger(HAND.index, HAND.indexW, M, { k, nail: true });
    return { svg: s, A: { rest: shadow, grip: at, thumb: M(HAND.thumb[3]), index: M(HAND.index[3]), wrist: M([-150, 66]) } };
  }
  function drawInst(inst, o = {}) {
    const f = { holder, forceps, tyer: (t, d, q) => forceps(t, d, { ...q, tying: true }), cannula, spatula, scissors }[inst.kind];
    return f ? f(inst.tip, inst.dir, { open: inst.open, clip: o.clip, op: inst.op }) : '';
  }

  // ---------------------------------------------------------------- the field seen from above, outside the microscope (surgeon at 12)
  // eye at the origin (radius of the speculum opening ~13 mm, 示意); drape over the face with an opening; two hands with their instruments.
  function overview(o) {
    const s = [], A = {};
    s.push(`<rect x="-400" y="-400" width="800" height="800" fill="${C.drape}"/>`);
    for (let i = -10; i <= 10; i++) s.push(`<path d="M${-400} ${i * 32}L400 ${i * 32 + 60}" stroke="${C.drapeD}" stroke-width="1" opacity="0.35" ${NS}/>`);
    s.push(`<ellipse cx="0" cy="0" rx="24" ry="17" fill="#e8c9b4" stroke="#b98d76" stroke-width="1.2" ${NS}/>`);          // skin in the drape window
    s.push(`<ellipse cx="0" cy="0" rx="13.5" ry="10" fill="#fbf4f1" stroke="#cfa79a" stroke-width="1" ${NS}/>`);            // opened lids
    s.push(`<circle cx="0" cy="0" r="5.94" fill="#5a3824" stroke="#9aa7b0" stroke-width="1" ${NS}/><circle cx="0" cy="0" r="1.5" fill="#1c0b06"/>`);
    for (const sg of [1, -1]) s.push(`<path d="M${-12} ${sg * 9}Q0 ${sg * 13} 12 ${sg * 9}L13 ${sg * 11}Q0 ${sg * 15.5} -13 ${sg * 11}Z" fill="${C.metal}" stroke="${C.metalS}" stroke-width="1" ${NS}/>`); // speculum blades
    s.push(`<path d="M13 9C28 12 30 -12 13 -9" fill="none" stroke="${C.metalS}" stroke-width="1.6" ${NS}/>`);
    for (const side of ['L', 'R']) if (o[side]) { const h = handTop(o[side], side); s.push(h.svg); A[side] = h.A; A[side].dir = o[side].dir; }
    A.eye = [0, 0];
    return { svg: s.join(''), A };
  }

  // ---------------------------------------------------------------- pen grip, side view (radial side of the right hand)
  // Frame: x forward (toward the eye), y down. The hand rests on the forehead (y = 0, x < 45); the eye is lower and further forward,
  // so the instrument runs down to it at `tilt` degrees. Thumb on the near side, index on top, middle finger under the instrument (tripod),
  // ring and little fingers curled, ulnar edge of the hand on the forehead. Proportions 示意.
  function gripSide(o = {}) {
    const tilt = o.tilt ?? 35, fwd = rot([1, 0], tilt), tip = o.tip ?? [126, 24], L = SZ.holderL, s = [], A = {};
    const on = u => add(tip, fwd, -u), up = rot(fwd, -90);             // point u mm behind the tip; `up` = the instrument's upper side
    const g = o.grip ?? 50;
    const fg = (pts, ws) => { let r = ''; for (let i = 1; i < pts.length; i++) r += `<path d="M${F(pts[i - 1])}L${F(pts[i])}" stroke="${C.gloveS}" stroke-width="${ws[i - 1] + 1.6}" stroke-linecap="round"/>`;
      for (let i = 1; i < pts.length; i++) r += `<path d="M${F(pts[i - 1])}L${F(pts[i])}" stroke="${C.glove}" stroke-width="${ws[i - 1]}" stroke-linecap="round"/>`;
      for (let i = 1; i < pts.length - 1; i++) { const p = pts[i], d = unit(sub(pts[i + 1], pts[i - 1])), q = perp(d), h = ws[i] * 0.3; r += `<path d="M${F(add(p, q, -h))}L${F(add(p, q, h))}" stroke="${C.gloveD}" stroke-width="1.2"/>`; }
      return r; };
    // forehead (support) with the eye lower and in front of it
    s.push(`<path d="M-160 0L40 0C70 0 80 18 104 24C114 26 118 22 126 24C136 26 150 34 190 40L190 120L-160 120Z" fill="#e8c9b4" stroke="#b98d76" stroke-width="1.5" ${NS}/>`);
    s.push(`<path d="M-160 0L40 0" stroke="${C.drapeD}" stroke-width="6" ${NS}/><path d="M-160 3H40V18H-160Z" fill="${C.drape}" opacity="0.9"/>`);
    s.push(`<ellipse cx="124" cy="25.5" rx="9" ry="3" fill="#5a3824" opacity="0.85"/>`);
    // forearm and palm; the ulnar edge rests on the forehead
    s.push(`<path d="${smooth([[-160, -66], [-70, -62], [-62, -2], [-160, -12]])}" fill="${C.glove}" stroke="${C.gloveS}" stroke-width="1.4" ${NS}/>`);
    s.push(fg([[2, -40], [24, -26], [22, -8]], [16, 14]), fg([[-8, -30], [10, -14], [4, -2]], [14, 12]));    // little and ring fingers, curled
    s.push(`<path d="${smooth([[-72, -60], [-30, -70], [18, -66], [34, -48], [28, -26], [6, -10], [-30, -1], [-66, -2]])}" fill="${C.glove}" stroke="${C.gloveS}" stroke-width="1.4" ${NS}/>`);
    // middle finger: supports the instrument from below
    const mid = [[24, -44], [50, -36], [70, -22], add(on(g + 2), up, -6.5)];
    s.push(fg(mid, [18, 16, 14]));
    // the instrument: jaws at the tip, ridged grip zone under the fingers, back end over the first web space
    const back = on(L);
    s.push(`<path d="M${F(tip)}L${F(on(9))}" stroke="${C.metalS}" stroke-width="3.2" stroke-linecap="round"/><path d="M${F(on(9))}L${F(back)}" stroke="${C.metalS}" stroke-width="8.6" stroke-linecap="round"/>`);
    s.push(`<path d="M${F(tip)}L${F(on(9))}" stroke="${C.metal}" stroke-width="2" stroke-linecap="round"/><path d="M${F(on(9))}L${F(back)}" stroke="${C.metal}" stroke-width="7" stroke-linecap="round"/>`);
    for (let u = 40; u <= 80; u += 2.6) { const c = on(u); s.push(`<path d="M${F(add(c, up, -3))}L${F(add(c, up, 3))}" stroke="${C.metalD}" stroke-width="0.7" opacity="0.8"/>`); }
    // index finger: pad on top of the instrument
    const ixTip = add(on(g - 4), up, 6.2), ix = [[22, -66], [52, -66], [76, -48], ixTip];
    s.push(fg(ix, [19, 17, 15]));
    { const d = unit(sub(ix[3], ix[2])), c = add(ix[3], perp(d), -4); s.push(`<ellipse cx="${c[0].toFixed(1)}" cy="${c[1].toFixed(1)}" rx="5.2" ry="3.2" transform="rotate(${angOf(d).toFixed(1)} ${c[0].toFixed(1)} ${c[1].toFixed(1)})" fill="${C.nail}" stroke="${C.gloveD}" stroke-width="1"/>`); }
    // thumb: on the near side, its pad pressing the instrument just behind the index pad
    const thTip = on(g + 6), th = [[-14, -40], [20, -44], [46, -30], thTip];
    s.push(fg(th, [24, 21, 18]));
    A.tip = tip; A.index = ixTip; A.thumb = thTip; A.middle = mid[3]; A.rest = [-34, -1]; A.forehead = [-110, 8]; A.eye = [124, 25]; A.back = back; A.grip = on(g); A.dir = [-fwd[0], -fwd[1]];
    return { svg: s.join(''), A };
  }

  return { holder, forceps, cannula, spatula, scissors, needle, needleSvg, handTop, overview, gripSide, drawInst, smooth, SZ, C, HAND, F, NS, add, sub, unit, perp, rot, len, angOf };
})();
if (typeof module !== 'undefined') module.exports = HANDS;
