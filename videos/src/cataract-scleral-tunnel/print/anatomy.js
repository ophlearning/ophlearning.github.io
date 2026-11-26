// 關鍵解剖與數字速查: (1) the section through the main incision with the scleral tunnel and its two distances, (2) the same section with
// a clear corneal incision of series ① drawn for comparison, (3) the surgeon's view of the finished incisions (OS: 3 o'clock = temporal),
// and two tables. Each table row names the ledger chapter of ../check.js its numbers come from (third element).
{
  const Ls = { side: 'L' }, Rs = { side: 'R' };
  const DONE = { cat: { ...BASE } }, BARE = { cat: { side: SIDE, globe: PERI } };
  const CCI = { h: MH, w: 2.4, s: -0.3, L: 2.0, arch: 'tri' };                       // clear corneal main incision of series ① (Ernest 1995)
  const SUT = wallPath([[2.15, 0], [1.5, 0.3], [0.85, 0]]);
  const limbArc = (s, h0, h1) => { const q = []; for (let k = 0; k <= 30; k++) q.push(W3(s, 0, h0 + (h1 - h0) * k / 30)); return q; };
  const lp = (zh, en, side, yp, a) => V => PRINT.lab(zh, en, side === 'L' ? 1.3 : V.w - 2.6, Math.max(4.5, yp * V.h), typeof a === 'function' ? a(V) : V.A[a], { side });   // label at a share of the figure height
  const periBack = [W3(0.25, 0, MH - 0.75), ...limbArc(3.0, MH - 0.75, MH + 0.75), W3(0.25, 0, MH + 0.75)];
  PRINT.sheet({
    type: 'anatomy', title: '關鍵解剖與數字速查', sub: '文獻數值附出處；這台的做法照 OP note，沒寫的依主刀',
    sources: ['Goel 2022', 'Ernest 1994', 'Olsen 1997', 'Hayashi 2010', 'Subudhi 2021', 'John 1992', 'ESCRS 2007', 'Soda 2012', 'Ye 2021'],
    ledger: { '9': '結構', '3': '結構' },
    figH: 66,
    figures: [
      { w: 104, kind: 'csec', hp: HP, state: DONE, win: { x: -9.6, y: -13.0, w: 7.6 }, overlays: [{ inc: tunnel(MAIN) }], scale: { mm: 1 },
        draw: all(lp('角膜緣', 'limbus', 'L', 0.10, V => P3(V, W3(0))), lp('外口（角膜緣後 1–2 mm）', '', 'L', 0.32, V => P3(V, tnM.to3(tnM.ext))),
          lp('鞏膜', 'sclera', 'L', 0.50, V => P3(V, W3(2.0, 0.3))), lp('結膜（示意）', '', 'L', 0.64, V => P3(V, W3(3.2, -0.13))),
          lp('角膜', '', 'R', 0.10, V => P3(V, W3(-2.2, 0.3))), lp('內口（角膜內約 1.5 mm）', '', 'R', 0.56, V => P3(V, tnM.to3(tnM.int))),
          lp('虹膜根部', 'iris root', 'R', 0.90, V => P3(V, W3(0.95, 0.85)))) },
      { w: 80, kind: 'csec', hp: HP, state: BARE, win: { x: -8.7, y: -13.0, w: 5.6 },
        overlays: [{ inc: tunnel(MAIN) }],
        draw: all(V => thin(tunnel(CCI)(V), '0.9 0.6', 0.55), lp('scleral（本例）', '', 'L', 0.40, V => P3(V, tnM.to3(tnM.ext))),
          lp('對照', 'clear corneal', 'R', 0.62, V => tunnel(CCI)(V)[20]), lp('角膜緣', 'limbus', 'L', 0.10, V => P3(V, W3(0)))) },
      { w: 86, kind: 'cscope', surgeon: SG, state: DONE, win: { x: -8.6, y: -8.6, w: 17.2, h: 17.2 }, overlays: [{ inc: mouth(MAIN), w: 0.9 }, { inc: mouth(SIDE), w: 0.9 }, { sut: path3(SUT) }],
        draw: all(V => thin(path3(periBack)(V)), lp('nasal（9 點）', '', 'R', 0.2, V => P3(V, W3(0, 0, 9))), lp('側切口（示意）', '', 'L', 0.40, 'sideExt'),
          lp('temporal（3 點）', '', 'L', 0.62, V => P3(V, W3(0, 0, 3))), lp('主切口', 'main', 'R', 0.80, 'mainExt'), lp('結膜掀開（示意）', '', 'R', 0.94, V => P3(V, W3(3.0, 0, MH + 0.6)))) },
    ],
    bottom: '80mm 1fr 44mm',
    tables: [
      { head: '這台的做法（OP note；沒寫的依主刀）', rows: [
        ['眼別、術者', 'OS；upper-temporal（約 1–2 點）', '2'], ['主切口', 'scleral，2.65 mm keratome', '3'], ['Side port', '15° 刀；位置依主刀', '2'],
        ['結膜', 'OP note 沒寫，依主刀', '2'], ['OVD、IOL', 'DuoVisc；ZMB00 +6.5 D', '5'], ['關閉', '10-0 nylon；針數依主刀', '6']] },
      { head: '文獻的數字', src: true, rows: [
        ['位置（MSICS 綜論）', '外口：鞏膜 1–2 mm；內口：角膜 1–2 mm', '3'],
        ['Lip（屍眼）', '內口 lip 1.5 mm：525 psi 不漏', '3'],
        ['對照（屍眼）', 'clear corneal 3.2×2.0 mm：13 psi 就漏', '3'],
        ['SIA（RCT，3.5–4.0 mm）', '6 個月：corneal 0.72 D；scleral 0.36 D', '1'],
        ['SIA（RCT，同寬度）', '3.0 mm：scleral 較少；2.0 mm：無差', '1'],
        ['住院醫師 339 例', 'premature／buttonhole 12.6%；虹膜脫出 10.6%', '4'],
        ['深 vs 淺隧道（RCT）', 'hyphema 34% vs 6%', '4'],
        ['ESCRS（RCT）', '沒打 cefuroxime：4.92 倍；CCI：5.88 倍', '6；1'],
        ['ZMB00', 'near 4.0 D；偏心 0.75 mm 內不預期有影響', '5']] },
    ],
    legend: { rows: ['inc', 'sut'], orient: ['<b>左、中圖</b>：經主切口的切面，左＝主切口　上＝前', '<b>右圖 術者視角</b>：OS、術者坐約 1–2 點；下＝主切口', '細虛線：中圖＝clear corneal 對照（白內障 ① 的切口）；右圖＝結膜掀開範圍'] },
  });
}
