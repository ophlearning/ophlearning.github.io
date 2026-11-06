// 跟刀清單: the eight items of segment 7 (術前 1、rotation 2、levator 2、眉毛 1、電解與收尾 2), with the key numbers of the video and one
// sourced pitfall where the video has one. Numbers = the step numbers of steps.js.
PRINT.sheet({
  type: 'checklist', title: '跟刀清單', sub: '跟刀前看一次；號碼＝手術步驟圖的號碼',
  sources: ['Cruz 2015a', 'Cruz 2023', 'Elder 1997', 'Tucker 2000'],
  items: [
    { sec: '術前', act: '看清楚每一根碰到角膜的睫毛：<b>entropion</b>、<b>misdirected</b> 還是 <b>metaplastic</b>',
      note: '只轉瞼緣可能不夠：60 片眼瞼中 1 片瞼緣位置正確，內側仍有 2 根碰角膜（Cruz 2015a）' },
    { sec: '術中①　Marginal rotation（從 lid crease 進去）', act: '依院內常規畫線：距睫毛線 內側 <b>2.5</b>、中央 <b>4</b>、外側 <b>4 mm</b>（之後 levator 用同一條）；掀起皮膚肌肉瓣，露出瞼板到<b>睫毛根</b>',
      note: '睫毛根附近的 orbicularis 要剝乾淨：縫線縫在這裡（Cruz 2015a）' },
    { act: '<b>瞼板全層切開</b>（位置依院內常規）→ 縫線把遠端瞼板拉過瞼緣段，<b>瞼緣往外轉</b>（針數、縫線依院內常規）',
      note: 'Contour 異常是 margin rotation 最常見的併發症之一：縫線要分散（Cruz 2015a）' },
    { sec: '術中②　Levator resection', act: '轉正之後再做 levator：切除 <b>5 mm</b> 寬的皮膚肌肉 → 開眶隔 → <b>Putterman clamp</b> 切除（依院內常規）' },
    { act: '<b>4-0 vicryl ×3</b> 固定瞼板（依院內常規）；請病人睜眼看<b>高度</b>、<b>contour</b>，以及瞼緣有沒有<b>又往內翻</b>',
      note: 'Ptosis 手術後的 entropion：瞼板摺起來的位置 70% 在上三分之一（Cruz 2023）' },
    { sec: '術中③　Internal brow fixation', act: '往上剝到眉下，避開 <b>supraorbital nerve</b>；眉下組織縫到骨膜 <b>4-0 vicryl ×1</b>；再量 <b>MRD1 約 2.5 mm</b>（依院內常規）' },
    { sec: '電解與收尾', act: '轉正後<b>還碰到角膜</b>的睫毛：細針<b>沿睫毛幹</b>進到毛囊電解（機器、能量、根數依院內常規）',
      note: '上眼瞼毛囊約 1.8 mm 深；要碰到 95% 的毛囊，針要插 2.4 mm（Elder 1997）' },
    { act: '<b>睜眼、閉眼</b>一起看：高度、contour、瞼緣方向、閉眼；<b>6-0 Prolene ×4</b>、<b>7-0 ethilone</b> 縫合（依院內常規）',
      note: 'Ptosis 修復後閉不緊：第 1 天 60%、1 週 33%、6–20 週 9%（Tucker 2000）' },
  ],
});
