# Failed DMEK 後改做 PK：助手版術前預習（規格書）

2026-11-23 訂（草稿）。眼球前段模型的 PK 類別第二部；PK 的步驟動畫共用 `globe/pk.js`（第一部 `videos/src/pk-tectonic-descemetocele/` 建立）。沒有真實錄影，兩個視角都用 mm 模型動畫。

## 目標與觀眾
- 觀眾：在這台刀當**助手**的眼科住院醫師（站長本人），之後給其他住院醫師。
- 看完要能做到：
  1. **說得出為什麼 DMEK 一週後就改 PK**：術後角膜仍水腫、上皮缺損、前房淺、pupillary block、hyphema、周邊前房塌，graft 沒有發揮功能。
  2. **知道 open sky 後前房要處理什麼**：沖掉 hyphema、確認 LI 通不通、分開周邊虹膜與角膜的沾黏、必要時加做 PI、看 IOL 位置（依主刀決定）。
  3. **知道 PK 步驟的順序與理由**（同第一部：trephine、供體、cardinal sutures、補完縫線、重建前房、測漏），以及 pseudophakic 眼 open sky 的注意事項。
  4. **助手自己的動作做對**（同第一部）。
- 片長目標 6–9 分鐘；和第一部相同的 PK 步驟段落精簡，重點放在這台不同的地方。

## 病例情境（站長 2026-11-23 確認）
- 站長 2026-11-23 確認：兩台都是當天的 PK，順序「先B再A」（這台是 A，第二台）。
- 站長確認的摘要（去識別版：原摘要的日期與檢查數值因 repo 公開而省略，原文只留在對話裡）：「OS PK：failed DMEK 後改做 PK（DMEK 後約一週：角膜水腫、上皮缺損、前房淺且有 pupillary block 和 hyphema、眼壓偏低）；pseudophakic（PCIOL），7 點鐘有 LI；受體與供體大小、縫法還不知道；站長當助手」。
- 影片用到的病程只有：Fuchs、pseudophakic、DMEK 後約一週 graft 沒有發揮功能，以及上面摘要的前房狀況。主切口的鐘點不寫（病歷兩處方位寫法不同，未查證），畫面以示意呈現、標「待刀後補」。
- **隱私**：網站 repo 是公開的。影片、網站、這份規格書都不寫病人姓名、病歷號、生日、年齡、性別、院內人員、主治代號、醫院名稱與角膜組織編號，也不寫病程日期與檢查數值。
- **院內的 PK 手術紀錄範本**（站長 2026-11-23 提供，不含病人資料；影片與列印單的步驟照它，標「院內常規」，大小欄位留白＝依主刀）：GA；Barraquer lid speculum（solid blades）；供體以 Barron vacuum punch 垂直切、內皮面朝上、內皮塗 Healon；受體以 Barron radial vacuum trephine 垂直切、取下 button；分開周邊 PAS、Healon 形成前房；不做 iridoplasty、不做白內障；16 針 10-0 nylon interrupted；TSCL、Maxitrol ointment、壓迫包紮＋金屬眼罩。範本的 OPERATIVE FINDINGS（clear、phakic、IOP high）是範本預設，不是本例。
- 站長沒有指定、病歷也沒寫的：trephine 大小、縫法、針數、前房實際要做哪些處理、IOL 保留與否、麻醉方式。畫面標「示意」，旁白說「依主刀決定」，標「待刀後補」。

## 時程
- 在第一部那台之後；這部在刀前做不完。刀前已在對話中交純文字術前速讀（兩台共用）。
- 第一部出片後接著做：病例與前房處理的段落 → `check-all` → 術前速讀包 → 三張列印單 → 出片 → 上傳 → 網站。

## 章節（暫定）
| 章 | 內容 | 助手的重點 |
|---|---|---|
| 片頭 | 左眼 failed DMEK 後的 PK；助手版 | — |
| 1 為什麼改 PK | DMEK 一週後的狀況；為什麼不 rebubble 或再做 DMEK（依文獻與主刀） | — |
| 2 Trephine 與 open sky | 同第一部（精簡）；pseudophakic 眼的注意事項 | open sky 時不壓、不扳 |
| 3 前房的處理 | hyphema、LI、周邊沾黏、PI、IOL（依主刀） | 吸引與沖洗時保持視野 |
| 4 供體與縫合 | 同第一部（精簡） | 內皮不碰、固定、遞針剪線 |
| 5 收尾、術後與會出錯的地方 | 測漏、病理（DMEK graft 一起送）；眼壓、rejection | — |

## 驗收項目
1. 眼別（OS）、術者方位（坐 12 點、temporal 在左）在旁白、畫面、模型一致：模型 `check.js` 檢查。
2. 同一個結構（LI 在 7 點、trephine 邊緣、cardinal sutures）在兩個視角落在同一個鐘點，寫成檢查；hyphema 在重力下方。
3. 旁白每個數字在數字帳本都有出處；`node videos/tools/check-all.js videos/src/pk-failed-dmek` 全部 PASS。
4. 不出現病人識別資料、院內人員、主治代號、醫院名稱與組織編號（commit 前 grep 檢查）。
5. 三張列印單 PASS：`node videos/tools/print/print.js videos/src/pk-failed-dmek --gray` 全部 PASS。

## 進度
- 2026-11-23　規格書草稿；等第一部的 PK 模組與文獻完成後開始。
- 2026-11-23 18:50–19:10　站長提供院內 PK 手術紀錄範本，要求先出三張單：旁白加入範本步驟，帳本（`check.js`）第一版，三張列印單（`print.js --gray` 全部 PASS，彩色全頁看過）交給站長。列印工具 `print-kit.js` 加 `pksec`、`pkscope` 兩種視角。PK 模組（`globe/pk.js`）由小助手做完、`check-all` 通過後才 commit。
- 2026-11-23 19:30　站長：B 台來不及，今晚先給 A 台影片。畫面（小助手，17 段）完成，`check-all` 全部 PASS（主對話重跑確認）；術前速讀包（`brief.js`，9 張圖＋旁白）交給站長；開始出片；YouTube 說明、章節、字幕、網站條目草稿在 `publish/`。
