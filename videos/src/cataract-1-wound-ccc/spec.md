# 白內障 ①：主切口、side port、OVD 與 CCC（規格書）

2026-11-09 訂。系列共同的決定（目標、病例、錄影、四件事的教學結構、驗收）見 `videos/src/cataract-series/spec.md`，這裡只寫 ① 自己的。模型見 `videos/models/globe/CARD.md`「白內障」一節；錄影工具見 `videos/tools/README.md`「真實手術錄影」。

## 目標與觀眾
- 觀眾：眼科住院醫師，準備開始做（或剛開始做）phaco 的切口與 CCC。
- 看完要能做到：
  1. 說出主切口要做成什麼樣子（三平面、隧道長約等於寬、自閉），以及太短、太長在刀房會看到什麼。
  2. 說出 CCC 的目標（連續、圓、置中、5.0–5.5 mm、360° 蓋住 optic 邊緣）與力學（shear／rip、夾在撕開的前緣附近、勤 regrasp、前房用 OVD 撐滿）。
  3. 在真實畫面上認出兩種出錯的線索：撕囊前緣往周邊跑（run-out）、zonule 弱（囊袋跟著動、前囊起皺），並知道當下的第一步。
- 時間目標 9–11 分鐘；CCC（第 4–6 章）至少占一半。

## 病例情境
- 系列確認的病例（站長 2026-11-09，原文見系列規格書）：OD、術者坐 superior、superior clear corneal 主切口＋side port。
- 錄影：案例 A（OD，站長確認；zonule 弱［PXF 等］，後來放了 CTR，站長確認）。旁白要照實說：
  - 本例 zonule 弱，所以撕囊比 routine 慢、regrasp 多；routine 的目標狀態用模型示範。
  - 主切口實測在 12 點偏 temporal 約 22°（約 11 點多），旁白說「12 點附近」。模型的 `main.h` 改成實測值，切面跟著換成經主切口的子午線。
  - 角膜緣附近的切口滲血，畫面上有血：當成真實畫面的一部分，不剪掉。

## 章節（暫定，寫旁白時可調；每章都照「目標狀態／動作（雙視角）／線索對錯／出事第一步」）
| 章 | 內容 | 錄影（案例 A 原始時間） | 模型 |
|---|---|---|---|
| 片頭 | 這支片練會三件事 | 撕囊完成的一格 | — |
| 1 目標 | 每一步做完應該長什麼樣子；本例的兩個特點（zonule 弱、切口在 11 點多） | — | `cscope`、`cat` 全景 |
| 2 Side port 與 OVD | side port 在左手那側（OD 坐 12 點是 nasal）；OVD 撐前房、壓平前囊；前囊往前凸＝後方壓力高、撕囊容易往外跑 | 0:00–0:28 | `cat`、`cscope` |
| 3 主切口 | 三平面隧道、長≈寬才自閉；太短漏水與虹膜脫出、太長看不清楚與器械卡住（oar-locking，角膜起皺）；superior 長隧道 SIA 較大的取捨（依院內常規） | 0:28–0:50 | `tunnel`、`cscope` |
| 4 CCC 的目標與力學 | 5.0–5.5 mm、置中、360° 蓋住 optic；shear 與 rip；夾在翻折的瓣上、靠近前緣；每撕一段就 regrasp | — | `cat`、`tear`、`capzoom`、`cscope` |
| 5 實錄：案例 A 的撕囊 | cystotome／撕囊鉗刺破、radial cut、翻瓣、每次 regrasp（標號）、中途補 OVD、擦血；zonule 弱的線索出現時標出 | 1:00–4:55（關鍵處 0.5×、其他加速並明說） | 同步的 `cat` 投影切面 |
| 6 出錯的線索與第一步 | run-out：前緣往外偏、跑到虹膜下看不到 → 停、補 OVD 壓平、靠近前緣重夾、往中央拉（或 Little 法往回拉）；zonule 弱：囊袋跟著動、前囊起皺 → 放慢、減少拉力（之後放 CTR 在 ③ 講） | 案例 A 的對應片段＋動畫示意 | run-out、zonule 弱狀態 |
| 7 練習清單 | wet lab／模擬器要練的幾件事 | — | — |
| 參考文獻 | | | |

## 待查證（寫旁白時在 PubMed 查，查不到就標示意或不講）
- 主切口：Ernest 1994、1995（方形切口、隧道長）；Masket 2007；McDonnell 2003（切口的動態形態）；Sonmez 2018（superior 長隧道 SIA）；Liu 2023 JAMA Ophthalmol（stromal hydration）只在 ③ 講。
- CCC：Gimbel & Neuhann 1990；Arshinoff 1992（shear／rip）；Mohammadpour 2012（pearls and pitfalls）；Little 2006（run-out rescue）；LoBue 2024（前囊撕裂的處理）；Hollick 1999、Haripriya 2025（大小與 optic 重疊）。
- Zonule 弱：Chen 2025（CCC 時前囊起皺）、Rai 2015（CTR 的時機）、Fairaq 2025（綜論）。
- 教學：Dooley 2006（CCC 是最難的步驟之一）、Ferris 2019（模擬器）。
- 錄影的事件時間碼（逐格確認，寫進 `anim/footage.js`）：side port、OVD、keratome 進出、cystotome 刺破、radial cut、每次 regrasp、補 OVD、撕囊完成、取出前囊瓣；撕囊的實際起點與方向（模型的 `h0`、`dir` 改成和錄影一致）。

## 驗收項目
- [ ] 系列規格書的「系列層級的驗收」全部適用。
- [ ] CCC（第 4–6 章）至少占全片一半。
- [ ] 每段手術步驟同時有錄影（或動畫示意）與同步的切面，兩邊用同一組事件時間；切面標題寫明「投影到切面」的地方照模型卡。
- [ ] 本例 zonule 弱、切口在 11 點多，旁白有照實說；routine 的目標狀態用模型示範。
- [ ] 錄影檢查（裁切不碰燒進畫面的文字、主切口在下方 ±30°、事件在片段內、影格齊全）全部 PASS。
- [ ] 數字帳本：旁白、重點框與畫面上的每個數字都有出處；示意與院內常規列在 `overview-notes.md`。
- [ ] `node videos/tools/check-all.js videos/src/cataract-1-wound-ccc` 全部通過；每段一張參考圖（Claude 自檢）；出片前交總覽（每章一張）。

## 進度
- 2026-11-09：
  - 模型（`globe/cataract.js`，51 條檢查、38 個故意改錯都抓到）與樣本圖完成，見模型卡。
  - 錄影工具完成（`videos/tools/video-kit/footage.js`），案例 A 的示範頁在 `videos/src/cataract-series/anim/`。
  - 規格書訂好章節；下一步：查證文獻、逐格標錄影事件、寫旁白（`script-draft.md`、`anim/segments.js`）與錄影片段（`anim/footage.js`）。
