// 跟刀清單 of the 2026-11-23 case (OS upper lid, second operation): 術前 2 (this case; the lashes), rotation 2, height → levator
// advancement or not 2, closure 1. Steps and numbers come from segment 7 of the video and its ledger; this case's numbers are in the
// print ledger as 病例 (the case summary the site owner confirmed). Numbers = the step numbers of steps.js.
PRINT.sheet({
  type: 'checklist', title: '跟刀清單', sub: '跟刀前看一次；號碼＝手術步驟圖的號碼',
  sources: ['Cruz 2015a', 'Cruz 2023', 'Tucker 2000'],
  ledger: { '2023': '病例', '0.5': '病例', '1.5': '病例', '3': '病例', '7': '病例' },
  items: [
    { sec: '術前（本台）', act: '<b>OS</b> 上眼瞼、<b>二次手術</b>（2023 年做過 upper LR、Hotz）；MRD1 OS <b>+0.5 mm</b>（OD +1.5）、LMF OS <b>3 mm</b>（OD 7）',
      note: '已向病人說明：效果有限、可能要第二次手術；術前電解睫毛是暫時處置，不在這台裡' },
    { act: '看清楚碰角膜的睫毛：<b>entropion</b>、<b>misdirected</b> 還是 <b>metaplastic</b>（角膜 superior SPK）；備<b>眼球保護蓋</b>',
      note: '只轉瞼緣可能不夠：60 片眼瞼中 1 片瞼緣位置正確，內側仍有 2 根碰角膜（Cruz 2015a）' },
    { sec: '術中①　Marginal rotation（從 lid crease 進去）', act: '依院內常規畫線：距睫毛線 內側 <b>2.5</b>、中央 <b>4</b>、外側 <b>4 mm</b>（二次手術：位置與剝離依主治）；掀起皮膚肌肉瓣，露出瞼板到<b>睫毛根</b>',
      note: '睫毛根附近的 orbicularis 要剝乾淨：縫線縫在這裡（Cruz 2015a）' },
    { act: '<b>瞼板全層切開</b>（位置依院內常規）→ 縫線把遠端瞼板拉過瞼緣段，<b>瞼緣往外轉</b>（針數、縫線依院內常規）',
      note: 'Contour 異常是 margin rotation 最常見的併發症之一：縫線要分散（Cruz 2015a）' },
    { sec: '術中②　看高度 → 要不要 levator advancement', act: '轉正後請病人<b>睜眼</b>：看<b>高度</b>、<b>contour</b>、瞼緣方向 → <b>主治決定</b>要不要做 levator advancement',
      note: 'Cruz 的做法也是先轉瞼緣，再坐起來看位置，需要時才調 aponeurosis（Cruz 2015a）' },
    { act: '若做（依院內常規）：切除 <b>5 mm</b> 寬的皮膚肌肉 → 開眶隔 → levator 從瞼板分開、前徙（量依主治）→ <b>4-0 vicryl 三針</b>固定瞼板；再看高度、contour、有沒有<b>又往內翻</b>',
      note: 'Ptosis 手術後的 entropion：瞼板摺起來的位置 70% 在上三分之一（Cruz 2023）' },
    { sec: '收尾', act: '<b>睜眼、閉眼</b>一起看：高度、contour、瞼緣方向、閉眼；縫皮 <b>7-0 ethilone</b>，有做 levator 時先用 <b>6-0 Prolene ×4</b> 縫到 orbicularis（依院內常規）',
      note: 'Ptosis 修復後閉不緊：第 1 天 60%、1 週 33%、6–20 週 9%（Tucker 2000）' },
  ],
});
