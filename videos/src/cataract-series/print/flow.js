// 白內障全流程: one routine phaco from the side port to the closed wound (15 steps) and the first action for each complication the
// videos teach, condensed from the four videos' checklists (cataract-1…4/print/checklist.js) with no new content: every step keeps
// the video's wording of the action and its marks (示意, 常用做法, 依院內常規). The numbers' sources: 2 mm = Ernest 1995 (video ① 3-1),
// 5.0–5.5 mm = Hollick 1999 (① 1-1); pedal positions, 90°, 360° and 12 o'clock are structure.
PRINT.sheet({
  type: 'flow', title: '白內障全流程', sub: '一台 routine phaco 從頭到尾；出事時看下方的框',
  note: '依四支教學影片的跟刀單整理；各院做法不同處依院內常規。',
  sources: ['Ernest 1995', 'Hollick 1999'],
  ledger: { '1': '結構', '3': '結構', '12': '結構', '90': '結構', '360': '結構' },
  phases: [
    { sec: '① 切口與 CCC', items: [
      '<b>Side port</b>：<b>左手側</b>（nasal）',
      '<b>OVD</b>：<b><span class="nw">撐滿前房</span>、<span class="nw">壓平前囊</span></b>',
      '<b>主切口</b>：三平面，隧道<b class="nw">約 2 mm</b>、<b>長≈寬</b>',
      '<b>CCC</b>：<b>沿切線拉</b>、夾<b class="nw">靠近前緣</b>、一小段就<b>重夾</b>',
      '前房一淺：鉗子退出 → <b class="nw">補 OVD</b> 再撕',
      '完成：<b>連續、圓、置中</b>、<b class="nw">5.0–5.5 mm</b>、<span class="nw">360° 蓋住 optic</span>',
    ] },
    { sec: '② Hydro 與 D&amp;C', w: 0.9, items: [
      '<b>Hydrodissection</b>：<span class="nw">撕囊緣下</span><b>慢、連續</b>打 → 壓核排液 → <b>轉得動</b>',
      '<b>刻槽</b>：<b>先有水流再踩 3</b>；到<b>槽底 red reflex 變亮</b>（示意）',
      '<b>分核</b>：放<b>槽底</b>、往<b class="nw">相反方向</b>推；<span class="nw">轉 <b>90°</b> 再一道</span>',
      '<b>核塊</b>：先<b class="nw">吸住（occlude）</b>、<b class="nw">拉到中央</b>再乳化',
    ] },
    { sec: '③ I/A、IOL 與收尾', items: [
      '<b>I/A</b>：<b>吸口朝上</b><span class="nw">（常用做法）</span>；<span class="nw">腳踏 <b>1</b> 灌流</span>、<span class="nw"><b>2</b> 才吸</span>；<b class="nw">到中央再吸</b>',
      '<b>主切口下方</b>：不硬伸，<b class="nw">換角度</b><span class="nw">（雙手 I/A 等）</span>',
      '<b>IOL</b>：OVD 撐囊袋 → <b>前導 haptic 先進</b> → <span class="nw">後 haptic <b>壓進</b></span>',
      '清 OVD：<b>連 optic 後面</b>',
      '<b>密閉切口</b>（依院內常規）：<b class="nw">前房深、不漏</b>',
    ] },
  ],
  alarm: { head: '出事時第一步', items: [
    { name: 'Run-out', see: '撕囊前緣往周邊跑', act: '<b>停、補 OVD</b>，瓣往反方向拉、再往中央' },
    { name: 'Capsular block', see: '打水後<span class="nw">前房變淺</span>、眼變硬', act: '<b>停止打水</b>' },
    { name: 'Wound burn', see: '切口旁角膜變白', act: '<b>立刻放開 3 段</b>' },
    { name: 'Surge', see: '前房一下子變淺', act: '<b>腳退回 1 段</b>，等前房撐回來' },
    { name: '後囊被吸住', see: '放射狀皺褶指向吸口', act: '<b>腳退回 1 段</b>；不往上拉<span class="nw">（常用做法）</span>' },
    { name: 'PCR', see: '前房突然變深、瞳孔變大', act: '<b>停乳化、phaco 留著</b>；<span class="nw">side port 打</span> <b>dispersive OVD</b>，<span class="nw">再慢慢退</span>' },
  ] },
});
