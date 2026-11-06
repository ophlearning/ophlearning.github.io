# 上眼瞼三合一（marginal rotation＋levator resection＋internal brow fixation）＋electric epilation 教學影片：原始檔

三部組合刀影片的第三部（影片 id `upper-lid-levator-rotation-brow`）。2026-11-06 站長更正病例後重做：三個步驟都在上眼瞼，順序 rotation → levator → brow，rotation 走同一條 lid crease 切口，電解也在上眼瞼。用共用影片套件（`videos/tools/video-kit/`，說明在 `videos/tools/README.md`）做；網站頁面不會連到這裡。

## 檔案
- `spec.md`：規格書與進度；`script-draft.md`：定稿腳本與 11 篇參考文獻（由 `anim/segments.js` 產生）；`overview-notes.md`：出片前總覽（示意、範本的解讀與沒有直接出處的內容）。
- `anim/segments.js`：旁白（＝字幕）、重點、來源、章節、參考文獻；`anim/draw.js`：每段畫面（含這支影片自己的正面皺褶切口／瓣／瞼板切開畫法 `ROT`，以及上瞼緣放大與電解針 `EPI`）；`anim/params.js`：手術參數（範本值、文獻值與示意值，刀後依 OP note 改這裡）；`anim/video.html`：影片頁；`anim/timeline.js`：語音長度產生的時間軸（進 git）。
- `check.js`：數字帳本、旁白↔模型檢查、兩個視角的方位（`node check.js --selftest` 會把每項故意改錯一次）；`check-all.js` 會自動跑。
- `tts/lexicon-extra.json`：英文發音；`ref/`：參考圖（`manifest.json`）與每章總覽（`ref/overview/`）；`publish/`：YouTube 說明欄、章節、字幕、網站條目草稿。

## 和第一部的關係
- 第 3 章（levator resection、眉毛固定）重用第一部的狀態、視窗與畫法，數值從第一部 `anim/params.js` 複製（同一份院內範本的解讀）；這支影片保留自己的一份，因為兩個病人刀後的 OP note 可能不同。
- 第 2 章的 rotation 用共用眼瞼模型的皺褶切口狀態（PLTR 影片 6-2 用過）；眼瞼模型 2026-11-06 加了選用參數 `creaseH`，讓皺褶切口落在 levator 下切口上（不給時畫面不變）。

## 重做步驟（在 repo 根目錄執行，`V=videos/src/upper-lid-levator-rotation-brow`）
1. 字型與語音模型照 `videos/tools/README.md` 的「準備」；`ln -s ~/.cache/ophtts/vits-melo-tts-zh_en $V/tts/`（這台機器的模型在 `/home/user/.cache/ophtts/`）。
2. 旁白：`node videos/tools/video-kit/tts/export_lines.js $V && python3 videos/tools/video-kit/tts/tts.py $V --check && python3 videos/tools/video-kit/tts/tts.py $V && python3 videos/tools/video-kit/tts/assemble.py $V`
3. 檢查：`node videos/tools/check-all.js $V`；術前速讀包：`node videos/tools/video-kit/brief.js $V`
4. 出片：`videos/tools/video-kit/build.sh $V upper-lid-levator-rotation-brow` → `$V/out/upper-lid-levator-rotation-brow.mp4`
5. 上傳（不公開）：`python3 videos/tools/video-kit/youtube_upload.py $V/out/upper-lid-levator-rotation-brow.mp4 --title "上眼瞼三合一：marginal rotation＋levator resection＋internal brow fixation，再加 electric epilation" --desc-file $V/publish/youtube-description.txt`；之後照 repo 根目錄 `CLAUDE.md` 同步網站（`publish/website-entry-draft.txt` 的 `yt` 換成影片 ID）。
