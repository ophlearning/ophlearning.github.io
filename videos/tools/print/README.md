# 列印用的跟刀單（`videos/tools/print/`）

貼在開刀房牆上、跟刀時抬頭看的橫式單張。紙張預設是院內全部在用的兩孔影印紙「LSs」**210 × 270 mm**（不是 A4；A4 版印在這種紙上，左邊會被裁掉 27 mm），也可以出 A4、Letter。每一台手術三張：

1. **跟刀清單**：分術前、術中，每一項有勾選框、號碼、動作、關鍵數字或縫線（粗體），最多一行「注意」。
2. **手術步驟圖**：每一步一格，左＝矢狀切面（機轉）、右＝術者視角（正面），兩張是同一個模型狀態；號碼＝清單的號碼。
3. **關鍵解剖與數字速查**：幾張解剖圖＋兩張數字表（依院內常規的、文獻的）。

一支影片只需要在 `videos/src/<影片>/print/` 放四個小資料檔；版面、黑白疊圖、標籤排版、頁尾、PDF／PNG 輸出與數字檢查都在這個資料夾。第一個完整範例：`videos/src/upper-lid-levator-rotation-brow/print/`。

## 指令（在 repo 根目錄執行）
```
node videos/tools/print/print.js videos/src/<影片> --gray            # 三張全部（LSs 270 × 210 mm）：PDF＋PNG＋灰階 PNG，並跑所有檢查
node videos/tools/print/print.js videos/src/<影片> --paper a4        # 改用 A4（--paper letter；--paper all＝三種紙都出）
node videos/tools/print/print.js videos/src/<影片> --only steps      # 只做一張
node videos/tools/print/print.js videos/src/<影片> --selftest        # 另外把數字檢查的每條規則故意弄錯一次
```
輸出在 `videos/src/<影片>/out/print/`（不進 git）：`<名稱>-<紙>.pdf`（向量，正好是那種紙：lss 270 × 210、a4 297 × 210、letter 279.4 × 215.9 mm）、`<名稱>-<紙>.png`（300 dpi，由 PDF 點陣化：lss 3189 × 2480、a4 3508 × 2480、letter 3300 × 2550）、`<名稱>-<紙>-gray.png`（`--gray`）。列印時選「實際大小／100%」，紙張選對應的尺寸。一次只開一個瀏覽器、一張一張畫，別的 agent 在出片時也不會搶太多資源。最後一行是 `all 3 sheet(s) passed` 才算完成。

需要：Playwright（同其他工具）、`pdftoppm`、`pdfinfo`（poppler）、ImageMagick（`identify`、`convert`）、字型（`videos/models/fonts`，見 `videos/tools/README.md` 的「準備」）。

## 新影片：加三張單子
先讀該影片的 `anim/segments.js`（跟刀清單那一段、重點、來源）、`check.js` 的 `LEDGER`、`anim/params.js`、`anim/draw.js`（每一步結束時的狀態）與 `overview-notes.md`（哪些是示意、依院內常規）。**單子上只放影片已經查證過的內容**；影片標示意或依院內常規的，單子照樣標。

在 `videos/src/<影片>/print/` 放四個檔（照範例複製最快）：

### `video.js`：哪一支影片、用哪些模型、狀態
```js
PRINT.video({
  id: 'upper-lid-levator-rotation-brow',             // 網站的 #id → 頁尾網址 https://ophlearning.github.io/videos/#<id>
  title: '上眼瞼三合一：…',                            // 頁尾的影片標題
  surgery: ['上眼瞼三合一', '第二行', '第三行'],         // 右上角：第一行粗體
  steps: 8,                                           // 清單件數＝步驟圖格數（不一致會直接報錯）
  models: ['eyelid/lid.js', 'eyelid/coronal.js'],     // videos/models/ 底下要載入的模型檔
  scripts: ['anim/segments.js', 'anim/params.js'],    // 影片資料夾裡要載入的檔（REFS、參數）
  setup() { const PRE = { mrd1: LRP.mrdPre }; …; return { PRE, …, WIN: { … } }; },   // 回傳的名稱變成資料檔可用的全域變數
});
```
`setup()` 裡的狀態**從 `anim/draw.js` 複製、名稱相同**（例如 `PRE`、`ADV`），單子的圖才會和影片的畫面一致；這支影片專用的幾何（例如範例裡的 `ROT`：正面的 lid crease 切口與皮瓣窗；`EPI`：瞼緣放大與電解針）也放這裡。

### `checklist.js`：清單
```js
PRINT.sheet({ type: 'checklist', title: '跟刀清單', sub: '…', sources: ['Cruz 2015a', …],
  items: [
    { sec: '術前', act: '動作，<b>關鍵數字或縫線</b>', note: '一句有出處的陷阱（作者 年份）' },
    { sec: '術中①　…', act: '…' },     // sec 只寫在新段落的第一項；右欄開頭會自動補「（續）」
    …
  ] });                                // 號碼自動 1…n；split: 左欄件數（預設一半）
```

### `steps.js`：步驟圖
```js
PRINT.sheet({ type: 'steps', title: '手術步驟圖', sub: '…', sources: […], grid: [3, 3],
  legend: { rows: ['inc', 'cut', 'sut', 'fix', 'nerve'], orient: ['<b>左圖 矢狀切面</b>…', '<b>右圖 術者視角</b>…', '…：示意'] },
  steps: [
    { hd: '格子標題（示意的寫在這裡）', views: [
      { kind: 'sag', state: ADV, win: WIN.sagLid, red: 'none', marks: [{ at: 'tarSut', pos: 'tr' }],
        labels: [['固定到瞼板', 'tarsus', 'tarSut'], ['瞼緣', 'margin', V => V.P(V.r.DP.at(0, 0))]] },
      { kind: 'cor', state: ADV, win: WIN.corLid, … } ] },
    … ] });
```
一個視角（view）的欄位：
- `kind`：`sag`（上眼瞼矢狀切面）、`cor`（正面）、`lsag`、`lcor`、`axial`（下眼瞼與外眥，見 `videos/models/eyelid/CARD.md`）；白內障（`globe/cataract.js`，狀態寫成 `{ cat: … }`）：`csec`（子午切面，`hp`＝切面右邊的鐘點、左邊是 `hp + 6`，整張圖的範圍都會算組織）、`cscope`（顯微鏡俯視，術者坐 12 點）；`csec` 另可給 `off`（切面離中心幾 mm，例如垂直槽的橫切面）與 `cut: true`（器械畫成穿過切面的截面），不給就是原本的切面（2026-11-10 為 ② 加）；後段（`posterior/posterior.js`，狀態就是模型的狀態，2026-11-12 為 RRD PPV 加）：`psec`（切面，整張圖的範圍都會算組織：預設經 `hp` 點的子午切面，右＝`hp` 點、上＝前；或給 `plane`，例如 trocar 隧道的橫切面 `GLOBE.planes.across(h, s)`、經器械的平面、頭位的 `POSTERIOR.headPlane(st)`）、`phead`（頭位圖：重力朝下，模型的重力箭頭在右上）、`pfundus`（眼底圖，檢查者畫法）、`pwide`（廣角，術者位置、inverter、看向依狀態）、`pscope`（顯微鏡俯視與 trocar）；`none`＝不畫模型，只畫 `draw`（例：備氣的針筒）。後段模型沒有紅、藍、紫，黑白疊圖改由 `print.css` 的 `.post` 規則把它自己的顏色拉到上層：器械、套管、壓鞏膜器＝淺灰黑邊，hub＝灰，裂孔、關好的傷口、重力箭頭＝黑，雷射點＝黑圈，廣角的黑底不印。新模型在 `print-kit.js` 的 `model()` 加一行。第二個範例：`videos/src/cataract-1-wound-ccc/print/`（標籤用 `draw` 指定位置，見該資料夾 `video.js` 的 `lb`）；第三個：`videos/src/cataract-2-hydro-dc/print/`（12–6 切面＋垂直槽的橫切面＋俯視；狀態照 `anim/draw.js` 同名複製）；後段：`videos/src/rrd-ppv-c3f8/print/`（`video.js` 直接載入影片的 `anim/views-posterior.js`，狀態用 `VP.ST` 的名稱）。
- `state`、`windows`（正面開窗）、`win`：模型視窗 `{ x, y, w[, h] }`（mm，左上角與寬高；圖的大小由 `grid` 算，視窗置中）。
- 模型自己的疊圖怎麼轉成黑白：`red: 'cut'`（預設，紅色→粗黑實線）／`'inc'`（紅色→粗黑虛線）／`'none'`（不畫，改用 `overlays` 依意義自己畫）；紫色畫線一律→虛線；藍色縫線→黑點線（`blue: false` 不畫）；`amber: true` 把眶上神經的投影→細點劃線。
- `overlays: [{ cut | inc | sut: 路徑, w }]`：路徑是 `V => [圖上的點]`、定位點陣列，或 `PRINT.along('excLoY', -12.4, 9.8)`（沿正面模型的高度函式取樣）。
- `dims: [{ from, to, label: ['中文', 'English'] }]`：尺寸線，標籤自動加進標籤列。
- `marks: [{ at, pos, fix }]`：這一步的圈號（號碼自動＝步驟號碼）；`pos` 是 `'tl' | 'tr' | 'bl' | 'br'`（角落，畫細引線）或 `[dx, dy]`（相對定位點，mm）；`fix: true`＝固定點（黑點＋黑底號碼）。
- `labels: [['中文', 'English', 定位點, { side }]]`：定位點可以是模型的定位點名稱（`'tarSut'`）、模型座標 `[x, y]`（mm）或 `V => [圖上的點]`；`labelOpts: { gap, y0, y1, sides }`。
- `scale: { mm, x, y }` 比例尺；`draw: V => svg` 其他畫法（在圖的 mm 座標畫；`V.P` 把模型 mm 換到圖上，`V.A` 是換好的定位點，`V.r` 是模型的完整回傳）。

### `anatomy.js`：解剖與數字速查
```js
PRINT.sheet({ type: 'anatomy', title: '關鍵解剖與數字速查', sub: '…', sources: […], figH: 73,
  figures: [{ w: 92, kind: 'sag', state: …, win: …, labels: …, dims: …, labelOpts: { sides: true } }, …],   // 寬度相加 ≤ 272 mm
  bottom: '86mm 1fr 50mm',                                 // 下排：表格…、圖例的欄寬
  tables: [
    { head: '依院內常規（刀後依 OP note 確認）', rows: [['切除皮膚寬', '5 mm', '3-1'], …] },
    { head: '文獻的數字', src: true, rows: [['Ptosis 修復後閉不緊', '第 1 天 60%、…', '6'], …] } ],
  legend: { rows: ['inc', 'nerve'], orient: […] } });
```
表格每一列的第三欄是**帳本的鍵**：`check.js` 的 `LEDGER` 段落編號（兩段用「；」隔開）。這一列的每個數字都必須在那一段登記，否則整張停下來報錯；「出處」欄由帳本自動填（涵蓋所有數字的最少文獻）。

## 系列的單子：跨好幾支影片（2026-11-12 為白內障系列加）
一個手術系列拆成好幾支影片時（例：白內障 ①–④），貼牆可以另做一張「全流程」，放在系列資料夾的 `print/`（例：`videos/src/cataract-series/print/`）。範例就是那個資料夾。
- `sources.json`：`{ "videos": ["cataract-1-wound-ccc", …], "refs": [] }`。系列資料夾沒有自己的 `check.js`，數字檢查改讀這幾支影片的帳本（段落寫成「<影片> <段落>」）與 `REFS`；`refs` 放只有系列單子用到的文獻全文（格式同 `REFS`）。
- `video.js`：`id` 是網站的系列網址（白內障用 `cataract`，`videos/#cataract` 會開 ①）；`models: []`、`scripts: []`。
- `flow.js`（版面 `type: 'flow'`）：每個階段一欄、步驟號碼 1…n 連續、不放勾選框（貼牆不勾）；下方一條粗框「出事時第一步」，三個一列、照發生順序。
  ```js
  PRINT.sheet({ type: 'flow', title: '白內障全流程', sub: '…', note: '依四支教學影片的跟刀單整理；…',   // note 取代頁尾的「示意圖，非手術錄影；…」（沒有圖的單子用）
    sources: ['Ernest 1995', …], ledger: { '1': '結構', … },
    phases: [{ sec: '① 切口與 CCC', w: 1, items: ['<b>Side port</b>：…', …] }, …],          // w：欄寬比例（步驟少或短的階段給小一點）
    alarm: { head: '出事時第一步', items: [{ name: 'Run-out', see: '撕囊前緣往周邊跑', act: '<b>停、補 OVD</b>，…' }, …] } });
  ```
- **內容**：只從各支影片的跟刀清單濃縮，不加新的醫學內容；影片標「示意」「常用做法」「依院內常規」的照標。字太多時先把句子縮成重點（細節在各支影片的單子），不要讓字縮到下限 14 pt。
- 不想被拆成兩行的詞組包 `<span class="nw">…</span>`（或 `<b class="nw">`）；`act` 裡的粗體本來就不拆。
- 系列資料夾也可以放一般的清單（`type: 'checklist'`，例：`prep.js` 術前核對與備料）：`video.js` 不寫 `steps`，每張單子用自己的項目數編號；`surgery: [...]` 只換掉這張單子的右上角。影片沒講過的內容，文獻全文放 `sources.json` 的 `refs`，數字登記在單子的 `ledger`。

## 設計規則
- **紙與邊界**：橫式，預設 LSs 270 × 210 mm，四邊 10 mm；白底，文字後面不放灰底，不放半透明或動畫中途的東西。
- **兩個孔**：LSs 紙上緣有兩個預打的孔（ISO 838：相距 80 mm、置中、離上緣 12 mm、直徑 6 mm），孔的周圍 1.5 mm 內不放東西（`print.js` 會檢查）。
- **換紙不重寫資料檔**：版面依紙寬重排——身體區、步驟格子由紙張算；速查圖的寬度（資料檔照 A4 寫）在窄紙上等比例縮；標題過長會縮（不小於 22 pt）到孔的左邊結束；步驟標題縮（不小於 9 pt）到一行；清單項目（不小於 14 pt）和表格（不小於 9.5 pt）縮到不溢出。縮到下限還放不下，檢查會失敗，要回去縮短資料檔的字。
- **字級（`print.js` 會檢查）**：標題 22–26 pt（版面用 25 pt）；清單的項目 ≥ 14 pt（版面用 16 pt，「注意」14 pt）；圖上的文字與標籤 ≥ 9 pt（標籤 9.5 pt）；頁尾 7–8 pt。站在 1–1.5 m 外要讀得到。
- **黑白安全**：意義靠線型和號碼，不靠顏色——切口＝粗黑虛線、切開／切除＝粗黑實線、縫線＝黑點線＋白底圈號、固定點＝黑點＋黑底號碼、神經投影＝細點劃線；組織畫淡（模型整層降低不透明度，PDF 仍是向量），黑色疊圖最顯眼。不透明度依視角（`print-kit.js` 的 `TISSUE`，單一視角可用 `light` 覆寫）：眼瞼的矢狀切面類（`sag`、`lsag`、`axial`）100%、正面（`cor`、`lcor`）65%、白內障（`csec`、`cscope`）與後段（`psec` 等）50%。2026-11-13 第一次在開刀房的黑白雷射印表機印出：50% 時矢狀切面的淡色與細線幾乎印不出來，正面還看得清楚；正面調到 100% 時虹膜接近全黑，會蓋掉壓在上面的黑色尺寸線。灰階 PNG 在螢幕上看起來會比印出來深，判斷深淺要以印出的紙為準。圖例每張寫一次。
- **標籤**：一律「中文 English」；白邊；一列一個、依定位點高度排，不重疊、引線不交叉（`labels()`）；放不下就縮短字，不要縮小字級。
- **方位**：每種視角寫一次（術者視角：檢查者面對病人，左＝temporal 右＝nasal；矢狀切面：左＝前 上＝上）。
- **號碼**：清單號碼＝步驟圖號碼；圈號的數字＝它屬於哪一步。
- **頁尾**：「示意圖，非手術錄影；各院做法不同處依院內常規」、教學影片網址（手術名稱已在右上角，頁尾不重複，窄紙才不會折行）、這張單子數字的出處、「製作　張博淳」。不寫醫院名稱與主治代號。
- **內容（硬規則）**：不新增醫學內容。數字必須在影片帳本登記（或在單子的 `ledger: { '數字': '出處' }` 登記，出處在 `REFS` 並列在頁尾，或是「院內常規」「示意」「結構」「病例」；「病例」＝站長確認、寫在規格書「病例情境」的病例摘要）；文獻出處要列在頁尾；範本與這台刀特有的值照影片標「依院內常規」或「示意」。共用模型與 `video-kit/` 不改；需要模型配合時要選用式、而且不改既有畫面（`check-all.js` 的參考圖維持 0.000%）。

## 自檢（每次改了資料檔或版面）
1. `node videos/tools/print/print.js videos/src/<影片> --gray`，全部 PASS。
2. 看彩色與灰階的全頁（`out/print/<名稱>.png`、`<名稱>-gray.png`；縮成約 2000 px 寬看全頁）：黑色疊圖有沒有被組織或標籤蓋住、圈號有沒有壓在字上、灰階裡切口／切開／縫線分不分得出來、組織是不是夠淡。
3. 放大看密的地方（例如 `convert out/print/steps-gray.png -crop 1200x900+X+Y z.png`）：標籤引線指對了沒有、兩個視角是不是同一個狀態。
4. 想像站在 1.5 m 外：只看得到標題、清單與黑色疊圖也要能跟上手術。
5. 有問題改資料檔（縮短標籤、改 `pos`、改視窗），重跑到全部 PASS，才 commit（`out/` 不進 git）。

## `print.js` 檢查什麼
- 沒有頁面錯誤（資料檔寫錯會直接顯示哪一行）；PDF 一頁、正好是那種紙；PNG 是那種紙的 300 dpi 尺寸。
- 數字（`numcheck.js`）：影片帳本照 `check.js` 的 `LEDGER` 文字讀（不執行 check.js）；帳本裡展開的共用物件（例 ② 的 `...PED`）也從 check.js 的 `const PED = {…}` 讀。頁尾的網址不算數字（影片 id 裡的 `-1-` 不會被當成 1）；畫面上每個數字都在影片帳本（任一段，來源不是「結構」）或單子的 `ledger`，文獻來源列在頁尾；出現的「作者 年份」都在 `REFS`；頁尾的出處都在 `REFS`；圈號只能是 1–n；`ledger` 裡登記了卻沒用到也算錯。`--selftest` 把每條規則故意弄錯一次（帳本沒有「院內常規」數字的影片，第一條改用「示意」的數字）。
- 版面：四邊 10 mm 內與兩個孔的周圍沒有東西、沒有框溢出、標籤在自己的圖裡且互不重疊。
- 字級：見上面。

## 檔案
- `print.js`：輸出與檢查；`numcheck.js`：數字檢查；`sheet.html`：所有單子共用的頁面（`?video=…&sheet=…`，依 `video.js` 載入模型與資料檔）。
- `layout.js`：三種單子與系列全流程（`flow`）的版面（`PRINT.video`、`PRINT.sheet`、帳本鍵）；`print-kit.js`：畫圖的基本工具（`view` 兩層畫法、疊圖、圈號、標籤排版、圖例、頁框與頁尾）；`print.css`：頁面與黑白樣式。

## 已知限制
- 模型的紅色同時代表切口與切開，CSS 只能整張圖選一種；同一張圖兩種都有時用 `red: 'none'`，再用 `overlays` 依意義畫（範例的第 2、3 步）。
- 標籤檢查只看文字框，不看引線有沒有穿過別的字；放大自檢。
