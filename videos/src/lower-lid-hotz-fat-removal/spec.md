# 下眼瞼 Hotz＋去眼袋（recurrent involutional entropion＋lid bag）：術前預習（規格書）

2026-11-23 訂（草稿）。手術當天下午，先做三張列印單，影片之後做。

## 目標與觀眾
- 觀眾：跟這台刀的眼科住院醫師。看完要知道：院內範本的 Hotz 每一步動到哪一層、去眼袋在哪一步做、下眼瞼三團脂肪與 inferior oblique 的位置，以及這位病人血小板低時，術前、術中、術後各要注意什麼（球後出血的徵象與第一步）。
- 畫面：右眼、亞洲人、`videos/models/eyelid/` 的 mm 模型（下眼瞼矢狀切面＋正面）；本台 OS，圖註明左右相反。

## 病例情境（站長 2026-11-23 確認）
- 確認的摘要（原樣）：「OS 下眼瞼 recurrent involutional entropion＋lid bag：照院內範本的 Hotz 做：切除皮膚與 orbicularis → 打開眶隔、去除部分脂肪（也就是去眼袋）→ 把 orbicularis 固定到 retractor。附加：無。血小板 [ ]。」
- 門診紀錄（站長提供；只摘和手術有關的，年齡、性別、電話、醫師代號不寫）：lower entropion and lid bag OU（這次開 OS）；OS entropion with trichiasis；結膜 SCH++ OS；角膜 lower SPK；TBUT 3 秒、dry eye；全身 pancytopenia（r/o MDS 或 ITP）、thrombocytopenia、recurrent duodenal ulcers。
- 紀錄自相矛盾：眼科史寫「沒開過刀」，診斷卻寫「OS recurrent」→ 前次處置一律寫「不詳」，不臆測。血小板數值紀錄沒有，單子留 [ ]。

## 時程
- 手術 2026-11-23 下午。順序：三張列印單 → 影片（旁白與畫面、`check-all`、術前速讀包、出片）。

## 術式依據與保密
- 院內範本的 Hotz（原文見 `../lower-lid-entropion-revision/spec.md`）：切除皮膚、皮下與 orbicularis → 穿過肌肉層、眶隔、眶脂肪露出 retractor aponeurosis、部分去脂 → orbicularis 固定到 aponeurosis（6-0 Prolene ×5）。範本值與去脂量標「依院內常規」。
- 影片、網站、這份規格書都不寫主治代號與醫院名稱。

## 文獻
- PubMed 查證，全文引用在 `anim/segments.js` 的 REFS；數字與來源在 `check.js` 的 LEDGER。
- 出血：Kaufman 2015（AABB：major elective non-neuraxial surgery 血小板 < 50 × 10⁹/L 建議預防性輸血小板；眼瞼手術算不算由主治與血液科判斷）、Hass 2004（blepharoplasty 後眶內出血 0.055%、永久視力喪失 0.0045%；多在 3 小時內；共病高血壓、aspirin、嘔吐、用力）、Murali 2021（OCS 徵象、只有約 15% 說眼痛、IOP 門檻；數字來自 PMC 全文）、McCallum 2019（2 小時內處置視力較好）、Lima 2009（列在 REFS，單子沒用到數字）。
- 解剖與併發症：Coban 2023（50 具屍體、三團型 36%；IO 分開內／中，arcuate expansion 分開中／外）、Syniuta 2003（眼瞼成形術後持續複視 12 位：下直肌 7、上斜肌 5）、Prischmann 2013（術後乾眼症狀 26.5%、lagophthalmos 使風險上升）、Kakizaki 2006（照抄 revision 影片：眶隔與囊瞼筋膜在瞼板下 2.4 mm 融合）。
- Hass 2004 與 Prischmann 2013 的病人是美容 blepharoplasty，不是 Hotz；單子寫「眼瞼成形術後」。三團型比例 Coban 2023（土耳其）36%，和模型卡引的 Oh 2006（韓國）60% 不同，單子只用 Coban。
- 沒有出處的提醒（不帶數字）：每一層止血、斷端止血再放開、請病人閉眼（預設局麻）。

## 影片章節（2026-11-23 第 1 版）
- 片頭 → 1 臨床決策（復發的內翻加眼袋、為什麼用 Hotz；前次處置不詳）→ 2 術前（2-1 血小板與凝血、2-2 乾眼與角膜）→ 3 手術步驟（3-1 切除皮膚、皮下與 orbicularis，3-2 打開眶隔露出 retractor aponeurosis，3-3 三團脂肪與 inferior oblique，3-4 部分去脂與止血，3-5 orbicularis 固定到 aponeurosis）→ 4 收尾（閉眼、瞼緣方向、止血）→ 5 術後（5-1 球後出血的時間與徵象，5-2 第一步 canthotomy＋inferior cantholysis，指向網站的 lateral canthotomy 影片）→ 6 跟刀清單（和列印單同一份）→ 參考文獻。
- 畫面：手術步驟每段左＝下眼瞼矢狀切面、右＝正面術者視角（同一個狀態，和列印單同一組 `anim/params.js`）；球後出血用眼窩水平切面（`videos/models/orbit/`）＋正面外眥開窗。每個正面面板標「右眼 OD 示意（本台 OS 左右相反）」。
- 文獻：沿用列印單的 9 篇，沒有新增。Coban 2023 摘要寫「最常見是 Type 1（36%）」，但 Type 3 是 44%，旁白只說「36% 分成清楚的三團」。

## 驗收項目
- [x] 三張列印單 PASS（跟刀清單、手術步驟圖、關鍵解剖與數字速查）：`node videos/tools/print/print.js videos/src/lower-lid-hotz-fat-removal --gray` 最後一行 `all 3 sheet(s) passed`，彩色與灰階全頁看過。
- [x] 出血風險（術前血小板與凝血、術中止血、術後球後出血的徵象與第一步）每一點都有出處；沒有出處的不寫數字。（影片 2-1、3-1、3-4、4、5-1、5-2：Kaufman 2015、Hass 2004、Murali 2021、McCallum 2019；止血的提醒不帶數字）
- [x] 單子與旁白的每個數字在數字帳本有來源（文獻、院內常規、示意、結構、病例）。（`check.js` 150 項帳本檢查＋`print.js` 數字檢查 PASS）
- [x] 每一步同時顯示機轉切面與術者視角，方位寫明。（`check.js` 檢查 11 段畫面都有「右眼 … 本台 OS」）
- [ ] 不出現病人識別資料、主治代號與醫院名稱（commit 前 grep）。（2026-11-23 影片檔案 grep 過醫院名稱、年齡、性別、電話：沒有；commit 前再 grep 一次）
- [x] 影片：`check-all` 全部通過 → 術前速讀包 → 出片 → 不公開上傳 → 網站同步（2026-11-23）。（2026-11-23：`check-all` 在暫存的文字基準上全部 PASS、速讀包已產生；`ref/manifest.json` 的 `textBase` 等 commit 後填；還沒出片）

## 進度
- 2026-11-23 11:00　病例摘要確認；三張列印單由小助手做，主對話檢查。
- 2026-11-23 11:10　三張列印單（清單 8 項、步驟圖 8 格［第 8 格球後出血用外眥水平切面＋正面］、速查）`print.js --gray` 全部 PASS；主對話看過彩色全頁，速查表「眼袋手術後眶內出血」改成「眼瞼成形術後眶內出血」（Hass 2004 是所有 blepharoplasty）後重跑 PASS；補上 `.gitignore`（`out/`）。三頁 PDF（A4 頁面上的 LSs 版）與 PNG 交給站長。正面開眶隔後的三團脂肪範圍、下斜肌在切面上的位置、Hotz 後瞼緣轉正（借用 `tie` 狀態）都是示意；第 7 格和第 6 格同一個狀態（模型沒有閉眼動作）。
- 2026-11-23 11:40　影片第 1 版（小助手）：`anim/segments.js`（片頭＋6 章 13 段＋參考文獻，55 句）、`anim/draw.js`、`anim/params.js`（和列印單同一組狀態）、`anim/views-lower.js`、`anim/video.html`、`check.js`（保留列印單的帳本鍵，加影片段落的帳本、旁白↔模型 16 項、方位檢查與 `--selftest` 23 個改法全部抓到）、`tts/lexicon-extra.json`、語音與 `anim/timeline.js`（片長 6:19）、參考圖 13 張（Claude 自檢）、總覽 `ref/overview/` 8 張與 `overview-notes.md`、`publish/`（`yt: 'TBD'`）、`script-draft.md`、`README.md`。文獻沒有新增；Coban 2023 的旁白改成「36% 分成清楚的三團」（摘要的「最常見」和 Type 3 44% 矛盾）。`check-all` 在暫存的文字基準（不寫進 repo 的 git 物件）上全部 PASS；`print.js --gray` 仍 `all 3 sheet(s) passed`；術前速讀包 `node videos/tools/video-kit/brief.js` → `out/brief/`（旁白.md＋13 張）。
- 2026-11-23 11:55　主對話：commit 後把 `ref/manifest.json` 的 `textBase` 設成影片內容的 commit（`02beaab`），`check-all` 全部通過；術前速讀包合成 PDF 與旁白.md 交給站長；出片 `out/lower-lid-hotz-fat-removal.mp4`（ffprobe 379.3 秒＝6:19，1920×1080、30 fps、AAC；抽格看過第 3 章）；YouTube 不公開上傳，影片 ID `CYqyymgItyY`（privacy: unlisted）；網站 `videos/index.html` 加在 `VIDEOS` 最前面，瀏覽器開 `videos/#lower-lid-hotz-fat-removal` 沒有 JS 錯誤、嵌入的是這支影片。
- 下一步：PR 合併後把 `textBase` 改成 main 上的 squash commit（repo 根目錄 `CLAUDE.md`）；刀後站長給 OP note 時再校正。
