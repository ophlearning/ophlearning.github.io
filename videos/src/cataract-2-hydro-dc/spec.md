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
- [ ] 刻槽＋分核＋四象限（第 3–5 章）至少占全片一半。
- [ ] 腳踏與面板的數字都有出處或標「示意，依院內機器設定」；面板和錄影同步。
- [ ] 每段手術步驟有錄影（或動畫示意）與同步切面；器械只從切口進出（phaco tip 經主切口、chopper 經 side port）。
- [ ] 本例 zonule 弱的地方旁白照實說。
- [ ] `check-all.js` 全部通過；參考圖 Claude 自檢；出片前交總覽。

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
