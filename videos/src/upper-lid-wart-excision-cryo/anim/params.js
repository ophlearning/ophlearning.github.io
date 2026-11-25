// Drawing parameters of the print sheets (videos/tools/print) and the video (draw.js), and the numbers the narration says (checked in
// ../check.js against these same values). The eyelid model (videos/models/eyelid) has no lesion, excision line, cryoprobe or ice
// ball, so the sheets and the video draw them on the model; every value in WART is 示意 (schematic, no source) unless a source is named.
// The lesion's position and size are not in the clinic record (the sheets leave [ ] for them), so the figures show one possible case.
const WART = {
  dq: 3,          // 皮膚面病灶的中心：睫毛線往上沿皮膚 3 mm（示意；畫面不寫數字）
  w: 2.4,         // 病灶沿皮膚的寬度（mm，示意）
  h: 0.9,         // 病灶突出皮膚的高度（mm，示意）
  dEx: 0.25,      // 切除深度：離皮膚表面（mm，示意）；這個位置的皮膚＋皮下約 0.33 mm，在 orbicularis 之上
  margin: 0.35,   // 切除範圍比病灶外緣多出的距離（mm，示意）
  iceR: 1.6,      // 皮膚面冰球的半徑（mm，示意）
  dqM: 0,         // 瞼緣病灶的中心：睫毛線（示意）
  wM: 1.8,        // 瞼緣病灶沿皮膚的寬度（mm，示意）
  iceRM: 2.4,     // 瞼緣冰球的半徑（mm，示意：畫成蓋到毛囊根部）
};
// Upper-lid lash follicle (Elder 1997), the same values as ../../upper-lid-levator-rotation-brow/anim/params.js EP; reach95 = the depth
// an electrolysis needle must reach to contact 95 % of follicles (mean + 2 SD)
const EP = { follicleUp: 1.8, reach95Up: 2.4, pct: 95 };
// Numbers the video's narration says (each also in ../check.js LEDGER with its source)
const NX = {
  kersten: { benign: 692, malig: 13, pct: 1.9, bcc: 10 },   // Kersten 1997：臨床良性 692 個 → 病理惡性 13 個（1.9%），其中 10 個 BCC
  custer: 150,                                                // Custer 2024：瞼緣 nevus 150 個，superficial excision＋cauterization
  sullivan: { cycles: 2, temp: -30 },                         // Sullivan 1976：瞼緣液態氮 2 個 freeze–thaw，皮下監測到 −30 °C（trichiasis）
  weeks: 2,                                                   // 病例：病程 2 週（站長 2026-11-23 確認的摘要）
};
if (typeof module !== 'undefined') module.exports = { WART, EP, NX };
