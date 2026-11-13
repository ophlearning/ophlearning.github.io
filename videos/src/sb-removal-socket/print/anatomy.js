// 關鍵解剖與數字速查: three figures of the case — the surgeon's view of the OS socket before surgery (band track, four recti, sutures 示意);
// the section through 3 and 9 o'clock (the band under both horizontal recti, on the collapsed shell); the 1:30 section close up (conjunctiva,
// Tenon, fibrous capsule, the 3.5 mm band, a Dacron suture) — and two tables. Every table row names the ledger segment of ../check.js its
// numbers come from (third element); the layout takes the source from that ledger entry and stops with an error when a number of the row is
// not in that segment. Only numbers with a source in the ledger, or of the case / the structure; the rest 依主刀.
{
  const PRE = { ...ST.hidden };
  // a rectus between its insertion and the band (the drawn muscle), front map; a point s mm along the shell, off mm outside it (section)
  const HR = { SR: 12, LR: 3, IR: 6, MR: 9 }, rect = k => V => FP(V, HR[k], (PR.sIns + PR.sEq) / 2);
  const sp = (s, off) => V => { const q = PR.at(s), d = typeof off === 'function' ? off(V.r.sides[1]) : off; return V.P([q.p[0] + q.n[0] * d, q.p[1] + q.n[1] * d]); };
  const S_ANT = PR.sEq - 3.2;   // in front of the band: conjunctiva, Tenon, sclera one above the other
  PRINT.sheet({
    type: 'anatomy', title: '關鍵解剖與數字速查', sub: '本例：左眼 OS、evisceration 後沒有植入物；文獻數值附出處，做法依主刀',
    sources: ['Gomaa 2017', 'Lee 2013', 'Zhang 2026', 'Kazi 2015', 'Girgis 2012', 'Das 2024'],
    ledger: { '12': '結構', '3': '結構', '6': '結構', '9': '結構' },
    figH: 64,
    figures: [
      { w: 86, kind: 'sfront', state: PRE, win: WIN.front, draw: all(bandArc(PRE), sutures(PRE), clocks),
        labels: [['上直肌', 'SR', rect('SR'), { side: 'L' }], ['外直肌', 'LR', rect('LR'), { side: 'L' }], ['下直肌', 'IR', rect('IR'), { side: 'R' }],
          ['內直肌', 'MR', rect('MR'), { side: 'R' }], ['Dacron 縫線（示意）', '', V => V.P(V.M.sut[10.5]), { side: 'R' }]], labelOpts: { sides: true } },
      { w: 106, kind: 'ssec', hp: 3, state: PRE, win: WIN.secAll, draw: V => bandRing(V, 1.9),
        labels: [['外直肌', 'LR', 'rectus', { side: 'R' }], ['band 在直肌下', '', V => V.P(V.r.sides[1].bandC), { side: 'R' }],
          ['內直肌', 'MR', V => V.P([-V.M.rectus[0], V.M.rectus[1]]), { side: 'L' }], ['鞏膜殼（大小示意）', '', 'shell', { side: 'L' }]], labelOpts: { sides: true } },
      { w: 76, kind: 'ssec', hp: EH, state: PRE, win: { x: 5.2, y: -6.2, w: 10.5, h: 10.5 }, draw: V => bandRing(V, 2.4),
        labels: [['結膜', 'conj', sp(S_ANT, sd => sd.conjOut(S_ANT) - 0.15), { side: 'L' }], ['Tenon', '', sp(S_ANT, sd => sd.conjIn(S_ANT) - 0.2), { side: 'L' }],
          ['鞏膜殼', 'sclera', sp(S_ANT, -0.45), { side: 'L' }], ['纖維囊', 'capsule', 'capsule', { side: 'R' }],
          ['band 寬 3.5 mm', '', V => V.P(V.r.sides[1].bandC), { side: 'R' }], ['Dacron 縫線', '', 'sut', { side: 'R' }]],
        labelOpts: { sides: true } },
    ],
    bottom: '1.1fr 1.3fr 46mm',
    tables: [
      { head: '本例（舊 OP note）與示意', rows: [
        ['Band', '#41 encircling、寬 3.5 mm（Gomaa 2017）', '1-1'],
        ['固定縫線', '5-0 Dacron；位置與條數未寫', '1-1'],
        ['直肌', '12、3、6、9 點，band 在底下', '2-1'],
        ['暴露處', '病歷未寫；本單 1 點半（示意）', '2-1'],
        ['Evisceration', '2023 年、沒有植入物', '1-1'] ] },
      { head: '文獻的數字', src: true, rows: [
        ['延遲拆除的暴露位置', '50 眼：多在上方偏鼻側或顳側', '2-1'],
        ['長菌：縫線／band', '84%／90%（102 眼）', '3-1'],
        ['拆除時鞏膜穿破', '13.7%；肌肉脫離 1 眼（102 眼）', '3-3'],
        ['NTM 眼部感染中 buckle 感染', '14.8%（139 例）', '1-2'],
        ['藥敏 amikacin／clarithromycin', '81%／93%', '5-3'],
        ['療程（綜論）', '至少兩種藥；症狀消失後再續 4 週到 6 個月', '5-3'] ] },
    ],
    legend: { rows: [], orient: ['<b>左圖 術者視角</b>：左眼、術者坐 12 點；下＝12 點、左＝3 點 temporal（T）', '<b>中、右圖 切面</b>：上＝前（術者側）；中圖右＝3 點、左＝9 點；右圖經 1 點半',
      '灰色粗帶＝band；黑點＝縫線（示意）', '鞏膜殼大小、直肌寬厚：示意'] },
  });
}
