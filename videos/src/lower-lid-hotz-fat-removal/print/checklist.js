// 跟刀清單: eight items (術前 2、切除 1、去眼袋 2、固定 1、收尾 1、術後 1). Numbers = the step numbers of steps.js. Every number is in
// ../check.js LEDGER; the template values (院內常規) are the department's Hotz template; 病例 = the confirmed case summary and clinic notes.
PRINT.sheet({
  type: 'checklist', title: '跟刀清單', sub: '跟刀前看一次；號碼＝手術步驟圖的號碼',
  sources: ['Kaufman 2015', 'Prischmann 2013', 'Hass 2004', 'Coban 2023', 'Syniuta 2003', 'Murali 2021'],
  items: [
    { sec: '術前', act: '核對 <b>OS</b>；<b class="nw">血小板 [　　　]</b>、<b class="nw">PT／aPTT [　　　]</b>：pancytopenia → 輸不輸依主治與血液科',
      note: 'AABB：major elective non-neuraxial surgery，血小板 < 50 × 10⁹/L 建議預防性輸血小板（Kaufman 2015）' },
    { act: '先記下角膜：<b>TBUT 3 秒</b>、下方 <b>SPK</b>、結膜 SCH++（病例）',
      note: '眼瞼成形術後乾眼症狀 26.5%（Prischmann 2013）' },
    { sec: '術中①　切除皮膚與 orbicularis', act: '依院內常規畫線，切除<b>皮膚、皮下與 orbicularis</b>（寬度依院內常規）；<b>每一層止血</b>',
      note: '術後眶內出血常見的共病：高血壓、aspirin、術後嘔吐、用力（Hass 2004）' },
    { sec: '術中②　打開眶隔、去眼袋', act: '穿過眶隔，露出 <b>retractor aponeurosis</b>；認出<b>內、中、外三團脂肪</b>',
      note: '內側與中央之間是 inferior oblique，中央與外側之間是 arcuate expansion：兩者都不要傷（Coban 2023）' },
    { act: '<b>部分去脂</b>（哪幾團、去多少依院內常規）；<b>斷端止血</b>再放開',
      note: '眼瞼成形術後持續複視 12 位：下直肌 7、上斜肌 5（Syniuta 2003）' },
    { sec: '術中③　固定', act: '<b>Orbicularis → retractor aponeurosis</b>：<b>6-0 Prolene ×5</b>（依院內常規）；瞼緣<b>轉正</b>了沒' },
    { sec: '收尾', act: '請病人<b>閉眼</b>：閉不閉得緊、瞼緣方向；<b>沒有活動性出血</b>',
      note: '術後 lagophthalmos 使乾眼症狀增加（Prischmann 2013）' },
    { sec: '術後：球後出血', act: '<b>眼球突出、眼瞼繃緊、RAPD、IOP 高、視力下降</b> → 先做 <b>lateral canthotomy＋inferior cantholysis</b>（網站有影片）',
      note: '多在術後 3 小時內，24 小時後明顯減少（Hass 2004）；只有約 15% 會說眼痛（Murali 2021）' },
  ],
});
