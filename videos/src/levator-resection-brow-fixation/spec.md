# 第一部：Levator resection + internal brow fixation + conjunctivoplasty（規格書）

2026-11-06 訂。三部組合刀影片的第一部（第二部見 `../lower-lid-entropion-revision/spec.md`，第三部見 `../levator-brow-lower-lid-rotation/spec.md`）。

## 目標與觀眾
- 觀眾：準備跟這台刀的眼科住院醫師。看完要知道每一步在做什麼、動到哪一層、主治在等什麼，以及這三個術式為什麼要一起做。
- 畫面：右眼、亞洲人單眼皮、`videos/models/eyelid/` 的 mm 模型動畫，不用手術錄影。

## 病例情境（站長 2026-11-06 確認）
- 成人 acquired（aponeurotic）ptosis，levator function 良好，局麻、前路（皮膚切口）手術。
- Conjunctivoplasty 指的是處理 levator resection 時或術後的 conjunctival prolapse（站長選項 B）。
- 這是站長 2026-11-06 實際跟的刀。**步驟章節以刀後站長回傳的實際 OP note 為準**；主治的術式範本只當作參考。

## 病例情境：第二台（站長 2026-11-13 確認）
- 確認的摘要：**OU 上眼瞼：levator resection → internal brow fixation；沒有附加處置**；主治範本與 11-06 那份相同；手術日期 2026-11-13（當天）。
- 站長決定：已有影片，**不重做影片**，只做貼開刀房牆壁的三張跟刀單（`print/`），並先送術前速讀包（`brief.js`）。
- 單子的圖沿用影片的右眼 OD；OU 的寫法：清單分「術前（兩眼）」「收尾（兩眼）」，兩眼的順序依院內常規，圖例註明 OS 左右相反。

## 術式依據與保密
- 主治的術式範本由站長提供，**不進 git**；影片、網站、這份規格書都不寫主治代號與醫院名稱。各院做法不同的地方，照舊標「依院內常規」。
- 範本中與這台刀有關的步驟（刀後要和實際 OP note 對照）：
  1. 局麻、消毒。
  2. 畫線切皮：「OU 2.5-4-4 mm」，切除皮膚 5 mm。三個數字推測是內側、中央、外側距睫毛線的高度，待刀後確認。
  3. 切除皮膚、皮下和 orbicularis。
  4. 打開眶隔，露出 aponeurosis。
  5. Levator disinsert、分離後，用 Putterman clamp 夾住，切除多餘的 levator。
  6. Levator 固定到瞼板：4-0 vicryl ×3；再固定到 orbicularis：6-0 Prolene ×4（推測是做雙眼皮線，待確認）。
  7. Internal brow fixation：往上剝到眉下，把眉下組織固定到骨膜上，4-0 vicryl ×1；另一份範本在這一步之後確認 MRD 2.5 mm。
  8. 縫皮：7-0 ethilone；GM oint。
  9. Conjunctivoplasty：範本沒有，完全以實際 OP note 為準。

## 待刀後補（站長回傳後填入，未填之前畫面不做這些步驟）
> **2026-11-06 站長決定：不等 OP note，依專業判斷先做影片。** 影片已依上面的院內範本（旁白一律說「依院內常規」）與文獻做好；範本的解讀與示意的地方列在 `overview-notes.md`。下列各項在刀後仍要和實際 OP note 對照，不同處改 `anim/params.js`（數值）與 `anim/segments.js`（旁白），再跑 `check-all.js`、重新出片。

- [ ] 切口三點高度、切除的皮膚寬度。
- [ ] Levator 切除量怎麼決定（術前算好，還是術中請病人睜眼調整）、clamp 夾的位置、實際切除幾 mm。
- [ ] 3 針固定點在瞼板上的高度與內外位置；打結後怎麼檢查 contour；目標 MRD1。
- [ ] 固定到 orbicularis 的 4 針是不是在做雙眼皮線。
- [ ] Brow fixation 的剝離平面、骨膜固定點（眶上緣上方多高、哪一段），以及怎麼避開 supraorbital notch。
- [ ] Conjunctival prolapse 什麼時候出現、脫出範圍、處理方式（fornix suture 從哪裡穿出、或直接切除）、用什麼縫線。
- [ ] 術中有沒有檢查 lagophthalmos。

## 章節大綱（定稿的逐句旁白與出處見 `script-draft.md` 第 2 版）
| 章 | 內容 | 主要出處 |
|---|---|---|
| 片頭 | 三個術式，一個切口 | — |
| 1 臨床決策 | 1-1 ptosis 評估：MRD1、levator function、Bell's phenomenon，決定能不能做 levator 手術；1-2 為什麼一起處理眉毛：ptosis 矯正後眉毛會下降；1-3 conjunctival prolapse 是什麼、誰比較會發生 | Kokubo 2019；Takagi 2021；Lee 2024；Buckman 1986；Dagi Glass 2026（對照：LF 很差時的術式） |
| 2 證據 | Internal browpexy 的效果：主要是防止下降，上提有限；與 external browpexy 比較；不適合的人 | McCord 1990；Baker 2016；Mokhtarzadeh 2017；Kaderli 2020；Huang 2023；Nemet 2019；Zandi 2017；Menderes 2024 |
| 3 術前準備 | 畫線（三點高度）、麻醉 | 實際 OP note |
| 4 手術步驟 | 4-1 切皮與切除皮膚肌肉；4-2 開眶隔、以 preaponeurotic fat 為地標找 aponeurosis；4-3 levator 分離與 Putterman clamp 切除；4-4 固定瞼板與調高度、contour；4-5 往上剝到眉下、brow fixation；4-6 conjunctivoplasty；4-7 雙眼皮線與縫皮 | 實際 OP note＋文獻 |
| 5 術中狀況 | 高度或 contour 不對、結膜脫出、外側的 lacrimal gland 不要當成脂肪切掉 | Takagi 2022；Eshraghi 2024；Pupić-Bakrač 2024；Lee 2024 |
| 6 術後 | 追蹤的重點：高度、閉眼、眉毛位置、結膜 | Tucker 1999；Chen 2016；Lee 2024 |
| 7 跟刀清單 | 每一步主治需要的器械與住院醫師要做的事 | 實際 OP note |
| 參考文獻 | — | — |

## 兩個同步視角（每段）
- 1-1、1-2：矢狀切面（眉到瞼緣）＋正面（MRD1、眉毛高度隨 ptosis 矯正改變）。
- 1-3、4-6：矢狀切面（上穹窿的結膜往下脫出、修復）＋正面或翻瞼（看得到脫出的結膜）。
- 4-1 到 4-5、4-7：矢狀切面＋正面開窗（皮膚切口、眶隔、aponeurosis、levator、眉下剝離逐層打開）。
- 4-5：正面要標出 supraorbital notch 與 nerve 的位置，以及 brow fixation 的固定點。
- 第 2 章、6、7：資訊卡為主。

## 模型要新增的部分（寫進 `videos/models/eyelid/CARD.md` 並加檢查）
- **矢狀切面往上延伸到眉毛**：眉毛皮膚與毛、眉下脂肪 ROOF、眶上緣骨膜、frontalis 與 orbicularis。亞洲人的 ROOF 往下延伸進上眼瞼（Manta 2025：東亞人在眶上緣下 5 mm 仍有 ROOF 1.8 ± 1.2 mm，白人 13 人中 12 人沒有），預設用亞洲人數值。
- **手術狀態**：切皮與切除皮膚肌肉（寬度由實際 OP note 決定）、眶隔打開、preaponeurotic fat 往上拉開、levator 與 Müller 從瞼板分開（disinsert）、Putterman clamp、切除 levator、3 針固定在瞼板（高度由 OP note 決定）、orbicularis–aponeurosis 固定做出雙眼皮線、往眉下剝離的平面、brow fixation 縫線、上穹窿結膜脫出與修復。
- **正面**：supraorbital notch（距中線的距離用東亞人數值：Pruksapong 2021 系統性回顧指出東亞人比中亞與白人短；該研究泰國屍體男 22.34 mm、女 23.58 mm），lacrimal gland 的位置，MRD1 與眉毛高度隨術式改變。
- **要寫成檢查的數值**：切口三點高度、切除皮膚寬度、固定點高度、MRD1、眉毛下降量（Kokubo 2019：aponeurosis advancement 後平均 2.50–2.87 mm）、ROOF 厚度、supraorbital notch 位置；兩個視角的切口與固定點高度差小於 0.3 mm。

## 文獻（PubMed 已查證，2026-11-06）
1. Kokubo K, et al. Evaluation of the eyebrow position after aponeurosis advancement. J Plast Surg Hand Surg 2019;53(1):60-64. doi:10.1080/2000656X.2018.1547735 — 100 眼瞼中 80–84% 眉毛下降，平均 2.50–2.87 mm，下降量和術前 MRD（ptosis 嚴重度）有關。
2. Kokubo K, et al. Evaluation of the eyebrow position after external Müller's muscle tucking: A new technique for ptosis repair. J Plast Reconstr Aesthet Surg 2019;72(4):662-668. doi:10.1016/j.bjps.2019.01.010 — 對照：只動 Müller 的術式，眉毛平均下降 0.24–0.51 mm。
3. Takagi S, et al. Factors that influence the postoperative upper eyelid position following surgery for involutional blepharoptosis. J Plast Reconstr Aesthet Surg 2022;75(1):278-285. doi:10.1016/j.bjps.2021.08.007 — 術後高度和術前（r = 0.49）、術中（r = 0.55）高度相關；嚴重 ptosis 術後會再掉，輕度的維持術中高度或略高。
4. Lee CC, et al. Resolving conjunctival prolapse following severe blepharoptosis correction: A simple sutureless direct excision technique and systematic review. J Plast Reconstr Aesthet Surg 2024;95:288-299. doi:10.1016/j.bjps.2024.05.056 — 24 篇、88 位病人，blepharoptosis 手術占 36.6%；手術處理的緩解率高於保守治療。
5. Buckman G, Levine MR. Treatment of prolapsed conjunctiva. Ophthalmic Plast Reconstr Surg 1986;2(1):33-9. doi:10.1097/00002341-198601040-00007 — 上穹窿結膜脫出是 levator resection 少見的併發症。
6. Lee JH, et al. Maximal levator resection in unilateral congenital ptosis with poor levator function. Br J Ophthalmol 2017;101(6):740-746. doi:10.1136/bjophthalmol-2016-309163 — 對照：congenital、LF 差的 maximal levator resection，conjunctival prolapse 0.8%、exposure keratopathy 11.1%。
7. Wang JQ, et al. An Unexpected Conjunctival Prolapse Following Frontalis Muscle Flap Transfer for Severe Ptosis. J Craniofac Surg 2019;30(8):e790-e793. doi:10.1097/SCS.0000000000005779 — 用 U 形固定縫線把脫出的結膜推回原位（個案）。
8. Dagi Glass LR, et al. Severe Congenital Ptosis Repair: A Report by the American Academy of Ophthalmology. Ophthalmology 2026;133(7):909-915. doi:10.1016/j.ophtha.2026.03.014 — 對照：LF ≤ 4 mm 時，frontalis flap、frontalis suspension、maximal levator resection 的成功率與 exposure 重疊。
9. Rojanasakul S, Putthirangsiwong B. Role of Orbicularis Oculi Resection in External Levator Advancement for Aponeurotic Blepharoptosis: A Prospective Randomised Controlled Trial. Aesthetic Plast Surg 2026;50(5):1717-1724. doi:10.1007/s00266-026-05617-5 — 泰國 20 人：切不切 preseptal orbicularis，dry eye 指標沒有差異，都沒有明顯 lagophthalmos。
10. McCord CD, Doxanas MT. Browplasty and browpexy: an adjunct to blepharoplasty. Plast Reconstr Surg 1990;86(2):248-54. doi:10.1097/00006534-199008000-00007 — 原始描述：經 eyelid crease 切口辨認眉下脂肪，用內部縫線把眉毛往上固定。
11. Baker MS, Shams PN, Allen RC. The Quantitated Internal Suture Browpexy: Comparison of Two Brow-Lifting Techniques in Patients Undergoing Upper Blepharoplasty. Ophthalmic Plast Reconstr Surg 2016;32(3):204-6. doi:10.1097/IOP.0000000000000454 — 只做 blepharoplasty 眉毛平均下降 1.7 mm；internal browpexy 防止下降，但上提很少（外側 +1.3 / +0.9 mm）。
12. Mokhtarzadeh A, et al. Quantitative efficacy of external and internal browpexy performed in conjunction with blepharoplasty. Orbit 2017;36(2):102-109. doi:10.1080/01676830.2017.1279661 — internal browpexy 外側／中央平均上提 2.29／1.47 mm（4–5 個月）。
13. Kaderli A, et al. Long-term comparison of the efficacies of internal and external browpexy combined with blepharoplasty. Arq Bras Oftalmol 2020;83(3):185-189. doi:10.5935/0004-2749.20200033 — 24 個月：internal browpexy 中央 2.10、外側 3.19 mm。
14. Huang PJ, et al. Objective Comparison of Eyebrow Position after Internal and External Browpexy. Plast Reconstr Surg 2023;152(3):414e-423e. doi:10.1097/PRS.0000000000010310 — internal browpexy 主要抬高眉毛外側，external 整條眉毛；只切皮膚的整條眉毛下降。
15. Nemet AY. Brow Ptosis: Is Transblepharoplasty Internal Browpexy Suitable for Everyone? J Craniofac Surg 2019;30(8):2425-2428. doi:10.1097/SCS.0000000000005680 — 外側平均上提 2.54 mm；不適合：significant ptosis（原文用詞，是否指眉毛待讀全文確認）、眉毛很重、內側比外側垂、顏面神經麻痺後。
16. Zandi A, et al. Temporal brow lift vs internal browpexy in females undergoing upper blepharoplasty: Effects on lateral brow lifting. J Cosmet Dermatol 2018;17(5):855-861. doi:10.1111/jocd.12433 — RCT：internal browpexy 6 個月外側眉高 15.09 → 17.43 mm。
17. Menderes A, Çağlı HB. Change in Brow Position After Upper Blepharoplasty With or Without Internal Browpexy. Ann Plast Surg 2024;93(4):420-424. doi:10.1097/SAP.0000000000004068 — 只做 blepharoplasty 瞳孔中線眉高 −6.13%，加 internal browpexy +2.99%。
18. Manta AI, Demer JL, Goldberg RA. Magnetic Resonance Imaging Demonstrates Differences in Brow and Upper Eyelid Fat and Muscle Layers Between East Asians and Caucasians. Ophthalmic Plast Reconstr Surg 2025;41(5):535-538. doi:10.1097/IOP.0000000000002904 — 模型的 ROOF 數值與亞洲人差異的出處。
19. Pruksapong C, et al. The anatomical variations of the emergence routes of supraorbital nerve: A cadaveric study and systematic review. Asian J Surg 2022;45(1):220-225. doi:10.1016/j.asjsur.2021.04.048 — supraorbital notch／foramen 距中線，東亞人較短。

（卷期年份以 PubMed 為準；寫進網站 `refs` 前再核對一次。）

## 驗收項目
- [ ] 步驟章節和刀後的實際 OP note 一致（2026-11-06 站長決定先依範本出片，刀後再對照）；範本與實際不同的地方以實際為準，並在規格書記下差異。
- [x] 所有解剖畫面都來自 `videos/models/eyelid/`；亞洲人單眼皮與 ROOF 往下延伸（Manta 2025）；`eyelid/check.js` 全部通過。
- [x] 每段手術步驟同時顯示矢狀切面與正面，兩圖的切口、固定點高度差小於 0.3 mm。
- [x] 旁白與重點框的每個數值都有出處，並寫成檢查；沒有出處的標「示意」或拿掉，列在出片前的總覽。
- [x] 標籤一律「中文 English」並列，不超出面板、不互相重疊（`check-video.js`）。
- [x] `node videos/tools/check-all.js videos/src/levator-resection-brow-fixation` 全部通過；每章至少一張參考圖（Claude 自檢）。
- [ ] 出片前交總覽（每章一張）；上傳為不公開，同步網站 `videos/index.html`，`videos/#levator-resection-brow-fixation` 沒有 JS 錯誤。

## 進度
- 2026-11-06：規格書與第一批文獻（19 篇，PubMed 已查證）完成。
- 2026-11-06：站長要求先開始做影片。`script-draft.md` 草稿第 1 版完成（依範本與文獻，共 22 篇；範本沒寫的步驟標 `[待刀後確認]`，沒有出處的標 `[待核對出處]`）。
- 2026-11-06：眼瞼模型補好眉毛區與這台刀的手術狀態（寫在 `eyelid/CARD.md`）：
  - 解剖：眶上緣附近的軟組織依 Manta 2025 加厚（ROOF 在眶上緣 4.5 mm、上 5 mm 1.85 mm；東亞人眶上緣下 5 mm 皮下脂肪 0.86、眼輪匝肌 1.15、ROOF 1.88 mm）；骨膜、額肌、眉毛（下緣離瞼緣 10.66 mm，Gao 2025）；正面的眶上切跡（距中線 22.96 mm，Pruksapong 2022；瞳孔中央鼻側 8.88 mm）、眶上神經、淚腺、ROOF。
  - 手術狀態：`mrd1`、切皮與切除、開眶隔與脂肪上拉、分離提上瞼肌、clamp、切除、前徙固定到瞼板、雙眼皮線固定縫線、眉下剝離與固定縫線、`browY`、結膜脫出與穹窿縫線。範本值（切口 2.5／4／4 mm、切除 5 mm）與示意值都是參數，刀後依 OP note 改。
  - 檢查：`eyelid/check.js` 75 項（新增 42 項，每項都故意改錯確認會報錯）；兩個視角的切口、固定點、clamp、眉毛、結膜脫出高度差都 < 0.3 mm。
  - 樣本圖（Claude 自檢）：`eyelid/sample-levator.jpg`（4-5 那一刻兩圖同步）、`eyelid/sample-levator-steps.jpg`（八個步驟）；參考圖登記在 `ref/manifest.json`（`page` 還是 null）。
  - 還沒做：縫皮後皮膚閉合的變形；正面的 clamp 被皮膚蓋住的部分畫虛線（實際上提上瞼肌常被往下拉出傷口再夾，刀後依 OP note 決定要不要改成往下拉）。
  - 沒有出處、畫成示意的：皮下脂肪與肌肉在眶上緣以上的比例、額頭軟組織、眉毛寬度與形狀、眶上神經分支、淚腺大小、剝離平面寬度、眉毛固定點高度與上提量、結膜脫出的長度與厚度。
- 下一步：(1) 站長回傳實際 OP note 後，把 `script-draft.md` 的 `[待刀後確認]` 定稿，並改模型參數（`incH`、`excW`、`resectMm`、`fixS`、`browFixH`、`browLift`、剝離層次、結膜脫出的處理方式）；不等 OP note 也能先做的：補 `[待核對出處]`；(2) 照 `videos/models/README.md` 製作流程，一章派一個小助手做影片頁（建好後在 `ref/manifest.json` 填 `page` 與 `textBase`）。
- 2026-11-06：站長決定不等 OP note、依專業判斷先做影片（步驟章節依院內範本，旁白說「依院內常規」）。影片完成到出片（未上傳）：
  - 共用影片套件 `videos/tools/video-kit/`（版面、時間軸、雙視角、標籤、渲染、語音、出片、上傳；用法見 `videos/tools/README.md`）；這支影片只提供 `anim/segments.js`（文字）、`anim/draw.js`（每段畫面）、`anim/params.js`（手術參數）。
  - 旁白定稿：`script-draft.md` 第 2 版（由 `segments.js` 產生，移除所有 `[待刀後確認]`）；逐句對照 PubMed 摘要；新增文獻 Carraway 1986、Jeong 1999、Lam 2003、Tucker 1999（PubMed 已查證），共 23 篇。
  - 檢查：`check.js`（數字帳本：畫面與旁白的每個數字都要有來源；13 項旁白↔模型檢查；`--selftest` 每項故意改錯一次都會報錯），`check-all.js` 會自動跑；兩支影片的 `check-all.js` 全部通過。
  - 眼瞼正面模型新增 `incX`（三點高度落在指定位置；不給時畫面不變，PLTR 與樣本參考圖不變）。
  - 語音：共用 MeloTTS（`tts/vits-melo-tts-zh_en` 連到 `~/.cache/ophtts/`），本片發音補在 `tts/lexicon-extra.json`；`anim/timeline.js` 進 git。
  - 參考圖：每章至少一張，共 19 張（Claude 自檢）；出片前總覽在 `ref/overview/`（每章一張）與 `overview-notes.md`（示意與沒有直接出處的內容）。
  - 出片：`out/levator-resection-brow-fixation.mp4`（不進 git；ffprobe 593.77 秒＝9:54，1920×1080、30 fps、AAC 48 kHz 立體聲，旁白 −16 LUFS，57 MB）；`publish/` 有 YouTube 說明欄、字幕、章節與網站條目草稿（`yt: 'TBD'`）。
- 下一步：站長看總覽；上傳 YouTube（不公開）並同步網站；刀後依 OP note 對照「待刀後補」，不同處改 `params.js`／`segments.js` 後重新出片。
- 2026-11-13：第二台（OU，同一份範本）當天開刀。`check-all` 全部通過後先送術前速讀包（`out/brief/`，17 張圖＋`旁白.md`）；新增貼牆的三張跟刀單（`print/`：`video.js`、`checklist.js`、`steps.js`、`anatomy.js`；`print.js --gray` 三張全部 PASS，LSs 210 × 270 mm；Claude 放大自檢彩色與灰階）。
  - 內容只取影片已查證的：清單 8 項＝影片第 7 章八件事；步驟圖每格是 `draw.js` 該段結束時的狀態；速查表每列登記在 `check.js` 的 `LEDGER`。
  - 解剖速查的 ROOF 尺寸線量在未手術的眼瞼（同 4-5 段，Manta 2025 量的是原生眼瞼）：1.88 mm。
  - 這台沒有排 conjunctivoplasty；清單第 7 項保留「有沒有結膜脫出」當作術中要看的狀況。
- 下一步：刀後站長若給 OP note，再對照「待刀後補」（特別是 2.5／4／4 是不是內／中／外三點高度）。

