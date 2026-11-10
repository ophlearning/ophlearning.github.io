# 白內障 ③：I/A、IOL 植入與收尾（規格書）

2026-11-10 訂。系列共同的決定見 `videos/src/cataract-series/spec.md`；做法照 ①、②：左＝案例 A 去識別錄影，右＝同步的 mm 模型切面。

## 目標與觀眾
- 觀眾：核已經做完、準備做 I/A 與放 IOL 的住院醫師。
- 看完要能做到：
  1. I/A：吸口朝上（朝術者看得到的方向）；在前囊邊緣下夾住皮質、occlude 後往中央剝、再吸；**subincisional cortex** 怎麼處理（換手、彎頭 I/A、bimanual）。
  2. 認出吸到後囊的線索（後囊出現放射狀皺褶）與第一步（停、reflux）。
  3. 囊袋打 OVD 撐開；injector 放 one-piece IOL：前導 haptic 進囊袋、optic 展開、後 haptic 塞進去；optic 置中、360° 被 CCC 蓋住。
  4. 移除 OVD（含 IOL 後方）；切口 stromal hydration 或依院內常規；確認前房深度與切口不漏。
- 時間目標 8–10 分鐘；I/A（含 subincisional）至少三分之一。

## 病例情境
- 系列確認的病例：one-piece hydrophobic acrylic IOL 用 injector 放 in the bag、不縫合（站長 2026-11-09）。
- 錄影：案例 A（OD、zonule 弱）。站長 2026-11-09 選「用案例 A，略過 CTR 與縫合」：只剪 I/A、IOL 植入、移除 OVD；旁白說明本例另放了 CTR 並縫合主切口，routine 不需要。
- IOL 型號、injector、OVD 種類：依院內常規（模型的 optic 6.0 mm 是示意，見 ① 的模型卡）。

## 章節（暫定）
| 章 | 內容 | 錄影（案例 A 原始時間） | 模型 |
|---|---|---|---|
| 片頭 | 這支片練會什麼 | — | — |
| 1 I/A 的原則 | 吸口朝上、先 occlude 再拉、往中央剝；腳踏 1–2 段 | 11:00–12:00 | I/A tip 在前囊邊緣下的切面；俯視 |
| 2 Subincisional cortex | 主切口下方最難；換手、彎頭 I/A、bimanual、hydro-dispersion | 12:00–14:20 | 主切口下方的切面 |
| 3 出錯的線索 | 吸到後囊：放射狀皺褶 → 停、reflux | 動畫示意 | 對應狀態 |
| 4 撐開囊袋、放 IOL | OVD 進囊袋；injector 斜面朝下、前導 haptic 進囊袋、optic 展開、後 haptic；optic 置中、360° 被蓋住 | 14:28–14:48、16:30–18:40（略過 14:52–16:10 的 CTR） | IOL 在囊袋內的切面；俯視 |
| 5 移除 OVD 與收尾 | IOL 前後的 OVD；stromal hydration、確認不漏（本例另縫合，routine 不需要） | 18:40–19:30 | 切口隧道切面 |
| 6 練習清單 | wet lab／模擬器 | — | — |
| 參考文獻 | | | |

## 待查證（PubMed；查不到就標示意或不講）
- I/A 與 subincisional cortex：Colvard 1997（bimanual）、Miyoshi 2022（hydro-dispersion）。
- IOL：one-piece 放 sulcus 的併發症只在 ④ 講（Chang 2009）；optic 被 CCC 360° 覆蓋的意義（Hollick 1999、Haripriya 2025，① 已用）。
- 切口：Liu 2023 JAMA Ophthalmol（swab pressing vs stromal hydration）、McDonnell 2003（切口的動態形態）。
- CTR 的時機（只為說明本例）：Rai 2015（① 已用）。

## 驗收項目
- [ ] 系列規格書的「系列層級的驗收」全部適用。
- [ ] 略過 CTR 與縫合的片段；旁白有說明本例的差異。
- [ ] I/A tip、IOL、injector 在兩個視角一致、只從切口進出。
- [ ] `check-all.js` 全部通過；參考圖 Claude 自檢；出片前交總覽。

## 進度
- 2026-11-10：規格書訂好章節；② 的模型完成後接著做 ③ 的模型（I/A tip、皮質、one-piece IOL 與 injector、囊袋內 OVD）。
- 2026-11-10：③ 的模型完成（`videos/models/globe/cataract.js`，選用式 `st.cat` 的 `bag`、`ovdBag`、`ovdOut`、`iol`、`seal`；細節、出處與示意清單見 `globe/CARD.md`「白內障 ③」）。
  - PubMed 查證：Colvard 1997（bimanual，subincisional cortex）、Miyoshi 2022（hydro-dispersion：27G 鈍針經 side port，56/60 眼成功）、Liu 2023（swab pressing 不劣於 stromal hydration；術中前房塌陷 0/63 vs 35/63）、McDonnell 2003（低眼壓時切口從內口開始張開）、Mifflin 2012（hydrate 切口兩側壁，基質變白）、Osawa 2021（一款疏水性壓克力 IOL：optic 6.0、overall 13.0 mm）、Vass 1999（in vivo 囊袋直徑 10.37 ± 0.25 mm）、Chang 2009（one-piece 放 sulcus 的併發症，留給 ④）。
  - 狀態：核拿掉後的囊袋與殘留皮質（主切口下方較厚）、coaxial I/A（吸口朝上／側／下、occlude、往中央剝、扇形進度）、雙手 I/A（aspiration 經 side port、irrigation 經主切口）、hydro-dispersion、吸到後囊（帳篷＋放射狀皺褶，動畫示意）、囊袋內 OVD、injector（斜面朝下）、IOL 植入（前導 haptic、optic 展開、後 haptic 用 hook 壓進）、最後位置（囊袋閉合、CCC 360° 蓋住 optic）、偏位與 sulcus 錯誤（示意）、移除 IOL 後方與前方的 OVD、內口張開與 stromal hydration。
  - `globe/check.js` 第 13 節 37 條，37 個故意改錯全部抓到；①、② 樣本與 open globe 參考圖 0.000% 不變。樣本 `globe/sample-cataract3.html` Claude 自檢，參考圖登記在 `ref/manifest.json`（page: null）。
  - 做影片時注意：IOL 剛出 nozzle 的一段（`out` 0.35–0.75）模型會碰角膜，動畫只用 `out` ≤ 0.3 與 ≥ 0.8，中間用錄影；吸到後囊的帳篷高約 1.4 mm（囊袋保持水晶體形狀），旁白標動畫示意。
  - 待確認：院內 IOL 型號（optic、overall、haptic 形狀）、I/A tip 與 injector 型號、是否用雙手 I/A 或 hydro-dispersion、收尾用 stromal hydration 或 swab pressing。
- 2026-11-10（第 1 版：文獻、錄影事件、旁白、錄影片段、影片頁與檢查；Claude 小助手。模型 `globe/` 沒改）：
  - 錄影（案例 A 10:40–19:41，事件表在 `script-draft.md`）：
    - I/A 11:00.3–14:08.2（約 3 分鐘）從頭到尾是**同一支彎頭 coaxial tip、都走主切口**：沒有換手、沒有雙手 I/A、沒有經側切口吸。順序：主切口這一側與中央 → 12:14–12:32 一整片皮質從 6 點那一側的邊緣下剝向中央（12:28 最清楚）→ 3 點那一側 → 13:20–13:36 彎頭轉向側邊、伸到主切口這一側 → 紅光均勻才退出。吸口朝哪裡看不清楚；吸皮質時沒有看到後囊皺褶。
    - OVD 14:28–14:46.5（cannula 經主切口，看得到 OVD 前緣往外推）；**CTR 14:49.5–16:28 略過**。
    - Injector 16:33 在主切口，摺著的 IOL 16:34.5 出來往 6 點那一側，optic 16:39.5–16:42.5 打開，injector 16:43.8 退出。之後 16:54–18:28 器械調整 IOL（細節看不清楚）略過；18:38 IOL 置中。
    - I/A 18:57.5–19:30.5 吸 OVD（約半分鐘，瞳孔已縮小）；19:31.5–19:39.5 棉棒壓在主切口那一側；**19:40 起縫合略過**；沒有看到 stromal hydration。
    - `footage-sources.js` 加 14 個定位點（角膜緣 RANSAC 圓逐張疊圖確認；1176 s 縮小倍率時用格線讀圖）；`anim/footage.js` 12 個片段（4×、2×、3×、2×、6×、2×、0.5×→原速、原速、2×、原速；9 個停格）。
  - 文獻（PubMed，細節與證據等級在 `script-draft.md`）：20 篇進參考文獻。新加 Kanclerz 2019（殘留皮質是囊袋撐脹的危險因子，綜論）、Hagan 1987（隨時知道吸口朝哪裡）、Sakamoto 2002（側切口器械處理主切口下方，227 眼）、Lockington 2021（金屬 I/A 吸口內側有毛邊，實驗室）、Biro 2006（只清前房眼壓較高，118 眼）、Auffarth 2004（壓克力 IOL 後面容易留 OVD，實驗台），Chang 2009 改在本片講 sulcus 的錯誤（30 人 93% 再手術）。吸口朝上、往中央剝、吸到後囊的第一步、彎頭 tip 都查不到比較研究 → 「常用做法」或示意。
  - 旁白 85 句、19 段；真實語音合成後全片 **8:55**（含 6 張章節卡與參考文獻），第 1–2 章（I/A、主切口下方）3:08.5，占 **35.2%**（不算參考文獻 37.6%）。
  - 影片頁 `anim/video.html`：右邊的模型由 `caseAt(錄影的原始時間)` 決定（I/A 的位置與吸過的區塊、6 點那一側的皮質條、彎頭轉向、囊袋 OVD、IOL、OVD 從後面先清、囊袋貼回、切口內口張開到棉棒壓住）；IOL 剛出口到打開之間（模型 `out` 0.3–0.8 會碰角膜）不畫，標「看左邊錄影」。
  - 檢查 `check.js`：數字帳本＋旁白↔錄影↔模型（播放速度、I/A 3 分鐘、OVD 半分鐘、略過 1 分半、CTR／調整／縫合不在任何片段、事件順序、標籤只在停格、6 點那一側／彎頭方向／IOL 往 6 點和錄影量到的鐘點相同、器械只經主切口、模型每 0.5 秒跟著錄影事件、241 個器械姿勢不碰虹膜角膜前囊、IOL 不碰組織、直 tip 到不了主切口下方而雙手 I/A 到得了）；19 個故意改錯全部抓到。
  - 做的時候發現：模型的直 coaxial tip 只到得了 4–7 點的邊緣下（隧道往中央上升 18°），在 1–3、8–11 點會穿過前囊；錄影裡吸那些區時，模型的 tip 放在瞳孔中央附近 0.25–0.5 mm 深（示意），彎頭轉向那段用雙手 I/A 的彎頭吸管畫在主切口（`iaAsp` + `via: 'main'`，標「彎頭 tip（示意）」）。模型卡沒有彎頭 coaxial tip，之後若要精確，請在 `globe/cataract.js` 加 `ia` 的彎頭選項。
  - 各章狀態與還要做的（照「最弱的先做」排）：
    - **1-4（最弱）**：右邊是術者視角的區塊變乾淨，tip 在模型裡只能放在中央（直 tip 到不了 3 點的邊緣下），和錄影 tip 在左半邊來回不完全一致；可以改用彎頭 tip 或換成 3–9 切面。
    - **2-3**：右邊的彎頭 tip 是投影的示意；錄影 13:36–13:50 沒放（6× 片段從 13:50 開始）。
    - **4-4**：第 1 句的錄影停在 18:36 的第一格（略過調整的那 1 分半沒有畫面），可以考慮加一張「略過」的說明卡。
    - **5-3**：只有模型（錄影沒有 stromal hydration）；左右都是隧道放大，可以加術者視角的 hydration 變白。
    - **1-3、5-2**：右邊 tip 的路徑是示意（依錄影的區塊時間）；5-2 先清後面再清前面的順序是示意。
    - 其他段（1-1、1-2、2-1、2-2、3-1、3-2、4-1、4-2、4-3、4-5、5-1、5-4、7）：可用。
    - 出片前：總覽（每章一張）放 `ref/overview/`；`publish/`、一頁式跟刀單還沒做。
