// ============================================================================
// PK after a failed DMEK, assistant's pre-op preview — text of every segment: narration lines (= burned-in captions), key-point box,
// sources, chapter, title, layout. The drawing of each segment is in draw.js (DRAW2). Layout and timeline: videos/tools/video-kit.
// Every number comes from a PubMed-verified source (../pk-tectonic-descemetocele/lit-notes.md, section 8 for this case) or is marked
// 病例 / 結構 / 示意; check.js holds the ledger. The PK steps reuse globe/pk.js from the first PK video and are told faster here.
// Case (站長 2026-11-23, de-identified in spec.md): OS, Fuchs, pseudophakic (PCIOL), LI at 7 o'clock, DMEK about a week ago that did not
// work (oedema, epithelial defect, shallow AC, pupillary block, peripheral AC collapse, hyphema, low IOP); 站長 is the assistant.
// No source found for intraoperative hyphema handling or for keeping vs exchanging the IOL in this setting (lit-notes 查不到): 依主刀.
// ============================================================================
const VIDEO = {
  name: 'Failed DMEK 後的 PK（助手版）',
  title: ['Failed DMEK 之後', '改做 PK'],
  subtitle: '助手版：看懂每一步，做對助手的事',
  line: '左眼 OS，Fuchs，人工水晶體眼',
  note: ['左眼示意動畫，不是手術錄影；比例不精確。', 'Trephine 大小、縫法、前房處理與藥物，依主刀決定與院內常規。'],
};
const CHAPTERS = ['片頭', '為什麼改 PK', 'Trephine 與 open sky', '前房的處理', '供體與縫合', '收尾與術後', '助手清單', '參考文獻'];

const SEGS = [
// ---------------------------------------------------------------- 片頭
{ id: 'title', ch: 0, layout: 'title', lead: 1.2,
  lines: ['這支影片站在助手的位置，\n預習一台左眼的 PK。',
          '情境是：DMEK 做完約一週，graft 沒有發揮功能，\n這次改做全層的角膜移植。',
          '和 tectonic PK 那部相同的步驟會講得比較快；\n細節以主刀當天的做法為準。'] },

// ---------------------------------------------------------------- 1 為什麼改 PK
{ id: 'c1', chapterCard: 1 },
{ id: '1-1', ch: 1, title: 'DMEK 一週之後', layout: 'dual',
  lines: ['這隻左眼有 Fuchs endothelial dystrophy，\n白內障手術後放了 PCIOL，角膜一直水腫。',
          '約一週前做了 DMEK：只換角膜最後面那一層，\nDescemet membrane 和內皮。',
          '現在角膜還是很腫，上皮也缺了一塊；前房淺，\n有 pupillary block、周邊前房塌，還有 hyphema。',
          '7 點鐘有一個以前做的 LI。'],
  keys: [[1, '<b>DMEK</b>：只換 Descemet membrane＋內皮。'],
         [2, '水腫、上皮缺損、<b>前房淺</b>、pupillary block、<b>hyphema</b>。'],
         [3, '<b>LI 在 7 點</b>。']] },
{ id: '1-2', ch: 1, title: '為什麼改做 PK', layout: 'dual',
  lines: ['DMEK 失敗，最常見的原因是 primary graft failure：\n一個多中心的系列裡占 64.1%。',
          '也可以再做一次 DMEK：55 眼的系列裡，\n早期再做的視力，和對側眼第一次 DMEK 差不多。',
          '這台主治決定改做 PK；全層打開以後，\n前房的血和沾黏也可以直接處理。'],
  keys: [[0, 'DMEK 失敗主因：<b>primary graft failure</b>（64.1%）。'],
         [1, '再做 DMEK 也是選項（55 眼）。'],
         [2, '這台：<b>PK</b>（主治決定）。']],
  src: [[0, 'Gómez-Benlloch 2021'], [1, 'Price 2015'], [2, '']] },

// ---------------------------------------------------------------- 2 Trephine 與 open sky
{ id: 'c2', chapterCard: 2 },
{ id: '2-1', ch: 2, title: 'Trephine 與 open sky', layout: 'dual',
  lines: ['Trephine 先切到部分深度，進前房以後，\n再沿著切痕切完一圈。',
          '這顆眼睛做過白內障手術和 DMEK：suprachoroidal hemorrhage 的\n830 例系列裡，9 例有 8 例以前做過眼內手術。',
          '英國的問卷：人工水晶體眼，有 33% 的醫師用 Flieringa ring\n撐住鞏膜；用不用，依主刀。',
          'Open sky 時，助手不壓眼球、不扳開瞼器，\n看到虹膜往前鼓、紅光變暗就馬上講。'],
  keys: [[0, '<b>部分深度</b> → 進前房 → 切完一圈。'],
         [1, '以前的<b>眼內手術</b>：9 例有 8 例。'],
         [2, 'Flieringa ring：人工水晶體眼 <b>33%</b>（依主刀）。'],
         [3, '<b>不壓、不扳</b>；往前鼓、紅光變暗 → 馬上講。']],
  src: [[0, 'Legeais 1993'], [1, 'Ingraham 1989'], [2, 'Lee 2012'], [3, '']] },

// ---------------------------------------------------------------- 3 前房的處理
{ id: 'c3', chapterCard: 3 },
{ id: '3-1', ch: 3, title: '前房：血與沾黏', layout: 'dual',
  lines: ['角膜拿下來以後，主刀會先看前房：\n有沒有血、虹膜有沒有貼在角膜後面、IOL 在哪裡。',
          '虹膜黏在角膜上時，硬拉角膜會把虹膜撕破、出血；\n要先把沾黏輕輕分開，再縫供體。',
          '前房的血怎麼清，依主刀；\n助手幫忙保持視野清楚。'],
  keys: [[0, '看三件事：<b>血、沾黏、IOL</b>。'],
         [1, '沾黏要<b>先分開</b>，硬拉會撕破虹膜。'],
         [2, '清血：依主刀；助手保持視野。']],
  src: [[1, 'Deshmukh 2020'], [2, '']] },
{ id: '3-2', ch: 3, title: 'Pupillary block、LI 與 IOL', layout: 'dual',
  lines: ['DMEK 後的 pupillary block，和前房裡的空氣、\n被堵住的 iridotomy 有關。',
          '一個 368 例的 DMEK 系列：術後 1 小時前房全滿空氣的有 22%；\n需要放氣的眼睛，iridotomy 被堵住的比例較高，23% 對 6.6%。',
          '所以主刀可能會確認 7 點鐘的 LI 通不通，\n必要時再做一個 PI；依主刀。',
          'IOL 的位置也會順便確認；要不要動它，依主刀。'],
  keys: [[0, 'Pupillary block：<b>空氣＋iridotomy 被堵</b>。'],
         [1, '全滿空氣 22%；被堵 <b>23% vs 6.6%</b>。'],
         [2, '確認 <b>7 點 LI</b>；必要時 PI（依主刀）。']],
  src: [[1, 'Gonzalez 2016'], [2, '']] },

// ---------------------------------------------------------------- 4 供體與縫合
{ id: 'c4', chapterCard: 4 },
{ id: '4-1', ch: 4, title: '供體與縫合', layout: 'dual',
  lines: ['供體從內皮面 punch；內皮保持濕潤、不碰。',
          'Cardinal sutures 第一針在 12 點，接著 6、3、9 點；\n第一針以後的順序是常規做法。',
          '其餘的縫線補在中間：英國的問卷裡，\n用 interrupted 的醫師 70% 縫 16 針。',
          '助手在主刀下針的對側固定，\n遞針、剪線、記針數。'],
  keys: [[0, '供體從<b>內皮面</b> punch；內皮不碰。'],
         [1, '<b>12 → 6 → 3 → 9</b>（12 點以後依常規）。'],
         [2, 'Interrupted：<b>16 針</b>最常見（70%）。'],
         [3, '助手：<b>對側</b>固定、遞針、剪線、記針數。']],
  src: [[0, 'Ward 1976'], [1, 'Lee 2012'], [3, '']] },

// ---------------------------------------------------------------- 5 收尾與術後
{ id: 'c5', chapterCard: 5 },
{ id: '5-1', ch: 5, title: '收尾與術後', layout: 'dual',
  lines: ['BSS 重建前房，再用高濃度的 fluorescein\n沿著交界測漏：Seidel test。',
          '取下的角膜和 DMEK graft 送病理，依院內常規。',
          '術後要盯眼壓：PK 後 24 小時內眼壓升高，\n和瞳孔固定散大的 Urrets-Zavalia syndrome 有關。',
          '這是第二次移植：PK 的 regraft 5 年存活 53%，\n第一次 graft 是 90%。'],
  keys: [[0, 'BSS 重建前房；<b>Seidel test</b>。'],
         [2, '術後 24 小時<b>盯眼壓</b>：Urrets-Zavalia。'],
         [3, 'Regraft 5 年存活 <b>53%</b> vs 第一次 90%。']],
  src: [[0, 'Romanchuk 1979'], [1, ''], [2, 'Figueiredo 2013'], [3, 'Thompson 2003']] },

// ---------------------------------------------------------------- 6 助手清單
{ id: 'c6', chapterCard: 6 },
{ id: '6', ch: 6, title: '助手記住這五件事', layout: 'full', tail: 2.5,
  lines: ['助手記住這五件事。',
          '一，方位：術者坐 12 點，下方是 12 點，\n左眼的 temporal 在左；LI 在 7 點。',
          '二，open sky 時不壓、不扳，\n看虹膜和紅光。',
          '三，主刀分沾黏、清前房時，保持視野清楚。',
          '四，供體內皮不碰；在主刀下針的對側固定。',
          '五，記針數、剪線、測漏；術後盯眼壓。'],
  keys: [[0, '步驟的來源見各章；trephine 大小、縫法、前房處理與藥物，依主刀決定與院內常規。']],
  src: [[0, '本片各章來源']] },

{ id: 'c7', chapterCard: 7 },
{ id: 'refs', ch: 7, title: '參考文獻', layout: 'refs', dur: 30, lines: [] },
];

// Reference list (rendered on the last card), in order of first use; details in ../pk-tectonic-descemetocele/lit-notes.md.
const REFS = [
  'Gómez-Benlloch A, Montesel A, Pareja-Aricò L, et al. Causes of corneal transplant failure: a multicentric study. Acta Ophthalmol 2021;99(6):e922-e928.',
  'Price MO, Feng MT, McKee Y, Price FW. Repeat Descemet membrane endothelial keratoplasty: secondary grafts with early intervention are comparable with fellow-eye primary grafts. Ophthalmology 2015;122(8):1639-44.',
  'Legeais JM, Parel JM, Simon G, Ren Q, Denham D. Endothelial damage by the corneal Hessburg-Barron vacuum trephine. Refract Corneal Surg 1993;9(4):255-8.',
  'Ingraham HJ, Donnenfeld ED, Perry HD. Massive suprachoroidal hemorrhage in penetrating keratoplasty. Am J Ophthalmol 1989;108(6):670-5.',
  'Lee RM, Lam FC, Georgiou T, et al. Suturing techniques and postoperative management in penetrating keratoplasty in the United Kingdom. Clin Ophthalmol 2012;6:1335-40.',
  'Deshmukh R, Stevenson LJ, Vajpayee R. Management of corneal perforations: an update. Indian J Ophthalmol 2020;68(1):7-14.',
  'Gonzalez A, Price FW, Price MO, Feng MT. Prevention and management of pupil block after Descemet membrane endothelial keratoplasty. Cornea 2016;35(11):1391-5.',
  'Ward DE, Nesburn AB. An artificial anterior chamber. Am J Ophthalmol 1976;82(5):796-8.',
  'Romanchuk KG. Seidel\'s test using 10% fluorescein. Can J Ophthalmol 1979;14(4):253-6.',
  'Figueiredo GS, Kolli SS, Ahmad S, Gales K, Figueiredo FC. Urrets-Zavalia syndrome following penetrating keratoplasty for keratoconus. Graefes Arch Clin Exp Ophthalmol 2013;251(3):809-15.',
  'Thompson RW, Price MO, Bowers PJ, Price FW. Long-term graft survival after penetrating keratoplasty. Ophthalmology 2003;110(7):1396-402.',
];

if (typeof module !== 'undefined') module.exports = { VIDEO, SEGS, CHAPTERS, REFS };
