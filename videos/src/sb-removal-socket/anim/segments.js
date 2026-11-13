// ============================================================================
// Scleral buckle removal in an eviscerated socket, assistant's pre-op preview — text of every segment: narration lines (= burned-in
// captions), key-point box, sources, chapter, title, layout. The drawing of each segment is in draw.js (DRAW2). Layout and timeline:
// videos/tools/video-kit. Every number comes from a PubMed-verified source (research/literature.md) or is marked 病例 / 結構 / 示意;
// check.js holds the ledger.
// Case (站長 2026-11-13): OS, eviscerated socket without an implant, an exposed and NTM-infected #41 encircling band (sewn with 5-0 Dacron,
// under the four recti); GA scleral buckle removal; 站長 is the assistant. The steps in between follow common practice (依主刀決定):
// the removal literature only says "removed", without a step-by-step technique (research/literature.md 題 1).
// ============================================================================
const VIDEO = {
  name: 'SB removal（eviscerated socket，助手版）',
  title: ['Eviscerated socket 的', 'scleral buckle removal'],
  subtitle: '助手版：看懂每一步，做對助手的事',
  line: '左眼 OS，暴露且 NTM 感染的 #41 encircling band',
  note: ['左眼示意動畫，不是手術錄影；比例不精確。', '藥物、器械與縫線，依院內常規與主刀決定。'],
};
const CHAPTERS = ['片頭', '這台刀的地圖', '暴露', '剪斷與抽出', '核對、檢體、清創', '收尾與術後', '助手清單', '參考文獻'];

const SEGS = [
// ---------------------------------------------------------------- 片頭
{ id: 'title', ch: 0, layout: 'title', lead: 1.2,
  lines: ['這支影片站在助手的位置，\n預習一台 scleral buckle removal。',
          '情境是左眼：evisceration 之後的眼窩裡，\n留著一條暴露、而且感染 NTM 的 encircling band。'] },

// ---------------------------------------------------------------- 1 這台刀的地圖
{ id: 'c1', chapterCard: 1 },
{ id: '1-1', ch: 1, title: 'Band 是怎麼留下來的', layout: 'dual',
  lines: ['2009 年，這隻左眼因為再次 RRD，\n縫了一條 #41 encircling band，寬 3.5 mm。',
          'Band 繞眼球一整圈，從四條直肌的底下穿過，\n用 5-0 Dacron 縫在鞏膜上。',
          '2023 年，角膜潰瘍做了 evisceration：\n清掉眼球內容物，保留鞏膜殼，沒有放植入物。',
          '手術紀錄沒有提到 band；\n所以 band 跟著鞏膜殼，留在眼窩裡。'],
  keys: [[0, '<b>#41 encircling band</b>（寬 3.5 mm）：繞一整圈、在<b>四條直肌底下</b>、<b>5-0 Dacron</b> 縫在鞏膜上。'],
         [2, '<b>Evisceration</b>：保留鞏膜殼、<b>沒有植入物</b> → band 留在鞏膜殼上。']],
  src: [[0, 'Gomaa 2017']] },
{ id: '1-2', ch: 1, title: '為什麼一定要拿掉', layout: 'dual',
  lines: ['現在 band 從結膜露出來，\n周圍長肉芽組織、流膿，培養長出 NTM。',
          'NTM 是非結核分枝桿菌：139 例 NTM 眼部感染裡，\nbuckle 感染占 14.8%，眼窩與植入物感染也占 14.8%。',
          'NTM 會在植入物表面形成 biofilm，\n擋住抗生素，感染就一直好不了。',
          '所以共同的做法是：拿掉 buckle，\n再依藥敏用抗生素。'],
  keys: [[0, '暴露＋肉芽組織＋流膿；培養：<b>NTM</b>。'],
         [2, '<b>Biofilm</b> 擋住抗生素 → 只用藥好不了。'],
         [3, '<b>拿掉 buckle</b>，再依藥敏用藥。']],
  src: [[1, 'Girgis 2012'], [2, 'Das 2024'], [3, 'Smiddy 1991；Das 2024']] },

// ---------------------------------------------------------------- 2 暴露
{ id: 'c2', chapterCard: 2 },
{ id: '2-1', ch: 2, title: '拿掉 conformer，找到暴露處', layout: 'dual',
  lines: ['全身麻醉：一個 102 眼的系列大多用全麻，\n因為拆除時可能弄破鞏膜。',
          '消毒鋪單、放開瞼器，先拿掉 conformer。\n術者坐 12 點：畫面下方是 12 點，temporal 在左。',
          '四條直肌在 12、3、6、9 點；\nband 繞著鞏膜殼，從它們底下穿過。',
          '先找到 band 露出來的地方，說出在幾點鐘：\n延遲拆除的 50 眼裡，暴露多在上方偏鼻側或顳側。',
          '這位病人的位置病歷沒寫；\n本片畫在 1 點半，上方偏顳側，是示意。'],
  keys: [[1, '術者坐 12 點：<b>下＝12 點</b>、<b>temporal 在左</b>。'],
         [3, '先找<b>暴露處</b>，說出鐘點。'],
         [4, '先找<b>暴露處</b>，說出鐘點（本片 1 點半為示意）。']],
  src: [[0, 'Kazi 2015'], [1, ''], [3, 'Zhang 2026'], [4, '']] },
{ id: '2-2', ch: 2, title: '打開結膜、Tenon 與纖維囊', layout: 'dual',
  lines: ['主刀從暴露處開始，\n沿著 band 往兩側剪開結膜和 Tenon。',
          'Band 外面會長一層纖維囊；\n剪開這層囊，才碰得到 band。',
          '助手用 cotton tip 拉開組織、吸乾淨、止血，\n讓主刀看得到 band 和縫線。',
          '打開多大範圍，依主刀決定。'],
  keys: [[1, 'Band 外面有<b>纖維囊</b>，要剪開。'],
         [2, '助手：<b>拉開、吸乾淨、止血</b>，讓主刀看得到 band 與縫線。']],
  src: [[1, 'Lee 2013'], [2, '']] },

// ---------------------------------------------------------------- 3 剪斷與抽出
{ id: 'c3', chapterCard: 3 },
{ id: '3-1', ch: 3, title: '剪斷固定縫線', layout: 'dual',
  lines: ['Band 被跨在上面的 Dacron 縫線，\n固定在鞏膜上。',
          '縫線也會長菌：102 眼裡，縫線長出菌的比例 84%，\n和 band 本身的 90% 差不多。',
          '所以看到縫線就剪斷、整條拿出來，\n和 band 一起送檢。',
          '縫線有幾條、在哪裡，病歷沒有寫；\n畫面上每個象限一條，是示意。'],
  keys: [[1, '縫線長菌 <b>84%</b>、band <b>90%</b>。'],
         [2, '縫線長菌 <b>84%</b>、band <b>90%</b> → 縫線<b>剪斷、整條拿出</b>，一起送檢。']],
  src: [[1, 'Kazi 2015'], [2, 'Kusaka 2021'], [3, '']] },
{ id: '3-2', ch: 3, title: '剪斷 band', layout: 'dual',
  lines: ['在暴露處剪斷 band。',
          '剪之前，先抓好要拉的那一端。',
          '先剪縫線還是先剪 band，依主刀決定。'],
  keys: [[0, '在<b>暴露處</b>剪斷；剪之前先抓好一端。']] },
{ id: '3-3', ch: 3, title: '從直肌底下抽出', layout: 'dual',
  lines: ['主刀夾住一端往外拉，\nband 沿著原本的路線繞出來。',
          '經過直肌時，助手用 muscle hook 勾起那條肌肉，\nband 才能從底下滑出。',
          '拉不動就停：多半還有縫線或纖維囊套住，\n先找出來剪開，不要硬拉。',
          '硬拉會出事：102 眼的拆除裡，\n鞏膜穿破 13.7%，肌肉意外脫離 1 眼。'],
  keys: [[1, '經過直肌：助手用 <b>muscle hook 勾起</b>那條肌肉。'],
         [2, '<b>拉不動就停</b>：找出還套著的縫線或纖維囊，先剪開。'],
         [3, '<b>拉不動就停</b>：鞏膜穿破 <b>13.7%</b>、肌肉脫離 1 眼。']],
  src: [[3, 'Kazi 2015']] },

// ---------------------------------------------------------------- 4 核對、檢體、清創
{ id: 'c4', chapterCard: 4 },
{ id: '4-1', ch: 4, title: '核對：拿乾淨了嗎', layout: 'dual',
  lines: ['拿出來之後，和主刀一起核對：\n兩端都在、是完整的一圈，沒有一段斷在裡面。',
          '找到的縫線，也都拿出來了。',
          '完整拿出很重要：有作者認為，band 完整拿出、\n又沒有眼窩侵犯時，全身用藥可以短一點。'],
  keys: [[0, '核對：<b>兩端都在、完整一圈</b>。'],
         [1, '核對：<b>兩端都在、完整一圈</b>；縫線也拿乾淨。']],
  src: [[2, 'Rujkorakarn 2025']] },
{ id: '4-2', ch: 4, title: '檢體與清創', layout: 'dual',
  lines: ['Band、縫線和肉芽組織放進無菌容器送培養，\n標明要做抗酸染色與 mycobacteria 培養。',
          '菌種要鑑定到亞種：\nM. abscessus 可能對 clarithromycin 有抗藥性。',
          '培養用的檢體不泡 formalin；\n要做病理的，另外分一份，依院內常規。',
          '接著清除肉芽組織、沖洗：個案報告用過\npovidone-iodine 或 amikacin；用什麼依主刀決定。'],
  keys: [[0, '檢體：<b>無菌容器</b>，標明<b>抗酸染色＋mycobacteria 培養</b>。'],
         [1, '檢體：<b>無菌容器</b>，標明<b>抗酸染色＋mycobacteria 培養</b>；菌種鑑定到<b>亞種</b>。'],
         [2, '培養檢體<b>不泡 formalin</b>，病理另外一份。']],
  src: [[0, 'Das 2024'], [1, 'Rujkorakarn 2025'], [2, '院內常規'], [3, 'Rujkorakarn 2025；Das 2024']] },

// ---------------------------------------------------------------- 5 收尾與術後
{ id: 'c5', chapterCard: 5 },
{ id: '5-1', ch: 5, title: '收尾：結膜與 conformer', layout: 'dual',
  lines: ['結膜要不要縫、縫到哪裡，依主刀決定；\n有 NTM 的個案報告刻意不縫，讓分泌物流出來。',
          '最後放回 conformer、上藥膏、包眼。',
          'Conformer 撐住結膜囊，\n防止結痂、眼窩縮小。'],
  keys: [[1, '放回 <b>conformer</b>、藥膏、包眼。'],
         [2, '放回 <b>conformer</b>：撐住結膜囊、防止縮小。']],
  src: [[0, 'Rujkorakarn 2025'], [2, 'Koch 2016']] },
{ id: '5-2', ch: 5, title: '為什麼這次不放植入物', layout: 'dual',
  lines: ['感染時能不能同時放植入物，文獻沒有共識：\n有的系列建議避免，有的主張一期就放。',
          '而且那些研究多是一般細菌的眼內炎，\n不是 NTM。',
          'NTM 感染的無眼球眼窩：沒察覺 NTM\n就修補暴露的植入物，很快又復發。',
          '所以先拿掉 band、控制感染，再談重建：\n這是推論，不是文獻的建議。'],
  keys: [[0, '感染時放植入物：<b>沒有共識</b>，研究多是一般細菌。'],
         [2, '沒察覺 NTM 就修補 → <b>很快復發</b>。'],
         [3, '先控制感染、再談重建（<b>推論</b>）。']],
  src: [[0, 'Lai 2023；Alrashed 2026'], [2, 'Choi 2018'], [3, '']] },
{ id: '5-3', ch: 5, title: 'NTM 的用藥交給誰', layout: 'dual',
  lines: ['139 例 NTM 眼部感染的藥敏：\n對 amikacin 敏感 81%、對 clarithromycin 敏感 93%。',
          '用藥多久沒有標準答案：綜論建議至少兩種藥，\n症狀消失後再續 4 週到 6 個月。',
          '有眼窩侵犯時，通常要更久；\n藥物與療程，依培養、藥敏和感染科。'],
  keys: [[0, '藥敏：amikacin 敏感 <b>81%</b>、clarithromycin 敏感 <b>93%</b>。'],
         [1, '<b>至少兩種藥</b>；症狀消失後再續 <b>4 週到 6 個月</b>。'],
         [2, '<b>至少兩種藥</b>；症狀消失後再續 <b>4 週到 6 個月</b>；眼窩侵犯更久，<b>依感染科</b>。']],
  src: [[0, 'Girgis 2012'], [1, 'Das 2024'], [2, 'Rujkorakarn 2025']] },

// ---------------------------------------------------------------- 6 助手清單
{ id: 'c6', chapterCard: 6 },
{ id: '6', ch: 6, title: '助手記住這六件事', layout: 'full', tail: 2.5,
  lines: ['助手記住這六件事。',
          '一，先定好方位：術者坐 12 點，\n下方是 12 點，左眼的 temporal 在左。',
          '二，暴露：拉開、吸乾淨、止血，\n讓主刀看得到 band 和縫線。',
          '三，經過直肌時，用 muscle hook 勾起肌肉；\n拉不動就說，先找縫線或纖維囊。',
          '四，核對：兩端都在、完整一圈，\n縫線也拿乾淨。',
          '五，檢體放無菌容器、不泡 formalin，\n標明抗酸染色與 mycobacteria 培養。',
          '六，術後：用藥依培養與感染科，\n重建等感染控制後再談。'],
  keys: [[0, '步驟的來源見各章；藥物、器械與縫線，依院內常規與主刀決定。']],
  src: [[0, '本片各章來源']] },

// ---------------------------------------------------------------- 參考文獻
{ id: 'c7', chapterCard: 7 },
{ id: 'refs', ch: 7, title: '參考文獻', layout: 'refs', dur: 30, lines: [] },
];

// PubMed-verified (research/literature.md); the year is the print issue's year (Girgis, Das, Lai went online a year earlier)
const REFS = [
  'Gomaa AR, Elbaha SM. Applying sutureless encircling number 41 band and transscleral chandelier-assisted laser retinopexy for scleral buckling procedure. J Ophthalmol 2017;2017:4671305.',
  'Girgis DO, Karp CL, Miller D. Ocular infections caused by non-tuberculous mycobacteria: update on epidemiology and management. Clin Exp Ophthalmol 2012;40(5):467-75.',
  'Das S, Murthy SI, Padhi TR, et al. Ocular infections associated with atypical mycobacteria: a review. Indian J Ophthalmol 2024;72(1):19-28.',
  'Smiddy WE, Miller D, Flynn HW. Scleral buckle infections due to atypical mycobacteria. Retina 1991;11(4):394-8.',
  'Kazi MS, Sharma VR, Kumar S, Bhende P. Indications and outcomes of scleral buckle removal in a tertiary eye care center in South India. Oman J Ophthalmol 2015;8(3):171-4.',
  'Zhang C, AbouKasm G, Yannuzzi NA, Smiddy WE, Flynn HW. Delayed scleral buckle removal in cases of exposure, extrusion, and infection: clinical features, microbiologic aspects, and clinical outcomes. J Vitreoretin Dis 2026;10(3).',
  'Lee KS, Sung KR, Na JH, et al. Clinical results of modified anterior chamber tube shunt to an encircling band surgery for uncontrolled intraocular pressure. J Glaucoma 2013;22(2):140-4.',
  'Kusaka M, Kagitani Y, Hama S, Kita M. Scleral buckle infection caused by Mycobacterium chelonae: a case report. Int Med Case Rep J 2021;14:51-3.',
  'Rujkorakarn P, Patamatamkul S. Orbital cellulitis associated with scleral buckle infection caused by macrolide-resistant Mycobacterium abscessus complex: a case report and literature review. Infect Drug Resist 2025;18:2489-95.',
  'Koch KR, Trester W, Müller-Uri N, et al. [Ocular prosthetics. Fitting, daily use and complications]. Ophthalmologe 2016;113(2):133-42.',
  'Lai KKH, Au AKH, Kuk AKT, et al. Surgical outcomes of orbital evisceration with primary orbital implant placement in patients with endophthalmitis. Eye (Lond) 2023;37(7):1361-4.',
  'Alrashed S, Alnefaim M, Althaqib RN, Alsulaiman HM. Outcomes of primary orbital implantation in evisceration/enucleation in patients with endophthalmitis in a tertiary hospital. BMC Ophthalmol 2026;26(1).',
  'Choi YJ, Oh EK, Lee MJ, et al. Atypical mycobacterial infection in anophthalmic sockets with porous orbital implant exposure. Am J Ophthalmol 2018;195:131-42.',
];
if (typeof module !== 'undefined') module.exports = { VIDEO, SEGS, CHAPTERS, REFS };
