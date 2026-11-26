# 白內障：scleral tunnel 主切口與縫合（規格書）

2026-11-26 訂。站長要一支「scleral incision 的白內障教學影片」，並貼了這台刀的 OP note。CCC、divide and conquer、I/A、IOL 植入已有白內障系列 ①–③ 詳細教過（`videos/src/cataract-series/spec.md`），這支只補系列沒有的：鞏膜隧道主切口與 10-0 nylon 縫合，以及本例和系列不同的地方。

## 病例情境（站長 2026-11-26 確認）
- 站長確認的摘要（Claude 依 OP note 整理；「結膜切開」與「術者坐約 1–2 點」是 Claude 推的，OP note 沒寫，站長回答「對」）：
  「OS，術者坐 upper-temporal（約 1–2 點）：peribulbar → 15° 刀做 side port → 結膜切開 → 2.65 mm keratome 做 scleral tunnel 主切口 → DuoVisc → 撕囊鉗 CCC → hydrodissection → divide and conquer（Signature）→ I/A＋polish → ZMB00 +6.5 D in the bag → 10-0 nylon 縫主切口 → 前房 cefuroxime。」
- 手術時間：2026-11-26，站長 12:05 左右說「2 小時後開始開刀，先給我三張紙」。所以先做三張列印單，術前速讀包與影片之後再做。
- OP note 的其他內容（照錄，去識別）：LenSx 沒用；iris retractor、ICG、CTR 都沒用；撕囊鉗做 CCC、前囊用鉗子取出；hydrodissection 用 irrigation cannula；前房注射 cefuroxime 1%；Tobradex 藥膏、紗布、眼罩。
- **隱私**：網站 repo 是公開的。影片、網站、這份規格書都不寫病人資料、院內人員姓名、主治代號與醫院名稱。

## 範圍（站長 2026-11-26 選「聚焦切口與縫合」）
一支約 8–10 分鐘，章節（暫定，帳本 `check.js` 的 `LEDGER` 照這個編號）：
1. 為什麼走鞏膜：和 clear corneal 比較（散光、傷口密閉、endophthalmitis）
2. 定位：OS 術者坐 upper-temporal、side port、結膜切開與止血
3. 鞏膜隧道：外口在角膜緣後 1–2 mm → 同一層往前 → 內口在角膜內約 1.5 mm（雙視角）
4. 出錯的線索與第一步：太淺穿破頂蓋（buttonhole）、太深或太早進前房（premature entry）、出血、虹膜脫出
5. CCC 到 IOL：只講本例不同處（DuoVisc、Signature、multifocal IOL 要置中），細節連到系列 ①–③
6. 縫合與收尾：10-0 nylon radial、內口張開時先打 BSS、前房 cefuroxime
7. 練習清單

## 模型與畫法（2026-11-26 先做列印單時定的）
- 共用的 `globe/cataract.js`：主切口的 `s`（外口在角膜緣後幾 mm）設成正值，外口就落在鞏膜上；本例 `s` 1.5、隧道弦長 3.0 mm，內口落在角膜內 1.48 mm（`anim/params.js`）。
- 眼球模型是右眼，但鐘點是檢查者的鐘點：把術者與主切口放在 1:30，畫出來就是這台 OS 的真實位置；只有 nasal／temporal 的名稱相反（OS 的 3 點＝temporal），單子上照 OS 寫。
- 切面裡的結膜掀開用 `st.cat.globe = { peri360: 0.4 }`（模型新加的選用欄位，舊畫面不變）；俯視圖的掀開範圍是單子自己畫的細虛線（示意）。
- Side port 的鐘點 OP note 沒寫：放在術者左手側、和系列案例 A 同樣離主切口 66°（3.7 點，示意）。

## 文獻（2026-11-26 PubMed 查證；Claude 小助手查、Claude 對摘要核對過）
| 文獻 | PMID | DOI | 用到的內容 |
|---|---|---|---|
| Goel 2022 Indian J Ophthalmol 70:3803（MSICS 併發症綜論，PMC 全文） | 36308100 | 10.4103/ijo.IJO_1812_22 | 外口在角膜緣後 1–2 mm、內口在角膜內 1–2 mm；太淺 buttonhole 要換深一點的平面；太深 premature entry 會虹膜脫出、iridodialysis、hyphema；傷口有疑慮時縫合門檻放低。注意是 MSICS（隧道較寬），不是 phaco 小切口 |
| Ernest 1994 JCRS 20:626（屍眼 6 眼） | 7837073 | 10.1016/s0886-3350(13)80651-7 | 方形 scleral corneal 3.2×3.2 mm、internal corneal lip 1.5 mm，耐壓到上限 525 psi 不漏；clear corneal 3.2×2.0 mm 在低眼壓 13 psi 就漏、虹膜脫出 |
| Ernest 1993 JCRS 19:457（屍眼 10 眼） | 8355151 | 10.1016/s0886-3350(13)80608-6 | 4.0 mm 寬、長 4.0 mm、含 1.5 mm corneal lip 最好；lip 越小、寬大於長越容易漏 |
| Olsen 1997 JCRS 23:337（RCT 100 人） | 9159676 | 10.1016/s0886-3350(97)80176-9 | 3.5–4.0 mm 切口，6 個月 SIA：corneal 0.72 D、scleral 0.36 D |
| Hayashi 2010 Ophthalmology 117:1313（RCT 90 人） | 20363504 | 10.1016/j.ophtha.2009.11.041 | 3.0 mm：clear corneal 的 SIA 較大；2.0 mm：沒有差別 |
| Subudhi 2021 Clin Ophthalmol 15:1667（住院醫師 MSICS 339 例） | 33907380 | 10.2147/OPTH.S290968 | 隧道相關（premature entry／buttonhole）12.6%；虹膜脫出 10.6% |
| John 1992 JCRS 18:495（RCT 129 眼） | 1403755 | 10.1016/s0886-3350(13)80105-8 | 深 vs 淺 scleral pocket：術後第 1 天 hyphema 34% vs 6% |
| Azar 1997 JCRS 23:1164（RCT 131 人） | 9368159 | 10.1016/s0886-3350(97)80310-0 | scleral tunnel 用 radial 10-0 nylon；一針組的 SIA 比三針組少 |
| Gimbel 1995 JCRS 21:121 | 7791048 | 10.1016/s0886-3350(13)80496-8 | 內口張開（fishmouthing）：先經 paracentesis 打 BSS 加深前房，不行再縫 |
| ESCRS 2007 JCRS 33:978（RCT 16,603 人） | 17531690 | 10.1016/j.jcrs.2007.02.032 | 沒打 cefuroxime 1 mg/0.1 mL：endophthalmitis 4.92 倍；CCI 對 scleral tunnel：5.88 倍 |
| Arshinoff 1999 JCRS 25:167 | 9951659 | 10.1016/s0886-3350(99)80121-7 | cohesive 撐空間、dispersive 留得住，依目的依序合用（摘要沒寫先打哪一種） |
| Hollick 1999 AJO 128:271 | 10511019 | 10.1016/s0002-9394(99)00157-9 | CCC 5.0–5.5 mm（系列 ① 已用） |
| Ye 2021 Ann Transl Med 9:144 | 33569446 | 10.21037/atm-20-7777 | ZMB00 是 diffractive multifocal，near 4.0 D |
| Soda 2012 Ophthalmologica 227:197（模型眼，測的是前一代 ZM900） | 22222365 | 10.1159/000333820 | 偏心 0.75 mm 內不預期有臨床影響 |
| Friedman 2001 Ophthalmology 108:519（RCT 的系統性整理） | 11237906 | 10.1016/s0161-6420(00)00597-2 | peribulbar 與 retrobulbar 的 akinesia、止痛相當 |
- 查不到、單子上沒寫數字的：phaco 小切口專屬的外口距離（只有 MSICS 綜論的 1–2 mm）、ZMB00 的 optic 直徑、DuoVisc 先打哪一種、埋結的做法、peribulbar 後眼球仍會動的比例。

## 畫面設計（2026-11-26 Claude 訂；旁白已定稿在 `anim/segments.js`，語音已合成）
每段左＝經主切口的切面（`sec`，左＝主切口、上＝前），右＝術者視角（`scope`，OS、術者坐 1:30、下＝主切口、左下＝temporal），兩邊同一個狀態、同一個時間。狀態與疊圖可以照搬 `print/steps.js`、`print/anatomy.js`（同名函式在 `anim/draw.js` 骨架裡）。顏色：切口與正確的隧道用 `COL.accent`，錯誤的路徑用 `WARN`，縫線用 `SUT_COL`；沒有出處的形狀或位置在畫面標「示意」。
- **片頭**：右邊完成後的術者視角（主切口、側切口、radial 縫線）。
- **1-1**：左邊 clear corneal（細虛線）和 scleral tunnel 依序出現；第 1 句兩條尺寸線（角膜緣 → 外口、角膜緣 → 內口，標「1–2 mm」）；第 2 句把隧道在角膜裡的一段（lip）描粗並標 internal corneal lip。右邊兩個外口的位置對照。
- **1-2**：左邊散光的長條圖（Olsen：corneal 0.72 vs scleral 0.36 D；下方一行 Hayashi 的 3.0／2.0 mm 結論）；右邊第 2 句起 endophthalmitis 5.88 倍的對照卡，第 3 句換成結膜切開的術者視角（代價）。
- **2-1**：右邊術者視角標 1–2 點的主切口（正下方）、3 點 temporal（左下）、9 點 nasal（右上）、側切口（左手側，示意）；左邊一張方位小圖：病人頭、左眼、術者坐的位置與顯微鏡方向（示意），第 0 句先放 peribulbar 的文字卡。
- **2-2**：第 0 句經側切口的切面，15° 刀進前房再退出；第 1–3 句換經主切口的切面，結膜往後掀（`globe.peri360` 0→`CASE.peri`），右邊沿角膜緣剪開的弧與掀開範圍（示意），第 2 句幾個燒灼點（示意）。
- **3-1**：keratome 從外口切入部分厚度、刀放平（只畫到隧道起點）；尺寸線「角膜緣後 1.5 mm（示意）」；右邊刀在外口。
- **3-2**：keratome 沿隧道往前推到內口前，切到哪裡隧道畫到哪裡；第 1 句 lip 段的尺寸線「約 1.5 mm」。
- **3-3**：刀尖進前房、退出；第 1 句眼壓箭頭把 lip 推向頂蓋（示意）；第 2–4 句 Ernest 的數字卡（scleral 3.2 × 3.2 mm、lip 1.5 mm、525 psi；clear corneal 3.2 × 2.0 mm、13 psi）。
- **4-1**：左邊太淺的路徑從頂蓋穿出（`WARN`），第 1 句退回、換深一點的平面（正確隧道淡出現）；右邊頂蓋穿破的位置（示意）；第 2 句 Subudhi 卡。
- **4-2**：左邊太早往下的隧道（內口在角膜緣、靠近虹膜根部），第 1 句虹膜從切口脫出與出血（示意形狀）；第 2–3 句 Subudhi 10.6% 與 John 34% vs 6% 的卡；第 4 句「縫合門檻放低」。
- **5-1**：OVD 撐滿前房（DuoVisc，標 dispersive／cohesive 示意）→ CCC 完成，右邊 5.0–5.5 mm 尺寸線；第 2 句 phaco 經隧道進前房（`print/steps.js` 的刻槽狀態）。
- **5-2**：IOL in the bag（`print/steps.js` 第 7 格的狀態）；第 2 句右邊並排「置中」與「偏心 0.75 mm」的 optic 位置（示意，只畫位置，不畫成像）。
- **6-1**：左邊內口張開（fishmouthing，lip 往下離開頂蓋，示意）→ 第 1 句 cannula 經側切口打 BSS、前房加深、lip 貼回；右邊同步。
- **6-2**：針穿過外口後唇、跨過外口、從頂蓋出針（`wallPath([[2.15,0],[1.5,0.3],[0.85,0]])`），右邊 radial 縫線；第 2 句 Azar 的卡。
- **6-3**：cannula 經側切口打 cefuroxime；第 1 句 ESCRS 4.92 倍的卡；第 2 句收尾清單（Tobradex、紗布、眼罩）。
- **7**：全寬，四張卡（外口 1–2 mm、同一層、lip 約 1.5 mm、打 BSS 看內口），每張一個小切面圖。
- 旁白↔畫面的檢查（`check.js` 的 M…，讀 `window.SYNC`）：外口畫在角膜緣後 1–2 mm、lip 約 1.5 mm（用畫面上的定位點與比例換算回 mm）；術者視角的主切口在正下方、3 點在左下、9 點在右上、側切口在左半；太淺的路徑穿出外表面、太早的內口在角膜緣附近；縫線跨過外口且和切口垂直（radial）；cefuroxime 與 BSS 的 cannula 經側切口。每條都要有一個故意改錯（MUTATIONS）。

## 示意與依主刀（單子上已標）
結膜掀開的範圍與做法、side port 鐘點、縫幾針、器械／OVD／核／IOL 的形狀、隧道的深度曲線（模型的 `tri` 隧道形狀）。

## 驗收項目
- [x] 三張列印單（跟刀清單、手術步驟圖、關鍵解剖與數字速查）`print.js --gray` 全部 PASS，傳 PDF（A4 頁面版）與 PNG。
- [ ] 術前速讀包（`brief.js`）：這台已開，影片做好後不再需要；之後同樣術式有排刀時再交。
- [ ] 旁白、畫面、`check.js` 的旁白檢查；`ref/manifest.json` 與 `check-all` 全部通過；每章一張總覽。
- [ ] 出片、上傳不公開、同步網站。

## 進度
- 2026-11-26：站長確認病例摘要與範圍；手術 2 小時後，依站長要求先做三張列印單（12:05–13:00）。PubMed 查 15 篇（上表）。共用工具加兩個選用參數（`cataract.js` 的 `st.cat.globe`、`print-kit.js` 俯視圖的 `surgeon`），舊畫面不變（白內障 ① 的 `check-all` 參考圖比對）。`check.js` 目前只有帳本與病例幾何的 50 項檢查。
- 2026-11-26（畫面：片頭、1-1、1-2、2-1）：照「畫面設計」畫完這四段。片頭＝完成後的術者視角（主切口、側切口、radial 縫線）；1-1 切面先畫 clear corneal（虛線）再畫隧道、兩條「1–2 mm」尺寸線、lip 描粗，右邊兩個外口對角膜緣的位置；1-2 Olsen 長條圖與 Hayashi 一行、ESCRS 5.88 倍的比例條、結膜切開的術者視角；2-1 peribulbar 卡 → 方位小圖（面對病人的鐘點、術者約 1–2 點），右邊標主切口、3／9 點與側切口。`check.js` 加旁白↔畫面檢查 M1–M10（各一個故意改錯），參考圖四張（Claude 自檢）。標示意的：結膜掀開範圍、側切口位置、縫幾針、方位小圖的臉與眼。
- 2026-11-26（畫面：2-2、3-1～3-3）：2-2 先經側切口的切面（15° 刀尖進前房再退出），再換經主切口的切面：結膜沿角膜緣剪開、往後掀（`peri360` 0→0.4，兩圖同一範圍）、燒灼點（示意）。第 3 章是同一個 keratome 動作：外口在角膜緣後 1.5 mm（示意）、切到部分厚度後以刀尖為軸放平、同一層往前穿過角膜緣、停在內口前（lip「約 1.5 mm」尺寸線）、3-3 刀尖往下經內口進前房再退出；隧道用模型的 `main.cut` 切到哪裡畫到哪裡；眼壓箭頭（示意）、Ernest 卡（兩個切口照比例）。刀子自己畫（尖端、寬、長取自模型）：轉角處以刀尖轉動而不是跳角度，進前房時以隧道的支點為槓桿（刀身經內口、不穿頂蓋），刀柄 45° 彎頸（示意）；刀壓住後唇與 lip 的變形模型沒有畫，畫面標示意。`check.js` 加 M11–M18（各一個故意改錯），參考圖四張（Claude 自檢）。
- 2026-11-26（畫面：4-1、4-2、5-1、5-2）：第 4 章是列印單第 5 格的兩條錯誤路徑，切面放大到外口、角膜緣、兩個內口與虹膜根部。4-1 刀沿太淺的路徑在頂蓋裡前進，從外口與角膜緣之間穿出（右邊同一處的頂蓋穿破，示意），退回後較深的平面（模型的隧道）淡淡出現，第 2 句換 Subudhi 卡；4-2 太早往下的隧道（模型 `L` 1.2，內口在角膜緣後 0.42 mm、近虹膜根部），虹膜經隧道脫出到外口、出血（形狀示意），Subudhi 與 John 的卡（長條同一比例），第 4 句「縫合的門檻放低」。刀以槽內一點為槓桿，刀抬起頂蓋的變形沒畫（標示意）。5-1 DuoVisc 撐滿前房（兩種的作用寫在小卡，先打哪一種不畫）→ CCC 5.25 mm 置中與尺寸線 → 刻槽狀態：模型的直桿 phaco 放進 3 mm 鞏膜隧道時壁的變形失真，所以切面改畫「外口 → 隧道 → 內口 → 刻槽」的路徑箭頭（示意），術者視角仍用模型的 phaco。5-2 IOL in the bag（列印單第 7 格的狀態）、繞射環（數目示意），第 2 句右邊並排置中與偏心 0.75 mm（只畫位置，方向示意）。`check.js` 加 M19–M27（各一個故意改錯），參考圖四張（Claude 自檢）。
- 下一步：寫旁白（`script-draft.md`、`anim/segments.js`）與畫面；刀後若站長給這台的實際細節（結膜做法、side port 位置、縫幾針），照實校正單子與影片。
