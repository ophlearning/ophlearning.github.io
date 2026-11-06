# 教學影片的共用工具

這裡放做影片時用來「看清楚」和「擋錯」的工具，所有影片、所有模型共用。工具都要用 Node 執行（`require('playwright')` 要能用）。以下指令都在 repo 根目錄執行。

## 準備（每台機器做一次，字型不進 git）
- 模型樣本頁的字型：`cd videos/models && mkdir -p fonts && cd fonts && npm pack @fontsource/noto-sans-tc@5.1.1 && tar xzf fontsource-noto-sans-tc-5.1.1.tgz && cd ../../..`
- 影片頁的字型：用共用影片套件（`video-kit/`）做的影片直接用上面那一份（頁面連到 `../../../models/fonts/package/*.css`），不必另外下載；PLTR 的舊版面見該影片 README 的「重做步驟」第 1 步（放在 `videos/src/<影片>/anim/fonts/`）。
- 語音模型（一份共用）：`mkdir -p ~/.cache/ophtts && cd ~/.cache/ophtts`，下載並解壓 https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/vits-melo-tts-zh_en.tar.bz2 ；`pip install sherpa-onnx opencc-python-reimplemented`。每支影片在 `tts/` 放一個連結：`ln -s ~/.cache/ophtts/vits-melo-tts-zh_en videos/src/<影片>/tts/`（不進 git）。

## 每次改了模型或畫面：一條指令跑完所有檢查
`node videos/tools/check-all.js videos/src/<影片>`
例：`node videos/tools/check-all.js videos/src/upper-lid-margin-rotation`

最後一段 summary 全部是 PASS 才能 commit。它依序跑三道檢查：
1. **每個模型的自我檢查**（`videos/models/*/check.js`，新模型自動納入）：解剖關係、兩個視角一致、方位與物理、旁白講到的數字。
   - 影片資料夾裡有 `check.js` 的話也會跑（在影片資料夾執行）：這支影片旁白講到的數字與空間關係在模型上的檢查，以及數字帳本（見下面「共用影片套件」）。
2. **影片層級檢查**（`check-video.js`）：旁白、重點框、來源、章節、參考文獻和上線版逐字相同；已換新畫法的段落，每句旁白時看得見的標籤都在面板內、引線指在面板內、標籤互不重疊；沒有程式錯誤。比對的頁面和文字基準版本，寫在該影片 `ref/manifest.json` 的 `page`、`textBase`。
3. **參考圖比對**（`ref-check.js`）：參考圖是檢查過、認定正確的畫面（Claude 放大自檢；站長只看出片前的總覽）。這道檢查會重畫同一時刻、比較每個像素的亮度，超過門檻（`manifest.json` 的 `threshold`，目前 0.02% 的像素）就判定不同，並印出差異圖的位置（紅色＝變了的地方）。門檻不要放寬：0.1% 時曾漏掉縫線位置 1.5 mm 的變化。
   - 差異是預期中的（例如這次本來就要改那一段）：自己放大看新截圖，確認正確後執行 `node videos/tools/ref-check.js <manifest> --update --only <段落>`，並在 `manifest.json` 的 `approved` 填日期、`note` 寫「Claude 自檢」。
   - 新增段落的參考圖：先在 `manifest.json` 加一筆（`approved` 填 null），再用 `--update --only <段落>` 只產生這一段，不會動到已確認的圖。
   - `--only` 也可以填參考圖或頁面的檔名（例如 `sample.html`）。
   - 畫面還沒自檢完、但要先 commit 保存時：更新參考圖，並把 `approved` 改成 null、`note` 寫明改了什麼；舊圖留在 git 歷史裡可以還原。自檢完再填日期。
   - 差異不在預期中：代表改 A 壞了 B，先修好。

## 看清楚用的工具
- `shot-model.js`＋`model-view.html`：把任一個已報到的模型放大到指定範圍（mm），可以並排幾個手術狀態，並加 1 mm 格線。
  例：`node videos/tools/shot-model.js 'model=eyelid&m=sag&v=-19,-14,12&grid=1&st=[{"curl":1},{"curl":1,"cut":1,"k":1,"tuck":1}]' out.png`
  `model` 是 `videos/models/registry.js` 裡的模型名稱；`m` 是該模型的視角（眼瞼有 `sag`、`cor`、`ev`；下眼瞼另有 `lsag`、`both`、`lzoom`、`lcor`、`lcanth`、`axial`，下眼瞼的狀態直接寫在 `st`，上眼瞼的狀態放在 `st` 的 `upper` 裡）；`v` 是左上角的 x、y 和寬度（mm），不給就用視角預設；`st` 是狀態清單。給錯視角名稱時，會列出這個模型有哪些視角。
- `seg-stills.js`：截某一段在指定時刻的畫面。時刻用「第幾句旁白的幾成」表示，所以語音重新合成後依然有效。
  例：`node videos/tools/seg-stills.js videos/src/upper-lid-margin-rotation/anim/video2.html 4-4 /tmp/s 0:0.05 2:0.6 6:0.9`

## 新增模型或新影片時
- **新模型**：照 `videos/models/README.md` 的製作流程。寫 `views.js` 報到，並在 `videos/models/registry.js` 加一行；寫 `check.js`。之後 `shot-model.js` 和 `check-all.js` 都會自動認得它。
- **新影片**：在 `videos/src/<影片>/ref/manifest.json` 寫好 `page`（影片頁）、`textBase`（文字比對的基準 commit）和參考圖清單。還在模型階段、沒有影片頁時，`page` 填 null：影片層級檢查顯示 SKIP（不是 PASS），模型自我檢查與參考圖照跑。影片頁要用共用版面（提供 `PANELS`、`CONTENT_Y`、`CONTENT_H`、`SEGS`、`DRAW2`、`renderAt`、`TL_EXPORT`），影片層級檢查才能運作。

## 共用影片套件（`video-kit/`）
新影片只寫「文字＋每段畫面」，版面、時間軸、視角、標籤、渲染、語音、出片、上傳都共用。第一支用它的是 `videos/src/levator-resection-brow-fixation/`（照著它做最快）。

### 一支影片要提供的檔案（`videos/src/<影片>/`）
- `anim/segments.js`：`VIDEO`（片頭標題 `title`［幾行］、`subtitle`、`line`、`note`、header 用的 `name`）、`CHAPTERS`（最後一個是「參考文獻」，不編號）、`REFS`、`SEGS`。每段：`id`、`ch`、`title`、`layout`（`dual` 左右兩圖／`full` 一張寬圖／`title` 片頭／`refs` 參考文獻）、`lines`（旁白＝字幕，`\n` 換行）、`keys`（`[第幾句起, '重點，<b>強調</b>']`）、`src`（`[第幾句起, '作者 年份；…']`，`''` 表示清掉）；章節卡是 `{ id: 'c1', chapterCard: 1 }`。檔尾 `module.exports = { VIDEO, SEGS, CHAPTERS, REFS }`。
- `anim/draw.js`：`const DRAW2 = {}`，每個非章節卡的段落（含 `title`，不含 `refs`）一個函式 `DRAW2[id] = T => ({ L, R })`（`dual`）或 `({ F })`（`full`）、片頭是 `({ R })`。每個面板是 `{ svg, extra, P: { title, orient } }`：`svg` 會被裁在面板內，`extra` 放標籤。
- `anim/video.html`：照第一部影片的那一份，依序載入字型 css、`../../../tools/video-kit/kit.js`、模型、`segments.js`、（參數檔）、`draw.js`、`timeline.js`，最後 `KIT.start()`。
- `tts/lexicon-extra.json`（選用）：這支影片的英文發音與念之前的文字替換。
- `check.js`（選用，建議）：數字帳本與旁白↔模型檢查；`check-all.js` 會自動跑。
- `ref/manifest.json`：`page` 填 `../anim/video.html`、`textBase` 填旁白定稿的 commit。

### kit.js 提供的東西
- 時間：`T.u`（段落內秒數）、`T.st(i)`／`T.en(i)`（第 i 句開始／結束）、`T.on(i, d, off)`（第 i 句開始後 d 秒內 0→1）、`T.p(i, a, b)`（第 i 句的 a～b 比例內 0→1）；`ss`、`lerp`、`clamp01`。
- 視角：`VIEWS.sag(state, PW, PH, win, id)`（矢狀切面，`LID.draw`）、`VIEWS.cor(state, PW, PH, win, id, { windows })`（正面，`CORONAL.draw`）、`VIEWS.ev(...)`（翻瞼）。`win = { x, y, w }`（mm，左上角與寬度），回傳 `svg`、面板座標的定位點 `A`、原始 mm 定位點 `M`、換算函式 `P([x, y])`、比例 `k` 與模型的完整回傳 `r`。同一畫面兩個視角的 `id` 要不同。`VIEWS.zwin(a, b, z)` 在兩個視窗之間平移縮放，`VIEWS.dim(a, b)` 畫尺寸線，`VIEWS.sbar(k, op)` 比例尺。
- 標籤：`VIEWS.lab2('中文', 'English', 文字 x, 文字 y, 定位點, { side: 'R', bold, color, op, size })` 輸出 `<g class="lbl">`（`check-video.js` 檢查它們在面板內、不重疊）。左邊的標籤 x 用 14，右邊用 `PW - 12` 加 `side: 'R'`；上下相鄰的標籤至少差 34 px。
- 其他：`text`、`htext`（白邊文字）、`tblock`、`card`、`COL`、`measure`；面板尺寸 `PW`×`PH`（dual）、`FW`×`PH`（full）；標準面板標題 `SAG_T`、`COR_T`、`EV_T`。
- 檢查工具讀的全域變數：`PANELS`、`CONTENT_Y`、`CONTENT_H`、`SEGS`、`DRAW2`、`renderAt`、`TL_EXPORT`。字型子集會在第一格前全部載入（含 `draw.js` 裡的字串）。
- 沒有 `timeline.js` 時，時間軸用字數估計（和 `tts/assemble.py` 同一組間隔常數），可以先做畫面再做語音。

### 從文字到 mp4（在 repo 根目錄執行；`V=videos/src/<影片>`）
1. 匯出旁白：`node videos/tools/video-kit/tts/export_lines.js $V`
2. 發音檢查：`python3 videos/tools/video-kit/tts/tts.py $V --check`，`MISSING` 不是空的就補 `tts/lexicon-extra.json`，重跑到空為止。
3. 合成：`python3 videos/tools/video-kit/tts/tts.py $V`，再 `python3 videos/tools/video-kit/tts/assemble.py $V`（產生 `anim/timeline.js`；`out/` 下的 `narration.wav`、`captions.srt`、`chapters.txt`）。`timeline.js` 進 git，參考圖與檢查才和影片同一條時間軸；改了旁白要重跑 1–3 並更新參考圖。
4. 檢查：`node videos/tools/check-all.js $V`。
   - 有手術日期時，這一步一過就先做術前速讀包：`node videos/tools/video-kit/brief.js $V`（約 1 分鐘，`out/brief/` 下的 `旁白.md`＋每段一張圖，不需要 TTS），先傳給站長，再出片（規則見 repo 根目錄 `CLAUDE.md`）。
5. 出片：`videos/tools/video-kit/build.sh $V <輸出檔名>`，輸出 `$V/out/<輸出檔名>.mp4`。實測見下面「出片速度」。
6. 上傳（不公開）：`python3 videos/tools/video-kit/youtube_upload.py $V/out/<輸出檔名>.mp4 --title "…" --desc-file $V/publish/youtube-description.txt`；之後照 repo 根目錄 `CLAUDE.md` 同步網站。
- 單張截圖：`node videos/tools/video-kit/render.js $V/anim/video.html 輸出前綴 --stills 秒數,秒數`，或照句子用 `seg-stills.js`。

### 出片速度（2026-11-06 實測與改法）
- 一格的時間：`renderAt` 產生畫面約 0.15 秒；把新畫面排版、點陣化、截圖約 0.4–0.6 秒，這才是大頭。九分鐘的影片約 16,000 格，有 57% 的格子跟前一格完全一樣（旁白在講、畫面不動）。
- 改法（都不改畫面）：
  - `kit.js`：畫面標記跟上一格相同就不重設，設 `window.FRAME_CHANGED = false`。
  - `render.js`：沿用上一格的 JPEG。畫面一變，下一格會再截一次確認，才開始沿用，避免沿用到還沒畫完的那一格。截圖改走 CDP（同樣的裝置比例），位元組和 `page.screenshot` 相同。
  - `build.sh`：切成 4 × worker 段，讓 4 核一起收尾；同一台機器一次只出一部（鎖檔 `/tmp/ophlearning-video-build.lock`）。
- 驗證：`node videos/tools/video-kit/render.js $V/anim/video.html - --verify --from F --to F` 逐格比對快速路徑和舊路徑（每格重設畫面＋`page.screenshot`），要全部相同。
- 實測：舊流程出第二部（8:49）時和第三部同時跑，53 分鐘；新流程單獨出第一部（9:54，17,813 格，其中 6,686 格沿用），20 分鐘（同時有一個 agent 在寫另一部的腳本）。剩下的大頭是每一格都要呼叫 `renderAt`（約 0.15 秒），連沿用的格子也一樣。

### 共用套件還沒收進來、各影片自己帶的東西
- 下眼瞼視角：第二部 `anim/views-lower.js`（`VL.lsag`、`VL.lcor`、`VL.axial`）、第三部 `anim/views-lower.js`（`VL.lsag`、`VL.lcor`、`VL.upper`），回傳格式和 `VIEWS.sag` 相同；下一部用到時收進 `kit.js`。
- `draw.js` 最外層常數裡的中文（例如面板標題）不會被字型預載抓到，放進 `window.PRELOAD_EXTRA`。
- `VIDEO.credit` 可以覆寫片尾製作者；預設是「製作　張博淳」，影片不寫醫院名稱。
- TTS：「mm」後面直接接中文（例如被移掉的 `\n` 後面）不會轉成「毫米」，`--check` 會列 MISSING；在後面加空白或標點。
- 新開的 worktree 沒有不進 git 的字型資料夾：從主目錄複製 `videos/models/fonts`，PLTR 還要 `videos/src/upper-lid-margin-rotation/anim/fonts`。
- 平行的 agent 共用 scratchpad，log 檔名要各自不同。

### 數字帳本（影片的 `check.js`）
把每段畫面在每一句的 60 % 與 98 % 畫出來，收集畫面上所有文字，加上旁白、重點和標題，抽出每個數字：每個數字都要在該段的帳本裡登記來源（文獻要出現在該段的「來源」，或是「院內常規」「結構」「示意」）；畫面上出現的「作者 年份」都要在 `REFS` 裡；帳本裡登記了卻沒用到的數字也會報錯。這樣新加一個數字卻沒有出處，檢查一定會擋下來。

## 列印用的跟刀單（`print/`）
貼在開刀房牆上的 A4 橫式單張（黑白印表機也看得清楚、1–1.5 m 外讀得到）。每支影片三張：跟刀清單、手術步驟圖（每一步矢狀切面＋術者視角並排、同一個狀態）、關鍵解剖與數字速查。第一支做的是 `videos/src/upper-lid-levator-rotation-brow/print/`（照著它做最快）。

- 指令：`node videos/tools/print/print.js videos/src/<影片> [--only <名稱>] [--gray]`，把 `print/*.html` 每一張輸出成 `out/print/<名稱>.pdf`（向量、A4 297 × 210 mm）與 `.png`（300 dpi，3508 × 2480，由 PDF 點陣化）；`--gray` 另存 `-gray.png` 給黑白自檢。一次只開一個瀏覽器、一張一張畫（別的 agent 在出片時也不會搶太多資源）。
- 同時跑的檢查（全部 PASS 才算完成）：
  - **數字**（`numcheck.js`）：畫出來的每個數字都要在該影片 `check.js` 的 `LEDGER`（任一段、來源不是「結構」）或這張單子的 `ledger` 裡登記，而且文獻來源要列在頁尾的「數字出處」（院內常規、示意不必列）；頁面上出現的「作者 年份」都要在 `REFS`。步驟號碼與比例尺標 `data-struct="step"`／`"scale"`，另外檢查（步驟號碼只能是 1–N）。
  - **版面**：四邊 10 mm 內沒有東西、沒有框溢出、標籤在自己的圖內且互不重疊。
  - **字級**：標題 22–26 pt、清單 ≥ 14 pt、圖上文字 ≥ 9 pt、頁尾 7–8 pt。
  - **PDF 一頁、正好 A4；PNG 3508 × 2480。**
- 新影片要做的：
  1. 在 `videos/src/<影片>/print/` 放 `sheets.js` 與三個 html（照第一支複製，html 只改要載入的模型檔與 `SHEETS.<名稱>`）。
  2. `sheets.js` 定義 `META`（`id`＝網站的 `#id`、影片標題、術式）、每一步的狀態（**從該影片 `anim/draw.js` 複製同名的狀態**，畫面和影片一致）與 `SHEETS = { checklist, steps, anatomy }`；每張有 `title`、`body()`、`sources`（頁尾的數字出處）、`steps`（清單的件數）、選用的 `ledger`（影片帳本沒有的數字：`{ '數字': '出處' }`，出處要在 `REFS` 並列在頁尾，或是「院內常規」「示意」「結構」）。
  3. 內容只能用影片已經查證的：`anim/segments.js` 的跟刀清單與重點、`check.js` 的帳本、`anim/params.js`、`overview-notes.md` 標的示意／依院內常規照樣標。清單的號碼＝步驟圖的號碼；「注意」只放影片裡有出處的陷阱。
  4. 跑 `print.js … --gray`，放大看彩色與灰階（標籤、黑色疊圖、號碼有沒有被蓋住），全部 PASS 後 commit（`out/` 不進 git）。
- `print-kit.js` 提供：`PRINT.render`（頁框、標題、頁尾：示意聲明、影片標題與網址、數字出處、「製作　張博淳」；不寫醫院名稱）、`PRINT.view`（共用模型畫成兩層：組織淡色＋模型自己的紅／藍／紫疊圖轉成黑色：紅＝切開實線或 `red: 'inc'` 切口虛線、紫＝畫線虛線、藍＝縫線點線，`amber: true` 把眶上神經投影轉成細點劃線；`red: 'none'` 時自己畫）、`inc`／`cut`／`sut`／`fix`／`num`（黑白安全的疊圖與步驟圈號）、`labels`（「中文 English」標籤，依定位點高度排成一列一個，不重疊）、`column`、`dim`、`sbar`、`legend`（圖例與兩種視角的方位，一張寫一次）。共用模型與 `video-kit/` 都沒改。

## 已知限制
- 參考圖比對只比亮度，不比顏色。原因是參考圖存成 JPEG，JPEG 會降低顏色解析度，比顏色的話，細的彩色線條每次都會被誤報。所以只改顏色、亮度不變的修改抓不到。
- 標籤檢查只看標籤文字和引線端點，不檢查標籤有沒有指對組織。指對與否靠模型裡的定位點，以及放大截圖自檢。
- 影片層級檢查適用共用版面的影片頁：PLTR 的 `video2.html`，以及所有用 `video-kit/` 的影片頁。
- `check-video.js` 只在每句的 60 % 檢查標籤；動畫中途的重疊靠截圖自檢。
