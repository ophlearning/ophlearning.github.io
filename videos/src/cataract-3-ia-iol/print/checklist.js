// 跟刀清單: I/A, the subincisional cortex, the first step when the posterior capsule is caught, the IOL in the bag and closure, in the order of
// the video, the routine steps the video demonstrates on the model (not case A's footage), with the key numbers of the video and one sourced
// pitfall where the video has one. Numbers = the step numbers of steps.js. Common practice without a direct study is marked 常用做法 as in the video.
PRINT.sheet({
  type: 'checklist', title: '跟刀清單', sub: '跟刀前看一次；號碼＝手術步驟圖的號碼',
  sources: ['Hagan 1987', 'Quesada 2022', 'Suryawanshi 2016', 'Colvard 1997', 'Miyoshi 2022', 'Kanclerz 2019', 'Lockington 2021', 'Haripriya 2025', 'Chang 2009', 'Biro 2006', 'Liu 2023'],
  ledger: { '1': '結構', '2': '結構', '360': '結構', '12': '結構' },
  items: [
    { sec: 'I/A', act: '<b>吸口朝上</b>（看得到、離後囊最遠；常用做法）；腳踏 <b>1</b> 灌流、<b>2</b> 才吸；tip 伸到<b>前囊邊緣下</b>，踩 2 <b>夾住</b>皮質',
      note: '任何時候都要知道吸口朝哪裡（Hagan 1987）' },
    { act: '夾住後<b>往中央拉</b>、剝下來，<b>到中央再吸</b>；一區接一區<b>繞一圈</b>，<b>紅光均勻</b>才退出',
      note: '訓練中 PCR 最常在吸皮質時：2.8%（Suryawanshi 2016）' },
    { act: '<b>主切口下方</b>：不要硬伸，<b>換角度</b>：雙手 I/A（吸的經<b>側切口</b>）、hydro-dispersion（鈍針經側切口打 BSS）或彎頭 tip',
      note: '主切口下方沒吸乾淨是術後囊袋撐脹的危險因子之一（綜論，Kanclerz 2019）' },
    { sec: '出錯時的第一步', act: '後囊出現<b>放射狀皺褶</b>、指向吸口 → <b>腳退回 1 段</b>停止吸；有 reflux 就 <b>reflux</b>；<b>不往上拉</b>（常用做法）',
      note: '金屬吸口內側有毛邊，被吸住的後囊可能被割破（實驗室，Lockington 2021）' },
    { sec: '放 IOL', act: '<b>OVD 撐開囊袋</b> → injector 經<b>主切口</b>、斜面朝下（示意）→ <b>前導 haptic 先進囊袋</b>、optic 在囊袋裡打開',
      note: 'IOL 型號、injector、OVD 依院內常規' },
    { act: '<b>後 haptic</b>：hook 經<b>側切口</b>往下、往裡壓進囊袋；IOL <b>置中</b>、CCC <b>360°</b> 蓋住 optic',
      note: '沒蓋到和偏位、YAG 有關（Haripriya 2025）；one-piece 不留 sulcus：30 人 93% 再手術（Chang 2009）' },
    { sec: '收尾', act: 'I/A 清 OVD：<b>連 optic 後面</b>一起清 → 囊袋貼回 IOL、前房變深',
      note: '只清前房：術後幾小時到一天眼壓較高（118 眼，Biro 2006）' },
    { act: '器械一退出就<b>密閉切口</b>：stromal hydration 或 <b>swab pressing</b>（依院內常規）；確認<b>前房深</b>、切口<b>不漏</b>',
      note: '126 眼隨機試驗：swab 閉合 96.8%、hydration 93.7%；術中前房塌陷 0 vs 35 眼（Liu 2023）' },
  ],
});
