# 第三部：上眼瞼 levator resection＋internal brow fixation，下眼瞼 marginal rotation＋electric epilation（規格書）

2026-11-06 訂。三部組合刀影片的第三部，用第一部（上眼瞼）與第二部（下眼瞼）做好的模型狀態組合而成。

## 目標與觀眾
- 觀眾：準備跟這台刀的眼科住院醫師。重點不是再教一次 levator resection，而是：同一個病人上下眼瞼一起開，順序怎麼排、彼此怎麼影響，以及 marginal rotation 之後為什麼還要電解睫毛。
- 畫面：右眼、亞洲人、`videos/models/eyelid/` 的 mm 模型動畫。

## 病例情境（站長 2026-11-06 確認）
- 上眼瞼：levator resection＋internal brow fixation。
- 下眼瞼：marginal rotation＋electric epilation（兩者都在下眼瞼）。
- 這是站長 2026-11-06 實際跟的刀，步驟以刀後實際 OP note 為準。

## 和第一部重疊的部分（2026-11-06 討論時的推薦做法；站長沒有另外指定）
- Levator resection 與 internal brow fixation 只用約 1 分鐘精簡重述，畫面重用第一部的狀態，並指向第一部的章節。
- 篇幅留給：下眼瞼 marginal rotation、electric epilation、上下眼瞼一起開時的順序與互相影響。

## 術式依據與保密
- 主治範本不進 git，影片與網站不寫主治代號與醫院名稱。
- 範本的下眼瞼 marginal rotation 見第二部規格書；範本沒有 electric epilation，完全以實際 OP note 為準。

## 待刀後補
- [ ] 下眼瞼 entropion 的類型（involutional 或 cicatricial）與為什麼要合併電解。
- [ ] 先做上眼瞼還是下眼瞼；消毒、麻醉是一次做完還是分開。
- [ ] 下眼瞼 rotation：切口高度、有沒有 tarsal fracture、mattress 幾針與進出針位置。
- [ ] Electric epilation：機器種類（electrolysis、radiofrequency 或 cautery）、針插的方向與深度、能量與時間、處理幾根、在 rotation 之前還是之後、處理的是哪一種睫毛（misdirected 或 metaplastic）。
- [ ] 術中怎麼檢查閉眼（lagophthalmos）與上下眼瞼的位置。

## 章節大綱（草稿）
| 章 | 內容 | 主要出處 |
|---|---|---|
| 片頭 | 上下眼瞼一起開 | — |
| 1 臨床決策 | 1-1 睫毛碰眼的三種機轉：rotation 只處理 entropion，歪掉或長錯位置的睫毛要另外處理（接上 PLTR 影片 1-1）；1-2 上眼瞼拉高之後對閉眼與下眼瞼的影響 | Rajak 2012（Surv Ophthalmol，PLTR 影片已查證）；其他 [待查證] |
| 2 上眼瞼重述 | levator resection 與 brow fixation 約 1 分鐘，指向第一部 | 第一部 |
| 3 下眼瞼 marginal rotation | 重用第二部的模型狀態，依實際 OP note | 實際 OP note |
| 4 Electric epilation | 針沿睫毛幹到毛囊、處理的睫毛、和 rotation 的先後 | 實際 OP note＋文獻 [待查證] |
| 5 術中狀況、6 術後、7 跟刀清單 | — | [待查證]／實際 OP note |
| 參考文獻 | — | — |

## 兩個同步視角
- 上眼瞼段落：同第一部。
- 下眼瞼段落：同第二部。
- Epilation：矢狀切面放大到瞼緣（寬約 5 mm，看得到毛囊深度）＋正面瞼緣特寫（哪幾根睫毛、針從哪裡進）。
- 上下一起看閉眼：矢狀切面同時畫上下眼瞼，或正面看眼裂；開始做時決定並寫進模型卡。

## 模型要新增的部分
- 下眼瞼毛囊（電解的目標深度）與 misdirected／metaplastic 睫毛（上眼瞼已有，下眼瞼要補）。
- 電解針與處理後的毛囊狀態。
- 上下眼瞼同時存在的閉眼狀態（眼裂）。

## 文獻
- 待查：electrolysis、radiofrequency ablation 治療 trichiasis 的做法與結果；上下眼瞼同時手術的閉眼與 exposure 風險。
- 可引用的已查證文獻：PLTR 影片的 Rajak 2012（三種機轉、破壞毛囊的方法）。

## 驗收項目
- [ ] 上眼瞼的重述畫面完全重用第一部的模型狀態（參考圖一致）。
- [ ] 下眼瞼 rotation 重用第二部的模型狀態；epilation 的毛囊深度有出處並寫成檢查。
- [ ] 每段手術步驟同時顯示兩個視角；同一結構兩圖一致。
- [ ] 旁白每個數值都有出處並寫成檢查；沒有出處的標「示意」或拿掉，列在出片前的總覽。
- [ ] `node videos/tools/check-all.js videos/src/levator-brow-lower-lid-rotation` 全部通過；每章至少一張參考圖。
- [ ] 出片前交總覽；上傳為不公開並同步網站。

## 進度
- 2026-11-06：規格書完成。
- 下一步：第一、二部完成後開始；拿到實際 OP note 後補「待刀後補」、查 epilation 文獻、寫腳本。
