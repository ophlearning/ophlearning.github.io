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
- [x] 上眼瞼的重述畫面完全重用第一部的模型狀態（同樣的狀態、視窗與 `VIEWS.sag`／`VIEWS.cor` 畫法；數值從第一部 `params.js` 複製）。
- [x] 下眼瞼 rotation 用共用模型裡第二部的狀態（`lower.js`：`subcil`、`plane`、`septOpen`、`retrOpen`、`frac`、`mattress`、`tie`、`skinClose`）；epilation 的毛囊深度有出處並寫成檢查（Elder 1997、Singh 2024）。
- [x] 每段手術步驟同時顯示兩個視角；同一結構兩圖一致（切口、fracture、上瞼緣、下睫毛線 < 0.3 mm）。
- [x] 旁白每個數值都有出處並寫成檢查；沒有出處的標「示意」或拿掉，列在出片前的總覽。
- [x] `node videos/tools/check-all.js videos/src/levator-brow-lower-lid-rotation` 全部通過；每章至少一張參考圖。
- [ ] 出片前交總覽；上傳為不公開並同步網站。（總覽已做好；上傳與網站同步未做）

## 進度
- 2026-11-06：規格書完成。
- 2026-11-06：`script-draft.md` 草稿第 1 版完成（電解的毛囊深度：Elder 1997 下眼瞼 0.9 mm、Singh 2024 根部 1.8 mm，兩篇都列；沒有東亞人資料，模型用標準值）。
- 2026-11-06：下眼瞼模型完成（見第二部規格書的進度與 `videos/models/eyelid/CARD.md`）。這一部要用的部分：
  - 下睫毛毛囊：深度 0.9 mm（Elder 1997，可改 1.8 mm：Singh 2024）、和瞼緣表面夾 75°、往瞼板方向斜（Singh 2024）；方向歪與化生的下睫毛；電解針沿睫毛幹、針尖停在毛囊根部；處理後的毛囊（凝固範圍示意；拔不拔睫毛待刀後確認）。每一項都有檢查。
  - 視角：下瞼緣矢狀切面放大（`lzoom`，寬約 5 mm，附 1 mm 比例尺）＋正面瞼緣特寫（`lcor` 放大）；樣本見 `eyelid/sample-lower-lts.jpg` 右半。
  - 上下眼瞼同時存在：`both` 視角（同一切面畫上下眼瞼）已有；**閉眼的動作還沒做**，等 1-2 的旁白有出處再決定要不要做。
- 下一步：拿到實際 OP note 後補「待刀後補」、查 epilation 文獻、寫腳本。
- 2026-11-06：站長決定不等 OP note、依院內範本＋文獻、用專業判斷先做影片（同第一部）。影片完成到出片（未上傳、網站未改）：
  - 章節定稿（逐句旁白與出處見 `script-draft.md` 第 2 版，由 `anim/segments.js` 產生）：片頭；1 臨床決策（1-1 睫毛碰眼的三種機轉 → rotation 處理 entropion、剩下的睫毛電解；1-2 上下一起開：ptosis 修復後的閉不緊與下方鞏膜露出，閉眼要上下一起看）；2 上眼瞼快速重述（2-1 levator resection、2-2 internal brow fixation，共約 70 秒，重用第一部的狀態並指向第一部第 4 章）；3 下眼瞼 marginal rotation（3-1 層次與睫毛下切口、3-2 剝開眶隔與 retractors、3-3 tarsal fracture、3-4 mattress suture 與縫皮）；4 Electric epilation（4-1 毛囊在哪裡、4-2 做法、4-3 不一定一次就好）；5 順序與術中狀況（5-1 本片的順序、5-2 三個狀況）；6 術後；7 跟刀清單；參考文獻。原大綱的「5 術中狀況、6 術後」合併成第 5、6 章。
  - 文獻 12 篇（PubMed 逐篇查證；摘要或全文核對）：沿用 Rajak 2012（Surv Ophthalmol 全文：三種機轉、electrolysis 的做法與適應症、復發率高）、Elder 1997、Singh 2024、Singh 2022；新增 Tucker 2000（ptosis 修復後的閉不緊）、Lim 2004、Kakizaki 2009（下眼瞼解剖）、Sakarya 2010、Kapantais 2022（電解結果）、Yip 2000（過度矯正）；上眼瞼重述沿用 Kokubo 2019、Pruksapong 2022。草稿裡的 Sinha 2024 沒有用（疤痕性眼表疾病，族群差太多）。
  - 上下眼瞼一起閉眼的動作：沒有找到有出處的旁白內容（PubMed 查不到上下眼瞼同時手術對閉眼的研究），**沒有做**；1-2 只講 Tucker 2000 的閉不緊與預測因素，並推論「閉眼要上下一起看」（列在 `overview-notes.md`）。
  - 畫面：下眼瞼視角包在 `anim/views-lower.js`（`VL.lsag`、`VL.lcor`、`VL.upper`），共用模型與 kit 沒有改。電解的矢狀切面放大用 `lzoom` 的同一份模型（視窗 5 mm、1 mm 比例尺）。
  - 檢查：`check.js`（數字帳本 255 項；旁白↔模型 23 項；10 段手術步驟的兩個視角都寫明方位；`--selftest` 32 個故意改錯全部抓到）；`check-all.js` 全部通過。
  - 語音：共用 MeloTTS，本片發音補在 `tts/lexicon-extra.json`；`anim/timeline.js` 進 git；全長 8:32。
  - 參考圖 17 張（每段至少一張，Claude 自檢）；出片前總覽 `ref/overview/`（每章一張）與 `overview-notes.md`。
  - 出片：`out/levator-brow-lower-lid-rotation.mp4`（不進 git）；`publish/` 有 YouTube 說明欄、章節、字幕與網站條目草稿（`yt: 'TBD'`）。
- 下一步：站長看總覽；上傳 YouTube（不公開）並同步網站；刀後依 OP note 對照「待刀後補」，不同處改 `anim/params.js`／`anim/segments.js` 後重新出片。
