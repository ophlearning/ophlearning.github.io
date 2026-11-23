// ============================================================================
// Tectonic PK for a descemetocele after two failed DALKs, assistant's pre-op preview — text of every segment: narration lines (= burned-in
// captions), key-point box, sources, chapter, title, layout. The drawing of each segment is in draw.js (DRAW2). Layout and timeline:
// videos/tools/video-kit. Every number comes from a PubMed-verified source (lit-notes.md) or is marked 病例 / 結構 / 示意; check.js holds
// the ledger.
// Case (站長 2026-11-23, de-identified in spec.md): OS, neurotrophic keratopathy + HSV history, two failed DALKs, two AMGs, descemetocele,
// phakic, very low IOP, 360° peripheral NV; 站長 is the assistant. Steps the case does not specify follow common practice (依主刀決定).
// ============================================================================
const VIDEO = {
  name: 'Tectonic PK（DALK 失敗後的 descemetocele，助手版）',
  title: ['DALK 失敗後的 descemetocele', 'Tectonic PK'],
  subtitle: '助手版：看懂每一步，做對助手的事',
  line: '左眼 OS，neurotrophic＋HSV 病史，有晶體眼',
  note: ['左眼示意動畫，不是手術錄影；比例不精確。', 'Trephine 大小、縫法與藥物，依主刀決定與院內常規。'],
};
const CHAPTERS = ['片頭', '為什麼是 PK', '下刀前的危險', 'Trephination 與 open sky', '供體與 cardinal sutures', '補完縫線與測漏', '術後與會出錯的地方', '助手清單', '參考文獻'];

const SEGS = [
// ---------------------------------------------------------------- 片頭
{ id: 'title', ch: 0, layout: 'title', lead: 1.2,
  lines: ['這支影片站在助手的位置，\n預習一台左眼的 tectonic PK。',
          '情境是：兩次 DALK 都失敗，\n角膜最薄的地方出現 descemetocele。',
          '步驟細節，以主刀當天的做法為準。'] },

// ---------------------------------------------------------------- 1 為什麼是 PK
{ id: 'c1', chapterCard: 1 },
{ id: '1-1', ch: 1, title: '這顆角膜走過的路', layout: 'dual',
  lines: ['這隻左眼的角膜知覺很差，是 neurotrophic keratopathy，\n也有 HSV keratitis 的病史。',
          '先後做過兩次 DALK，之後 graft melting、\nDM rolling，也發生 rejection。',
          '兩次 AMG 都沒能補住；現在最薄的地方，\n只剩 Descemet membrane 往前凸，叫 descemetocele。',
          '周邊一整圈長了新生血管；\n水晶體還在。'],
  keys: [[0, '<b>Neurotrophic</b>＋<b>HSV</b> 病史的角膜。'],
         [1, '<b>DALK 兩次失敗</b>：melting、DM rolling、rejection。'],
         [2, '<b>Descemetocele</b>：只剩 Descemet membrane、往前凸。']] },
{ id: '1-2', ch: 1, title: 'Tectonic：先保住眼球', layout: 'dual',
  lines: ['Descemetocele 隨時可能破；\n破了就是穿孔，前房會塌掉。',
          '所以這台 PK 的第一個目標，是讓眼球保持完整，\n叫 tectonic；視力是其次。',
          '病灶已經深到 Descemet membrane，\n舊的 graft 也失敗了，所以這次換全層。'],
  keys: [[1, '<b>Tectonic</b>：先保住眼球完整，視力其次。'],
         [2, '深到 DM＋舊 graft 失敗 → <b>全層</b>換掉。']] },

// ---------------------------------------------------------------- 2 下刀前的危險
{ id: 'c2', chapterCard: 2 },
{ id: '2-1', ch: 2, title: '薄、軟、有晶體', layout: 'dual',
  lines: ['這顆眼睛有三個特點：薄、軟、有晶體。',
          '薄：消毒、上開瞼器、量角膜的時候，手都不能壓到眼球，\n不然還沒下刀就可能破。',
          '軟：眼壓很低，trephine 一壓，角膜就跟著凹下去，\n不容易切得又正又圓。',
          '有晶體：角膜拿掉以後，水晶體就在開口正下方，\n器械和往前推的壓力都可能傷到它。'],
  keys: [[0, '<b>薄、軟、有晶體</b>。'],
         [1, '薄 → <b>手不壓眼球</b>。'],
         [2, '軟 → trephine <b>不好切正</b>。'],
         [3, '有晶體 → open sky 時<b>保護水晶體</b>。']] },
{ id: '2-2', ch: 2, title: 'Suprachoroidal hemorrhage', layout: 'dual',
  lines: ['Open sky 時最怕的，是 suprachoroidal hemorrhage：\n脈絡膜上腔大出血，把眼內容物往外推。',
          '大型系列裡，PK 的發生率是 0.45% 到 1.08%。',
          '830 例的那篇：9 例裡有 8 例以前做過眼內手術；\n局部麻醉 4.3%，全身麻醉 0.56%。',
          '助手看到虹膜和水晶體往前鼓、紅光變暗，\n馬上告訴主刀。'],
  keys: [[1, 'PK 的 suprachoroidal hemorrhage：<b>0.45%–1.08%</b>。'],
         [2, '危險因子：以前的<b>眼內手術</b>；局麻 4.3% vs 全麻 0.56%。'],
         [3, '<b>往前鼓、紅光變暗</b> → 馬上講。']],
  src: [[1, 'Price 1994；Ingraham 1989'], [2, 'Ingraham 1989']] },

// ---------------------------------------------------------------- 3 Trephination 與 open sky
{ id: 'c3', chapterCard: 3 },
{ id: '3-1', ch: 3, title: '選 trephine 的大小', layout: 'dual',
  lines: ['先量角膜，選受體 trephine 的大小：\n要把病灶和舊 graft 的交界一起換掉，由主刀決定。',
          '供體通常和受體同大，或大 0.25 mm。',
          '一個系列裡，大 0.25 mm 那組 12 個月時平均負 1.35 D，\n同大那組負 0.14 D：供體大，graft 就比較陡。',
          '助手記下兩個數字，術後病歷要寫。'],
  keys: [[0, '受體 trephine：涵蓋<b>病灶＋舊交界</b>（依主刀）。'],
         [1, '供體＝受體，或 <b>+0.25 mm</b>。'],
         [2, '+0.25 mm：12 個月 <b>−1.35 D</b> vs 同大 <b>−0.14 D</b>。']],
  src: [[1, 'Koo 2019']] },
{ id: '3-2', ch: 3, title: '部分深度，再剪完一圈', layout: 'dual',
  lines: ['Trephine 先切到部分深度，不直接切穿。',
          '主刀在其中一處用刀片進前房，\n再換角膜剪，沿著切痕剪完一圈。',
          '眼球軟的時候，主刀可能先打 viscoelastic，\n把前房撐起來。',
          '剪的時候，剪刀的下葉在角膜和虹膜之間：\n助手幫忙穩住眼球，不要往下壓。'],
  keys: [[0, '<b>部分深度</b> → 一點進前房 → <b>角膜剪</b>剪完一圈。'],
         [2, '軟眼：viscoelastic 撐起前房（依主刀）。'],
         [3, '剪刀下葉在角膜與虹膜之間：<b>不壓</b>。']] },
{ id: '3-3', ch: 3, title: 'Open sky', layout: 'dual',
  lines: ['病變的角膜拿下來，眼睛就完全打開了，\n這段叫 open sky。',
          '這段時間助手不壓眼球、不扳開瞼器，\n也注意病人有沒有咳嗽或用力。',
          '取下的角膜送病理，依院內常規。'],
  keys: [[0, '<b>Open sky</b>：眼睛完全打開。'],
         [1, '<b>不壓、不扳</b>；注意咳嗽、用力。']] },

// ---------------------------------------------------------------- 4 供體與 cardinal sutures
{ id: 'c4', chapterCard: 4 },
{ id: '4-1', ch: 4, title: '供體：內皮最重要', layout: 'dual',
  lines: ['供體角膜從內皮面 punch 下來。',
          '內皮決定這片 graft 能不能保持透明：\n助手讓內皮保持濕潤，任何東西都不能碰到它。',
          '放上去的時候，內皮面朝下、對著前房。'],
  keys: [[0, '供體從<b>內皮面</b> punch。'],
         [1, '<b>內皮</b>：保持濕潤、不碰。']] },
{ id: '4-2', ch: 4, title: '四針 cardinal sutures', layout: 'dual',
  lines: ['先縫 12 點，再縫 6 點。',
          '第二針決定兩邊的組織分得平不平均，\n主刀會很仔細對位。',
          '接著縫 3 點、9 點，四針把供體固定住。',
          '助手用 0.12 forceps，在主刀下針的對側固定組織，\n遞針、剪線。'],
  keys: [[0, '<b>12 → 6 → 3 → 9</b>。'],
         [1, '第二針（6 點）：兩側組織的分配。'],
         [3, '助手：<b>對側</b>固定、遞針、剪線。']] },

// ---------------------------------------------------------------- 5 補完縫線與測漏
{ id: 'c5', chapterCard: 5 },
{ id: '5-1', ch: 5, title: '補完縫線', layout: 'dual',
  lines: ['其餘的縫線補在四針之間，\n針數與縫法依主刀。',
          '每一針都放射狀跨過交界，深度接近全層，\n但不穿過內皮。',
          '一個系列的做法是：12 針 interrupted，\n再加一條 12 bite 的 running，都用 10-0 nylon。',
          '打完的結轉進去埋起來；\n助手記針數、剪線。'],
  keys: [[1, '放射狀跨過交界、<b>接近全層、不穿內皮</b>。'],
         [2, '例：12 針 interrupted＋12 bite running，<b>10-0 nylon</b>。'],
         [3, '<b>埋結</b>；助手記針數。']],
  src: [[2, 'Koo 2019'], [3, '']] },
{ id: '5-2', ch: 5, title: '重建前房、測漏', layout: 'dual',
  lines: ['從 paracentesis 打 BSS，把前房撐起來。',
          '再沿著交界點 fluorescein，\n看有沒有水把染劑沖開：這是 Seidel test。',
          '有漏，就在漏的地方補一針。'],
  keys: [[0, 'BSS <b>重建前房</b>。'],
         [1, '<b>Seidel test</b>：沿交界測漏。'],
         [2, '漏 → 補一針。']] },

// ---------------------------------------------------------------- 6 術後與會出錯的地方
{ id: 'c6', chapterCard: 6 },
{ id: '6-1', ch: 6, title: '術後：HSV、上皮、rejection', layout: 'dual',
  lines: ['HSV 病史的 PK，術後會口服抗病毒藥預防復發。',
          '一個 68 眼的 RCT：acyclovir 400 mg 一天兩次、吃 6 個月，\n2 年內培養證實的復發 3 例，安慰劑組 9 例。',
          'Neurotrophic 角膜的上皮很難長：\n可能要 TSCL、AMG 或 tarsorrhaphy，由主刀決定。',
          '周邊一圈新生血管、又不是第一次 graft：\nrejection 的風險比一般 PK 高。'],
  keys: [[0, 'HSV → <b>口服 acyclovir</b> 預防。'],
         [1, '400 mg bid × 6 個月：2 年復發 <b>3 vs 9 例</b>。'],
         [2, '上皮保護：TSCL／AMG／tarsorrhaphy（依主刀）。'],
         [3, 'NV＋再次 graft → <b>rejection 高風險</b>。']],
  src: [[1, 'van Rooij 2003'], [2, '']] },
{ id: '6-2', ch: 6, title: '會出錯的地方', layout: 'dual',
  lines: ['術中：suprachoroidal hemorrhage、水晶體被碰傷、\n虹膜從開口脫出。',
          '剛縫完：傷口漏水、前房起不來。',
          '術後：上皮缺損與 melting、rejection、HSV 復發。',
          '助手能做的，是看到就講。'],
  keys: [[0, '術中：出血、水晶體、虹膜脫出。'],
         [1, '縫完：漏水、前房起不來。'],
         [2, '術後：上皮與 melting、rejection、HSV。']] },

// ---------------------------------------------------------------- 7 助手清單
{ id: 'c7', chapterCard: 7 },
{ id: '7', ch: 7, title: '助手記住這六件事', layout: 'full', tail: 2.5,
  lines: ['助手記住這六件事。',
          '一，方位：術者坐 12 點，\n下方是 12 點，左眼的 temporal 在左。',
          '二，薄、軟、有晶體：手不壓眼球。',
          '三，供體的內皮保持濕潤、不碰。',
          '四，cardinal 的順序是 12、6、3、9；\n在主刀下針的對側固定。',
          '五，記針數、剪線，最後幫忙測漏。',
          '六，open sky 時看虹膜、水晶體和紅光：\n往前鼓或變暗，馬上講。'],
  keys: [[0, '步驟的來源見各章；trephine 大小、縫法與藥物，依主刀決定與院內常規。']],
  src: [[0, '本片各章來源']] },

{ id: 'c8', chapterCard: 8 },
{ id: 'refs', ch: 8, title: '參考文獻', layout: 'refs', dur: 30, lines: [] },
];

// Reference list (rendered on the last card; the numbered order follows first use).
const REFS = [
  'Price FW, Whitson WE, Ahad KA, Tavakkoli H. Suprachoroidal hemorrhage in penetrating keratoplasty. Ophthalmic Surg 1994;25(8):521-5.',
  'Ingraham HJ, Donnenfeld ED, Perry HD. Massive suprachoroidal hemorrhage in penetrating keratoplasty. Am J Ophthalmol 1989;108(6):670-5.',
  'Koo EH, Feuer WJ, Forster RK. Graft-size selection and anisometropia reduction in penetrating keratoplasty (PKP). PLoS One 2019;14(6):e0218199.',
  'van Rooij J, Rijneveld WJ, Remeijer L, et al. Effect of oral acyclovir after penetrating keratoplasty for herpetic keratitis: a placebo-controlled multicenter trial. Ophthalmology 2003;110(10):1916-9.',
];

if (typeof module !== 'undefined') module.exports = { VIDEO, SEGS, CHAPTERS, REFS };
