// 關鍵解剖與數字速查: three figures of the case — the fundus chart (OS, examiner's drawing) with the detachment's extent 11:30 → 5 o'clock round
// the chart (VP.RD_ARC, as 1-1), the tear, the macula and the 11–5 section line; the 11 o'clock periphery of the 11–5 section (pars plicata, pars
// plana, ora, vitreous base, the tear on its back border, 4 mm from the limbus = where a trocar goes, 2-1); the surgeon's wide-angle view (3-2 line 2:
// inverter on, looking toward 11) — and two tables. Every table row names the ledger segment of ../check.js its numbers come from (third element);
// the layout takes the source from that ledger entry and stops with an error when a number of the row is not in that segment. Only numbers with a
// source in the ledger, or of the case / the structure; the rest 依主刀 or 依院內常規.
{
  const R = P.fundus({ st: ST.rrd }).A.rEdge;                                // the chart's edge (pars plicata), chart mm
  const cpt = (V, h, r) => V.P(VP.chart(h, r));                              // chart mm (clock h, r mm from the foveola) → figure mm
  const arc = (V, h0, h1, r) => { const q = []; for (let i = 0; i <= 90; i++) q.push(cpt(V, h0 + (h1 - h0) * i / 90, r)); return q; };
  // clock numbers round the chart, outside the detachment's arc; left / right ones end / start at their place (OS: 3 = temporal, 9 = nasal)
  const NAMES = { 12: '12', 3: '3 T', 6: '6', 9: 'N 9' };
  const chartClocks = V => [12, 3, 6, 9].map(h => { const p = cpt(V, h, R + 3.4), d = G.clockDir(h);
    return PRINT.txt(p[0], p[1] + (d[1] > 0.5 ? 0 : d[1] < -0.5 ? 2.4 : 1.2), NAMES[h], { pt: 9.5, bold: true, anchor: d[0] > 0.5 ? 'start' : d[0] < -0.5 ? 'end' : 'middle' }); }).join('');
  // the detachment's extent round the chart (11:30 clockwise via 12 and 3 to 5 o'clock, 病例), thick black; the 11–5 section line, dashed
  const rdArc = V => PRINT.cut(arc(V, VP.RD_ARC[0], VP.RD_ARC[1], R + 1.2), { w: 1.0 }) + thin([cpt(V, 11, R), cpt(V, 5, R)], '1.4 0.9', 0.35);
  PRINT.sheet({
    type: 'anatomy', title: '關鍵解剖與數字速查', sub: '本例：左眼 OS、有晶體；文獻數值附出處，做法依主刀與院內常規',
    sources: ['EyeWiki 2026a', 'Duker 2021', 'Li 2025', 'Spitznas 1987', 'Neffendorf 2017', 'Jackson 2013', 'Figueroa 2013', 'Garg 2012', 'Vaziri 2016',
      'Kanclerz 2018b', 'Woo 2009', 'Duval 2014', 'Lee 2004', 'Kontos 2017a', 'Chen 1997'],
    ledger: { '3': '結構', '6': '結構', '9': '結構' },
    figH: 62,
    figures: [
      { w: 82, kind: 'pfundus', state: ST.rrd, win: { x: -37, y: -37, w: 74, h: 74 },
        draw: all(rdArc, chartClocks, V => ring(V.A.tear, 1.4, { w: 0.6 }),
          lb('剝離 RD', '11 點半 → 5 點', 'R', 4.6, V => cpt(V, 1, R + 1.2)), lb('裂孔 HST', '11 點、1 DD', 'R', 12.5, 'tear'),
          lb('視盤', 'disc', 'L', 22, 'disc'), lb('fovea 貼著', 'fovea on', 'R', 33.5, 'fovea'), lb('黃斑下半部剝離', '', 'R', 41.5, 'rdMac'),
          lb('11–5 切面', '', 'R', 52.5, V => cpt(V, 5, R * 0.66))) },
      { w: 104, kind: 'psec', hp: 11, state: ST.rrd, win: { x: 1.5, y: -12.5, w: 13.5, h: 13 },
        draw: V => PRINT.dim(W3(V, 11, 0, -0.6), W3(V, 11, 4, -0.6)),
        labels: [['角膜緣', 'limbus', 'limbusR'], ['trocar 4 mm', '有水晶體', V => W3(V, 11, 2, -0.6)], ['pars plicata', '', 'plicataR'], ['pars plana', '', 'planaR'],
          ['ora', '', 'oraR'], ['vitreous base', '', 'vbR'], ['瓣', 'flap', 'flapEdge'], ['裂孔', 'HST', 'tearMid'], ['視網膜下液', 'SRF', 'srf'], ['水晶體', 'lens', [4.2, -7.9]]],
        labelOpts: { gap: 4.9 } },
      { w: 74, kind: 'pwide', state: VIEW3_11, win: { x: -27, y: -26, w: 54, h: 52 },
        draw: all(clocks(), tick11, tag(['inverter 開', '看向 11 點']), V => ring(V.A.tear, 1.8, { w: 0.6 }), V => lb('11 點裂孔', '下方略偏右', 'L', V.h - 8.2, 'tear')(V)) },
    ],
    bottom: '72mm 1fr 42mm',
    tables: [
      { head: '依院內常規（刀後依 OP note 確認）', rows: [
        ['術者', '坐 12 點；右手器械 10 點半', '4-1'],
        ['Trocar 鐘點', 'infusion 4 點半；器械 1 點半、10 點半', '4-1'],
        ['壓鞏膜', '幾點、多深、多久：聽主刀口令', '5-2'],
        ['貼回視網膜、雷射', '方法與範圍：依主刀', '6-1'],
        ['C3F8 抽多少', '依院內常規；和主刀確認', '7-2'],
        ['拔 cannula', '順序依主刀；每個傷口查漏', '7-3'],
        ['術後頭位、天數', '依主刀醫囑', '8-1']] },
      { head: '文獻的數字', src: true, rows: [
        ['Trocar 距角膜緣', '3–4 mm；有水晶體 4 mm', '2-1'],
        ['角膜緣 → ora（華人）', '顳側 7.6、鼻側 7.0 mm', '2-1'],
        ['修 RRD 的醫源性裂孔', '23G 1.9%、20G 5.8%', '5-2'],
        ['清周邊碰到水晶體（英國）', '1.2–1.6%', '5-1'],
        ['視網膜下殘留 PFCL（23G）', '4.5–10.3%', '6-2'],
        ['純 C3F8 在眼內', '膨脹約 4 倍、3–4 天最大', '7-2'],
        ['C3F8 不膨脹濃度', '常用 14%', '7-2'],
        ['SF6 備氣例（補到 50 mL）', '留 10 mL＝20%；誤留 20 mL＝40%', '7-2'],
        ['23G 傷口需要縫', '11.2–38.5%', '7-3'],
        ['N2O 造成失明，最晚', '術後 37 天', '8-3'],
        ['15% C3F8 完全消失', '平均 67.7 天', '8-3'],
        ['有氣體：眼壓 > 25 mmHg', '43%；其中 88% 在 24 小時內', '8-4']] },
    ],
    legend: { rows: [], orient: [
      '<b>左 眼底圖</b>：左眼 OS，檢查者畫法：12 點在上、3 點 temporal 在右；周邊被拉寬',
      '<b>中 切面</b>：經 11 點，上＝前、右＝11 點',
      '<b>右 廣角</b>：術者坐 12 點、inverter 開：下＝12 點、temporal 在左；inverter 關＝整張轉 180°',
      '黑粗弧＝剝離範圍；黑＝裂孔；虛線＝11–5 切面',
      '示意：剝離邊緣的形狀、血管、看向 11 點'] },
  });
}
