// 關鍵解剖與數字速查: the lower-lid section (layers the Hotz goes through, back to the inferior oblique) and the surgeon's view with the
// septum opened layer by layer (three fat pads, inferior oblique, arcuate expansion), plus two tables. Every table row names the ledger
// segment of ../check.js its numbers come from (third element); the layout takes the source from that entry.
{
  const L = { side: 'L' }, R = { side: 'R' };
  PRINT.sheet({
    type: 'anatomy', title: '關鍵解剖與數字速查', sub: '文獻數值附出處；這台的做法依院內常規',
    sources: ['Kaufman 2015', 'Hass 2004', 'Murali 2021', 'McCallum 2019', 'Coban 2023', 'Syniuta 2003', 'Prischmann 2013', 'Kakizaki 2006'],
    figH: 62,
    figures: [
      { w: 122, kind: 'lsag', state: {}, win: { x: -20.5, y: 1.0, w: 30, h: 20 }, red: 'none', labelOpts: { sides: true, gap: 5.2 }, scale: { mm: 5, x: 50, y: 4.5 },
        dims: [{ from: 'tarBotL', to: 'fusionL', w: 0.4, label: ['融合：瞼板下 2.4 mm', 'fusion', L] }],
        labels: [['瞼板', 'tarsus', 'tarsusL', L], ['眼輪匝肌', 'orbicularis', 'orbPS', L], ['眶隔', 'septum', 'septumL', L], ['眶下緣', 'rim', 'rimL', L],
          ['中央脂肪', 'central fat', [-6.5, 15.2], L], ['囊瞼筋膜', 'retractor', 'cpf', R], ['下直肌', 'IR', 'ir', R], ['下斜肌（位置示意）', 'IO', 'io', R]] },
      { w: 140, kind: 'lcor', state: { lstrips: [[-16.5, 13.2, 3]] }, win: { x: -19, y: -4, w: 35, h: 24 }, labelOpts: { gap: 5.2 },
        labels: [['外側脂肪', 'lateral fat', 'fatLat', L], ['弓狀擴張', 'arcuate expansion', 'arcuate', L], ['中央脂肪', 'central fat', 'fatCen', L],
          ['內側脂肪', 'medial fat', 'fatMed', R], ['下斜肌：分開內／中', 'inferior oblique', 'io', R], ['眶下緣', 'orbital rim', 'rimL', R]] },
    ],
    bottom: '66mm 1fr 40mm',
    tables: [
      { head: '依院內常規與病例（刀後依 OP note 確認）', rows: [
        ['切除寬度、去脂量、止血方式', '依院內常規（圖為示意）', 'tmpl'], ['Orbicularis → aponeurosis', '6-0 Prolene ×5', 'tmpl'],
        ['病例：角膜', 'TBUT 3 秒、下方 SPK', 'case'], ['病例：血小板、PT／aPTT', '[　　　]（紀錄沒有）', 'case'], ['病例：前次處置', '不詳', 'case']] },
      { head: '文獻的數字', src: true, rows: [
        ['預防性輸血小板（AABB）', 'major elective 手術：< 50 × 10⁹/L', 'plt'],
        ['眼瞼成形術後眶內出血', '0.055%（永久視力喪失 0.0045%）；多在 3 小時內，24 小時後明顯減少', 'rbh'],
        ['眼眶腔室症候群：IOP', '正常 8–21；> 30 緊急找眼科；> 40 立刻減壓', 'ocs'], ['眼痛、處置時間', '只有約 15% 會說眼痛；2 小時內處置視力較好', 'ocs'],
        ['三團脂肪（50 具屍體）', '三團型 36%；IO 分開內／中、arcuate 分開中／外', 'fat'], ['眼瞼成形術後持續複視', '12 位：下直肌 7、上斜肌 5', 'dip'],
        ['術後乾眼症狀（892 例）', '26.5%；術後 lagophthalmos 使風險上升', 'dry'], ['眶隔與囊瞼筋膜融合', '瞼板下 2.4 mm；19 眼中 7 眼看得到', 'fus']] },
    ],
    legend: { rows: [], orient: ['<b>左圖 矢狀切面</b>（瞳孔中央）：左＝前　上＝上', '<b>右圖 術者視角</b>（右眼 OD 示意；本台 OS 左右相反）：面對病人，左＝temporal　右＝nasal；眶隔以下逐層打開', '各團大小、下斜肌在切面上的位置：示意'] },
  });
}
