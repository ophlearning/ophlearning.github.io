// ============================================================================
// OS lower-lid Hotz with partial fat removal (recurrent involutional entropion + lid bag; pancytopenia, thrombocytopenia) — text of every
// segment: narration lines (= burned-in captions), key-point box, sources, chapter, title, layout. The drawing of each segment is in
// draw.js (DRAW2). Layout and timeline: videos/tools/video-kit. The printed sheets (../print/) read REFS from here (footer and number check).
// Every number comes from a source in REFS (each one checked in PubMed; DOI at the end of its line), the department template (said as
// 「依院內常規」), the case (病例: the case summary and clinic notes the site owner confirmed on 2026-11-23) or is schematic (示意);
// ../check.js holds the ledger of every number and fails on any number without one. Kakizaki 2006 comes from ../lower-lid-entropion-revision;
// Murali 2021, McCallum 2019 and Lima 2009 from ../lateral-canthotomy-ocs. The content stays within what the printed sheets verified.
// ============================================================================
const VIDEO = {
  id: 'lower-lid-hotz-fat-removal',
  name: '下眼瞼 Hotz＋去眼袋',
  title: ['下眼瞼 Hotz＋去眼袋', '術前預習'],
  subtitle: '復發的 involutional entropion＋lid bag；血小板低',
  line: '每一步動到哪一層、三團脂肪與 inferior oblique、術後球後出血',
  note: ['右眼 OD 示意動畫，不是手術錄影；本台 OS，左右相反。', '各院做法不同的地方，依院內常規。'],
  credit: '製作　張博淳',   // the kit's default credit; videos do not name the hospital
};
const CHAPTERS = ['片頭', '臨床決策', '術前', '手術步驟', '收尾', '術後', '跟刀清單', '參考文獻'];

const SEGS = [
// ---------------------------------------------------------------- 片頭
{ id: 'title', ch: 0, layout: 'title', lead: 1.2,
  lines: ['這位病人的左下眼瞼內翻、睫毛碰到角膜，同時有眼袋；\n今天照院內範本做 Hotz，同一個切口一起去眼袋。',
          '病人有 pancytopenia 和 thrombocytopenia，\n所以這支影片特別講止血，以及術後的球後出血。',
          '畫面是右眼示意；本台是左眼 OS，左右相反。'] },

// ---------------------------------------------------------------- 1 臨床決策
{ id: 'c1', chapterCard: 1 },
{ id: '1', ch: 1, title: '復發的內翻加眼袋：為什麼用 Hotz', layout: 'dual',
  lines: ['門診紀錄：左下眼瞼內翻合併 trichiasis，\n兩眼都有眼袋，這次開左眼。',
          '紀錄寫「復發」，眼科史卻寫沒開過刀；\n前次處置不詳，本片不臆測。',
          '院內範本的 Hotz：切除一條皮膚與 orbicularis，\n把 orbicularis 固定到 retractor aponeurosis。',
          '這條路本來就要穿過眶隔、露出 aponeurosis，範本在這一步部分去脂，\n所以眼袋可以在同一個切口處理。',
          '這位病人為什麼選 Hotz、去多少脂肪，依主治判斷。'],
  keys: [[0, '門診：<b>OS 下眼瞼內翻＋trichiasis</b>；眼袋 OU，這次開 OS'],
         [1, '前次處置：<b>不詳</b>（紀錄自相矛盾，本片不臆測）'],
         [2, '院內範本 Hotz：切除皮膚＋orbicularis → orbicularis 固定到 <b>retractor aponeurosis</b>'],
         [3, '穿過眶隔時<b>部分去脂</b> → 同一個切口去眼袋'],
         [4, '選術式、去脂量：<b>依主治判斷</b>']],
  src: [[0, '病例'], [2, '院內常規']] },

// ---------------------------------------------------------------- 2 術前
{ id: 'c2', chapterCard: 2 },
{ id: '2-1', ch: 2, title: '血小板與凝血', layout: 'full',
  lines: ['術前先核對開 OS，再看血小板和 PT、aPTT；\n這位病人的數值紀錄裡沒有，跟刀前自己查。',
          'AABB 的指引：major elective non-neuraxial surgery，\n血小板低於 50 × 10⁹/L 建議預防性輸血小板。',
          '眼瞼手術算不算這一類、要不要輸，\n依主治與血液科判斷。',
          '一個眼瞼成形術後眶內出血的調查，\n常見的共病是高血壓、aspirin、術後嘔吐和用力。',
          '用藥、血壓與術後止吐，依主治與院內常規。'],
  keys: [[0, '核對 <b>OS</b>；<b>血小板 [　　]</b>、<b>PT／aPTT [　　]</b>：紀錄沒有，跟刀前自己查'],
         [1, 'AABB：major elective non-neuraxial surgery，血小板 <b>< 50 × 10⁹/L</b> → 建議預防性輸血小板'],
         [2, '眼瞼手術算不算、輸不輸：<b>依主治與血液科</b>'],
         [3, '眼瞼成形術後眶內出血的共病：<b>高血壓、aspirin、術後嘔吐、用力</b>'],
         [4, '用藥、血壓、止吐：依主治與院內常規']],
  src: [[0, '病例'], [1, 'Kaufman 2015'], [3, 'Hass 2004'], [4, '院內常規']] },
{ id: '2-2', ch: 2, title: '乾眼與角膜：先記下基準', layout: 'dual',
  lines: ['先記下角膜的基準：TBUT 3 秒、dry eye，\n下方角膜 SPK，結膜下出血 SCH 兩個加號。',
          '內翻讓下睫毛碰到下方角膜；\n手術把瞼緣轉正，睫毛才離開。',
          '一個 892 例的眼瞼成形術系列，術後乾眼症狀 26.5%；\n術後 lagophthalmos 讓風險上升。',
          '術前記下角膜，術後才比得出差別。'],
  keys: [[0, '病例：<b>TBUT 3 秒</b>、dry eye、下方 <b>SPK</b>、<b>SCH++</b>'],
         [1, '內翻：下睫毛碰到下方角膜'],
         [2, '眼瞼成形術後乾眼症狀 <b>26.5%</b>（892 例）；術後 <b>lagophthalmos</b> → 風險上升'],
         [3, '術前記下基準，術後才比得出差別']],
  src: [[0, '病例'], [2, 'Prischmann 2013']] },

// ---------------------------------------------------------------- 3 手術步驟
{ id: 'c3', chapterCard: 3 },
{ id: '3-1', ch: 3, title: '切除皮膚、皮下與 orbicularis', layout: 'dual',
  lines: ['依院內常規畫線，切除一條皮膚、皮下組織與 orbicularis；\n寬度依院內常規，畫面是示意。',
          '每一層都止血，再往深處走。'],
  keys: [[0, '切除<b>皮膚、皮下與 orbicularis</b>（畫線與寬度依院內常規；圖為示意）'],
         [1, '<b>每一層止血</b>，再往深處走']],
  src: [[0, '院內常規']] },
{ id: '3-2', ch: 3, title: '打開眶隔，露出 retractor aponeurosis', layout: 'dual',
  lines: ['依院內常規，穿過肌肉層與眶隔，\n露出眶脂肪和 retractor aponeurosis。',
          '亞洲人的眶隔約在瞼板下 2.4 mm，\n和 capsulopalpebral fascia 融合；它是 retractor 的前層。',
          '不過 19 眼裡只有 7 眼看得到明確的融合；\norbicularis 最後就固定在這一層。'],
  keys: [[0, '穿過肌肉層與<b>眶隔</b> → 眶脂肪、<b>retractor aponeurosis</b>（依院內常規）'],
         [1, '亞洲人：眶隔在瞼板下約 <b>2.4 mm</b> 和 <b>capsulopalpebral fascia</b> 融合'],
         [2, '19 眼中 7 眼看得到明確融合；orbicularis 最後固定在這一層']],
  src: [[0, '院內常規'], [1, 'Kakizaki 2006']] },
{ id: '3-3', ch: 3, title: '三團脂肪與 inferior oblique', layout: 'dual',
  lines: ['一個 50 具屍體的研究，36% 的下眼瞼脂肪\n分成清楚的三團：內側、中央、外側。',
          '內側和中央之間隔著 inferior oblique 的筋膜，\n中央和外側之間是 arcuate expansion。',
          '作者提醒：inferior oblique 和 arcuate expansion，\n手術時都不要傷到。',
          '各團的大小、下斜肌在切面上的位置，畫面是示意。'],
  keys: [[0, '50 具屍體：<b>36%</b> 分成清楚的<b>三團</b>（內側、中央、外側）'],
         [1, '內／中之間：<b>inferior oblique</b>｜中／外之間：<b>arcuate expansion</b>'],
         [2, '兩者都<b>不要傷到</b>'],
         [3, '各團大小、下斜肌在切面上的位置：示意']],
  src: [[0, 'Coban 2023']] },
{ id: '3-4', ch: 3, title: '部分去脂與止血', layout: 'dual',
  lines: ['依院內常規部分去脂：\n去哪幾團、去多少，依院內常規。',
          '夾、剪之前先認出 inferior oblique，不要夾到。',
          '眼瞼成形術後持續複視的 12 位病人：\n下直肌 7 位、上斜肌 5 位。',
          '脂肪的斷端先止血，確認不出血再放開。'],
  keys: [[0, '<b>部分去脂</b>：哪幾團、多少依院內常規'],
         [1, '先認出 <b>inferior oblique</b>：不要夾'],
         [2, '眼瞼成形術後持續複視 12 位：<b>下直肌 7、上斜肌 5</b>'],
         [3, '<b>斷端止血</b>再放開']],
  src: [[0, '院內常規'], [2, 'Syniuta 2003']] },
{ id: '3-5', ch: 3, title: 'Orbicularis 固定到 retractor aponeurosis', layout: 'dual',
  lines: ['依院內常規，用 6-0 Prolene 五針，\n把 orbicularis 固定到 retractor aponeurosis。',
          '綁好之後，瞼緣往外轉，下睫毛離開角膜。',
          '縫線的位置與深度依院內常規，畫面是示意。'],
  keys: [[0, 'Orbicularis → retractor aponeurosis：<b>6-0 Prolene ×5</b>（依院內常規）'],
         [1, '瞼緣<b>轉正</b>：下睫毛離開角膜（示意）'],
         [2, '縫線位置與深度：依院內常規（圖為示意）']],
  src: [[0, '院內常規']] },

// ---------------------------------------------------------------- 4 收尾
{ id: 'c4', chapterCard: 4 },
{ id: '4', ch: 4, title: '閉眼、瞼緣方向、止血', layout: 'dual',
  lines: ['收尾前請病人閉眼：閉不閉得緊、\n瞼緣有沒有轉正、睫毛還有沒有碰到角膜。',
          '術後 lagophthalmos 會讓乾眼症狀增加；\n這位病人的 TBUT 只有 3 秒。',
          '最後確認沒有活動性出血；\n傷口縫合與敷料依院內常規。'],
  keys: [[0, '請病人<b>閉眼</b>：閉緊、瞼緣方向、睫毛離開角膜'],
         [1, '術後 lagophthalmos → 乾眼症狀增加；本病例 <b>TBUT 3 秒</b>'],
         [2, '<b>沒有活動性出血</b>；縫合與敷料依院內常規']],
  src: [[1, 'Prischmann 2013；病例'], [2, '院內常規']] },

// ---------------------------------------------------------------- 5 術後
{ id: 'c5', chapterCard: 5 },
{ id: '5-1', ch: 5, title: '球後出血：時間與徵象', layout: 'dual',
  lines: ['眼瞼成形術後眶內出血很少見：0.055%，\n造成永久視力喪失 0.0045%。',
          '多發生在術後 3 小時內，24 小時後明顯減少，\n但也可能晚到幾天後。',
          '這位病人血小板低，回病房後的這段時間要特別注意。',
          '徵象：眼球突出、眼瞼繃緊、RAPD、\nIOP 升高、視力下降。',
          '只有約 15% 會說眼痛，不能等病人喊痛。',
          '急診的文獻建議：IOP 正常 8 到 21，\n超過 30 緊急找眼科，超過 40 立刻減壓。'],
  keys: [[0, '眼瞼成形術後眶內出血 <b>0.055%</b>；永久視力喪失 <b>0.0045%</b>'],
         [1, '多在術後 <b>3 小時內</b>；24 小時後明顯減少；也可能晚到幾天後'],
         [3, '<b>眼球突出、眼瞼繃緊、RAPD、IOP 高、視力下降</b>'],
         [4, '只有約 <b>15%</b> 會說眼痛：不能等病人喊痛'],
         [5, 'IOP 正常 8–21；<b>> 30</b> 緊急找眼科；<b>> 40</b> 立刻減壓']],
  src: [[0, 'Hass 2004'], [3, 'Murali 2021']] },
{ id: '5-2', ch: 5, title: '第一步：lateral canthotomy＋inferior cantholysis', layout: 'dual',
  lines: ['判斷是球後出血，第一步是床邊的\nlateral canthotomy 加 inferior cantholysis，不等 CT。',
          '從外眥水平剪到外側眶緣，\n再剪斷外眥韌帶的下支，眼瞼就鬆開了。',
          '2 小時內處置，視力結果較好。',
          '詳細的步驟，請看網站上的 lateral canthotomy 影片。'],
  keys: [[0, '第一步：<b>lateral canthotomy＋inferior cantholysis</b>，不等 CT'],
         [1, '外眥<b>水平</b>剪到外側眶緣 → 剪斷<b>下支</b>'],
         [2, '<b>2 小時內</b>處置，視力結果較好'],
         [3, '步驟影片：ophlearning.github.io/videos/#lateral-canthotomy-ocs']],
  src: [[0, 'Murali 2021'], [2, 'McCallum 2019'], [3, '']] },

// ---------------------------------------------------------------- 6 跟刀清單
{ id: 'c6', chapterCard: 6 },
{ id: '6', ch: 6, title: '跟刀時看這八件事', layout: 'full', tail: 2.5,
  lines: ['跟刀時看這八件事。',
          '一，核對 OS；血小板、PT 和 aPTT，輸不輸依主治與血液科。',
          '二，先記下角膜：TBUT 3 秒、下方 SPK、結膜下出血。',
          '三，依院內常規切除皮膚、皮下與 orbicularis，每一層止血。',
          '四，打開眶隔、露出 retractor aponeurosis，認出三團脂肪。',
          '五，部分去脂，避開 inferior oblique，斷端止血再放開。',
          '六，6-0 Prolene 五針，把 orbicularis 固定到 aponeurosis。',
          '七，請病人閉眼，看瞼緣方向，確認沒有活動性出血。',
          '八，術後球後出血：眼球突出、眼瞼繃緊、RAPD、IOP 高、視力下降，\n先做 lateral canthotomy 加 inferior cantholysis。'],
  keys: [[0, '和列印的跟刀清單同一份；做法與數值依院內常規。']],
  src: [[0, '本片各章來源']] },

// ---------------------------------------------------------------- 參考文獻
{ id: 'c7', chapterCard: 7 },
{ id: 'refs', ch: 7, title: '參考文獻', layout: 'refs', dur: 26, lines: [] },
];

const REFS = [
 'Kaufman RM, et al. Platelet transfusion: a clinical practice guideline from the AABB. Ann Intern Med 2015;162(3):205-13.',                                         // 10.7326/M14-1589
 'Hass AN, Penne RB, Stefanyszyn MA, Flanagan JC. Incidence of postblepharoplasty orbital hemorrhage and associated visual loss. Ophthalmic Plast Reconstr Surg 2004;20(6):426-32.',   // 10.1097/01.iop.0000143711.48389.c5
 'Murali S, Davis C, McCrea MJ, Plewa MC. Orbital compartment syndrome: pearls and pitfalls for the emergency physician. J Am Coll Emerg Physicians Open 2021;2(2):e12372.',            // 10.1002/emp2.12372
 'McCallum E, et al. Orbital compartment syndrome: an update with review of the literature. Clin Ophthalmol 2019;13:2189-94.',                                         // 10.2147/OPTH.S180058
 'Lima V, et al. Orbital compartment syndrome: the ophthalmic surgical emergency. Surv Ophthalmol 2009;54(4):441-9.',                                                  // 10.1016/j.survophthal.2009.04.005
 'Coban I, et al. Anatomical basis for the lower eyelid rejuvenation. Aesthetic Plast Surg 2023;47(3):1059-1066.',                                                     // 10.1007/s00266-023-03297-z
 'Syniuta LA, Goldberg RA, Thacker NM, Rosenbaum AL. Acquired strabismus following cosmetic blepharoplasty. Plast Reconstr Surg 2003;111(6):2053-9.',                   // 10.1097/01.PRS.0000056840.61348.35
 'Prischmann J, et al. Dry eye symptoms and chemosis following blepharoplasty: a 10-year retrospective review of 892 cases in a single-surgeon series. JAMA Facial Plast Surg 2013;15(1):39-46.',   // 10.1001/2013.jamafacial.1
 'Kakizaki H, et al. Microscopic anatomy of Asian lower eyelids. Ophthalmic Plast Reconstr Surg 2006;22(6):430-3.',                                                    // 10.1097/01.iop.0000242182.96161.78
];
if (typeof module !== 'undefined') module.exports = { VIDEO, SEGS, CHAPTERS, REFS };
