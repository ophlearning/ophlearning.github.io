// 跟刀清單: the case of the OP note (spec.md 病例情境) in surgical order; the scleral tunnel and its closure in detail (key numbers of the
// planned chapters 2–4 and 6), the phaco steps between them in one line each (taught in the cataract series ①–③). Numbers = steps.js.
PRINT.sheet({
  type: 'checklist', title: '跟刀清單', sub: '跟刀前看一次；號碼＝手術步驟圖的號碼', split: 4,
  ledger: { '360': '結構' },
  sources: ['Friedman 2001', 'Goel 2022', 'Ernest 1994', 'Subudhi 2021', 'John 1992', 'Arshinoff 1999', 'Hollick 1999', 'Soda 2012', 'Ye 2021', 'Gimbel 1995', 'Azar 1997', 'ESCRS 2007'],
  items: [
    { sec: '術前', act: '核對 <b>OS</b>、<b>ZMB00 +6.5 D</b>（multifocal）；<b>peribulbar</b>；術者坐 <b>upper-temporal</b>（約 1–2 點）',
      note: 'Peribulbar 與 retrobulbar 的止痛、不動相當（Friedman 2001）' },
    { sec: '切口', act: '<b>Side port</b>：<b>15° 刀</b>，在術者<b>左手側</b>（位置依主刀）；刀尖一進前房就退出' },
    { act: 'Upper-temporal <b>結膜切開</b>（沿角膜緣），露出鞏膜、<b>燒灼止血</b>',
      note: 'OP note 沒寫結膜做法（範圍、燒灼、縫回），依主刀' },
    { act: '<b>2.65 mm keratome</b>：外口在角膜緣後 <b>1–2 mm</b> 鞏膜 → 同一層往前 → 進透明角膜<b>約 1.5 mm</b> 再刺入前房',
      note: '內口在角膜裡（internal corneal lip 1.5 mm）：屍眼耐壓到 525 psi 不漏（Ernest 1994）' },
    { sec: '隧道出錯時', act: '<b>太淺 → buttonhole</b>：停，換<b>深一點的平面</b>；<b>太深 → 太早進前房</b>（虹膜脫出、出血）→ <b>縫合門檻放低</b>',
      note: '住院醫師 339 例：隧道併發症 12.6%（Subudhi 2021）' },
    { sec: 'CCC 到 IOL（詳見白內障 ①–③）', act: '<b>DuoVisc</b> → <b>CCC 置中、5.0–5.5 mm</b>、360° 蓋住 optic → hydro → <b>divide and conquer</b>（Signature）→ <b>I/A＋polish</b>',
      note: 'Cohesive 撐空間、dispersive 留得住（Arshinoff 1999）' },
    { act: '<b>ZMB00 +6.5 D in the bag</b>、<b>置中</b>；移除 OVD（含 IOL 後方）',
      note: '模型眼：偏心 0.75 mm 內不預期有臨床影響（Soda 2012）' },
    { sec: '關閉', act: '<b>10-0 nylon</b> 縫主切口（radial，針數依主刀）→ 前房 <b>cefuroxime 1 mg/0.1 mL</b>',
      note: '內口張開：先經 side port 打 BSS 加深前房，不行再縫（Gimbel 1995）' },
  ],
});
