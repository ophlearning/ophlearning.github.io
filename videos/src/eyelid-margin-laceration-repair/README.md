# 外傷性瞼緣裂傷的治療室一期縫合：教學影片原始檔

值班前預習用的治療室處置（沒有特定病人與手術日期，所以不做術前速讀包）。用共用影片套件（`videos/tools/video-kit/`，說明在 `videos/tools/README.md`）做；網站頁面不會連到這裡。解剖畫面用眼瞼模型（`videos/models/eyelid/`）的瞼緣裂傷部分（`laceration.js`），下眼瞼那一章用 `lower.js`。

## 檔案
- `spec.md`：規格書與進度；`script-draft.md`：腳本與出處；`overview-notes.md`：出片前總覽（示意與推論的內容）。
- `anim/segments.js`：旁白（＝字幕）、重點、來源、章節、參考文獻；`anim/params.js`：手術狀態與示意的幾何（畫面和 `check.js` 共用）；`anim/views-lac.js`：裂傷模型的視角包裝（`VLAC.margin`、`VLAC.sag`、`VLAC.cor`、`VLAC.lsag`、`VLAC.lcor`，和套件的 `VIEWS.sag` 同樣的回傳格式；`kit.js` 不動）；`anim/draw.js`：每段畫面；`anim/video.html`：影片頁；`anim/timeline.js`：語音長度產生的時間軸（合成語音後產生，進 git）。
- `check.js`：數字帳本與旁白↔模型檢查（`node check.js --selftest` 會把每項故意改錯一次）；`check-all.js` 會自動跑。
- `tts/lexicon-extra.json`：英文發音與念之前的文字替換；`ref/`：參考圖（`manifest.json`）與總覽（`ref/overview/`）。

## 視角
- 縫瞼緣的段落：左＝瞼緣面（從下方看上瞼緣，上＝前、皮膚；下＝後、結膜）；右＝正面（左＝temporal）。兩圖共用 x（同一個視窗 x 與寬度），同一針在兩圖同一個 x。
- 縫 tarsus、皮膚、線尾的段落：左＝傷口面（經傷口的矢狀切面，左＝前）；右＝正面，縫 tarsus 時開窗到瞼板層。
- 下眼瞼那一章：下眼瞼矢狀切面（兩針 tarsal suture 的高度為示意，沒有下眼瞼裂傷的模型）＋正面內側（淚小點與淚小管為示意）。

## 重做步驟（在 repo 根目錄執行，`V=videos/src/eyelid-margin-laceration-repair`）
1. 字型與語音模型照 `videos/tools/README.md` 的「準備」；`ln -s ~/.cache/ophtts/vits-melo-tts-zh_en $V/tts/`。
2. 旁白：`node videos/tools/video-kit/tts/export_lines.js $V && python3 videos/tools/video-kit/tts/tts.py $V --check && python3 videos/tools/video-kit/tts/tts.py $V && python3 videos/tools/video-kit/tts/assemble.py $V`
3. 檢查：`node videos/tools/check-all.js $V`（合成語音後時間軸會變，參考圖要自檢後重新產生）
4. 出片：`videos/tools/video-kit/build.sh $V eyelid-margin-laceration-repair` → `$V/out/eyelid-margin-laceration-repair.mp4`
5. 上傳（不公開）與同步網站：照 repo 根目錄 `CLAUDE.md`。
