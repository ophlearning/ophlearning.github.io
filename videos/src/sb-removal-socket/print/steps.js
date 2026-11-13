// 手術步驟圖 (assistant's version): one cell per checklist item (numbers = checklist numbers); left = the model's meridional section
// (mechanism, right half, anterior up), right = the surgeon's view of the OS socket (surgeon at 12), the same state, as the video shows it
// (draw.js segment in brackets). States are the video's own (VS.ST …, print/video.js). Black overlays: the band still in place = thick
// grey strip with a black rim; intact suture = black dot, cut suture = X; the cut = thick black line across it; exposure = dashed ring. 示意 as in spec.md: the exposure at 1:30, one
// suture per quadrant, the opening 7 → 5 o'clock, the shell's size.
{
  const SEC = WIN.sec, FR = WIN.front;
  const front = (st, extra = []) => ({ kind: 'sfront', state: st, win: FR, draw: all(bandArc(st), sutures(st), clocks, ...extra) });
  const expoRing = V => ring(FP(V, EH, PR.sEq), 3.2, { w: 0.5, dash: '1.2 0.8' });
  PRINT.sheet({
    type: 'steps', title: '手術步驟圖', sub: '左：切面（右半、上＝前）　右：術者視角（左眼、術者坐 12 點）',
    sources: ['Lee 2013'],
    ledger: { '12': '結構', '3': '結構', '6': '結構', '9': '結構' },
    grid: [3, 3],
    legend: { rows: ['cut'], orient: ['<b>左圖 切面</b>：經該鐘點、只畫右半；上＝前（術者側）', '<b>右圖 術者視角</b>：下＝12 點、左＝3 點 temporal（T）',
      '灰色粗帶＝還在的 band；黑點＝縫線、X＝已剪；粗黑線＝剪斷處', '暴露處 1 點半、縫線位置、打開範圍：示意'] },
    steps: [
      { hd: '方位：band 在四條直肌下', views: [
        { kind: 'ssec', hp: 3, state: ST.hidden, win: SEC, draw: all(V => bandRing(V), lb('外直肌', 'LR', 'R', 4, V => V.P(V.M.rectus)), lb('band', '', 'L', 37, V => V.P(V.r.sides[1].bandC))) },
        front(ST.hidden) ] },
      { hd: '拿掉 conformer、找暴露處（示意）', views: [
        { kind: 'ssec', hp: EH, state: ST.expo, win: SEC, draw: all(V => bandRing(V), lb('暴露的 band', '', 'R', 4, V => V.P(V.M.expose))) },
        front(ST.expo, [expoRing]) ] },
      { hd: '打開結膜、Tenon、纖維囊', views: [
        { kind: 'ssec', hp: EH, state: ST.open, win: SEC, draw: all(V => bandRing(V), lb('纖維囊', 'capsule', 'L', 37, V => V.P(V.M.capsule))) },
        front(ST.open) ] },
      { hd: '剪斷縫線、整條拿出', views: [
        { kind: 'ssec', hp: EH, state: ST.sutCut, win: SEC, draw: all(V => bandRing(V), V => X(V.P(V.M.sut), 0.9), lb('縫線已剪', '', 'R', 4, V => V.P(V.M.sut))) },
        front(ST.sutCut) ] },
      { hd: '在暴露處剪斷 band', views: [
        { kind: 'ssec', hp: EH, state: ST.cut, win: SEC, draw: all(V => bandRing(V), lb('剪斷處', 'cut', 'R', 4, V => V.P(V.M.cut || V.M.band))) },
        front(ST.cut, [cutMark(EH)]) ] },
      { hd: '勾起直肌、抽出 band', views: [
        { kind: 'ssec', hp: PULL.hook, state: PULL, win: SEC, draw: all(V => bandRing(V), lb('肌肉鉤', 'hook', 'R', 4, V => V.P(V.M.hook)), lb('band', '', 'L', 37, V => V.P(V.r.sides[1].bandC))) },
        front(PULL, [cutMark(EH), V => arw(FP(V, EH, PR.sEq + 2), FP(V, EH, PR.sEq + 7.5)), lb('肌肉鉤', 'hook', 'L', 4, V => V.P(V.M.hook))]) ] },
      { hd: '核對完整一圈；檢體', views: [
        { kind: 'ssec', hp: EH, state: ST.out, win: SEC, draw: lb('band 原本的位置', '', 'R', 4, V => { const q = PR.at(PR.sEq), o = S.P.CAPS_T + S.P.BAND_T / 2; return V.P([q.p[0] + q.n[0] * o, q.p[1] + q.n[1] * o]); }) },
        front(ST.out) ] },
      { hd: '清創、縫合依主刀、放回 conformer', views: [
        { kind: 'ssec', hp: EH, state: ST.end, win: SEC, draw: lb('眼窩模型', 'conformer', 'R', 4, V => V.P(V.M.conformer)) },
        front(ST.end) ] },
    ],
  });
}
