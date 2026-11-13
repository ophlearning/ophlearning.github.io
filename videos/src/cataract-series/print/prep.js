// 術前核對與備料: what to check before the patient goes in, and the risk factors that change who operates or what to have ready. New
// content (the videos left pre-op risk out on purpose; cataract-series/spec.md): every statement comes from the abstract of the cited paper
// (PubMed, read 2026-11-12; full texts were not reachable from this environment, so no per-factor odds ratios), the backup IOL from video
// ④ (Chang 2009). Devices and drugs are 依院內常規: the papers say what kind of tool, not which product.
PRINT.sheet({
  type: 'checklist', title: '術前核對與備料', sub: '進刀房前看一次；風險因子有任一項，先告訴主治',
  note: '術前核對用；器材、藥物與流程依院內常規。',
  surgery: ['白內障 phaco 系列 ①–④', '術前：核對、風險因子、要先備好的東西', '每一台都看'],
  sources: ['Chang 2009', 'Narendran 2009', 'Chang 2005', 'Chang 2008', 'Shingleton 2017', 'Melles 1999', 'Langwińska-Wośko 2011', 'Osher 1990'],
  ledger: { '1': '結構', '3': '結構', '63': 'Chang 2005', '55': 'Narendran 2009', '567': 'Narendran 2009', '1.92': 'Narendran 2009',
    '26.0': 'Narendran 2009', '22': 'Langwińska-Wośko 2011', '31': 'Osher 1990', '26': 'Osher 1990' },
  items: [
    { sec: '核對', act: '<b>眼別</b>、<b>IOL 型號與度數</b>：和 <b>biometry 報告</b>一致（依院內常規）' },
    { act: '<b>備用 IOL</b>：<b>3-piece</b>（後囊破、前囊完整時放 sulcus）',
      note: 'one-piece 壓克力放 sulcus：30 人中 93% 要再手術（Chang 2009）' },
    { act: '散瞳後瞳孔<b>夠不夠大</b>？不夠 → 備<b>擴瞳器材</b>（依院內常規）',
      note: '瞳孔越小，PCR／玻璃體流失越多（55,567 台，Narendran 2009）' },
    { sec: '風險因子（有就先告訴主治）', act: '<b>α1 阻斷劑</b>（tamsulosin 等）<b>現在或以前</b>用過 → 預期 <b>IFIS</b>：備<b>高黏度 OVD</b>、<b>擴瞳器材</b>',
      note: 'tamsulosin 病人 63% 出現 IFIS（Chang 2005）；sphincterotomy、拉瞳孔無效，術前停藥效果存疑（Chang 2008）' },
    { act: '<b>PXF／phacodonesis</b>：zonule 弱 → 備 <b>CTR</b>、capsule hook（依院內常規）',
      note: 'PCR／玻璃體流失較多（Narendran 2009）；術後 IOL 偏位較多，不縫的 CTR 擋不住（Shingleton 2017）' },
    { act: '<b>White／brunescent</b>、<b>紅光反射弱或沒有</b> → 備 <b>trypan blue</b> 染前囊',
      note: '沒有紅光反射，撕囊邊緣看不到；染色後看得到（成熟白內障，Melles 1999）' },
    { act: '<b>Posterior polar cataract</b> → <b>資深醫師做</b>、<b>不做 hydrodissection</b>（22 眼系列，Langwińska-Wośko 2011）',
      note: '混濁黏在特別薄的後囊上：31 眼中 PCR 26%（Osher 1990）' },
    { act: '<b>眼軸 ≥ 26.0 mm</b>、<b>glaucoma</b>、<b>diabetic retinopathy</b>、<b>看不到眼底</b>、<b>不能平躺</b>、年紀大、男性',
      note: '都是 PCR／玻璃體流失的風險因子；整體 1.92%（55,567 台，Narendran 2009）' },
    { act: '<b>住院醫師主刀</b>本身也是風險因子 → 合併上面任一項，<b>先和主治討論</b>',
      note: '高風險可以事先預測：用來說明同意書、預作準備（Narendran 2009）' },
  ],
});
