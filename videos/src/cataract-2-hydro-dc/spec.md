# 白內障 ②：Hydrodissection 與 divide and conquer（規格書）

2026-11-10 訂。系列共同的決定（目標、病例、錄影、四件事的教學結構、驗收）見 `videos/src/cataract-series/spec.md`；做法照 ①（`videos/src/cataract-1-wound-ccc/`）：左＝案例 A 去識別錄影，右＝同一組事件時間同步的 mm 模型切面。

## 目標與觀眾
- 觀眾：做完 CCC、準備開始做核的住院醫師。
- 看完要能做到：
  1. Hydrodissection：知道 cannula 放在哪裡（前囊邊緣下、靠近赤道方向）、怎麼打（慢、連續）、要看到什麼（fluid wave 越過 red reflex）、打完要做什麼（壓中央讓液體排出、確認核能轉），以及打太多會怎樣（capsular block）。
  2. 腳踏 0–3 段各在做什麼，面板上的 vacuum、aspiration、power、IOP 怎麼跟著變。
  3. 刻槽：寬度、長度、深度；**深度靠 red reflex 判斷**（槽底變亮＝接近後板）；刻槽時不要 occlude。
  4. 分核：兩支器械放在槽底、往兩側推開；看到裂縫貫穿到周邊才算分開；轉 90° 再刻、再分。
  5. 四象限移除：occlude、提高 vacuum、把核塊拉到中央（安全區）再乳化。
  6. 認出出錯的線索並做第一步：刻太深、post-occlusion surge（前房突然變淺）、wound burn（切口變白、乳白液體）、zonule 受力（本例 zonule 弱）。
- 時間目標 10–12 分鐘；刻槽＋分核＋四象限至少一半。

## 病例情境
- 系列確認的病例：OD、術者坐 superior、divide and conquer（站長 2026-11-09）。
- 錄影：案例 A（OD；zonule 弱［PXF 等］，後來放 CTR）。旁白照實說：本例 zonule 弱，所以轉核、分核時要減少對囊袋的拉扯；routine 的目標狀態用模型示範。
- 機器：J&J Veritas（站長確認）。院內預設參數沒有提供：面板的數字用廠商文件或文獻範圍，畫面標「示意，依院內機器設定」；之後拿到照片再換。

## 章節（暫定）
| 章 | 內容 | 錄影（案例 A 原始時間） | 模型 |
|---|---|---|---|
| 片頭 | 這支片練會什麼 | — | — |
| 1 Hydrodissection | cannula 位置、慢而連續、fluid wave（金色的環）、壓中央排液、轉核；打太多→capsular block | 5:15–5:50 | 經 cannula 的切面：液體在囊與皮質之間往後繞；俯視 fluid wave |
| 2 腳踏與面板 | 0 不動、1 灌流、2 灌流＋吸、3 再加超音波；vacuum、aspiration、power、IOP 跟著段數變；occlusion 與 surge 的原理 | — | 腳踏與流體面板＋切面上的灌流／吸力 |
| 3 刻槽 | 槽的寬、長、深；腳踏 3、低 vacuum、不 occlude；槽底 red reflex 變亮＝接近後板；不要刻到 CCC 邊緣外 | 5:50–6:40 | 刻槽深度切面（核、後板、後囊的距離）；俯視槽底變亮 |
| 4 分核 | 兩支器械在槽底、往兩側推；裂縫要貫穿；轉 90° 再刻再分 | 6:40–8:00（逐格標） | 分核切面 |
| 5 四象限移除 | occlude、提高 vacuum、拉到中央再乳化；chopper 保護後囊 | 8:00–10:40 | 核塊被吸進 tip 的切面；安全區 |
| 6 出錯的線索與第一步 | 刻太深；surge；wound burn；zonule 受力（本例） | 案例 A 對應片段＋動畫示意 | 對應狀態 |
| 7 練習清單 | wet lab／模擬器 | — | — |
| 參考文獻 | | | |

## 待查證（PubMed；查不到就標示意或不講）
- Hydrodissection：Fine 1992（cortical cleaving hydrodissection）；Miyake 1998（capsular block 分類）；Vasavada 2004（inside-out delineation，必要時）。
- Divide and conquer：Gimbel 1991；Wong 2000（D&C 與 chop 的能量）；Koch 1994（stop and chop，只提差異）。
- 流體與 surge：Scarfone 2026 綜論；Veritas 的流體系統（FDA 510(k) 或廠商文件；查不到就只講原理）。
- Wound burn：Sugar 1999、Giglio 2024。
- Zonule 弱與 PXF：Fairaq 2025；Haripriya 2025（若有核處理相關）。
- 刻槽深度與 red reflex 的判斷：找教科書或綜論出處；查不到就說「臨床常用的判斷」並標示意。

## 驗收項目
- [ ] 系列規格書的「系列層級的驗收」全部適用。
- [x] 刻槽＋分核＋四象限（第 3–5 章）至少占全片一半。（5:19，53.3%）
- [x] 腳踏與面板的數字都有出處或標「示意，依院內機器設定」；面板和錄影同步。（照文獻的只有 Quesada 2022、Choi 2026、Soule 2026、Scarfone 2026，見 `overview-notes.md`）
- [x] 每段手術步驟有錄影（或動畫示意）與同步切面；器械只從切口進出（phaco tip 經主切口、chopper 經 side port）。
- [x] 本例 zonule 弱的地方旁白照實說。
- [x] `check-all.js` 全部通過；參考圖 Claude 自檢；出片前交總覽。（總覽在 `ref/overview/`，和 mp4 一起交站長，上傳前看）

## 進度
- 2026-11-10：規格書訂好章節；下一步：模型（hydrodissection、核的刻槽與分核、phaco tip 與 chopper、腳踏與流體面板）。
- 2026-11-10：模型做好（`videos/models/globe/cataract.js`＋新檔 `globe/fluidics.js`，選用式 `st.cat`；狀態、出處與示意清單見 `globe/CARD.md`「白內障 ②」）：
  - Hydrodissection：`hydro { h, prog, press, block }`。液體走在囊與皮質之間、繞赤道、越過後囊；俯視是 red reflex 上移動的波前；壓中央排液；capsular block（動畫示意）。
  - 核：`nuc { groove, crack, rot, groove2, crack2, quads }`。刻槽（寬、長、深，標槽底到後囊幾 mm）、槽底亮度（示意）、刻太深（錯誤示範）、分核（裂縫先往下貫穿後板再往周邊）、轉 90°、四象限（只動核，皮質留下；吸住、拉到中央、乳化）。
  - 器械：phaco（針頭、bevel、sleeve、灌流孔）只經主切口、chopper 只經 side port、hydrodissection 的彎尖 cannula；隧道跟著 phaco 彎（示意）。
  - 新視角 `cross`：3–9 切面，從 12 點看，可平移切過器械尖端，器械畫切口。
  - 流體：`FLUIDICS.state({ pedal, occl, set, tOcc, tBreak })` 給灌流、流量、vacuum、US、IOP；`FLUIDICS.surge(t)` 給前房變淺的比例，切面用 `st.cat.surge`。
  - PubMed 查證：Fine 1992（只有摘要）、Miyake 1998、Gimbel 1991、Wong 2000、Scarfone 2026、Sugar 1999、Giglio 2024；另找到 Veritas 的 Soule 2026（quadrant preset 450 mmHg、瓶高 41／81 cm、surge 持續時間）、Quesada 2022（Advanced Infusion＋22 mmHg、雙幫浦）、Choi 2026（腳踏 3＝超音波）、Kato 2018、Yeoh 2000、Yip 2002。
  - 沒查到：Veritas 的 FDA 510(k) 與廠商手冊、院內設定；Vasavada 2004、Koch 1994、Fairaq 2025 這次沒查；槽底變亮與後板厚度、核的大小都沒有出處 → 示意。面板上的數字一律標「示意，依院內機器設定」。
  - 檢查：`globe/check.js` 第 12 節 43 條，35 個故意改錯全部抓到；① 與 open globe 的參考圖 0.000%。樣本 `globe/sample-cataract2.html` Claude 自檢，參考圖登記在 `ref/manifest.json`（page: null）。
  - 做的時候發現（寫進模型卡）：① 的隧道往中央上升 18°，直的 phaco 從 12 點切口到不了槽的近端深處，所以槽最深在遠端、近端是斜坡；phaco 在最深點時 sleeve 會壓到近端撕囊緣（≤ 0.5 mm，示意）。chopper 從 2 點 side port 只在槽的遠端（離中心 1 mm）才放得到槽底。
  - 下一步：從案例 A 5:15–10:40 挑 clip（`anim/footage.js`，補定位點），寫 `segments.js`、`draw.js`；面板接 `FLUIDICS`；拿到 Veritas 院內設定的照片就換數字。
- 2026-11-10（第 1 版：文獻、錄影事件、旁白、錄影片段、影片頁與檢查；Claude 小助手。模型 `globe/` 沒改）：
  - 文獻（PubMed，細節與證據等級在 `script-draft.md`）：17 篇進參考文獻。新加 Taş 2017（轉述 Fine 的做法：撕囊邊緣下、慢而連續、壓中央、換處、推核轉核；打太多 → capsular block、掉核；先放掉一點 OVD）、Blumenthal 2020（越過後囊的波＝hydrodissection、金色的環＝hydrodelineation）、Ernest 2001（wound burn：沒有水流時發熱、OVD 堵住更熱、先確定有水流）、Suryawanshi 2016（訓練中移除核塊時 PCR 1.7%）、Dooley 2006（phaco 自評最難）。Fine 1992 只有摘要，細節改用 Taş 2017。Fairaq 2025 全文：zonule 弱時 hydrodissection 做足、低流量慢動作、chop 類對 zonule 壓力小於 D&C、轉核分核較難。Koch 1994（stop and chop）讀過摘要沒引用；Vasavada 2004、Haripriya 2025、Kato 2018 這一版沒用。刻槽深度靠 red reflex、槽寬、槽底到後囊的毫米數查不到出處 → 示意；surge 與 wound burn 的「第一步」依腳踏的機轉推得，重點框註明。
  - 錄影（案例 A 5:00–10:45，事件表在 `script-draft.md`）：
    - Hydrodissection 從**主切口**進 3 次（尖端約 7.9、1.6、8.3 點）；5:22.75–5:23.75 瞳孔邊緣出現**金色的環**（約 1 秒繞滿）；看不到越過後囊的波，也看不出壓中央、轉核。
    - Phaco 5:52.5 進、刻槽 5:54–6:38（槽底一條比兩側更紅的溝）；chopper 6:39.3 從側切口進；兩支器械先推中段、移到近端，6:57.5 兩半分開。
    - 7:00–7:45 chopper 伸到核周邊推核、核轉了方向、phaco 往前推進、再分開：第二道槽看不清楚，也可能是 chop 類動作（stop and chop 就是刻槽分兩半再 chop）。所以**前半確定是 divide and conquer（刻槽＋分核）**，後半旁白照實說看不清楚，第二道槽與第二次分核用模型示範。
    - 7:45–9:47.7 核塊一塊一塊拉到中央乳化（chopper 輔助），每拿走一塊露出更紅的 red reflex；9:47.7 chopper 出、10:40.5 phaco 出。沒有看到切口變白、明顯的 surge、清楚的 zonule 受力線索。
    - `footage-sources.js` 加 19 個定位點（角膜緣：放射狀邊緣搜尋＋RANSAC 圓；鎖到金色環的時段改用格線讀圖），`anim/footage.js` 9 個 clip（0.5×、2×、原速→3×、1.5×、2×、5×、4×；5 個停格），裁切跟著眼睛、離燒進去的文字 ≥ 4 px。
  - 旁白 99 句、22 段；真實語音合成後全片 **10:00**（含 9 張章節卡與參考文獻），第 3–5 章（刻槽、分核、移除核塊）5:19，占 **53.3%**（不算參考文獻 56.8%）。
  - 影片頁 `anim/video.html`（22 段）：右邊的模型由 `caseAt(錄影的原始時間)` 決定（注水的鐘點與液體層、槽深、裂縫、轉核、第二道槽、四塊依錄影時間），注水時右邊是經注水點的切面（cannula 經主切口、不在這個切面上，只畫在俯視小圖）；刻槽、移除核塊是經主切口的切面，分核是垂直槽的橫切面。腳踏與機器面板（`globe/fluidics.js`）出現在 2-1、3-2、5-1、6-1，數字標「示意，依院內機器設定」。
  - 檢查 `check.js`：數字帳本＋旁白↔錄影↔模型（播放速度、注水次數與鐘點、金色環 1 秒、刻槽 45 秒、分核 20 秒、核塊 2 分鐘、phaco 4 分 50 秒、事件順序、器械只從自己的切口、標籤只在停格、模型每 0.5 秒跟著錄影事件、四塊在 chopper 退出前清完、Advanced Infusion 22、vacuum 450、surge 1.6–2.9 秒、腳踏 1／2／3、槽的後板與方向）；17 個故意改錯全部抓到。
  - 參考圖：模型樣本＋每段一張（21 張，Claude 自檢 dpr 1；錄影只有裁切後的眼睛，看不到燒進畫面的文字）；`textBase` 是本版旁白的 commit（91c9a3e）。`check-all` 全部 PASS。
  - 各章狀態與還要做的（下一個小助手；照「最弱的先做」排）：
    - **4-3（最弱）**：錄影 7:00–7:45 看不清楚第二道槽，右邊是模型俯視（轉 90°、第二道槽、四塊），沒有切面；後兩句時錄影停在最後一格。可以加一個經第二道槽的橫切面，或把 7:04–7:11 的推核放慢加停格（量 chopper 尖端）。
    - **5-2**：右邊四塊依錄影時間一塊一塊轉到對側再拉到中央，但轉的角度、順序是示意；左邊只有 7:56 一個停格。可以再量 9:06–9:24 大塊核被推到中央的一格（chopper 與 phaco 尖端），加停格與標籤。
    - **1-3**：錄影 8 秒（2×）播完後停格 15 秒，右邊換成模型示範；可以改成原速、或在錄影停格處標第 2、3 次注水的尖端（點已量：`pass2-tip`、`pass3-tip`）。
    - **6-2**：wound burn 的變白與熱都是示意圖，沒有錄影；隧道放大圖裡 phaco 是斜的長條，看起來不像器械在隧道裡，可以改用 `cat` 切面放大到隧道。
    - **3-2、4-2**：右邊的器械姿勢是模型的示意（刻槽每 4 秒一刀；分核時兩支器械在槽的遠端），錄影裡分開的那一刻兩支器械其實在近端（頁尾已註明）。
    - **2-1、5-1、6-1**：面板是長條、沒有數字（院內設定沒有提供）；拿到 Veritas 的設定畫面再換成數字。
    - 第 1 章其他段、3-1、3-3、3-4、4-1、5-3、5-4、6-1、6-3、7：可用。
    - 出片前：總覽（每章一張）放 `ref/overview/`；`publish/`、一頁式跟刀單還沒做。
- 2026-11-10（第 2 版：畫面精修；Claude 小助手。旁白、重點框、來源沒改，沒重新合成語音；模型 `globe/` 與 video-kit 沒改）：
  - 1-1：左邊改成 14 mm 視窗，看得到 cannula 進來的主切口；cannula 寬度量過＝0.40 mm（27G 0.41 mm，模型照實），加管狀亮線與 1 mm 比例尺，讀起來是細管；波前標籤釘在畫出來的波前上。
  - 1-3：錄影 2× 播完（第 1 句中）就換成模型的術者視角示範（輕壓中央 → 換一處再打 → 推核周邊＋旋轉箭頭），不再停格 15 秒；右邊 cannula 移到中央再壓（原本停在撕囊邊緣、箭頭卻在中央）。
  - 3-2：phaco 每一刀從切口下方推到最深點，6:06 停格那一刻退在近端（和錄影同）；頁尾註明來回是示意。4-2：右上標「器械姿勢：模型示意（不是這一格）」（錄影分開時兩支器械在近端，chopper 從 2 點側切口只在遠端放得到槽底）。
  - 4-3：第 0–1 句兩邊都是模型示範（轉 90° → 第二道槽 → 第二次分核）；第 2 句起錄影對齊（7:04 轉核落在第 2 句開頭、播到段尾，不停格），左下字幕跟著錄影事件（推核轉了方向／沿新的方向推進、第二道槽看不清楚／再一次分開），右邊是垂直第二道槽的橫切面（離中心 1.6 mm，避開轉到 3–9 的第一道槽）＋俯視小圖，依錄影時間刻槽、分核；`caseAt` 的 phaco 在第二道槽刻、兩支器械在第二道槽分核。
  - 5-2：核塊改成在原位拉出，第 1、2、4 塊的鐘點對錄影量到的紅光位置（約 6.4、10.7、4.7 點；`anim/footage.js` 的 `m-*` 量測點），時間對錄影事件（`piece<n>` 開始、`reflex-<n>` 清掉；新增 `reflex-2` 8:36）；第 3 塊看不清楚 → 剩下的一塊（示意）。右邊改成經目前這一塊的切面＋俯視小圖（器械只畫在小圖），左下字幕寫第幾塊從哪一側。片段從 7:32.5 開始（第二次分開的尾巴），開頭的靜止從 4.7 秒縮成 1.7 秒（影格重抽）。
  - 6-2：右邊改成主切口隧道的橫切面（切過隧道中段）：sleeve 在隧道裡、針頭在 sleeve 裡；有水流時 ⊗ 灌流往眼內、⊙ 抽吸往外，沒有水流時熱集中在切口唇（只畫在角膜組織裡），OVD 堵住針頭時更熱；第 3 句放開 3 段後超音波停、先有水流；標籤短、放兩側。
  - 標籤（全片）：另用腳本在每句 8 個時刻量（在面板內、不重疊、引線不交叉、不穿過文字、長度）；原本有 31 個標籤的引線 145–316 px（固定在角落），改到定位點旁，現在全部 ≤ 131 px、0 個問題。順便修好切面的裂縫標籤（定位點是兩點一組，換算時漏掉，4-1、4-2 原本沒畫出來）。
  - 檢查 `check.js` 加 1 條：模型在錄影每個 `piece<n>` 拿走的那一塊、到 `reflex-<n>` 時已清掉、量到的紅光鐘點在模型那一塊的範圍內（±1.5 h），旁白「6 點那一側」；故意改錯 2 個（第 1、2 塊對調、第 2 塊在紅光出現時還在）都抓到，另把 `params.js` 的 `pieceQ` 真的對調跑一次 → FAIL，再改回。量測點（`m-*`）不算標籤，不要求停格。
  - 參考圖重新自檢更新：1-1、1-2、1-3、1-4、2-1、3-2、4-1、4-2、4-3、5-1、5-2、5-3、5-4、6-2（其餘 0.000%）。`check-all` 全部 PASS。
  - 還可以做的（不擋出片）：5-2 旁白第 7 句「順序是示意」現在只對第 3 塊與四塊的分法成立，下次改旁白時可改成「第 3 塊的位置是示意」；4-3 第 0 句右邊在轉核那 2 秒切面形狀會變（真的切面，不好讀）；2-1、5-1、6-1 的面板仍是長條（等院內 Veritas 設定）；總覽（`ref/overview/`）、`publish/`、跟刀單還沒做。
- 2026-11-10（出片前：總覽、publish、跟刀單；Claude 小助手。旁白、畫面、`anim/`、模型都沒改）：
  - 總覽：`ref/overview/` 9 張（片頭、第 1–7 章、參考文獻；1920×1080＝影片解析度），從 commit 2f61d98 的乾淨 worktree 截（主目錄的模型同時有人在改），每章挑最有資訊的一刻、放大自檢；`overview-notes.md` 加總覽表、流體數字的原則（照文獻講的只有 Quesada 2022、Choi 2026、Soule 2026、Scarfone 2026，其餘「示意，依院內機器設定」）、案例 A 摘要（OD、zonule 弱 → 後來放 CTR、前半是 D&C、第二道分核看不清楚）與跟刀單說明。
  - 逐句截圖對照旁白與錄影（1-2、1-3、3-2、3-3、4-2、4-3、5-2、5-4），發現的問題列在 `overview-notes.md`「上傳前可以再看的」：5-2 第 5 句「大塊的核由 chopper 推到中央」比錄影的大塊早一句（錄影當時是第 3 塊）、5-2 停格標籤讀成「red reflex reflex」、5-2 面板標題「約 7 點」vs 旁白「6 點那一側」、5-1「phaco 口」標籤指在 sleeve 的灌流孔、3-3 第 3 句「越來越清楚」只配 6:06 一格、4-2 模型器械交叉 vs 錄影不交叉（已標「不是這一格」）。
  - `publish/`：`youtube-description.txt`（說明、去識別、流體數字示意、章節、17 篇參考文獻含 DOI［PubMed 逐篇對過 PMID 與 DOI］、製作）、`chapters.txt` 與 `captions.srt`（從 `out/` 複製）、`website-entry-draft.txt`（`yt:'TBD'`、`dur:0` 等 ffprobe；章節秒數照 `chapters.txt`）。
  - 跟刀單 `print/`（LSs 三張：跟刀清單 8 項、手術步驟圖 8 格、關鍵解剖與數字速查）：狀態照 `anim/draw.js` 同名複製；`print.js --gray` 三張 PASS、`--selftest` PASS；彩色與灰階全頁、密的格子放大自檢。列印工具：`print-kit.js` 的 `csec` 加選用的 `off`、`cut`（垂直槽的橫切面）；`numcheck.js` 讀帳本時一併讀 `...PED`、selftest 在沒有「院內常規」數字的影片改用「示意」；README 補；範例 `upper-lid-levator-rotation-brow`、`cataract-1-wound-ccc` 重跑 PASS。
  - `check-all` 全部 PASS（2f61d98 的 worktree，加上這次的檔案；參考圖 0.000%）。
- 2026-11-10（上傳前修正：總覽時發現的五個問題；Claude 小助手。旁白文字、重點框、來源與時間軸沒動，沒重新合成語音；模型 `globe/` 與 video-kit 沒改；細節在 `overview-notes.md`「上傳前可以再看的」）：
  - 5-2 第 5 句「大塊的核由 chopper 推到中央」：片段（5×、停格照舊）在第 2 塊的紅光之後跳過第 3 塊（原始 8:37.5–9:06，左上註明「略過約 30 秒」），大塊整句都在畫面上；停格標籤改成「露出更紅的紅光 red reflex」；右邊切面與標題改用錄影量到的鐘點（第 1 塊「約 6 點」，原本「約 7 點」）。
  - 5-1「phaco 口吸住核塊」改指針頭的口（原本在 sleeve 的灌流孔），核塊吃完後淡出。
  - 3-3 第 3 句「刻到後面，紅溝越來越清楚」：6:06（前段）與 6:31（後段，新 clip `groove-late`）兩格並排。另一個 checkout 出片前先跑 `node videos/tools/video-kit/footage-cli.js extract videos/src/cataract-2-hydro-dc`（只會抽新的 `groove-late`，61 格）。
  - `check.js` 加 1 條：5-2 第 2–5 句、3-3 第 3 句畫面上的錄影時間＝旁白說的那一刻（頁面逐句取樣 `FOOT_SEEN`）、跳接只跳過第 3 塊且註明秒數、右邊標題的鐘點＝錄影量到的；selftest 加 4 個故意改錯都抓到，另把跳接真的拿掉跑一次 → FAIL，再改回。
  - 參考圖：更新 5-1-L5、5-2-L1，新增 3-3-L2、5-1-L2、5-2-L4（Claude 自檢）；總覽 `ref/overview/5-quadrant-removal.jpg` 重截（第 3 章那張的時刻沒變，比對 0 像素差）。`check-all` 全部 PASS。
