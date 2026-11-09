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
   - 影片有 `anim/footage.js`（用真實錄影）的話也會跑錄影檢查（見下面「真實手術錄影」）。錄影不在這台機器上時顯示 SKIP，不是 PASS。
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
- `window.KIT_READY`：畫面裡有 `<image>`（錄影影格）時，等全部解碼完才 resolve 的 promise（值是載不到的影格清單）；沒有圖時是 null。工具在 `renderAt` 之後都會等它，自己寫新工具也要等。
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
  - `kit.js` 的 `drawMemo`：`DRAW2` 是 T 的純函式，記下它讀過的 `T.on`／`T.p` 值；沒讀 `T.u`、而且這一格這些值都一樣，就沿用上一次的畫面，不重算模型。字型還在載入時不沿用，載完就清掉（標籤位置靠量字寬；2026-11-06 片頭的標籤曾因此被沿用在錯的位置，是 `check-all` 抓到的）。
  - `render.js`：畫面一變，先等兩個 animation frame 再截圖；沒等的話，機器忙時偶爾會截到還沒畫完的一格。
- 驗證：`node videos/tools/video-kit/render.js $V/anim/video.html - --verify --from F --to F` 逐格比對快速路徑和舊路徑（每格重設畫面＋`page.screenshot`；舊路徑本身同一格每次都相同、和前一格是什麼無關）。結果分三類：逐位元相同、只差最低位元、看得出差異（任何像素任一色版差超過 8/255）。2026-11-06 抽驗四段（各 240 格）：PLTR 全部逐位元相同；用 kit 的影片有少數沿用的格子差 1 個像素（約 9/255），肉眼看不出。所以正確說法是「畫面相同到肉眼分不出」，不是逐位元相同。改了 kit 或 render 一定要再跑 `check-all`（參考圖）和幾段 `--verify`。
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

## 真實手術錄影（`video-kit/footage.js`，2026-11-09）
白內障系列起，術者視角用院內真實錄影：錄影是面板裡的一張圖，機轉切面照舊用模型畫，兩邊用同一組事件時間同步。

### 檔案
- `video-kit/footage.js`：頁面和 Node 共用的時間換算、裁切幾何、面板與檢查。`video-kit/footage-cli.js`：`extract`（抽影格）與 `check`（檢查）。
- 錄影來源（每個系列一份，放在錄影旁邊、進 git）：例 `videos/src/cataract-series/footage-sources.js`。
  - `file`（從 repo 根目錄算，放在不進 git 的 `footage/`）、`w`、`h`、`fps`、`eye`。
  - `overlays`：燒進畫面的文字與標誌（source px，實測），裁切一律離它們 4 px 以上。
  - `landmarks`：某一刻的角膜中心與主切口（source px），每個 clip 的時間範圍內至少一個。
- 每支影片的 `anim/footage.js`：`FOOTAGE_DEF = { sources, clips }`。clip 的欄位：
  - `src`、`in`／`out`（原始秒數）、`rate`（0.5＝半速）、`freeze: [{ at, dur }]`（停在原始時間 `at`，停 `dur` 秒）。
  - `crop: [{ t, cx, cy, w, rot }]`：原始時間的關鍵格（中心、寬，`rot`＝畫面順時針轉幾度），中間線性內插，可以平移縮放跟著眼睛；高度＝寬×面板比例。
  - `events: { 名稱: 原始秒數 }`、`points: { 名稱: [{ t, p: [x, y] }] }`（追蹤的 source px 點，給標籤用）。
- `video.html`：在 `kit.js` 之後依序載入 `../../../tools/video-kit/footage.js`、來源檔、`footage.js`。

### 步驟
1. 量 overlay：從整部錄影平均抽 60 格全解析度影格到 scratchpad（`ffmpeg -an`，聲音一律不用），算平均亮度；文字框的邊緣是亮度突然變暗的地方，再抽幾格放大確認。
2. 定位點：抽格、加格線放大，讀角膜緣（取中心）和主切口（器械穿過角膜緣的地方）。
3. 寫 clip，跑 `node videos/tools/video-kit/footage-cli.js check videos/src/<影片>`，再跑 `extract`。
   - `extract`：裁切、轉正、bicubic 縮放到面板×1.5（dual 909×615），存成 `<影片>/footage/frames/<clip>/<原始格號>.jpg`（不進 git）。
   - 已是最新就跳過；`check` 沒過的 clip 拒絕抽格，舊影格不動。
4. `draw.js`：`FOOTAGE.panel(clip, tau)` 回傳 `{ svg, extra, P }`，直接當 `L` 或 `R`。`tau` 是 clip 自己的秒數，超出範圍時停在第一格或最後一格。
   - 對旁白：`tau = FOOTAGE.sync(clip, '事件', T.u, T.st(2))`，事件就落在第 2 句開始。
   - 事件：`FOOTAGE.ev(clip, 名稱)`（clip 秒數）、`FOOTAGE.k(clip, 名稱, tau, d)`（事件後 d 秒 0→1）。標籤和模型狀態都用它，兩個視角才會對同一格。
   - 標籤定位點：`FOOTAGE.point(clip, 名稱, tau)` 或 `FOOTAGE.toPanel(clip, [x, y], tau)`（source px → 面板 px，用畫面上那一格的裁切）。
   - 面板標題自動產生：「術者視角　右眼 OD　手術錄影」「下＝12 點（主切口）　右＝temporal」；右上角自動加「慢放 0.5×」「加速 4×」或「停格」（2026-11-09 起 rate > 1 標「加速」，之前會誤標成慢放），右側標籤放在 y 44 以下。
5. 出片前 `check-all`；`render.js`、`brief.js` 遇到缺影格直接失敗，不會出現空白面板。

### 檢查（`footage-cli.js check`；`check-all.js` 看到 `anim/footage.js` 就自動跑）
- overlay：每個原始格（關鍵格與內插）的裁切框（含旋轉）離每個 overlay 至少 4 px，且不超出畫面。
- orientation：clip 內每個定位點，裁切與旋轉之後，主切口在角膜中心正下方 ±30° 內；clip 內沒有定位點也算失敗。
- events：事件、停格、追蹤點與裁切關鍵格都在 clip 內；追蹤點落在面板內。
- frames：每一格都在，`meta.json` 和目前的 clip、來源檔、抽格程式版本相同（改了 crop 沒重抽＝stale，FAIL）。
- 錄影和影格都不在這台機器（新 checkout）：frames 報 SKIP、exit 3；`ref-check.js` 對缺影格的項目也報 SKIP、exit 3；`check-all.js` 把 exit 3 顯示成 SKIP，不是 PASS。
- 2026-11-09 每條都故意改錯一次，確認會擋：
  - 裁切往左進參數欄、放大蓋到下方兩個框、畫面轉 180° → overlay FAIL（轉 180° 同時 orientation FAIL，−156°）。
  - 定位點的主切口改到 3 點方向（76°）、clip 縮短到沒有定位點 → orientation FAIL。
  - 事件在 clip 外（85 s）、停格在 clip 外 → events FAIL。
  - 改了 crop 沒重抽、刪掉一格 → frames FAIL；拿掉影格和錄影 → footage 與 ref-check 都 SKIP（exit 3）；只拿掉影格 → FAIL（要重抽）。

### 示範頁與實測
- 示範頁（不是影片）：`videos/src/cataract-series/anim/footage-demo.html`。案例 A 0:58–1:20（撕囊鉗開始 CCC），0.5× 慢放，原始 70.0 s 停格 3 秒，兩個標籤釘在 source px（鉗尖、主切口），右邊留白。
  - 檢查：`node videos/tools/check-all.js videos/src/cataract-series`（模型、footage、示範頁兩張參考圖；還沒有影片頁，影片層級 SKIP）。
- 案例 A 的 overlay（x, y, w, h）：ZEISS 標誌 10, 10, 50, 48；左側參數欄 10, 180, 120, 360；下方兩框 500, 637, 280, 72 與 826, 637, 444, 72；左緣 2 px 色線 0, 0, 2, 720。整段錄影不動。
  - 結果：左側參數欄擋住 x < 134，所以眼睛偏左時裁切跟不到正中央（示範頁的角膜中心偏左約 50 px）。
- 案例 A 的主切口在正下方偏 temporal 21–24°（66.1、70、78 s 三個定位點）。
- 速度：抽格約 70 ms／格（單核 JS bicubic，22 秒的 clip 46 秒）。出片 `render.js` 約 0.1 秒／格（示範頁沒有模型；有模型的影片再加 `renderAt`）。`--verify` 示範頁 390 格逐位元相同（含停格時沿用的 37 格）。

### 坑
- 影格是圖片，非同步載入：一定要等 `KIT_READY` 再截圖。沒等的話會截到空白或上一格。
- 去識別靠抽出來的影格本身只有裁切後的眼睛，不是靠 SVG 遮住；參考圖、總覽、速讀包才不會帶到文字。
- 裁切關鍵格用原始時間，所以停格時不能平移縮放（停格用那一格的裁切）。要在停格時放大，另做一個 clip。
- 追蹤點只有在量過的那一格是準的：眼睛不是等速移動，關鍵格之間是內插。標籤只在量過的格（例如停格）顯示，或把關鍵格加密。
- 主切口本來就偏離正下方（案例 A 21–24°），錄影若再轉一點就會超過 30°，檢查會擋。
- 慢放 0.5× 時，每個錄影格出現兩次；只有進度條也沒變時才沿用上一格的截圖。短片的進度條每格都在變，所以不會沿用。
- 面板尺寸寫在 `footage.js` 的 `PANEL_PX`（606×410、1230×410），頁面上會和 `kit.js` 的 `PW`、`PH`、`FW` 比對，不同就丟錯。
- 改了重採樣就把 `footage-cli.js` 的 `VERSION` 加一，舊影格會判定過期。

## 列印用的跟刀單（`print/`）
貼在開刀房牆上的橫式單張（預設院內兩孔紙 LSs 210 × 270 mm，也可出 A4／Letter）（黑白印表機也看得清楚、1–1.5 m 外讀得到）：跟刀清單、手術步驟圖（每一步矢狀切面＋術者視角並排）、關鍵解剖與數字速查。一支影片只要在 `videos/src/<影片>/print/` 放四個小資料檔（`video.js`、`checklist.js`、`steps.js`、`anatomy.js`），版面、黑白疊圖、標籤排版、頁尾、PDF／PNG 與數字檢查都由 `videos/tools/print/` 做。
- 指令：`node videos/tools/print/print.js videos/src/<影片> --gray`（輸出在 `out/print/`，不進 git）。
- **怎麼加一支新影片、資料檔格式、設計規則與最小字級、黑白自檢：見 [`print/README.md`](print/README.md)。** 第一個範例：`videos/src/upper-lid-levator-rotation-brow/print/`。

## 已知限制
- 參考圖比對只比亮度，不比顏色。原因是參考圖存成 JPEG，JPEG 會降低顏色解析度，比顏色的話，細的彩色線條每次都會被誤報。所以只改顏色、亮度不變的修改抓不到。
- 標籤檢查只看標籤文字和引線端點，不檢查標籤有沒有指對組織。指對與否靠模型裡的定位點，以及放大截圖自檢。
- 影片層級檢查適用共用版面的影片頁：PLTR 的 `video2.html`，以及所有用 `video-kit/` 的影片頁。
- `check-video.js` 只在每句的 60 % 檢查標籤；動畫中途的重疊靠截圖自檢。
