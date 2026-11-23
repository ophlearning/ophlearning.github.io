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

## 驗收項目
- [ ] 三張列印單 PASS（跟刀清單、手術步驟圖、關鍵解剖與數字速查）：`node videos/tools/print/print.js videos/src/lower-lid-hotz-fat-removal --gray` 最後一行 `all 3 sheet(s) passed`，彩色與灰階全頁看過。
- [ ] 出血風險（術前血小板與凝血、術中止血、術後球後出血的徵象與第一步）每一點都有出處；沒有出處的不寫數字。
- [ ] 單子與旁白的每個數字在數字帳本有來源（文獻、院內常規、示意、結構、病例）。
- [ ] 每一步同時顯示機轉切面與術者視角，方位寫明。
- [ ] 不出現病人識別資料、主治代號與醫院名稱（commit 前 grep）。
- [ ] 影片：`check-all` 全部通過 → 術前速讀包 → 出片 → 不公開上傳 → 網站同步。

## 進度
- 2026-11-23 11:00　病例摘要確認；三張列印單由小助手做，主對話檢查。
