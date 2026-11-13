// ============================================================================
// Drawing of every segment, keyed by segment id (text is in segments.js). DRAW2[id](T) returns { L, R } (dual) or { F } (full):
// { svg (clipped to the panel), extra (labels, from VIEWS.lab2), P: { title, orient } }. Panels are PW × PH px (video-kit/kit.js).
// Surgical segments show two synced views of the socket model (videos/models/socket, through views-socket.js): the mechanism section
// (left) and the surgeon's view of the left socket, surgeon at 12 (right); both come from the same state (checked in ../check.js).
// ============================================================================
const DRAW2 = {};
const lab = VIEWS.lab2;
const note = (s, op, y = PH - 14) => htext(PW - 12, y, s, { size: 13, color: COL.sub, anchor: 'end', op });

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
