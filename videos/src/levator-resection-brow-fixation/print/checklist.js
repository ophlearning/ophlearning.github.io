// 跟刀清單: the items of segment 7 for an OS case (left upper lid, levator resection only; the brow fixation item is left out), with the
// key numbers of the video, this case's numbers (病例: the clinic values the site owner gave with the 2026-11-23 case summary) and one
// sourced pitfall where the video has one. Numbers = the step numbers of steps.js.
PRINT.sheet({
  type: 'checklist', title: '跟刀清單', sub: '跟刀前看一次；號碼＝手術步驟圖的號碼；本台只開 OS',
  sources: ['Chen 2016', 'Lam 2003', 'Eshraghi 2024', 'Takagi 2022', 'Lee 2024', 'Tucker 1999'],
  ledger: { '0.5': '病例', '11': '病例' },
  items: [
    { sec: '術前（OS）', act: '量 <b>MRD1</b>、<b>levator function</b>：本台 OD、OS 都是 MRD1 <b>+0.5 mm</b>、LMF <b class="nw">11 mm</b>；這次只開 <b>OS</b>',
      note: '單側手術：術後另一眼（OD）可能跟著往下掉（Hering\'s law；Chen 2016）' },
    { act: '病人<b>坐著</b>畫線：距睫毛線 內 <b>2.5</b>／中 <b>4</b>／外 <b>4 mm</b>，切除寬 <b>5 mm</b>；局麻、消毒（依院內常規）',
      note: '坐著畫，把重力對眼皮的影響算進去（Lam 2003）' },
    { sec: '術中　Levator resection', act: '切除<b>皮膚＋皮下＋orbicularis</b> → 開眶隔 → <b>preaponeurotic fat</b> 往上撥，下面是 <b>aponeurosis</b>',
      note: '外側鼓起先想 lacrimal gland（prolapse 10–60%），別當脂肪切掉（Eshraghi 2024）' },
    { act: 'Levator 從瞼板分開、往上分離 → <b>Putterman clamp</b> 夾住 → 切除多的那段（量依院內常規）' },
    { act: '斷端 <b>4-0 vicryl ×3</b> 固定瞼板 → 請病人<b class="nw">睜眼</b>：看<b>高度</b>與 <b>contour</b>',
      note: '術後高度和術中高度相關 r = 0.55；嚴重 ptosis 術後會再掉一點（Takagi 2022）' },
    { sec: '收尾（OS）', act: '睜眼再看 OS 的<b>高度</b>、<b>contour</b>；有沒有<b>結膜脫出</b> → 發生時才處理：縫回穹窿或切除（依院內常規）',
      note: 'Conjunctival prolapse 最常見的原因是 blepharoptosis 手術占 36.6%（Lee 2024）' },
    { act: '<b>6-0 Prolene ×4</b> 做雙眼皮線 → <b>7-0 ethilone</b> 縫皮 → <b>GM 藥膏</b>（依院內常規）',
      note: '術後 1 週只有 40% 到最終高度，52% 會再升高（Tucker 1999）' },
  ],
});
