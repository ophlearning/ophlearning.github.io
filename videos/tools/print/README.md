# 列印用的跟刀單（`videos/tools/print/`）

貼在開刀房牆上、跟刀時抬頭看的 A4 橫式單張。每一台手術三張：

1. **跟刀清單**：分術前、術中，每一項有勾選框、號碼、動作、關鍵數字或縫線（粗體），最多一行「注意」。
2. **手術步驟圖**：每一步一格，左＝矢狀切面（機轉）、右＝術者視角（正面），兩張是同一個模型狀態；號碼＝清單的號碼。
3. **關鍵解剖與數字速查**：幾張解剖圖＋兩張數字表（依院內常規的、文獻的）。

一支影片只需要在 `videos/src/<影片>/print/` 放四個小資料檔；版面、黑白疊圖、標籤排版、頁尾、PDF／PNG 輸出與數字檢查都在這個資料夾。第一個完整範例：`videos/src/upper-lid-levator-rotation-brow/print/`。

## 指令（在 repo 根目錄執行）
```
node videos/tools/print/print.js videos/src/<影片> --gray            # 三張全部：PDF＋PNG＋灰階 PNG，並跑所有檢查
node videos/tools/print/print.js videos/src/<影片> --only steps      # 只做一張
node videos/tools/print/print.js videos/src/<影片> --selftest        # 另外把數字檢查的每條規則故意弄錯一次
```
輸出在 `videos/src/<影片>/out/print/`（不進 git）：`<名稱>.pdf`（向量，正好 A4 297 × 210 mm）、`<名稱>.png`（300 dpi，3508 × 2480，由 PDF 點陣化，和 PDF 一模一樣）、`<名稱>-gray.png`（`--gray`）。一次只開一個瀏覽器、一張一張畫，別的 agent 在出片時也不會搶太多資源。最後一行是 `all 3 sheet(s) passed` 才算完成。

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
- `kind`：`sag`（上眼瞼矢狀切面）、`cor`（正面）、`lsag`、`lcor`、`axial`（下眼瞼與外眥，見 `videos/models/eyelid/CARD.md`）；新模型在 `print-kit.js` 的 `model()` 加一行。
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

## 設計規則
- **紙與邊界**：A4 橫式，四邊 10 mm；白底，文字後面不放灰底，不放半透明或動畫中途的東西。
- **字級（`print.js` 會檢查）**：標題 22–26 pt（版面用 25 pt）；清單的項目 ≥ 14 pt（版面用 16 pt，「注意」14 pt）；圖上的文字與標籤 ≥ 9 pt（標籤 9.5 pt）；頁尾 7–8 pt。站在 1–1.5 m 外要讀得到。
- **黑白安全**：意義靠線型和號碼，不靠顏色——切口＝粗黑虛線、切開／切除＝粗黑實線、縫線＝黑點線＋白底圈號、固定點＝黑點＋黑底號碼、神經投影＝細點劃線；組織畫淡（模型整層 50% 不透明度，PDF 仍是向量），黑色疊圖最顯眼。圖例每張寫一次。
- **標籤**：一律「中文 English」；白邊；一列一個、依定位點高度排，不重疊、引線不交叉（`labels()`）；放不下就縮短字，不要縮小字級。
- **方位**：每種視角寫一次（術者視角：檢查者面對病人，左＝temporal 右＝nasal；矢狀切面：左＝前 上＝上）。
- **號碼**：清單號碼＝步驟圖號碼；圈號的數字＝它屬於哪一步。
- **頁尾**：「示意圖，非手術錄影；各院做法不同處依院內常規」、影片標題與網址、這張單子數字的出處、「製作　張博淳」。不寫醫院名稱與主治代號。
- **內容（硬規則）**：不新增醫學內容。數字必須在影片帳本登記（或在單子的 `ledger: { '數字': '出處' }` 登記，出處在 `REFS` 並列在頁尾，或是「院內常規」「示意」「結構」）；文獻出處要列在頁尾；範本與這台刀特有的值照影片標「依院內常規」或「示意」。共用模型與 `video-kit/` 不改；需要模型配合時要選用式、而且不改既有畫面（`check-all.js` 的參考圖維持 0.000%）。

## 自檢（每次改了資料檔或版面）
1. `node videos/tools/print/print.js videos/src/<影片> --gray`，全部 PASS。
2. 看彩色與灰階的全頁（`out/print/<名稱>.png`、`<名稱>-gray.png`；縮成約 2000 px 寬看全頁）：黑色疊圖有沒有被組織或標籤蓋住、圈號有沒有壓在字上、灰階裡切口／切開／縫線分不分得出來、組織是不是夠淡。
3. 放大看密的地方（例如 `convert out/print/steps-gray.png -crop 1200x900+X+Y z.png`）：標籤引線指對了沒有、兩個視角是不是同一個狀態。
4. 想像站在 1.5 m 外：只看得到標題、清單與黑色疊圖也要能跟上手術。
5. 有問題改資料檔（縮短標籤、改 `pos`、改視窗），重跑到全部 PASS，才 commit（`out/` 不進 git）。

## `print.js` 檢查什麼
- 沒有頁面錯誤（資料檔寫錯會直接顯示哪一行）；PDF 一頁、正好 A4；PNG 3508 × 2480。
- 數字（`numcheck.js`）：畫面上每個數字都在影片帳本（任一段，來源不是「結構」）或單子的 `ledger`，文獻來源列在頁尾；出現的「作者 年份」都在 `REFS`；頁尾的出處都在 `REFS`；圈號只能是 1–n；`ledger` 裡登記了卻沒用到也算錯。`--selftest` 把每條規則故意弄錯一次。
- 版面：四邊 10 mm 內沒有東西、沒有框溢出、標籤在自己的圖裡且互不重疊。
- 字級：見上面。

## 檔案
- `print.js`：輸出與檢查；`numcheck.js`：數字檢查；`sheet.html`：所有單子共用的頁面（`?video=…&sheet=…`，依 `video.js` 載入模型與資料檔）。
- `layout.js`：三種單子的版面（`PRINT.video`、`PRINT.sheet`、帳本鍵）；`print-kit.js`：畫圖的基本工具（`view` 兩層畫法、疊圖、圈號、標籤排版、圖例、頁框與頁尾）；`print.css`：頁面與黑白樣式。

## 已知限制
- 模型的紅色同時代表切口與切開，CSS 只能整張圖選一種；同一張圖兩種都有時用 `red: 'none'`，再用 `overlays` 依意義畫（範例的第 2、3 步）。
- 標籤檢查只看文字框，不看引線有沒有穿過別的字；放大自檢。
