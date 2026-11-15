// 跟刀清單 (assistant's version): what the assistant does or watches for, in the order of the video; each number is in the video's
// ledger (check.js) and each source in the footer. Numbers = the step numbers of steps.js.
PRINT.sheet({
  type: 'checklist', title: '跟刀清單（助手）', sub: '跟刀前看一次；號碼＝手術步驟圖的號碼；步驟順序與範圍依主刀決定',
  sources: ['Zhang 2026', 'Lee 2013', 'Kazi 2015', 'Rujkorakarn 2025', 'Das 2024'],
  ledger: { '12': '結構', '3': '結構', '6': '結構', '9': '結構' },
  items: [
    { sec: '術前', act: '<b>左眼 OS</b>、術者坐 12 點：<b>下＝12 點</b>、<b>temporal 在左</b>；直肌在 12、3、6、9 點，<b>band 在它們底下</b>',
      note: '#41 band、5-0 Dacron 縫在鞏膜上（2009 年 OP note）' },
    { sec: '術中', act: '拿掉 <b>conformer</b>，找到<b>暴露處</b>、說出幾點（本單畫在 1 點半，示意）',
      note: '延遲拆除 50 眼：暴露多在上方偏鼻側或顳側（Zhang 2026）' },
    { act: '打開結膜、Tenon 與<b>纖維囊</b>：助手<b>拉開、吸乾淨、止血</b>',
      note: 'band 外面包一層纖維囊（Lee 2013）；範圍依主刀' },
    { act: '<b>Dacron 縫線剪斷、整條拿出</b>，和 band 一起送檢',
      note: '縫線長菌 84%、band 90%（102 眼，Kazi 2015）' },
    { act: '在暴露處<b>剪斷 band</b>；剪之前<b>先抓好要拉的一端</b>',
      note: '先剪縫線或先剪 band：依主刀' },
    { act: '抽出：經過直肌時用 <b>muscle hook 勾起</b>；<b>拉不動就停、說出來</b>',
      note: '硬拉：鞏膜穿破 13.7%、肌肉脫離 1 眼（Kazi 2015）' },
    { act: '核對<b>兩端都在、完整一圈</b>；檢體<b>無菌容器、不泡 formalin</b>，標明<b>抗酸染色＋mycobacteria 培養</b>',
      note: '菌種到亞種：M. abscessus 可能對 clarithromycin 抗藥' },
    { sec: '收尾與術後', act: '清創沖洗、結膜縫合<b>依主刀</b>；放回 <b>conformer</b>、藥膏、包眼；<b>不放植入物</b>',
      note: '用藥依培養、藥敏與感染科（Das 2024）' },
  ],
});
