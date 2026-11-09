// ============================================================================
// Real surgical footage as one panel of a kit video (videos/tools/video-kit). Shared by the page (loaded after kit.js, before
// the video's anim/footage.js) and by Node (footage-cli.js: extraction and checks), so both use the same timing and geometry.
//
// Registry (one per video folder: anim/footage.js → const FOOTAGE_DEF = { sources, clips }; sources usually come from a shared
// file next to the footage, e.g. videos/src/cataract-series/footage-sources.js):
//   sources[id] = { file: repo-relative mp4 (inside a gitignored footage/ folder), w, h, fps, eye: 'OD' | 'OS',
//     overlays:  [{ name, x, y, w, h }]   burned-in text and logos in source px (measured from full-resolution frames).
//                                       A crop keeps at least OVERLAY_PAD px away from every one of them.
//     landmarks: [{ t, cornea: [x, y], incision: [x, y] }]   orientation landmarks at source time t (s): cornea centre and the
//                                       main incision. Every clip needs one inside its source range (the eye moves).
//     tag?: { title, orient }   panel title; default 術者視角 + eye, orient 下＝12 點 (checked: main incision at the bottom) }
//   clips[id] = { src, in, out          source seconds
//     rate?: 0.5                         playback rate (0.5 = half speed)
//     freeze?: [{ at, dur }]             hold source time `at` for `dur` video seconds
//     crop: [{ t, cx, cy, w, rot? }]     keyframes in SOURCE time, linear in between, held outside; centre and width in source px,
//                                        height = w × panel aspect; rot = degrees the picture is turned clockwise on screen
//     events?: { name: source s }        named moments (puncture, regrasp-1 …); labels and model states key off them
//     points?: { name: [{ t, p: [x, y] }] }   tracked source-px points (label anchors), linear in source time
//     panel?: 'dual' | 'full' }
// Time: a clip runs on its own video clock tau (s from the clip start): source = in + tau × rate, with freezes inserted.
//   FOOTAGE.ev(clip, name) = tau of an event; FOOTAGE.k(clip, name, tau, d) = 0 → 1 over d s after it;
//   FOOTAGE.sync(clip, name, u, atU) = the tau that puts event `name` at segment time atU (e.g. T.st(2)): pass it to panel().
// Geometry: FOOTAGE.toPanel(clip, [x, y], tau) maps source px to panel px through the crop at that moment;
//   FOOTAGE.point(clip, name, tau) does it for a tracked point. Use these as VIEWS.lab2 anchors.
// Panel: FOOTAGE.panel(clip, tau) → { svg, extra, P } for DRAW2 (an <image> of the extracted frame, plus a 慢放 / 加速 / 停格 badge).
// Frames: node videos/tools/video-kit/footage-cli.js extract videos/src/<video> writes <video>/footage/frames/<clip>/<n>.jpg
//   (n = source frame number), already cropped and scaled to the panel at the render scale; the page only shows them.
// Checks: node videos/tools/video-kit/footage-cli.js check videos/src/<video> (check-all.js runs it when anim/footage.js exists).
// ============================================================================
(function (root, factory) { const M = factory(); if (typeof module !== 'undefined' && module.exports) module.exports = M; else root.FOOTAGE = M; })(this, function () {
  const PANEL_PX = { dual: [606, 410], full: [1230, 410] };   // = kit.js PW × PH and FW × PH (checked on the page)
  const DPR = 1.5;                                            // = render.js deviceScaleFactor: frames are extracted at this scale
  const OVERLAY_PAD = 4;                                      // px between a crop and an overlay (> the 2 px reach of bicubic taps)
  const ORIENT_TOL = 30;                                      // degrees: main incision within this of straight down
  const EYE = { OD: '右眼 OD', OS: '左眼 OS' };
  let DEF = null;
  const def = () => DEF || (typeof FOOTAGE_DEF !== 'undefined' ? FOOTAGE_DEF : null);   // eslint-disable-line no-undef
  function use(d) { DEF = d; return d; }
  const clipOf = id => { const D = def(), c = D && D.clips[id]; if (!c) throw new Error('footage: no clip ' + id); return c; };
  const srcOf = c => { const s = def().sources[c.src]; if (!s) throw new Error('footage: no source ' + c.src); return s; };
  const C = x => typeof x === 'string' ? clipOf(x) : x;
  const panelPx = c => PANEL_PX[c.panel || 'dual'];
  const outPx = c => panelPx(c).map(v => Math.round(v * DPR));
  const freezes = c => (c.freeze || []).slice().sort((a, b) => a.at - b.at);

  // ---------------------------------------------------------------- time
  function dur(c) { c = C(c); return (c.out - c.in) / (c.rate || 1) + freezes(c).reduce((a, f) => a + f.dur, 0); }
  // video time (tau, s from the clip start) → { s: source time, frozen: freeze or null }; clamped to the clip
  function at(c, tau) {
    c = C(c); const r = c.rate || 1; let s = c.in, v = 0; tau = Math.max(0, tau);
    for (const f of freezes(c)) {
      const vf = v + (f.at - s) / r;                      // video time when the freeze starts
      if (tau < vf) return { s: s + (tau - v) * r, frozen: null };
      if (tau < vf + f.dur) return { s: f.at, frozen: f };
      s = f.at; v = vf + f.dur;
    }
    return { s: Math.min(c.out, s + (tau - v) * r), frozen: null };
  }
  // source time → the first video time at which it is shown (an event on a freeze → the start of the freeze)
  function videoTime(c, s) {
    c = C(c); const r = c.rate || 1; let s0 = c.in, v = 0;
    for (const f of freezes(c)) { if (s <= f.at) return v + (s - s0) / r; v += (f.at - s0) / r + f.dur; s0 = f.at; }
    return v + (s - s0) / r;
  }
  const frames = c => { c = C(c); const fps = srcOf(c).fps; return [Math.round(c.in * fps), Math.round(c.out * fps)]; };
  function frameAt(c, s) { c = C(c); const [a, b] = frames(c); return Math.min(b, Math.max(a, Math.floor(s * srcOf(c).fps + 1e-6))); }
  function ev(c, name) { c = C(c); const s = (c.events || {})[name]; if (s === undefined) throw new Error('footage: no event ' + name); return videoTime(c, s); }
  const ease = x => x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x);
  const k = (c, name, tau, d = 0.4) => ease((tau - ev(c, name)) / d);
  const sync = (c, name, u, atU) => u - atU + ev(c, name);

  // ---------------------------------------------------------------- geometry (source px ↔ panel px)
  function lin(keys, t, f) {   // keys sorted by t; linear, held outside
    if (t <= keys[0].t) return f(keys[0]);
    for (let i = 1; i < keys.length; i++) if (t <= keys[i].t) { const a = keys[i - 1], b = keys[i], u = (t - a.t) / (b.t - a.t); return f(a).map((v, j) => v + (f(b)[j] - v) * u); }
    return f(keys[keys.length - 1]);
  }
  function cropAt(c, s) {
    c = C(c); const [W, H] = panelPx(c), keys = c.crop.slice().sort((a, b) => a.t - b.t);
    const [cx, cy, w, rot] = lin(keys, s, q => [q.cx, q.cy, q.w, q.rot || 0]);
    return { cx, cy, w, h: w * H / W, rot, k: W / w };
  }
  // corners of the crop in source px (clockwise from top left of the panel)
  function quad(cr) {
    const a = -cr.rot * Math.PI / 180, co = Math.cos(a), si = Math.sin(a), hw = cr.w / 2, hh = cr.h / 2;
    return [[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]].map(([x, y]) => [cr.cx + x * co - y * si, cr.cy + x * si + y * co]);
  }
  // source px → panel px for a crop: turn by rot (clockwise on screen) about the crop centre, scale by k, centre in the panel
  function mapCrop(c, cr, p) {
    const [W, H] = panelPx(C(c)), a = cr.rot * Math.PI / 180, x = p[0] - cr.cx, y = p[1] - cr.cy;
    return [W / 2 + (x * Math.cos(a) - y * Math.sin(a)) * cr.k, H / 2 + (x * Math.sin(a) + y * Math.cos(a)) * cr.k];
  }
  function unmapCrop(c, cr, q) {   // panel px → source px (used by the extractor)
    const [W, H] = panelPx(C(c)), a = -cr.rot * Math.PI / 180, x = (q[0] - W / 2) / cr.k, y = (q[1] - H / 2) / cr.k;
    return [cr.cx + x * Math.cos(a) - y * Math.sin(a), cr.cy + x * Math.sin(a) + y * Math.cos(a)];
  }
  // geometry follows the picture on screen: the crop of the frame being shown (on a freeze, the frozen frame)
  const shownS = (c, tau) => frameAt(c, at(c, tau).s) / srcOf(C(c)).fps;
  const toPanel = (c, p, tau) => { c = C(c); return mapCrop(c, cropAt(c, shownS(c, tau)), p); };
  function pointSrc(c, name, s) { c = C(c); const ks = ((c.points || {})[name] || []).slice().sort((a, b) => a.t - b.t); if (!ks.length) throw new Error('footage: no point ' + name); return lin(ks, s, q => q.p); }
  const point = (c, name, tau) => { c = C(c); const s = shownS(c, tau); return mapCrop(c, cropAt(c, s), pointSrc(c, name, s)); };

  // ---------------------------------------------------------------- page side
  const pad = n => String(n).padStart(6, '0');
  const href = (id, n) => `../footage/frames/${id}/${pad(n)}.jpg`;   // relative to <video>/anim/
  function tag(src) {
    if (src.tag) return src.tag;
    return { title: `術者視角　${EYE[src.eye] || src.eye}　手術錄影`, orient: `下＝12 點（主切口）　右＝${src.eye === 'OS' ? 'nasal' : 'temporal'}` };
  }
  function badge(s, W) {
    const w = 14 + (typeof measure === 'function' ? measure(s, 14, true) : s.length * 12);   // eslint-disable-line no-undef
    return `<g class="ftg-badge"><rect x="${W - w - 10}" y="10" width="${w}" height="26" rx="5" fill="#1d2733" opacity="0.72"/><text x="${W - 16}" y="28" fill="#fff" font-size="14" font-weight="700" text-anchor="end">${s}</text></g>`;
  }
  // panel for DRAW2: { svg, extra, P }. opt.badge false hides the 慢放／停格 badge; opt.extra adds labels (VIEWS.lab2)
  function panel(id, tau, opt = {}) {
    if (typeof PW !== 'undefined' && (PANEL_PX.dual[0] !== PW || PANEL_PX.dual[1] !== PH || PANEL_PX.full[0] !== FW)) throw new Error('footage: PANEL_PX out of step with kit.js');   // eslint-disable-line no-undef
    const c = clipOf(id), src = srcOf(c), [W, H] = panelPx(c), a = at(c, tau), n = frameAt(c, a.s), r = c.rate || 1;
    const b = opt.badge === false ? '' : a.frozen ? '停格' : r < 1 ? `慢放 ${r}×` : r > 1 ? `加速 ${r}×` : '';
    return { svg: `<rect width="${W}" height="${H}" fill="#1d2733"/><image href="${href(id, n)}" x="0" y="0" width="${W}" height="${H}" preserveAspectRatio="none"/>` + (b ? badge(b, W) : ''),
      extra: opt.extra || '', P: tag(src), s: a.s, frame: n, frozen: !!a.frozen };
  }
  // every string the page may draw (kit.js preloads the font subset before the first frame)
  function text() { const D = def(); return D ? Object.values(D.sources).map(s => JSON.stringify(tag(s))).join('') + '慢放加速停格×0123456789.' : ''; }

  // ---------------------------------------------------------------- checks (pure; footage-cli.js adds the frame files)
  // separating axis test: convex polygon vs axis-aligned rect
  function polyHitsRect(poly, r) {
    const R = [[r.x, r.y], [r.x + r.w, r.y], [r.x + r.w, r.y + r.h], [r.x, r.y + r.h]];
    for (const P of [poly, R]) for (let i = 0; i < P.length; i++) {
      const a = P[i], b = P[(i + 1) % P.length], n = [b[1] - a[1], a[0] - b[0]];
      const pr = Q => Q.map(q => q[0] * n[0] + q[1] * n[1]), p1 = pr(poly), p2 = pr(R);
      if (Math.max(...p1) <= Math.min(...p2) || Math.max(...p2) <= Math.min(...p1)) return false;
    }
    return true;
  }
  const deg = v => Math.atan2(v[0], v[1]) * 180 / Math.PI;   // angle from straight down (+ = towards the right of the panel)
  function check(D) {
    D = D || def(); const out = { overlay: [], orientation: [], events: [], info: { crops: 0, landmarks: [], events: 0 } };
    const prev = DEF; DEF = D;
    try {
      for (const [id, c] of Object.entries(D.clips)) {
        const src = D.sources[c.src];
        if (!src) { out.events.push(`${id}: no source ${c.src}`); continue; }
        if (!(c.out > c.in)) out.events.push(`${id}: out ${c.out} must be after in ${c.in}`);
        if (!(src.w > 0 && src.h > 0 && src.fps > 0)) out.events.push(`${id}: source ${c.src} needs w, h, fps`);
        if (c.in < 0) out.events.push(`${id}: in ${c.in} before the start of the source`);
        if (!(c.rate === undefined || c.rate > 0)) out.events.push(`${id}: rate must be > 0`);
        if (!c.crop || !c.crop.length) { out.overlay.push(`${id}: no crop keyframes`); continue; }
        // 1. overlays: every source frame of the clip (keyframes and everything interpolated between them)
        const [f0, f1] = frames(c), ovs = (src.overlays || []).map(o => ({ ...o, x: o.x - OVERLAY_PAD, y: o.y - OVERLAY_PAD, w: o.w + 2 * OVERLAY_PAD, h: o.h + 2 * OVERLAY_PAD }));
        const ts = []; for (let n = f0; n <= f1; n++) ts.push(n / src.fps); for (const q of c.crop) if (q.t >= c.in && q.t <= c.out) ts.push(q.t);
        const hit = {};
        for (const t of ts) {
          const cr = cropAt(c, t), qd = quad(cr); out.info.crops++;
          for (const o of ovs) if (polyHitsRect(qd, o)) (hit[o.name] = hit[o.name] || []).push(t);
          if (qd.some(([x, y]) => x < 0 || y < 0 || x > src.w || y > src.h)) (hit['frame edge'] = hit['frame edge'] || []).push(t);
        }
        for (const [n, tt] of Object.entries(hit)) out.overlay.push(`${id}: crop ${n === 'frame edge' ? 'leaves the frame' : `comes within ${OVERLAY_PAD} px of overlay 「${n}」`} at ${tt.length} moment(s), first at source ${tt[0].toFixed(2)} s`);
        // 2. orientation: main incision at the bottom of the panel, from the landmarks inside the clip
        const lms = (src.landmarks || []).filter(l => l.t >= c.in && l.t <= c.out);
        if (!lms.length) out.orientation.push(`${id}: no orientation landmark inside source ${c.in}–${c.out} s (add one to sources.${c.src}.landmarks)`);
        for (const l of lms) {
          const cr = cropAt(c, l.t), pc = mapCrop(c, cr, l.cornea), pi = mapCrop(c, cr, l.incision), a = deg([pi[0] - pc[0], pi[1] - pc[1]]), [W, H] = panelPx(c);
          out.info.landmarks.push(`${id}@${l.t}s ${a.toFixed(0)}°`);
          if (Math.abs(a) > ORIENT_TOL) out.orientation.push(`${id}: at source ${l.t} s the main incision is ${a.toFixed(0)}° from straight down (limit ±${ORIENT_TOL}°): rotate the crop`);
          if (pc[0] < 0 || pc[1] < 0 || pc[0] > W || pc[1] > H) out.orientation.push(`${id}: at source ${l.t} s the cornea centre is outside the panel`);
        }
        // 3. events, freezes, tracked points and crop keyframes inside the clip
        const inside = t => t >= c.in - 1e-9 && t <= c.out + 1e-9;
        for (const [n, t] of Object.entries(c.events || {})) { out.info.events++; if (!inside(t)) out.events.push(`${id}: event 「${n}」 at source ${t} s is outside the clip (${c.in}–${c.out} s)`); }
        for (const f of c.freeze || []) { if (!inside(f.at)) out.events.push(`${id}: freeze at source ${f.at} s is outside the clip`); if (!(f.dur > 0)) out.events.push(`${id}: freeze at ${f.at} s needs dur > 0`); }
        for (const [n, ks] of Object.entries(c.points || {})) for (const q of ks) {
          if (!inside(q.t)) { out.events.push(`${id}: point 「${n}」 keyframe at source ${q.t} s is outside the clip`); continue; }
          const p = mapCrop(c, cropAt(c, q.t), q.p), [W, H] = panelPx(c);
          if (p[0] < 0 || p[1] < 0 || p[0] > W || p[1] > H) out.events.push(`${id}: point 「${n}」 at source ${q.t} s falls outside the panel`);
        }
        if (c.crop[0] && Math.min(...c.crop.map(q => q.t)) > c.in + 1e-9) out.events.push(`${id}: first crop keyframe after the clip start (it would be held; start the keyframes at in)`);
      }
    } finally { DEF = prev; }
    return out;
  }
  return { PANEL_PX, DPR, OVERLAY_PAD, ORIENT_TOL, use, def, dur, at, videoTime, frames, frameAt, ev, k, sync, cropAt, quad, mapCrop, unmapCrop, toPanel, point, pointSrc, href, pad, tag, panel, text, check, outPx, panelPx, polyHitsRect };
});
