// Drawing parameters of the print sheets (videos/tools/print). The eyelid model (videos/models/eyelid) has no lesion, excision line,
// cryoprobe or ice ball, so the sheets draw them on the model; every value here is 示意 (schematic, no source) unless a source is named.
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
// Upper-lid lash follicle (Elder 1997), the same values as ../../upper-lid-levator-rotation-brow/anim/params.js EP
const EP = { follicleUp: 1.8, reach95Up: 2.4 };
if (typeof module !== 'undefined') module.exports = { WART, EP };
