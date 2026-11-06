# 上眼瞼 levator resection＋internal brow fixation、下眼瞼 marginal rotation＋electric epilation 教學影片：原始檔

三部組合刀影片的第三部。用共用影片套件（`videos/tools/video-kit/`，說明在 `videos/tools/README.md`）做的第二支影片；網站頁面不會連到這裡。

## 檔案
- `spec.md`：規格書與進度；`script-draft.md`：定稿腳本與 12 篇參考文獻（由 `anim/segments.js` 產生）；`overview-notes.md`：出片前總覽（示意、範本的解讀與沒有直接出處的內容）。
- `anim/segments.js`：旁白（＝字幕）、重點、來源、章節、參考文獻；`anim/draw.js`：每段畫面；`anim/params.js`：手術參數（範本值、文獻值與示意值，刀後依 OP note 改這裡）；`anim/views-lower.js`：下眼瞼的視角（kit 的 `VIEWS` 只有上眼瞼）；`anim/video.html`：影片頁；`anim/timeline.js`：語音長度產生的時間軸（進 git）。
- `check.js`：數字帳本、旁白↔模型檢查、兩個視角的方位（`node check.js --selftest` 會把每項故意改錯一次）；`check-all.js` 會自動跑。
- `tts/lexicon-extra.json`：這支影片的英文發音；`ref/`：參考圖（`manifest.json`）與出片前總覽（`ref/overview/`）；`publish/`：YouTube 說明欄、章節、字幕、網站條目草稿。

## 和第一部的關係
- 第 2 章（上眼瞼快速重述）重用第一部的狀態、視窗與畫法（`VIEWS.sag`／`VIEWS.cor`，狀態同第一部 `anim/draw.js` 的 `PRE`／`EXC`／`OPEN`／`RES`／`ADV`），所以兩部畫面一致；上眼瞼的數值（2.5／4／4 mm、5 mm、4-0 vicryl ×3、6-0 Prolene ×4、4-0 vicryl ×1、MRD1 約 2.5 mm）是同一份院內範本，2026-11-06 從第一部的 `anim/params.js` 複製過來。兩個病人刀後的 OP note 可能不同，所以這支影片保留自己的一份，不直接載入第一部的檔案。
- 下眼瞼的狀態用共用模型 `videos/models/eyelid/`（`lower.js`、`lower-coronal.js`），沒有改模型；第二部（另一位製作者）也用同一套模型，但兩支影片的畫面檔互不相依。

## 重做步驟（在 repo 根目錄執行，`V=videos/src/levator-brow-lower-lid-rotation`）
1. 字型與語音模型照 `videos/tools/README.md` 的「準備」；`ln -s ~/.cache/ophtts/vits-melo-tts-zh_en $V/tts/`（這台機器的模型在 `/home/user/.cache/ophtts/`）。
2. 旁白：`node videos/tools/video-kit/tts/export_lines.js $V && python3 videos/tools/video-kit/tts/tts.py $V --check && python3 videos/tools/video-kit/tts/tts.py $V && python3 videos/tools/video-kit/tts/assemble.py $V`
3. 檢查：`node videos/tools/check-all.js $V`
4. 出片：`videos/tools/video-kit/build.sh $V levator-brow-lower-lid-rotation` → `$V/out/levator-brow-lower-lid-rotation.mp4`
5. 上傳（不公開）：`python3 videos/tools/video-kit/youtube_upload.py $V/out/levator-brow-lower-lid-rotation.mp4 --title "上下眼瞼一起開：levator resection＋brow fixation、marginal rotation＋electric epilation" --desc-file $V/publish/youtube-description.txt`；之後照 repo 根目錄 `CLAUDE.md` 同步網站（`publish/website-entry-draft.txt` 的 `yt` 換成影片 ID）。
