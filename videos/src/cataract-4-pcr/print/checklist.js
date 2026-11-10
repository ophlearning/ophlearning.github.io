// 跟刀清單: the PCR drill in the order of the video — recognise (2-1, 2-3–2-5), the first step (3-1, 3-2; I/A 3-4), assess (3-5), the remaining
// nucleus (4-1, 4-4), the vitreous (5-1, 5-2, 5-5), the IOL decision (6-1, 6-2) — the recommended practice of the video's sources, not case B's
// own sequence (the video describes that one without judging it). Numbers = the step numbers of steps.js.
PRINT.sheet({
  type: 'checklist', title: '跟刀清單：PCR 演練', sub: '跟刀前看一次；號碼＝手術步驟圖的號碼；建議做法依文獻',
  sources: ['Rajan 2025', 'Arbisser 2006', 'Burk 2003', 'Chang 2009', 'Suto 2003'],
  ledger: { '3': '結構', '12': '結構' },
  items: [
    { sec: '認出', act: '乳化中<b>前房突然變深</b>、<b>瞳孔一下子變大</b> → 先想到 <b>PCR</b>',
      note: '最常在吃最後一塊核、tip 離後囊最近時（Rajan 2025）' },
    { act: '<b>核塊不跟 tip</b>、轉不動、<b>一端歪下去</b>；red reflex 出現<b>特別清亮</b>的區域',
      note: '紅光弱的眼：清亮區不明顯 → 盯前房與核塊（推論）' },
    { sec: '當下第一步', act: '<b>不要突然抽出</b>：停止乳化、<b>phaco 留著</b> → <b>side port 打 dispersive OVD</b> 蓋住破口 → 穩了<b>再慢慢退</b>',
      note: '直接退出：前房變淺、玻璃體到切口、破口變大（Rajan 2025）' },
    { act: '<b>I/A 時破了</b>：一樣，<b>I/A 留著</b>、先打<b>大量 OVD</b> 再慢慢退；掉下去的核塊<b>不要追</b>',
      note: '剩下的皮質：降低瓶高，或用 vitrector 吸（Rajan 2025）' },
    { sec: '評估', act: '評估：<b>破口多大</b>、<b>剩多少核與皮質</b>、<b>玻璃體有沒有出來</b>',
      note: '團隊事先演練過這套流程（Arbisser 2006）' },
    { sec: '剩下的核與玻璃體', act: '核塊：<b>dispersive OVD</b> 墊著、<b>鈍器械墊在下面</b>、<b>低能量</b>乳化；太大 → <b>ECCE／SICS</b>',
      note: '已掉進玻璃體腔：<b>不撈</b>（巨大裂孔）→ 前段處理乾淨、轉 VR（Rajan 2025）' },
    { act: '玻璃體用 <b>vitrector 切</b>：<b>雙手</b>、灌流與切割分開，或經 <b>pars plana</b>（角膜緣後 <b>3.5–4 mm</b>）',
      note: 'TA 讓玻璃體看得見（Burk 2003）；不用棉棒、鑷子拉' },
    { sec: 'IOL 放哪裡', act: '囊袋完整 → <b>in the bag</b>；前囊完整 → <b>sulcus</b>（<b>3-piece</b>）或 <b>optic capture</b>；不夠 → 其他固定',
      note: 'one-piece 壓克力通常不放 sulcus；sulcus 度數 −1.00 D（Suto 2003）；備好 backup IOL（Chang 2009）' },
  ],
});
