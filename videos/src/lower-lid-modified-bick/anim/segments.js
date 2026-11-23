// ============================================================================
// OS lower-lid involutional entropion (horizontal laxity, trichiasis): modified Bick — text of every segment: narration lines (= burned-in
// captions), key-point box, sources, chapter, title, layout. The drawing of each segment is in draw.js (DRAW2). Layout and timeline:
// videos/tools/video-kit. The printed OR sheets (print/) came first (2026-11-23); the video says what they say.
// REFS: every reference PubMed-verified (DOI or PMID in the comment). Bick 1966 has no abstract on PubMed: it is cited as the original
// description only, no number or step from it. Every number's source is in ../check.js (LEDGER): a REFS citation, 院內常規, 示意, 結構 or
// 病例 (spec.md「病例情境」, confirmed by 站長 2026-11-23). No department template for this procedure: steps follow the literature; what
// differs between papers, and every suture, is said as 「依院內常規」.
// ============================================================================
const VIDEO = {
  id: 'lower-lid-modified-bick',
  name: '下眼瞼 modified Bick',
  title: ['下眼瞼 modified Bick', '術前預習'],
  subtitle: 'Involutional entropion：在外眥處全層縮短下眼瞼',
  line: '左眼 OS 下眼瞼；附加術式：無',
  note: ['右眼 OD 示意動畫；本台 OS，左右相反。', '不是手術錄影；比例不精確。', '各院做法不同的地方，依院內常規。'],
  credit: '製作　張博淳',   // no hospital name (CLAUDE.md)
};
const CHAPTERS = ['片頭', '臨床決策', '術前評估', '手術步驟', '術中狀況與收尾', '術後', '跟刀清單', '參考文獻'];

const SEGS = [
// ---------------------------------------------------------------- 片頭
{ id: 'title', ch: 0, layout: 'title', lead: 1.2,
  lines: ['今天這台是左眼下眼瞼的 involutional entropion：\n眼瞼水平鬆弛，睫毛往內刷到角膜。',
          '術式是 modified Bick：在外眥處全層楔形切除，\n把下眼瞼縮短，再把瞼板斷端接回外眥。',
          '畫面是右眼的示意圖；這台是左眼，左右相反。'] },

// ---------------------------------------------------------------- 1 臨床決策
{ id: 'c1', chapterCard: 1 },
{ id: '1-1', ch: 1, title: '下眼瞼為什麼會往內翻', layout: 'dual',
  lines: ['老年性的下眼瞼內翻，\n來自老化造成的組織鬆弛和肌肉張力變差。',
          'Retractors 從瞼板下緣鬆脫，\n被認為是最主要的原因。',
          '另外還有 orbicularis 張力變差，\n以及眶隔前的 orbicularis 往上跨到瞼板前面。',
          '再加上整片眼瞼和外眥韌帶變鬆，\n也就是 horizontal laxity。',
          '這位病人門診記錄的是 horizontal laxity，\n睫毛刷到角膜，角膜下方有點狀的 SPK。'],
  keys: [[0, '老化：組織鬆弛＋肌肉張力變差'],
         [1, '<b>Retractors 鬆脫</b>：被認為是最主要的原因'],
         [2, '<b>Orbicularis</b>：張力變差、眶隔前的往上跨'],
         [3, '<b>Horizontal laxity</b>：整片眼瞼與外眥韌帶變鬆'],
         [4, '這位病人：<b>horizontal laxity</b>＋睫毛刷到角膜＋角膜下方 SPK']],
  src: [[0, 'Pushker 2025'], [4, '病例']] },
{ id: '1-2', ch: 1, title: '為什麼這台要水平縮短', layout: 'dual',
  lines: ['文獻建議：horizontal laxity 明顯時，要做水平縮短；\n垂直和水平兩個成分都處理，長期效果最好。',
          '一個系列比較同時有水平與垂直鬆弛的內翻：\n只做水平縮短，54 個裡 4 個復發，也就是 7%。',
          '合併其他術式的復發是 8%，兩組差不多；\n作者仍提醒，要依主要的致病因素選術式。',
          '這台門診記錄的是 horizontal laxity，\n只做 modified Bick，沒有附加術式。'],
  keys: [[0, 'Horizontal laxity 明顯 → <b>水平縮短</b>；兩個成分都處理，長期效果最好'],
         [1, '只做水平縮短：復發 <b>7%</b>（4/54）'],
         [2, '合併術式 8%；依<b>主要的致病因素</b>選術式'],
         [3, '本台：<b>modified Bick</b>，附加術式：無']],
  src: [[0, 'Pushker 2025'], [1, 'Auguste 2023'], [3, '病例']] },
{ id: '1-3', ch: 1, title: 'Bick 和 lateral tarsal strip', layout: 'full',
  lines: ['水平縮短常用兩種做法。Lateral tarsal strip 剪開外眥、剪斷下支，\n把外側瞼板做成一條，縫到外側眶緣的骨膜。',
          'Bick 則是在外眥附近，把眼瞼全層切掉一塊三角形，\n切多少依鬆弛的程度。',
          'Hurwitz 的改良把全層縮短放在外眥處，瞼緣不會留 notch；\n成敗取決於瞼板直接縫到外側眶緣的骨膜。',
          '一個 641 次手術的非隨機比較：Bick 84 次，解剖成功 100%、\n沒有人再手術；lateral tarsal strip 89.1%，再手術 9%。',
          '只看內翻、各自合併 everting sutures 或 retractor plication：\nBick 治癒 100%，lateral tarsal strip 92% 與 90%。',
          '兩個研究都是回溯性的；\nBick 被批評的地方，是外眥角可能變圓、往內移。'],
  keys: [[0, '<b>Lateral tarsal strip</b>：外側瞼板做成一條 → 縫到外側眶緣骨膜'],
         [1, '<b>Bick</b>：外眥附近<b>全層</b>切掉一塊三角形，切多少依鬆弛程度'],
         [2, 'Hurwitz 改良：外眥處全層縮短，<b>瞼緣不留 notch</b>；成敗取決於瞼板直接縫到骨膜'],
         [3, '641 次（非隨機）：解剖成功 Bick <b>100%</b> vs LTS 89.1%；再手術 0 vs 9%'],
         [4, '內翻：治癒 Bick <b>100%</b> vs LTS 92%／90%'],
         [5, '回溯性研究；Bick 的缺點：<b>外眥角變圓、往內移</b>']],
  src: [[0, 'Anderson 1979'], [1, 'Tao 2025'], [2, 'Hurwitz 1987'], [3, 'Vahdani 2018'], [4, 'Poon 2019'], [5, 'Vahdani 2018；Poon 2019；Tao 2025']] },

// ---------------------------------------------------------------- 2 術前評估
{ id: 'c2', chapterCard: 2 },
{ id: '2', ch: 2, title: 'Distraction 與 snap-back', layout: 'dual',
  lines: ['Distraction test：請病人往前看，\n把下眼瞼往前拉離眼球，量拉開幾 mm。',
          '超過 6 到 8 mm 算明顯；一個 80 位單側內翻的研究，\n量到的是 7.5 到 11 mm。',
          '放開之後看 snap-back：眨了好幾次眼還貼不回眼球，\n代表 orbicularis 張力明顯變差。',
          '術前也記下睫毛碰到角膜的位置、角膜下方的 SPK，\n以及病人有糖尿病（口服藥）和抽菸。'],
  keys: [[0, '<b>Distraction test</b>：往前拉離眼球，量幾 mm'],
         [1, '> 6–8 mm 算明顯；內翻病人 7.5–11 mm'],
         [2, '<b>Snap-back</b>：眨好幾次眼還貼不回 → orbicularis 張力差'],
         [3, '記下：睫毛碰角膜的位置、角膜下方 SPK；DM（口服藥）、抽菸']],
  src: [[0, 'Pushker 2025'], [1, 'Pushker 2025；Beigi 2008'], [2, 'Pushker 2025'], [3, '病例']] },

// ---------------------------------------------------------------- 3 手術步驟
{ id: 'c3', chapterCard: 3 },
{ id: '3-1', ch: 3, title: '局部麻醉，畫外眥線與楔形', layout: 'dual',
  lines: ['局部麻醉的藥物與劑量，依院內常規。',
          '在外眥畫一條水平的切開線，\n往外延伸到外側眶緣（位置示意）。',
          '再畫出預計切除的楔形：底邊在睫毛線，\n尖端在瞼板下緣下方；位置和寬度依院內常規。'],
  keys: [[0, '局部麻醉：依院內常規'],
         [1, '外眥切開線：水平、往外到外側眶緣（位置示意）'],
         [2, '<b>楔形</b>：底邊在睫毛線、尖端在瞼板下緣下方（位置與寬度依院內常規）']],
  src: [[0, '院內常規']] },
{ id: '3-2', ch: 3, title: 'Lateral canthotomy 與 inferior cantholysis', layout: 'dual',
  lines: ['依院內常規做 lateral canthotomy：\n從外眥往外，水平剪開。',
          '再剪斷外眥韌帶的下支，也就是 inferior cantholysis，\n外側的下眼瞼就鬆開了。',
          '文獻的做法不一：有的改良保留外眥韌帶、不切外眥；\n這台怎麼做，依院內常規。'],
  keys: [[0, '<b>Canthotomy</b>：從外眥往外水平剪開'],
         [1, '<b>Inferior cantholysis</b>：剪斷外眥韌帶下支 → 下眼瞼外側鬆開'],
         [2, '有的改良不切外眥；這台依院內常規']],
  src: [[0, '院內常規'], [2, 'Rubino 2024']] },
{ id: '3-3', ch: 3, title: '往外拉：決定切多少', layout: 'dual',
  lines: ['把鬆開的下眼瞼往外拉，看多出來多少；\n多出來的寬度，就是要切掉的楔形。',
          '切除量依鬆弛的程度調整；\n這台切多少，依院內常規。'],
  keys: [[0, '往外拉：<b>多出來的寬度</b>＝要切掉的楔形'],
         [1, '切除量依鬆弛程度調整；這台依院內常規']],
  src: [[0, 'Rubino 2024'], [1, 'Tao 2025']] },
{ id: '3-4', ch: 3, title: '全層楔形切除', layout: 'dual',
  lines: ['在外眥附近，把多出來的部分全層切除：\n皮膚、orbicularis、瞼板、結膜一起切。',
          '一篇回顧描述的形狀是一塊三角形；\n畫面的位置與寬度是示意。',
          'Hurwitz 把全層縮短放在外眥處，\n瞼緣就不會留下 notch。'],
  keys: [[0, '<b>全層</b>切除：皮膚、orbicularis、瞼板、結膜'],
         [1, '三角形（畫面的位置與寬度：示意）'],
         [2, '在外眥處縮短 → <b>瞼緣不留 notch</b>']],
  src: [[0, 'Tao 2025；Hurwitz 1987'], [2, 'Hurwitz 1987']] },
{ id: '3-5', ch: 3, title: '瞼板斷端縫到外側眶緣骨膜', layout: 'dual',
  lines: ['把瞼板斷端直接縫到外側眶緣的骨膜；\n縫線種類與針數，依院內常規。',
          '原本的外眥韌帶，附著在眶緣後方約 1.5 mm 的\nWhitnall 結節上。',
          'Hurwitz 認為，成敗取決於瞼板直接縫到骨膜；\n綁好之後，眼瞼變緊、貼回眼球（畫面示意）。',
          '這台固定在骨膜還是外眥韌帶的殘端，依院內常規；\n刀後依 OP note 確認。'],
  keys: [[0, '瞼板斷端 → <b>外側眶緣骨膜</b>（縫線、針數依院內常規）'],
         [1, '外眥韌帶附著在 <b>Whitnall 結節</b>：眶緣後方約 1.5 mm'],
         [2, '成敗取決於<b>瞼板直接縫到骨膜</b>'],
         [3, '固定在骨膜或韌帶殘端：依院內常規（刀後確認）']],
  src: [[0, 'Hurwitz 1987；院內常規'], [1, 'Gioia 1987'], [2, 'Hurwitz 1987'], [3, '院內常規']] },
{ id: '3-6', ch: 3, title: '重建外眥角，縫合', layout: 'dual',
  lines: ['接著把切口兩邊的瞼緣對齊，重建外眥角。',
          '再縫 orbicularis 與皮膚；\n層次與縫線依院內常規。',
          '這一步決定外眥角的形狀，\n收尾時要特別看。'],
  keys: [[0, '瞼緣對齊，<b>重建外眥角</b>'],
         [1, '縫 orbicularis 與皮膚（層次、縫線依院內常規）'],
         [2, '外眥角的形狀：收尾時特別看']],
  src: [[0, 'Tao 2025'], [1, '院內常規'], [2, 'Tao 2025']] },

// ---------------------------------------------------------------- 4 術中狀況與收尾
{ id: 'c4', chapterCard: 4 },
{ id: '4', ch: 4, title: '收尾看四件事', layout: 'dual',
  lines: ['收尾看四件事：睫毛離開角膜、眼瞼貼住眼球、\n瞼緣沒有 notch、外眥角的形狀。',
          '切除放在外眥處、瞼板斷端接回外眥，\n瞼緣就不會在眼瞼中間留下 notch。',
          'Bick 被批評的地方是外眥角變圓、往內移；\n重建外眥角時，上下眼瞼要對齊。',
          '不滿意時怎麼調整，依院內常規。'],
  keys: [[0, '睫毛離開角膜｜眼瞼貼住眼球｜<b>沒有 notch</b>｜<b>外眥角</b>形狀'],
         [1, '外眥處縮短 → 瞼緣中間不留 notch'],
         [2, '外眥角<b>變圓、往內移</b> → 重建時上下對齊'],
         [3, '不滿意時的調整：依院內常規']],
  src: [[1, 'Hurwitz 1987'], [2, 'Tao 2025'], [3, '院內常規']] },

// ---------------------------------------------------------------- 5 術後
{ id: 'c5', chapterCard: 5 },
{ id: '5', ch: 5, title: '術後追蹤', layout: 'full',
  lines: ['術後看三件事：睫毛不再碰到角膜、\n眼瞼貼住眼球、外眥角的位置與形狀。',
          'Quick strip 混合了 Bick 和 lateral tarsal strip：\n225 個眼瞼，完全矯正 92.4%，沒有一例外眥角變圓。',
          'Modified Bick 合併切除 orbicularis 與脫出的眶脂肪：\n70 個眼瞼平均追蹤 46.9 個月，復發 1.4%。',
          '拆線時間、用藥，以及角膜 SPK 的追蹤，依院內常規。'],
  keys: [[0, '睫毛不碰角膜｜眼瞼貼住眼球｜外眥角的位置與形狀'],
         [1, 'Quick strip：225 個眼瞼，完全矯正 <b>92.4%</b>，沒有外眥角變圓'],
         [2, 'Modified Bick＋orbicularis 與脂肪切除：70 個眼瞼，復發 <b>1.4%</b>'],
         [3, '拆線、用藥、角膜追蹤：依院內常規']],
  src: [[0, 'Tao 2025'], [1, 'Barrett 2012'], [2, 'Prendes 2020'], [3, '院內常規']] },

// ---------------------------------------------------------------- 6 跟刀清單
{ id: 'c6', chapterCard: 6 },
{ id: '6', ch: 6, title: '跟刀時看這八件事', layout: 'full', tail: 2.5,
  lines: ['跟刀時看這八件事；號碼和手術步驟圖一樣。',
          '一，術前看 distraction 和 snap-back，\n記下睫毛碰角膜、角膜下方的 SPK、糖尿病和抽菸。',
          '二，局部麻醉，畫外眥切開線和預計切除的楔形。',
          '三，lateral canthotomy 加 inferior cantholysis。',
          '四，把下眼瞼往外拉，看多出來多少，決定楔形寬度。',
          '五，在外眥處全層楔形切除：\n皮膚、orbicularis、瞼板、結膜一起切。',
          '六，瞼板斷端直接縫到外側眶緣的骨膜。',
          '七，重建外眥角、對齊，縫 orbicularis 和皮膚。',
          '八，收尾：睫毛離開角膜、眼瞼貼住眼球、\n沒有 notch、外眥角的形狀。'],
  keys: [[0, '術前 1 件、術中 6 件、收尾 1 件；藥物、寬度與縫線依院內常規。']],
  src: [[0, '本片各章來源']] },

// ---------------------------------------------------------------- 參考文獻
{ id: 'c7', chapterCard: 7 },
{ id: 'refs', ch: 7, title: '參考文獻', layout: 'refs', dur: 26, lines: [] },
];

const REFS = [
 'Bick MW. Surgical management of orbital tarsal disparity. Arch Ophthalmol 1966;75(3):386-9.',                                                      // doi:10.1001/archopht.1966.00970050388015 (no abstract)
 'Hurwitz JJ, Mishkin SK, Rodgers KJ. Modification of Bick\'s procedure for treatment of eyelid laxity. Can J Ophthalmol 1987;22(5):262-5.',           // PMID 3311321 (no DOI)
 'Vahdani K, Ford R, Garrott H, Thaller VT. Lateral tarsal strip versus Bick\'s procedure in correction of eyelid malposition. Eye (Lond) 2018;32(6):1117-1122.',   // doi:10.1038/s41433-018-0048-9
 'Poon JS, Vahdani K, Thaller VT. Comparison of four combined procedures for correction of involutional lower eyelid entropion. J Craniofac Surg 2019;30(4):1239-1244.',   // doi:10.1097/SCS.0000000000005466
 'Barrett RV, Meyer DR. The modified Bick quick strip procedure for surgical treatment of eyelid malposition. Ophthalmic Plast Reconstr Surg 2012;28(4):294-9.',   // doi:10.1097/IOP.0b013e31824e1240
 'Prendes MA, et al. Assessment of the safety and efficacy of prolapsed orbital fat resection during involutional entropion repair. Ophthalmic Plast Reconstr Surg 2020;36(1):34-37.',   // doi:10.1097/IOP.0000000000001452
 'Tao BK, et al. Ectropion repair techniques and the role of adjunctive superotemporal skin transposition for tarsal ectropion. J Clin Med 2025;14(3):827.',   // doi:10.3390/jcm14030827 (full text, PMC11818440)
 'Rubino C, et al. 3-Step combined technique for correction of involutional lower eyelid ectropion: a case series. J Clin Med 2024;14(1):128.',   // doi:10.3390/jcm14010128 (full text, PMC11721973)
 'Auguste LA, Nghiem AZ, Vahdani K. Horizontal eyelid shortening alone versus combined procedures for the correction of involutional lower eyelid entropion. Int Ophthalmol 2023;43(12):4979-4983.',   // doi:10.1007/s10792-023-02900-1
 'Pushker N, Mounica B, Agrawal S. Transconjunctival correction of involutional entropion: a video demonstration. Indian J Ophthalmol 2025;73(2):309.',   // doi:10.4103/IJO.IJO_630_24 (as in lower-lid-entropion-revision)
 'Beigi B, et al. Fornix fat prolapse as a sign for involutional entropion. Ophthalmology 2008;115(9):1608-12.',   // doi:10.1016/j.ophtha.2008.02.014 (as in lower-lid-entropion-revision)
 'Gioia VM, Linberg JV, McCormick SA. The anatomy of the lateral canthal tendon. Arch Ophthalmol 1987;105(4):529-32.',   // doi:10.1001/archopht.1987.01060040099042 (as in lower-lid-entropion-revision)
 'Anderson RL, Gordy DD. The tarsal strip procedure. Arch Ophthalmol 1979;97(11):2192-6.',   // doi:10.1001/archopht.1979.01020020510021 (PMID 508189; added 2026-11-23 for the video, abstract read)
];
if (typeof module !== 'undefined') module.exports = { VIDEO, SEGS, CHAPTERS, REFS };
