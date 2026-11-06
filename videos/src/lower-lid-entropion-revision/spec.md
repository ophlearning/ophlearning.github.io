# 第二部：OD 下眼瞼 entropion 復發的 revision（規格書）

2026-11-06 訂。三部組合刀影片的第二部（第一部見 `../levator-resection-brow-fixation/spec.md`）。

## 目標與觀眾
- 觀眾：準備跟這台刀的眼科住院醫師。看完要能回答：上次的手術為什麼沒撐住？這次要多處理哪一個機轉？每一步動到下眼瞼的哪一層？
- 畫面：右眼、亞洲人、`videos/models/eyelid/` 的 mm 模型動畫。**下眼瞼還沒建**，先補模型卡與樣本圖，自己放大檢查後才做影片。

## 病例情境（站長 2026-11-06 確認）
- 老年 involutional entropion。一年前在同一個下眼瞼（OD lower）做過 marginal rotation，近期又出現 mild entropion，這次做 revision。
- 這是站長 2026-11-06 實際跟的刀。**revision 的術式與步驟以刀後實際 OP note 為準。**

## 術式依據與保密
- 主治範本不進 git，影片與網站不寫主治代號與醫院名稱。
- 範本中的下眼瞼術式（刀後對照實際用了哪一種）：
  - **Marginal rotation for lower lid**：睫毛下 2.5 mm 切皮 → 剝開眶隔與 retractor，到結膜 → 15 號刀切瞼板一半深度（tarsal fracture）→ 4-0 vicryl mattress ×2 → 7-0 ethilone 縫皮；可以再加 lateral canthopexy（4-0 vicryl 固定到外側眶緣骨膜 ×1）。
  - **Marginal rotation＋lateral tarsal strip**：先 lateral canthotomy、做 tarsal strip 固定到外側眶骨膜（4-0 vicryl ×1），再做上面的 rotation（mattress ×3）。
  - **Hotz**：切除皮膚、皮下與 orbicularis → 穿過肌肉層、眶隔、眶脂肪露出 retractor aponeurosis、部分去脂 → orbicularis 固定到 aponeurosis（6-0 Prolene ×5）。

## 待刀後補
- [ ] 主治判斷的復發原因：horizontal laxity（distraction、snap-back）、retractor、用力閉眼時加重（preseptal orbicularis override）、前次縫線吸收、疤痕。
- [ ] 一年前做的是哪一個版本（有沒有 tarsal fracture、有沒有 canthopexy／LTS）。站長若查得到舊 OP note 就補上；查不到就寫「不詳」，影片不臆測。
- [ ] 這次選哪一種 revision、為什麼。
- [ ] 前次疤痕對剝離平面與找 retractor 的影響。
- [ ] Tarsal fracture 的高度與深度、mattress suture 的進出針位置、有沒有加 LTS／canthopexy。

## 章節大綱（草稿）
| 章 | 內容 | 主要出處 |
|---|---|---|
| 片頭 | 一年前做過、又內翻了 | — |
| 1 為什麼會復發 | 1-1 involutional entropion 的三個機轉，各對應一個術式成分；1-2 檢查：每個機轉怎麼在門診看出來；1-3 只做 everting suture 和加上 horizontal tightening 的復發率 | Nakos 2019；Dulz 2019；Auguste 2023；機轉與檢查 [待查證] |
| 2 這次怎麼選 | 主治的三種下眼瞼術式各處理哪個機轉；這次選哪一種 | 實際 OP note |
| 3 術前準備 | 畫線、麻醉 | 實際 OP note |
| 4 手術步驟 | 依實際 OP note 拆段（預計：切皮、穿過前次疤痕找 retractor、tarsal fracture、mattress suture、LTS／canthopexy、縫皮） | 實際 OP note＋文獻 |
| 5 術中狀況 | 疤痕組織、過度矯正變 ectropion、瞼緣缺口 | [待查證] |
| 6 術後 | 追蹤重點 | [待查證] |
| 7 跟刀清單 | — | 實際 OP note |
| 參考文獻 | — | — |

## 兩個同步視角（寫進模型卡時定案）
- 機轉切面：下眼瞼矢狀切面（經瞳孔中央），看 retractor、瞼板、眶隔、tarsal fracture 與 mattress suture 的路徑。
- 術者視角：正面皮膚面（睫毛下切口、縫線出針點）。
- 做 LTS／canthopexy 的段落：外眥部要另外決定視角（候選：外眥水平切面看 tarsal strip 拉到眶緣內側骨膜，加正面）。開始做時寫進模型卡。

## 下眼瞼模型要補的部分（先寫進 `videos/models/eyelid/CARD.md`，數值逐項找出處）
- 結構：下瞼板、lower lid retractors（capsulopalpebral fascia）、眶隔與 retractor 的融合、下穹窿、inferior oblique、下眼瞼脂肪墊、眼輪匝肌（pretarsal、preseptal）、外眥韌帶與外側眶緣骨膜、下眶緣。
- 亞洲人和其他族群的差異：有文獻證實才改用亞洲人數值（待查）。
- 手術狀態：involutional 內翻（horizontal laxity、retractor 鬆脫、preseptal orbicularis 往上跨）、前次手術的疤痕、睫毛下切口、tarsal fracture、mattress suture 轉出瞼緣、LTS／canthopexy、Hotz 的皮膚肌肉切除與固定。
- 檢查：同一個結構在矢狀切面與正面的高度一致；矯正後睫毛離開角膜；mattress suture 出針點在睫毛下方；縫線穿過的層次正確。

## 文獻（PubMed 已查證，2026-11-06；之後繼續補）
1. Nakos EA, et al. Randomized Controlled Trial Comparing Everting Sutures with a Lateral Tarsal Strip for Involutional Lower Eyelid Entropion. Ophthalmol Ther 2019;8(3):397-406. doi:10.1007/s40123-019-0189-3 — 12 個月成功率：LTS 88.5%、everting sutures 57.1%；復發 11.5% 對 42.9%。
2. Dulz S, et al. A comparison of the lateral tarsal strip with everting sutures and the Quickert procedure for involutional entropion. Acta Ophthalmol 2019;97(6):e933-e936. doi:10.1111/aos.14093 — LTS＋everting sutures 和 Quickert procedure 的 14 個月成功率相近。
3. Auguste LA, Nghiem AZ, Vahdani K. Horizontal eyelid shortening alone versus combined procedures for the correction of involutional lower eyelid entropion. Int Ophthalmol 2023;43(12):4979-4983. doi:10.1007/s10792-023-02900-1 — 只做 horizontal shortening 復發 7%，合併術式 8%；作者建議依主要的致病因素選術式。

注意：主治範本的 marginal rotation 有剝開 retractor 與 tarsal fracture，不等於研究裡單純的 everting sutures（Quickert）；旁白引用時要講清楚這個差別。

## 驗收項目
- [x] 下眼瞼模型卡、樣本圖完成並自己放大檢查；`eyelid/check.js` 加上下眼瞼的檢查並全部通過（2026-11-06）。
- [ ] 步驟章節和實際 OP note 一致（2026-11-06 先依院內範本的「marginal rotation＋lateral tarsal strip」版本做，刀後對照）；復發原因只講主治的判斷與有出處的內容，不臆測前次手術細節（已做到：旁白明說不臆測）。
- [x] 每段手術步驟同時顯示兩個視角，同一結構兩圖高度差小於 0.3 mm（`check.js`：切口兩圖差 0.01 mm；外眥固定點水平切面與正面 x 差 0.11 mm）。
- [x] 旁白每個數值都有出處並寫成檢查；沒有出處的標「示意」或拿掉，列在出片前的總覽（`overview-notes.md`）。
- [x] `node videos/tools/check-all.js videos/src/lower-lid-entropion-revision` 全部通過；每章至少一張參考圖（21 張）。
- [ ] 出片前交總覽（`ref/overview/`、`overview-notes.md` 已備好）；上傳為不公開並同步網站（還沒做）。

## 進度
- 2026-11-06：規格書與第一批文獻完成。
- 2026-11-06：`script-draft.md` 草稿第 1 版完成（10 篇文獻；retractors 兩層與 horn 寬度沒有族群差異，模型用標準解剖）。
- 2026-11-06：下眼瞼模型完成（站長決定不等 OP note，先照院內範本＋文獻做；範本特有的數值是參數，標「依院內常規／待刀後確認」）。
  - 解剖（亞洲人值有文獻才用）：下瞼板 4.12 × 1.36 mm（Lim 2004）、下瞼板肌在瞼板下 1.44 mm 開始、眶隔在瞼板下 2.38 mm 與囊瞼筋膜融合（Kakizaki 2006；但多數亞洲人屍體看不到明確融合，畫虛線）、下穹窿 10.9 mm、眶下緣與脂肪墊前後位置（Kato 2025 東亞人）、外側眶緣（Tsai 2006 台灣人 Hertel）、Whitnall 結節眶緣內 1.5 mm、外眥韌帶。數值與 DOI 見 `videos/models/eyelid/CARD.md`。
  - 視角：下眼瞼矢狀切面（`lsag`）＋正面（`lcor`）；LTS／canthopexy 用外眥高度的水平切面（`axial`，從下往上看，同 CT）＋正面外眥（`lcanth`），兩圖共用 x。
  - 狀態：involutional entropion（retractor 鬆脫、眼輪匝肌上跨、horizontal laxity 與 distraction test）、前次疤痕、睫毛下切口、剝開眶隔與 retractor、tarsal fracture、mattress suture、綁緊、縫皮、Hotz、LTS（外眥切開、下支切斷、瞼板條、固定在眶緣內）、canthopexy。
  - 檢查：`eyelid/check.js` 新增 42 項（全部通過，每項故意改錯過）；樣本圖 `sample-lower.jpg`、`sample-lower-steps.jpg`、`sample-lower-lts.jpg` 自檢後登記在 `ref/manifest.json`（`page` 還是 null）。
  - 查文獻時順便找到腳本 1-2 的 [待核對出處]：distraction 超過 6–8 mm 算明顯、往下看時下眼瞼正常移動 3–4 mm（Pushker 2025，doi:10.4103/IJO.IJO_630_24）；內翻病人 distraction 7.5–11 mm、下穹窿脂肪脫出是 retractor 鬆脫的徵象（Beigi 2008，doi:10.1016/j.ophtha.2008.02.014）。還沒寫進腳本。
  - 模型卡列為示意或 [待核對出處]、出片前要列進總覽的：眶下緣高度、下斜肌在切面上的位置、脂肪墊大小、內翻角度與睫毛被擋住的門檻、retractor 退縮量、正常眼瞼的 distraction 3 mm 與 LTS 預設剪掉的長度、tarsal fracture 的位置與切的面、出針點、MRD2 5 mm。
- 下一步：拿到實際 OP note 後改參數（切口、fracture、縫線位置、有沒有 LTS）、寫腳本，再做影片頁。
- 2026-11-06：站長決定不等 OP note、依院內範本與文獻、以專業判斷先做影片。影片完成到出片（未上傳、未改 `videos/index.html`）：
  - 術式：範本三種下眼瞼術式中，本片**假設術前 distraction test 顯示 horizontal laxity**，示範「marginal rotation＋lateral tarsal strip」（範本順序：先 LTS 再 rotation）；旁白明說這是假設、實際依主治判斷；一年前的手術細節與復發原因不臆測。
  - 旁白定稿：`script-draft.md` 第 2 版（由 `anim/segments.js` 產生）；PubMed 查證並新增 Pushker 2025、Beigi 2008（`[待核對出處]` 的兩項都支持，已用上）、Scheepers 2010、Anderson 1979、Becker 1982、Gioia 1987、Kakizaki 2006、Dunbar 2017；共 16 篇。
  - 視角：下眼瞼步驟用矢狀切面＋正面；LTS 用外眥水平切面（從下往上看，同 CT）＋正面外眥，兩圖同一個 x 視窗（瞼板條拉緊時兩圖末端同 x）。下眼瞼的視角包裝放在本片 `anim/views-lower.js`（`kit.js` 與共用模型都沒改）。
  - 檢查：`check.js` 數字帳本（259 項）＋22 項旁白↔模型檢查（復發時睫毛碰到角膜、綁緊後離開；切口 2.5 mm 兩圖同高；剝離平面在眶隔前；retractors 開到結膜；融合處 2.38 mm；fracture 一半深度、不穿結膜；mattress ×3／×2、進出針位置、穿過 retractors、不進眼球；過度矯正；distraction 範圍；canthotomy 水平、cantholysis 下支；Whitnall 1.5 mm；瞼板條固定在眶緣內面骨膜、一針、兩圖同 x）；`--selftest` 27 種改錯全部抓到。
  - 參考圖 21 張（Claude 自檢）；出片前總覽 `ref/overview/`（每章一張）與 `overview-notes.md`（範本的解讀、示意與推論，刀後對照用）。
  - 出片：`out/lower-lid-entropion-revision.mp4`（不進 git；ffprobe 528.80 秒＝8:49，1920×1080、30 fps、15864 格，AAC 48 kHz 立體聲，旁白 −16.7 LUFS，47 MB）；`publish/` 有章節、字幕、YouTube 說明欄與網站條目草稿（`yt: 'TBD'`）。
- 下一步：站長看總覽；上傳 YouTube（不公開）並同步網站；刀後依 OP note 對照「待刀後補」與 `overview-notes.md` 的範本解讀，不同處改 `anim/params.js`／`segments.js` 後重新出片。
