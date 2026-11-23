// 跟刀清單: eight items in the order of the case (術前 2、切除送病理 2、基底 cryotherapy 3、收尾 1). Position and size of the lesion are
// not in the clinic record: left as [ ] to fill in by hand. Numbers = the step numbers of steps.js; every other number is in ../check.js LEDGER.
PRINT.sheet({
  type: 'checklist', title: '跟刀清單', sub: '跟刀前看一次；號碼＝手術步驟圖的號碼；[　] 現場手寫',
  sources: ['Kersten 1997', 'Custer 2024', 'Elder 1997', 'Sullivan 1976', 'Wingfield 1979', 'Fraunfelder 1979'],
  items: [
    { sec: '術前', act: '核對 <b>OD 上眼瞼</b>、病程 <b>2 週</b>；病灶在 <b>[瞼緣／皮膚面]</b>、大小 <b>[　　] mm</b>（門診紀錄沒寫）；畫出切除範圍',
      note: '臨床看似良性的 692 個眼瞼病灶，13 個（1.9%）病理是惡性（Kersten 1997）' },
    { act: '<b>局部麻醉</b>：打在病灶下方的皮下（藥物、劑量依院內常規）' },
    { sec: '術中①　切除送病理', act: '<b>Shave 或 excision</b>（依院內常規）：切在 <b>orbicularis 之上</b>，整顆完整拿下（深度示意）',
      note: '在瞼緣：150 個瞼緣 nevus 用 superficial excision＋cauterization，術後可見 trichiasis（Custer 2024）' },
    { act: '標本<b>全部送病理</b>：臨床診斷 <b>wart</b>、病程 <b>2 週</b>、OD 上眼瞼',
      note: '看似良性卻是惡性的 13 個中 10 個是 BCC；切下的眼瞼病灶都要送病理（Kersten 1997）' },
    { sec: '術中②　基底 cryotherapy', act: '先<b>保護眼球</b>（保護片等，依院內常規）；探頭與冰球<b>不碰結膜、角膜</b>',
      note: '冷凍傷到眼球的報告見於治療結膜、角膜病灶，治療眼瞼病灶時沒有（Wingfield 1979）' },
    { act: '探頭放在<b>基底</b>，冰球蓋過整個基底（示意）；<b>freeze–thaw 次數、時間依院內常規</b>' },
    { act: '<b>靠近瞼緣</b>：冰球蓋到<b>睫毛毛囊</b>，睫毛會掉；上眼瞼毛囊約 <b>1.8 mm</b> 深（Elder 1997）',
      note: '瞼緣 2 個 freeze–thaw 到 −30 °C，正是破壞睫毛的 trichiasis 療法（Sullivan 1976）' },
    { sec: '收尾', act: '止血、傷口與藥膏依院內常規；告知病人：<b>紅腫、水泡</b>，日後可能<b>色素脫失</b>、<b>睫毛脫落</b>、疤痕',
      note: '副作用見 Wingfield 1979；色素深的人，瞼緣冷凍治 trichiasis 列為禁忌（Fraunfelder 1979）' },
  ],
});
