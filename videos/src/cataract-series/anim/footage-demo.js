// ============================================================================
// Footage kit demo page (not a video; anim/footage-demo.html): case A 0:58–1:20 at 0.5× with one freeze and two labels pinned to
// source-pixel points, beside an empty right panel (the mechanism section comes from the globe model in the real videos).
// One file holds what a video splits into segments.js, draw.js and timeline.js; the timeline is written by hand here so the
// narration lines fall on the clip's events (in a video it comes from the TTS, and draw.js shifts the clip with FOOTAGE.sync).
// ============================================================================
const VIDEO = { name: 'footage kit 示範', title: ['footage kit 示範'], credit: '製作　張博淳' };
const CHAPTERS = ['錄影示範'];
const REFS = [];
const SEGS = [
  { id: 'demo', ch: 0, title: '錄影示範：撕囊開始（案例 A）', layout: 'dual',
    lines: ['示範頁：案例 A 錄影 0:58–1:20，0.5× 慢放', '停格：撕囊鉗經主切口進入前房', '標籤釘在錄影的像素座標；裁切避開燒進畫面的文字'],
    keys: [[0, '真實錄影＝<b>術者視角</b>；右邊之後放同步的機轉切面']],
    src: [[0, '案例 A 手術錄影（去識別裁切）']] },
];
const CLIP = 'ccc-start', CLIP_AT = 0.5;   // the clip starts 0.5 s into the segment (after the panel fades in)
const FZ = CLIP_AT + FOOTAGE.ev(CLIP, 'freeze'), FZ_END = FZ + FOOTAGE_DEF.clips[CLIP].freeze[0].dur, SEG_DUR = CLIP_AT + FOOTAGE.dur(CLIP) + 1;
window.TIMELINE = { segs: { demo: { t0: 0, t1: SEG_DUR, lines: [[0.7, 7.5], [FZ, FZ_END - 0.1], [FZ_END + 0.5, FZ_END + 6.5]] } }, total: SEG_DUR };

const DRAW2 = {};
const SEC_P = { title: '機轉切面　mechanism section', orient: '（示範頁：留白）' };
window.PRELOAD_EXTRA = JSON.stringify(SEC_P) + '之後放經主切口的子午切面（globe 模型），和左邊同一組事件時間';
DRAW2.demo = T => {
  const tau = T.u - CLIP_AT, L = FOOTAGE.panel(CLIP, tau);
  // labels only while the frame is frozen: their anchors are measured on that frame (tracked points elsewhere need more keyframes)
  const op = FOOTAGE.k(CLIP, 'freeze', tau, 0.4) * (1 - ss(FZ_END - CLIP_AT - 0.3, FZ_END - CLIP_AT, tau));
  if (op > 0) L.extra = VIEWS.lab2('撕囊鉗', 'capsulorhexis forceps', 14, 70, FOOTAGE.point(CLIP, 'forceps-tip', tau), { op }) +
    VIEWS.lab2('主切口', 'main incision', PW - 12, 392, FOOTAGE.point(CLIP, 'incision', tau), { side: 'R', op });
  const R = { svg: '', extra: htext(PW / 2, PH / 2, '之後放經主切口的子午切面（globe 模型），和左邊同一組事件時間', { size: 14, color: COL.sub, anchor: 'middle' }), P: SEC_P };
  return { L, R };
};
