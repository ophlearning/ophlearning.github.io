# 第三部：上眼瞼三合一——marginal rotation＋levator resection＋internal brow fixation，再加 electric epilation（規格書）

2026-11-06 訂；同日依站長更正的病例重做（舊版把 marginal rotation 與電解寫在下眼瞼，是錯的）。

> **2026-11-06 站長更正：三個步驟都在上眼瞼，marginal rotation 從同一個 lid crease 切口前路做，electric epilation 也在上眼瞼；順序 rotation → levator resection → brow fixation。**
> 舊版（資料夾 `levator-brow-lower-lid-rotation`，影片「上下眼瞼一起開」）的規格、腳本與畫面留在 git 歷史裡；資料夾改名為 `upper-lid-levator-rotation-brow`。

## 目標與觀眾
- 觀眾：準備跟這台刀的眼科住院醫師。重點：同一個上眼瞼的三個步驟怎麼走同一個切口、為什麼先轉瞼緣、三個步驟彼此怎麼影響（高度、contour、瞼緣方向、閉眼），以及轉正後剩下的睫毛怎麼電解。
- 畫面：右眼、亞洲人、`videos/models/eyelid/` 的 mm 模型動畫。

## 病例情境（站長 2026-11-06 更正，定案）
- 同一個病人、同一個上眼瞼：levator muscle resection＋marginal rotation＋internal brow fixation。
- Marginal rotation：從 levator resection 用的同一條 lid crease 切口**前路**做，不是翻瞼的後路 PLTR。
- Electric epilation：保留，也在上眼瞼。
- 這台的順序：先 marginal rotation，再 levator resection，最後 internal brow fixation。
- 這是站長 2026-11-06 實際跟的刀，步驟以刀後實際 OP note 為準。

## 術式依據與保密
- 主治範本不進 git，影片與網站不寫主治代號與醫院名稱；片尾用 kit 預設「製作　張博淳」。
- Levator resection 與眉毛固定：同第一部的範本解讀（2.5／4／4 mm、切除 5 mm、4-0 vicryl ×3、4-0 vicryl ×1、MRD1 約 2.5 mm、6-0 Prolene ×4、7-0 ethilone）。
- 上眼瞼前路 marginal rotation：手上沒有任何院內範本寫到。原理與步驟照 Cruz 2015a／2015b（lid crease 切口、皮膚肌肉瓣掀到睫毛根、瞼板全層切開、三針 6-0 polyglactin 從遠端瞼板切緣縫到睫毛根附近的 orbicularis、埋在眼瞼裡）；這台的切口與瞼板切開位置、針數與路徑一律說「依院內常規」、畫面標「示意」。
- 順序的理由：Cruz 2015a 的做法是先轉瞼緣、再讓病人坐起來看位置、需要時調 aponeurosis（有出處）；這台為什麼這樣排、電解的時機，說「依院內常規」。

## 待刀後補
- [ ] 上瞼緣內翻的類型與程度（疤痕性？ptosis 手術相關？）與為什麼要合併電解。
- [ ] Rotation：瞼板切開從哪一面、離瞼緣多遠；縫線種類、針數、路徑；皮膚肌肉瓣剝到哪裡。
- [ ] Levator：切除量、固定點；固定後瞼緣有沒有再內翻。
- [ ] Electric epilation：機器、能量、時間、根數、時機（rotation 前或後）、拔不拔睫毛。
- [ ] 術中怎麼檢查閉眼、高度與 contour。

## 章節（定稿；逐句旁白與出處見 `script-draft.md`，由 `anim/segments.js` 產生）
| 章 | 內容 | 主要出處 |
|---|---|---|
| 片頭 | 同一個上眼瞼、同一個切口的三個步驟＋電解 | — |
| 1 臨床決策 | 1-1 三種機轉；rotation 後剩下的睫毛電解；1-2 三個步驟都在改同一個瞼緣（同切口可一起處理 ptosis；ptosis 手術後的 entropion；ptosis 修復後的閉不緊） | Rajak 2012、Cruz 2015a/b、Cruz 2023、Tucker 2000 |
| 2 Marginal rotation：從 lid crease 進去 | 2-1 同一條切口、掀皮膚肌肉瓣；2-2 瞼板全層切開；2-3 縫線把瞼緣轉出來 | Cruz 2015a/b；院內常規 |
| 3 Levator resection 與眉毛固定 | 3-1 levator resection（固定後看瞼緣有沒有再內翻）；3-2 internal brow fixation | 第一部、Cruz 2023、Kokubo 2019、Pruksapong 2022 |
| 4 Electric epilation | 4-1 上眼瞼毛囊的深度；4-2 做法；4-3 效果與再處理 | Elder 1997、Rajak 2012、Singh 2022、Sakarya 2010、Kapantais 2022 |
| 5 順序與術中狀況 | 5-1 這台的順序；5-2 三個狀況 | Cruz 2015a、Cruz 2023、Rajak 2012；院內常規 |
| 6 術後、7 跟刀清單、參考文獻 | — | Tucker 2000、Cruz 2015a、Rajak 2012、Sakarya 2010 |

## 兩個同步視角
- Rotation（第 2 章）：矢狀切面（`LID.draw` 的 `crease`／`flap`／`cut`／`suture`＋`buried`；用選用參數 `creaseH` 把切口放在 levator 下切口）＋正面術者視角（皮膚面；皮膚肌肉瓣往下翻、窗內露出瞼板；瞼板切開畫虛線，高度由矢狀切面換算）。
- Levator 與眉毛（第 3 章）：同第一部。
- 電解（第 4 章）：上瞼緣矢狀切面放大（寬 5 mm、1 mm 比例尺）＋正面上瞼緣特寫。

## 驗收項目
- [x] 三個步驟都在上眼瞼；順序 rotation → levator → brow；rotation 走同一條切口（`check.js`：皺褶切口＝levator 下切口，0.00 mm）。
- [x] 每段手術步驟同時顯示兩個視角並寫明方位；同一結構兩圖一致（切口高度、瞼板切開高度 < 0.3 mm）。
- [x] 旁白與畫面每個數字都在數字帳本有出處；沒有出處的標「示意」或說「依院內常規」，列在 `overview-notes.md`。
- [x] `node videos/tools/check-all.js videos/src/upper-lid-levator-rotation-brow` 全部通過；每段一張參考圖（Claude 自檢）。
- [ ] 出片前交總覽；上傳為不公開並同步網站（不在這次的範圍）。

## 進度
- 2026-11-06：舊版（上下眼瞼）完成並出片、上傳（不公開）。
- 2026-11-06：站長更正病例 → 重做。資料夾改名；下眼瞼段落全部拿掉；第 2 章改成上眼瞼前路 marginal rotation（Cruz 2015a/b）；第 3 章 levator 與眉毛（重用第一部的狀態）；電解改成上眼瞼（Elder 1997 上眼瞼 1.8 mm、碰到 95% 要 2.4 mm）；新增 Cruz 2015a、Cruz 2015b、Cruz 2023（PubMed 查證；Cruz 2015a 讀全文）；拿掉 Lim 2004、Kakizaki 2009、Singh 2024、Yip 2000。眼瞼模型加選用參數 `creaseH`（不給時畫面逐字不變，其他影片參考圖 0.000%）。旁白 78 句、全長 9:16；參考圖 15 張與每章總覽 `ref/overview/`；`publish/` 重寫（`yt: 'TBD'`）。
- 下一步：站長看總覽；上傳 YouTube（不公開）並同步網站；刀後依 OP note 對照「待刀後補」。
