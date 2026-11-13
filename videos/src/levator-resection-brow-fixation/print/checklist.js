// 跟刀清單: the eight items of segment 7 for an OU case (both upper lids), with the key numbers of the video and one sourced pitfall
// where the video has one. Numbers = the step numbers of steps.js.
PRINT.sheet({
  type: 'checklist', title: '跟刀清單', sub: '跟刀前看一次；號碼＝手術步驟圖的號碼；OU 兩眼的順序依院內常規',
  sources: ['Kokubo 2019a', 'Lam 2003', 'Eshraghi 2024', 'Takagi 2022', 'Pruksapong 2022', 'Lee 2024', 'Tucker 1999'],
  items: [
    { sec: '術前（兩眼）', act: '兩眼各量 <b>MRD1</b>、<b>levator function</b>：LF 良好 → 前路 levator 手術',
      note: 'Ptosis 矯正後 80–84% 的眉毛下降，平均 2.5–2.9 mm → 同台固定眉毛（Kokubo 2019a）' },
    { act: '病人<b>坐著</b>畫線：距睫毛線 內 <b>2.5</b>／中 <b>4</b>／外 <b>4 mm</b>，切除寬 <b>5 mm</b>；局麻、消毒（依院內常規）',
      note: '坐著畫，把重力對眼皮的影響算進去（Lam 2003）' },
    { sec: '術中①　Levator resection', act: '切除<b>皮膚＋皮下＋orbicularis</b> → 開眶隔 → <b>preaponeurotic fat</b> 往上撥，下面是 <b>aponeurosis</b>',
      note: '外側鼓起先想 lacrimal gland（prolapse 10–60%），不要當脂肪切掉（Eshraghi 2024）' },
    { act: 'Levator 從瞼板分開、往上分離 → <b>Putterman clamp</b> 夾住 → 切除多的那段（量依院內常規）' },
    { act: '斷端 <b>4-0 vicryl ×3</b> 固定瞼板 → 請病人<b>睜眼</b>：看<b>高度</b>與 <b>contour</b>',
      note: '術後高度和術中高度相關 r = 0.55；嚴重 ptosis 術後會再掉一點（Takagi 2022）' },
    { sec: '術中②　Internal brow fixation', act: '同一切口剝到眉下（<b>ROOF</b>），內側避開 <b>supraorbital nerve</b>；縫到骨膜 <b>4-0 vicryl ×1</b>；再量 <b>MRD1 約 2.5 mm</b>',
      note: '眶上切跡距中線約 22–24 mm（泰國屍體研究；Pruksapong 2022）' },
    { sec: '收尾（兩眼）', act: '兩眼都做完、睜眼對照<b>高度</b>、<b>contour</b>、<b>眉毛</b>；有沒有<b>結膜脫出</b> → 縫回穹窿或切除（依院內常規）',
      note: 'Conjunctival prolapse 最常見的原因是 blepharoptosis 手術，占 36.6%（Lee 2024）' },
    { act: '<b>6-0 Prolene ×4</b> 做雙眼皮線 → <b>7-0 ethilone</b> 縫皮 → <b>GM 藥膏</b>（依院內常規）',
      note: '術後 1 週只有 40% 到最終高度，52% 會再升高（Tucker 1999）' },
  ],
});
