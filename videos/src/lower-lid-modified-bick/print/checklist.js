// 跟刀清單: eight items (術前 1、術中 6、收尾 1). Steps follow the literature (no department template for this procedure): full-thickness
// shortening at the lateral canthus and the tarsus sutured to the orbital periosteum (Hurwitz 1987), resection tailored to the laxity and
// the edges realigned (Tao 2025), the lid pulled laterally to judge the excess (Rubino 2024). Whatever papers do differently, and every
// suture, is 依院內常規. Numbers = the step numbers of steps.js; each number is in ../check.js LEDGER (segment = item number).
PRINT.sheet({
  type: 'checklist', title: '跟刀清單', sub: '跟刀前看一次；號碼＝手術步驟圖的號碼',
  sources: ['Pushker 2025', 'Beigi 2008', 'Rubino 2024', 'Tao 2025', 'Hurwitz 1987', 'Auguste 2023'],
  items: [
    { sec: '術前', act: '看 <b>horizontal laxity</b>（distraction、snap-back）；記下 <b>trichiasis</b>、角膜 <b>inferior SPK</b>；DM（口服藥）、抽菸',
      note: 'Distraction 超過 6–8 mm 算明顯（Pushker 2025）；內翻病人量到 7.5–11 mm（Beigi 2008）' },
    { sec: '術中', act: '局部麻醉；畫<b>外眥切開線</b>與預計切除的<b>楔形</b>（藥物、位置、寬度依院內常規）' },
    { act: '<b>Lateral canthotomy</b>＋<b>inferior cantholysis</b>，外側下眼瞼鬆開（做法依院內常規）',
      note: '文獻做法不一：有的改良保留外眥韌帶、不切外眥（Rubino 2024）' },
    { act: '把下眼瞼<b>往外拉</b>，看<b>多出來多少</b> → 決定楔形寬度（依院內常規）',
      note: '切除量依 laxity 調整（Tao 2025）' },
    { act: '外眥處<b>全層楔形切除</b>：皮膚、orbicularis、瞼板、結膜一起切',
      note: '在外眥處全層縮短，瞼緣不會留 notch（Hurwitz 1987）' },
    { act: '<b>瞼板斷端</b>直接縫到<b>外側眶緣骨膜</b>（縫線、針數依院內常規）',
      note: '成敗取決於瞼板直接縫到眶緣骨膜（Hurwitz 1987）' },
    { act: '重建<b>外眥角</b>，斷端對齊；縫 orbicularis 與<b>皮膚</b>（層次、縫線依院內常規）',
      note: 'Bick 被批評的地方：外眥角變圓、往內移（Tao 2025）' },
    { sec: '收尾', act: '<b>睫毛離開角膜</b>、眼瞼<b>貼住眼球</b>、瞼緣<b>沒有 notch</b>、<b>外眥角</b>形狀',
      note: '只做水平縮短：復發 7%（4/54），合併術式 8%（Auguste 2023）' },
  ],
});
