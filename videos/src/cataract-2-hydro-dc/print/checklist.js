// 跟刀清單: hydrodissection, sculpting, cracking and quadrant removal in the order of the video, the routine steps the video demonstrates
// (not case A's footage), with the key numbers of the video and one sourced pitfall where the video has one; 8 = the first step of
// chapter 6 (surge). Wound burn sits with sculpting (3: flow before pedal 3), capsular block with hydrodissection (2), zonule weakness with
// the second division (6). Numbers = the step numbers of steps.js.
PRINT.sheet({
  type: 'checklist', title: '跟刀清單', sub: '跟刀前看一次；號碼＝手術步驟圖的號碼',
  sources: ['Taş 2017', 'Blumenthal 2020', 'Miyake 1998', 'Ernest 2001', 'Gimbel 1991', 'Fairaq 2025', 'Scarfone 2026', 'Soule 2026'],
  ledger: { '1': '結構', '3': '結構', '90': '結構', '12': '結構', '6': '結構' },
  items: [
    { sec: 'Hydrodissection', act: 'Cannula 尖端放在<b>撕囊邊緣下</b>，<b>慢、連續</b>地打 BSS；看<b>越過 red reflex 的波</b>',
      note: '金色的環是 hydrodelineation 的徵象；hydrodissection 看越過後囊的波（Blumenthal 2020）' },
    { act: '每打一處就<b>輕壓核的中央</b>排出液體 → <b>換一處</b>再打 → <b>推核</b>，確認<b>轉得動</b>',
      note: '打太多：核頂住撕囊口、前房變淺、眼球變硬（capsular block）→ 停止打水（Miyake 1998；Taş 2017）' },
    { sec: '刻槽', act: '先確定<b>有水流</b>，再踩<b>腳踏 3</b>；<b>低 vacuum、不 occlude</b>；從<b>切口下方往對側</b>刻，長到<b>撕囊邊緣內</b>',
      note: '切口附近角膜變白（wound burn）→ 立刻放開 3 段；沒有水流時熱帶不走（Ernest 2001）' },
    { act: '寬約 <b>sleeve 寬</b>、深到只剩<b>薄的後板</b>：<b>槽底 red reflex 變亮</b>（寬、深、亮度為示意）',
      note: '槽底突然很亮、很清楚＝可能刻穿後板 → 不再往下刻（動畫示意）' },
    { sec: '分核', act: '<b>Phaco</b> 與 <b>chopper</b>（經側切口）放到<b>槽底</b>、各貼一側槽壁，<b>往相反方向推開</b>',
      note: '裂縫先貫穿後板、再裂到周邊才算分開（Gimbel 1991）；沒貫穿不硬推，再刻深（示意）' },
    { act: '核<b>轉 90°</b>，第二道槽又在 <b>12→6 點</b>；<b>再刻、再分</b> → 四塊',
      note: 'Zonule 弱：囊袋不穩，轉核、分核都較難 → 動作輕、慢（Fairaq 2025）' },
    { sec: '移除核塊', act: '口朝核塊<b>吸住（occlude）</b>、咬緊再拉 → <b>拉到中央</b>、離後囊遠 → 再踩 3 段乳化；chopper 推向 phaco',
      note: '堵塞解除時後囊離 phaco 口越近，越容易被吸破（Scarfone 2026）' },
    { sec: '出錯時的第一步', act: '<b>Surge</b>（前房一下子變淺）：<b>腳退回 1 段</b>（只灌流）讓前房撐回來，再繼續（依腳踏的機轉）',
      note: '預防：vacuum、流量別設太高；Veritas 實驗台 450 mmHg 時 surge 持續 1.6–2.9 秒（Soule 2026）' },
  ],
});
