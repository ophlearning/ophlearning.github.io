// 跟刀清單: the incisions, OVD and CCC in the order of the video (case A: side port → OVD → main incision → CCC), with the key numbers
// of the video and one sourced pitfall where the video has one; 7 = the first step of chapter 6, 8 = the end state of chapter 1 / 4-1.
// Numbers = the step numbers of steps.js.
PRINT.sheet({
  type: 'checklist', title: '跟刀清單', sub: '跟刀前看一次；號碼＝手術步驟圖的號碼',
  sources: ['LoBue 2024', 'Ernest 1995', 'Ernest 1994', 'Fairaq 2025', 'Karim 2010', 'Hollick 1999', 'Haripriya 2025'],
  ledger: { '12': '結構', '360': '結構', '1': 'Hollick 1999' },
  items: [
    { sec: '切口與 OVD', act: '<b>Side port</b> 在<b>左手那側</b>（右眼、術者坐 12 點＝nasal）；刀尖一進前房就退出' },
    { act: '經 side port 打 <b>OVD</b>：從中央往周邊<b>撐滿前房</b>、<b>壓平前囊</b>',
      note: '前房不夠深：後方壓力把水晶體往前推，撕囊容易往外跑（LoBue 2024）' },
    { act: '<b>Keratome</b> 做<b>三平面</b>主切口：透明角膜 → 基質 → 前房；隧道長<b>約 2 mm</b>、<b>長≈寬</b>（寬依院內 keratome）',
      note: '屍眼：方形 2.0×2.0 mm 耐壓 525 psi；長方形 3.2×2.0 mm 13 psi 就漏（Ernest 1994）' },
    { sec: 'CCC', act: '中央破開前囊，把<b>瓣翻起來</b>',
      note: 'Zonule 弱：夾住時整片前囊起皺、囊袋跟著動 → 放慢、減小拉力（Fairaq 2025）' },
    { act: '<b>沿圓的切線拉</b>；夾在瓣上、<b>靠近撕開的前緣</b>；撕一小段就<b>放開、重新夾</b>',
      note: '拉力一偏外，前緣就往外跑（Karim 2010）' },
    { act: '前房一淺：鉗子退出 → 經 side port <b>補 OVD</b>、前囊壓平，再撕',
      note: '重新夾、補 OVD 是控制撕囊的方法，不是失誤（Karim 2010；LoBue 2024）' },
    { sec: '出錯時的第一步', act: '<b>Run-out</b>（前緣偏離圓、跑到虹膜下）：<b>停</b> → <b>補 OVD</b> 壓平 → 瓣<b>往反方向拉、再往中央</b>（Little 法）',
      note: '前緣超過 zonule 附著，可能一路撕到赤道（LoBue 2024）' },
    { sec: '完成', act: '<b>連續、圓、置中</b>、<b>5.0–5.5 mm</b>、360° 蓋住 optic 邊緣（以 6.0 mm optic 換算）；前囊瓣從主切口取出',
      note: '撕囊沒蓋到 optic 邊緣：1 年 PCO 較多（Hollick 1999），IOL 偏位、YAG 較多（Haripriya 2025）' },
  ],
});
