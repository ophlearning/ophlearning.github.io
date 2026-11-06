# Levator resection＋internal brow fixation＋conjunctivoplasty 教學影片：原始檔

三部組合刀影片的第一部。用共用影片套件（`videos/tools/video-kit/`，說明在 `videos/tools/README.md`）做的第一支影片；網站頁面不會連到這裡。

## 檔案
- `spec.md`：規格書與進度；`script-draft.md`：定稿腳本與 23 篇參考文獻（由 `anim/segments.js` 產生）；`overview-notes.md`：出片前總覽（示意與沒有直接出處的內容）。
- `anim/segments.js`：旁白（＝字幕）、重點、來源、章節、參考文獻；`anim/draw.js`：每段畫面；`anim/params.js`：手術參數（範本值與示意值，刀後依 OP note 改這裡）；`anim/video.html`：影片頁；`anim/timeline.js`：語音長度產生的時間軸（進 git）。
- `check.js`：數字帳本與旁白↔模型檢查（`node check.js --selftest` 會把每項故意改錯一次）；`check-all.js` 會自動跑。
- `tts/lexicon-extra.json`：這支影片的英文發音；`ref/`：參考圖（`manifest.json`）與出片前總覽（`ref/overview/`）；`publish/`：YouTube 說明欄、章節、字幕、網站條目草稿。

## 重做步驟（在 repo 根目錄執行，`V=videos/src/levator-resection-brow-fixation`）
1. 字型與語音模型照 `videos/tools/README.md` 的「準備」；`ln -s ~/.cache/ophtts/vits-melo-tts-zh_en $V/tts/`。
2. 旁白：`node videos/tools/video-kit/tts/export_lines.js $V && python3 videos/tools/video-kit/tts/tts.py $V --check && python3 videos/tools/video-kit/tts/tts.py $V && python3 videos/tools/video-kit/tts/assemble.py $V`
3. 檢查：`node videos/tools/check-all.js $V`
4. 出片：`videos/tools/video-kit/build.sh $V levator-resection-brow-fixation`（4 核心約 25 分鐘）→ `$V/out/levator-resection-brow-fixation.mp4`
5. 上傳（不公開）：`python3 videos/tools/video-kit/youtube_upload.py $V/out/levator-resection-brow-fixation.mp4 --title "上眼瞼 levator resection＋internal brow fixation 教學" --desc-file $V/publish/youtube-description.txt`；之後照 repo 根目錄 `CLAUDE.md` 同步網站（`publish/website-entry-draft.txt` 的 `yt` 換成影片 ID）。
