# 教學影片的共用工具

這裡放做影片時用來「看清楚」和「擋錯」的工具，所有影片、所有模型共用。工具都要用 Node 執行（`require('playwright')` 要能用）。以下指令都在 repo 根目錄執行。

## 準備（每台機器做一次，字型不進 git）
- 模型樣本頁的字型：`cd videos/models && mkdir -p fonts && cd fonts && npm pack @fontsource/noto-sans-tc@5.1.1 && tar xzf fontsource-noto-sans-tc-5.1.1.tgz && cd ../../..`
- 影片頁的字型：見該影片 README 的「重做步驟」第 1 步（放在 `videos/src/<影片>/anim/fonts/`）。

## 每次改了模型或畫面：一條指令跑完所有檢查
`node videos/tools/check-all.js videos/src/<影片>`
例：`node videos/tools/check-all.js videos/src/upper-lid-margin-rotation`

最後一段 summary 全部是 PASS 才能 commit。它依序跑三道檢查：
1. **每個模型的自我檢查**（`videos/models/*/check.js`，新模型自動納入）：解剖關係、兩個視角一致、方位與物理、旁白講到的數字。
2. **影片層級檢查**（`check-video.js`）：旁白、重點框、來源、章節、參考文獻和上線版逐字相同；已換新畫法的段落，每句旁白時看得見的標籤都在面板內、引線指在面板內、標籤互不重疊；沒有程式錯誤。比對的頁面和文字基準版本，寫在該影片 `ref/manifest.json` 的 `page`、`textBase`。
3. **參考圖比對**（`ref-check.js`）：參考圖是檢查過、認定正確的畫面（Claude 放大自檢；站長只看出片前的總覽）。這道檢查會重畫同一時刻、比較每個像素的亮度，超過門檻（`manifest.json` 的 `threshold`，目前 0.02% 的像素）就判定不同，並印出差異圖的位置（紅色＝變了的地方）。門檻不要放寬：0.1% 時曾漏掉縫線位置 1.5 mm 的變化。
   - 差異是預期中的（例如這次本來就要改那一段）：自己放大看新截圖，確認正確後執行 `node videos/tools/ref-check.js <manifest> --update --only <段落>`，並在 `manifest.json` 的 `approved` 填日期、`note` 寫「Claude 自檢」。
   - 新增段落的參考圖：先在 `manifest.json` 加一筆（`approved` 填 null），再用 `--update --only <段落>` 只產生這一段，不會動到已確認的圖。
   - `--only` 也可以填參考圖或頁面的檔名（例如 `sample.html`）。
   - 畫面還沒自檢完、但要先 commit 保存時：更新參考圖，並把 `approved` 改成 null、`note` 寫明改了什麼；舊圖留在 git 歷史裡可以還原。站長確認後再填日期。
   - 差異不在預期中：代表改 A 壞了 B，先修好。

## 看清楚用的工具
- `shot-model.js`＋`model-view.html`：把任一個已報到的模型放大到指定範圍（mm），可以並排幾個手術狀態，並加 1 mm 格線。
  例：`node videos/tools/shot-model.js 'model=eyelid&m=sag&v=-19,-14,12&grid=1&st=[{"curl":1},{"curl":1,"cut":1,"k":1,"tuck":1}]' out.png`
  `model` 是 `videos/models/registry.js` 裡的模型名稱；`m` 是該模型的視角（眼瞼有 `sag`、`cor`、`ev`）；`v` 是左上角的 x、y 和寬度（mm），不給就用視角預設；`st` 是狀態清單。給錯視角名稱時，會列出這個模型有哪些視角。
- `seg-stills.js`：截某一段在指定時刻的畫面。時刻用「第幾句旁白的幾成」表示，所以語音重新合成後依然有效。
  例：`node videos/tools/seg-stills.js videos/src/upper-lid-margin-rotation/anim/video2.html 4-4 /tmp/s 0:0.05 2:0.6 6:0.9`

## 新增模型或新影片時
- **新模型**：照 `videos/models/README.md` 的製作流程。寫 `views.js` 報到，並在 `videos/models/registry.js` 加一行；寫 `check.js`。之後 `shot-model.js` 和 `check-all.js` 都會自動認得它。
- **新影片**：在 `videos/src/<影片>/ref/manifest.json` 寫好 `page`（影片頁）、`textBase`（文字比對的基準 commit）和參考圖清單。影片頁要用共用版面（提供 `PANELS`、`CONTENT_Y`、`CONTENT_H`、`SEGS`、`DRAW2`、`renderAt`、`TL_EXPORT`），影片層級檢查才能運作。

## 已知限制
- 參考圖比對只比亮度，不比顏色。原因是參考圖存成 JPEG，JPEG 會降低顏色解析度，比顏色的話，細的彩色線條每次都會被誤報。所以只改顏色、亮度不變的修改抓不到。
- 標籤檢查只看標籤文字和引線端點，不檢查標籤有沒有指對組織。指對與否靠模型裡的定位點，以及放大截圖自檢。
- 影片層級檢查目前只適用共用版面的影片頁（例如 `video2.html`）；之後抽出共用引擎時一起整理。
