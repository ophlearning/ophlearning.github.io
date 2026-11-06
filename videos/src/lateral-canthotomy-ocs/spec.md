# OD orbital compartment syndrome 的 lateral canthotomy and cantholysis（規格書）

2026-11-06 訂。

## 目標與觀眾
- 觀眾：值班的眼科住院醫師。看完要能在急診床邊回答並做到：什麼時候不等 CT 就要做；每一剪剪到哪一個結構；怎麼判斷 inferior cantholysis 剪完了；剪完 IOP 還高時下一步是什麼。
- 定位：值班前預習。這不是一台排定的刀，沒有手術日期，所以不做術前速讀包，也沒有 OP note 要對照。
- 畫面：右眼、亞洲人、`videos/models/` 的 mm 模型動畫。眼窩的水平切面是新類別，先寫模型卡（`videos/models/orbit/CARD.md`）、做樣本圖並自己放大檢查，再做影片。

## 病例情境（站長 2026-11-06 確認）
- OD：外傷後 retrobulbar hemorrhage 造成 OCS → 急診床邊局麻 → lateral canthotomy → inferior cantholysis → 重測 IOP 仍高 → superior cantholysis；不縫合，放鬆後才排 CT orbit。

## 章節大綱（2026-11-06 定稿；旁白在 `anim/segments.js`）
| 章 | 內容 | 主要出處 |
|---|---|---|
| 片頭 | 情境：右眼外傷後 retrobulbar hemorrhage；先剪下支，IOP 還高再剪上支 | 病例摘要 |
| 1 什麼時候要做 | 1-1 眼窩是前面有門的硬盒子；1-2 診斷靠臨床（病史、前凸、眼瞼繃緊、RAPD、IOP 門檻），不等 CT；1-3 先排除 open globe；1-4 時間 | Murali 2021；Zoumalan 2008；Oester 2012a、b；Lima 2009；Hayreh 2004；McCallum 2019 |
| 2 準備 | 局麻、器械朝眶緣遠離眼球、直 hemostat 夾 1 分鐘 | Murali 2021；Weightman 2024 |
| 3 Lateral canthotomy | 水平剪到外側眶緣；露出上下支；單做 canthotomy 只部分降壓 | Murali 2021；Haubner 2015 |
| 4 Inferior cantholysis | 上下支與 Whitnall 結節；鑷子提下眼瞼、剪刀朝下撥弦、剪斷，直到下眼瞼整片鬆開 | Gioia 1987；Murali 2021；Haubner 2015；Blandford 2018 |
| 5 重測與 superior cantholysis | 重測；剪上支（朝上、往後、不要深）；再不行升級 | Murali 2021；Haubner 2015；Lima 2009；Oester 2012a；Kitaguchi 2019 |
| 6 術後與 CT | 這個病例不縫；持續出血會再升壓、反覆重測；放鬆後 CT、globe tenting；之後修補外翻 | Zoumalan 2008；Murali 2021；Papadiochos 2023；Dalley 1989 |
| 7 值班清單 | 八件事 | 各章 |
| 參考文獻 | 14 篇 | — |

## 兩個同步視角（寫進 `orbit/CARD.md` 時定案）
- 機轉切面：眼窩的水平切面（axial，經過外眥與視神經的高度），從下往上看，和 axial CT、`eyelid` 的外眥水平切面同一套方向：上＝前，病人右側在畫面左邊。看血腫、眼球前凸、視神經被拉直、眼瞼與外眥韌帶擋在前面，以及剪斷後前面的門打開。
- 術者視角：右眼外眥的正面（術者面對病人）。皮膚上看得到切開線；剪斷韌帶的段落開一個窗，看到外眥韌帶的上支、下支和眶緣內的 Whitnall 結節。
- 兩圖共用 x（外眥、外側眶緣、Whitnall 結節在兩圖同一個 x），和 `eyelid` 的外眥視角一致。

## 眼窩模型要補的部分（數值逐項找出處，寫進 `orbit/CARD.md`）
- 結構：眶骨（外側壁、內側壁、眶尖）、眼球、視神經（含鬆弛的長度）、內直肌與外直肌、眶脂肪、retrobulbar 血腫、眼瞼與外眥韌帶（上支、下支）、眶隔。
- 手術狀態：血腫大小與眼球前凸、視神經拉直與 globe tenting、hemostat 壓痕、canthotomy、inferior cantholysis、superior cantholysis、眼瞼被拉離眼球。
- 檢查：兩圖的外眥、眶緣、結節同 x；前凸量、tenting 的角度和旁白一致；剪刀方向（下支朝下、上支朝上）。

## 文獻（PubMed 已查證，2026-11-06）
1. Lima V, et al. Orbital compartment syndrome: the ophthalmic surgical emergency. Surv Ophthalmol 2009;54(4):441-9. doi:10.1016/j.survophthal.2009.04.005 — 診斷完全靠臨床，影像前就減壓；LCIC 是主要處置，沒反應再做更廣的眶隔切開或 bony decompression。
2. McCallum E, et al. Orbital Compartment Syndrome: An Update With Review Of The Literature. Clin Ophthalmol 2019;13:2189-94. doi:10.2147/OPTH.S180058 — 2 小時內處置的視力結果較好；延遲處置仍有恢復的報告。
3. Hayreh SS, et al. Central retinal artery occlusion. Retinal survival time. Exp Eye Res 2004;78(3):723-36. doi:10.1016/s0014-4835(03)00214-8 — 老年、動脈硬化、高血壓的獼猴：CRAO 97 分鐘沒有可偵測的損傷，之後越久越嚴重，約 240 分鐘大範圍不可逆。
4. Hayreh SS, Weingeist TA. Experimental occlusion of the central artery of the retina. IV: Retinal tolerance time to acute ischaemia. Br J Ophthalmol 1980;64(11):818-25. doi:10.1136/bjo.64.11.818 — 年輕獼猴：97–98 分鐘恢復良好，105 分鐘後無法修復。
5. Haubner F, et al. Orbital compartment: effects of emergent canthotomy and cantholysis. Eur Arch Otorhinolaryngol 2015;272(2):479-83. doi:10.1007/s00405-014-3238-5 — 屍體 8 眼：canthotomy 後 IOP 部分下降；inferior cantholysis 後 7 眼降到 20 mmHg 以下；2 眼需要再做 superior cantholysis；septolysis 沒有額外幫助。
6. Zoumalan CI, et al. Evaluation of intraocular and orbital pressure in the management of orbital hemorrhage: an experimental model. Arch Ophthalmol 2008;126(9):1257-60. doi:10.1001/archopht.126.9.1257 — 屍體 10 眼注入 22 mL 血：orbital pressure 68.4、IOP 71.5 mmHg，兩者高度相關；canthotomy＋cantholysis＋septolysis 後 IOP 降 50 mmHg（59%）；再注入 10 mL 很快又升高。
7. Oester AE, Fowler BT, Fleming JC. Inferior orbital septum release compared with lateral canthotomy and cantholysis in the management of orbital compartment syndrome. Ophthalmic Plast Reconstr Surg 2012;28(1):40-3. doi:10.1097/IOP.0b013e31823646f3 — 屍體 10 眼：LCC 平均降 56 mmHg；接著做 inferior septal release 合計降 73 mmHg；IOP 與眶內壓高度相關（Spearman 0.978）。
8. Blandford AD, et al. Paracanthal "One-Snip" Decompression in a Cadaver Model of Retrobulbar Hemorrhage. Ophthalmic Plast Reconstr Surg 2018;34(5):428-31. doi:10.1097/IOP.0000000000001032 — 屍體 3 眼 LCIC 後 IOP 平均 14 mmHg（平均降 32）。
9. Dryden S, et al. Marginal Full Thickness Blepharotomy for Management of Orbital Compartment Syndrome. Ophthalmic Plast Reconstr Surg 2024;40(4):408-10. doi:10.1097/IOP.0000000000002600 — 屍體：下眼瞼外側全層切開降 62.2 mmHg，再切上眼瞼外側多降 10.3 mmHg（LCC 失敗或做不了時的替代法）。
10. Makarewicz N, et al. Diagnosis and Management of Orbital Compartment Syndrome in Burn Patients—A Systematic Review. J Burn Care Res 2024;45(6):1367-76. doi:10.1093/jbcr/irae096 — 多數研究以 IOP > 30–40 mmHg 為診斷；減壓門檻仍沒有共識。
11. Kitaguchi Y, et al. Bony Orbital Decompression Following Lateral Canthotomy and Cantholysis for Traumatic Orbital Compartment Syndrome. J Craniofac Surg 2019;30(1):231-4. doi:10.1097/SCS.0000000000004902 — 日本 4 例：LCC 後 pupillary light reflex 沒改善、眼窩仍硬，再做 bony decompression；術前 IOP 都 ≥ 40 mmHg。
12. Dalley RW, Robertson WD, Rootman J. Globe tenting: a sign of increased orbital tension. AJNR Am J Neuroradiol 1989;10(1):181-6. PMID 2492721 — posterior globe angle < 130° 叫 globe tenting；< 120° 合併急性 proptosis 是外科急症。
13. Oester AE, et al. Radiographic predictors of visual outcome in orbital compartment syndrome. Ophthalmic Plast Reconstr Surg 2012;28(1):7-10. doi:10.1097/IOP.0b013e31822672c4 — 正常視力組：內側壁 43.9、外側壁 41.6 mm；globe-to-apex 未受影響眼 26.3、患眼 30.3 mm（差 4.2 mm）；視力喪失組差 4.5 mm、stretch angle 少 11.2°。
14. Papadiochos I, et al. Acute orbital compartment syndrome due to traumatic hemorrhage: 4-year case series and relevant literature review. Oral Maxillofac Surg 2023;27(1):101-16. doi:10.1007/s10006-021-01036-9 — CT 最好在 LCIC 之後做；9 例中 7 例有凝血功能低下。
15. Chen Z, et al.〔不同年齡眼眶容積的 CT 研究〕Zhonghua Yan Ke Za Zhi 2006;42(3):222-5. PMID 16643753 — 中國成人眼眶容積：男 25.04 ± 2.37 mL、女 22.89 ± 2.67 mL。
16. Kakizaki H, et al. Lateral canthal support system in Japanese. Okajimas Folia Anat Jpn 2006;83(3):85-90. doi:10.2535/ofaj.83.85 — 日本人屍體：「外眥韌帶」是淺層的眶隔（septal band）加深層的韌帶（tarsoligamentous band）。
- 沿用 `eyelid/CARD.md` 已查證的：Gioia 1987（外眥韌帶長、附著寬、Whitnall 結節在眶緣內 1.5 mm）、Rosenstein 2000、Tsai 2006（台灣人 Hertel）。
- 還沒有出處、影片要標示或拿掉的：外眥韌帶上支與下支的分法與大小（教科書標準解剖，[待核對出處]，候選 Kang 2012 *Orbit* 31:279 的回顧）、視神經眶內段長度（教科書 25–30 mm，[待核對出處]）、局麻藥量與 hemostat 夾多久、剪開長度（約 1 cm）、輔助用藥劑量。

## 驗收項目
- [x] `orbit/CARD.md` 照模板寫完，每個數值有出處或標「示意」「[待核對出處]」（2026-11-06）。
- [x] 眼窩模型的樣本圖（OCS 前後、canthotomy、下支、上支）自己放大檢查；`orbit/check.js` 26 項全部通過，21 種故意改錯都會報錯（2026-11-06）。
- [x] 每段手術步驟同時顯示機轉切面＋術者視角；兩圖的外眥、外側眶緣、Whitnall 結節 x 差小於 0.3 mm（`orbit/check.js`、本片 `check.js`）。
- [x] 旁白每個數值都有出處並寫成檢查（`check.js` 數字帳本，14 種故意改錯都會報錯）；沒有出處的標「示意」或拿掉，列在 `overview-notes.md`。
- [x] 旁白不說「單做 canthotomy 沒有用」：屍體研究是「部分下降」（Haubner 2015）。
- [x] `node videos/tools/check-all.js videos/src/lateral-canthotomy-ocs` 全部通過；每章至少一張參考圖（16 張＋模型樣本）。
- [x] 出片前交總覽（每章一張，2026-11-06 傳給站長，不等回覆）；上傳為不公開（YouTube `_9jyyTjJnNI`，privacy unlisted）並同步網站（`videos/index.html` 最前面）。

## 進度
- 2026-11-06：病例摘要經站長確認；規格書與第一批 16 篇文獻完成。
- 2026-11-06：眼窩模型完成（`videos/models/orbit/`，沿用眼瞼模型的眼球與外眥）。
  - 視角：`oax` 眼窩水平切面（從下往上看，同 CT）＋`ofront` 外眥正面（開窗看韌帶上下支），兩圖共用 x。
  - 狀態：`heme`（血腫，前凸 4.5 mm × heme）、`tentShow`、`clamp`、`canthotomy`、`infLysis`、`supLysis`、`pull`（拉離眼瞼）、`window`。說明見 `orbit/CARD.md`「手術狀態」。
  - 檢查：`orbit/check.js` 26 項；樣本 `orbit/sample.jpg` 自檢後登記在 `ref/manifest.json`（`page` 還是 null）。
  - 模型卡列為示意或 [待核對出處]、出片前要列進總覽的：視神經直徑與餘裕、眶尖位置與眶壁後段形狀、直肌厚度、血腫形狀、眼瞼回縮 1.5 mm 與拉離 4 mm、外眥韌帶上下支的畫法。
  - 寫影片時要注意（模型卡「已知的坑」）：前凸 4.5 mm 不一定造成 tenting（Oester 2012 正常視力組沒有），旁白要說「可能出現」；水平切面的眼瞼是投影；正面圖剪斷後眼瞼的位移沒有畫，用箭頭或鑷子表示。
- 2026-11-06：影片完成（站長要求一路做完、不再中途確認）。
  - 步驟細節的出處：環境連不到 NCBI Bookshelf（StatPearls），改用 PubMed Central 全文的 Murali 2021（急診醫學的 pearls and pitfalls 回顧）：局麻、直 hemostat 夾 1 分鐘、iris scissors、器械朝外側眶緣、鑷子把下眼瞼往內往前提、剪刀朝下撥弦、下眼瞼要整片鬆開、上支要往上往後且不深、open globe 是唯一的相對禁忌症、IOP > 30 緊急找眼科、> 40 立刻減壓。另加 Weightman 2024、Gioia 1987；共 14 篇。
  - 旁白定稿在 commit aa0e730（`ref/manifest.json` 的 `textBase`）；語音約 7 分鐘；參考圖 16 張與總覽 8 張自檢。
- 2026-11-06：出片（7 分 0 秒，1080p，30 fps），上傳 YouTube 不公開（`_9jyyTjJnNI`），網站 `videos/#lateral-canthotomy-ocs` 用瀏覽器確認沒有 JS 錯誤、嵌入網址正確（這台機器連不到 YouTube，播放器本身沒有載入）。
