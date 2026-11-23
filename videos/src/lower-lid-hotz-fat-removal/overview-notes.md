# 出片前總覽：示意、範本的解讀與沒有直接出處的內容

2026-11-23，手術當天下午的術前預習（OS 下眼瞼 Hotz＋去眼袋；病例摘要是站長當天確認的原樣，見 `spec.md`）。不等 OP note：步驟依院內範本的 Hotz，內容不超出三張列印單已查證的範圍；新的數字一律在 `check.js` 的數字帳本登記來源。手術參數與狀態在 `anim/params.js`，和列印單 `print/video.js` 同一組。

每章一張總覽圖在 `ref/overview/`（1280×720，Claude 自檢）：

| 章 | 圖 | 內容 |
|---|---|---|
| 片頭 | `ref/overview/0-title.jpg` | 標題；右邊正面：右眼 OD 示意（本台 OS 左右相反），下眼瞼內翻、睫毛往內碰到角膜 |
| 1 臨床決策 | `ref/overview/1-clinical.jpg` | 術前 → Hotz 做完：orbicularis 縫到 retractor aponeurosis、部分去脂、睫毛離開角膜（示意）；選術式與去脂量依主治 |
| 2 術前 | `ref/overview/2-preop.jpg` | 血小板與 PT／aPTT 留空白（紀錄沒有）；AABB 門檻 50 × 10⁹/L（Kaufman 2015）；眼瞼成形術後眶內出血的共病（Hass 2004） |
| 3 手術步驟 | `ref/overview/3-steps.jpg` | 三團脂肪：下斜肌分開內／中、弓狀擴張分開中／外（Coban 2023；範圍示意） |
| 4 收尾 | `ref/overview/4-closing.jpg` | 閉眼、瞼緣方向、沒有活動性出血；術後 lagophthalmos（Prischmann 2013）、本病例 TBUT 3 秒 |
| 5 術後 | `ref/overview/5-postop.jpg` | 球後出血的時間與徵象（Hass 2004、Murali 2021）；眼窩水平切面的血腫與眼球前凸 |
| 6 跟刀清單 | `ref/overview/6-checklist.jpg` | 八件事，和列印的跟刀清單同一份 |
| 參考文獻 | `ref/overview/7-references.jpg` | 9 篇（PubMed 已查證） |

## 病例與範本（刀後要和 OP note 對照）
1. **病例**：只用站長確認的摘要與門診紀錄重點（OS 內翻合併 trichiasis、眼袋 OU、TBUT 3 秒、下方 SPK、SCH++、pancytopenia、thrombocytopenia）。血小板與 PT／aPTT 的數值紀錄沒有，畫面與旁白都留 [ ]，說「跟刀前自己查」。紀錄寫「復發」但眼科史寫沒開過刀：前次處置一律說「不詳」，模型不畫前次疤痕。病人的年齡、性別、醫院、主治都不寫。
2. **院內範本的 Hotz**：切除皮膚、皮下與 orbicularis → 穿過肌肉層、眶隔、露出 retractor aponeurosis、部分去脂 → orbicularis 固定到 aponeurosis（6-0 Prolene ×5）。畫線、切除寬度、去哪幾團脂肪與去多少、縫線位置與深度、傷口縫合與敷料、麻醉、用藥與止吐：一律說「依院內常規」。
3. **「範本的這條路本來就要穿過眶隔，所以眼袋可以在同一個切口處理」**（第 1 章第 4 句）：由範本的步驟（穿過眶隔、露出 aponeurosis、部分去脂）推論；為什麼這位病人選 Hotz，旁白明說依主治判斷。

## 畫法（沒有數值出處，示意）
4. 內翻、retractor 鬆脫、preseptal orbicularis 上跨的程度（模型 `entr` 0.95、`dehis` 1、`override` 0.6），和列印單相同。
5. 切除的寬度與位置（模型 `hotzLo` 2.0、`hotzW` 3.0 mm）、切除線（紅）。
6. 開眶隔後正面看到的三團脂肪範圍（`draw.js` 的 `FAT_WIN`，照列印單）、各團大小、下斜肌在矢狀切面上的位置。
7. 部分去脂（模型 `hotzFat`：眶隔前凸變平 1.4 mm）。
8. Hotz 做完後瞼緣外轉、睫毛離開角膜：借用模型的 `tie` 狀態（列印單也這樣畫）；正面五針的位置。
9. 下方角膜 SPK 的點（位置照病例「下方 SPK」，數量與分布示意）。
10. 球後血腫的大小、眼球前凸的量與眼瞼張力（眼窩模型的 `heme`，和 lateral canthotomy 影片同一個模型）。
11. 2-1 的 AABB 門檻條沒有刻度，只標 50 × 10⁹/L 一個門檻。

## 文獻只支持一部分、或是本片的講法
12. Hass 2004 與 Prischmann 2013 的病人是美容 blepharoplasty，不是 Hotz：旁白一律說「眼瞼成形術後」。Syniuta 2003 也是美容 blepharoplasty（上、下眼瞼都有），上斜肌那 5 位不一定和下眼瞼有關。
13. Coban 2023 是土耳其 50 具屍體：三團型（Type 1）36%、兩團型（Type 2）20%、double convexity（Type 3）44%；摘要寫「最常見是 Type 1」和 44% 互相矛盾，所以旁白只說「36% 分成清楚的三團」，不說「最常見」。模型卡引的 Oh 2006（韓國）是 60%，本片只用 Coban（和列印單相同）。
14. Kaufman 2015（AABB）的建議對象是 major elective non-neuraxial surgery；眼瞼手術算不算這一類、要不要輸，旁白明說依主治與血液科判斷。
15. Murali 2021 寫給急診醫師：IOP 超過 30 緊急找眼科、超過 40 立刻減壓；旁白說「急診的文獻建議」。
16. 「這位病人血小板低，回病房後的這段時間要特別注意」「術前記下角膜，術後才比得出差別」「每一層止血」「斷端止血再放開」「請病人閉眼（預設局麻）」：沒有出處的提醒，不帶數字（spec.md 已列）。
17. 片尾製作者用 kit 預設「製作　張博淳」（不寫醫院名稱）。

## 有出處、寫成檢查的數字
旁白、重點框和畫面上的每一個數字都列在 `check.js` 的數字帳本（LEDGER），每個都要有來源。手術步驟講到的空間關係都在模型上檢查：內翻時睫毛碰到角膜、固定後離開（> 2 mm）；切除深度到眼輪匝肌、兩圖切除線同高；開眶隔的切口在眶隔上；融合處在瞼板下 2.38 mm（Kakizaki 2006）；三團脂肪由 temporal 到 nasal 依序是外側 → 弓狀擴張 → 中央 → 下斜肌 → 內側；去脂後眶隔前凸變平；五針、縫線從眼輪匝肌到 capsulopalpebral fascia；球後血腫使眼球前凸、眼瞼繃緊，canthotomy＋inferior cantholysis 後張力歸零；canthotomy 水平、cantholysis 在下支；每段雙視角都寫「右眼 … 本台 OS」。`node check.js --selftest` 會把每一項故意改錯一次（23 個改法全部抓到）。
