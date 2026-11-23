# 上眼瞼 wart 切除＋cryotherapy 教學影片：原始檔

術前預習影片（影片 id `upper-lid-wart-excision-cryo`）：OD 上眼瞼 wart，切除後送病理，再對基底做 cryotherapy；病灶在皮膚面或瞼緣兩種情況都講。2026-11-23 手術當天做，先做三張列印單、再做影片。用共用影片套件（`videos/tools/video-kit/`，說明在 `videos/tools/README.md`）做；網站頁面不會連到這裡。

## 檔案
- `spec.md`：規格書與進度；`script-draft.md`：定稿腳本與 7 篇參考文獻（由 `anim/segments.js` 產生）；`overview-notes.md`：出片前總覽（示意、依院內常規與沒有直接出處的內容）。
- `anim/segments.js`：旁白（＝字幕）、重點、來源、章節、參考文獻；`anim/params.js`：病灶、切除、冰球的大小（示意）與旁白講到的文獻數字；`anim/geo.js`：模型沒有的東西（病灶、切除線、傷口、局麻針、保護片、探頭、冰球、毛囊）的幾何，畫面與檢查共用；`anim/draw.js`：每段畫面；`anim/video.html`：影片頁；`anim/timeline.js`：語音長度產生的時間軸（進 git）。
- `check.js`：數字帳本（含列印單用的鍵）、旁白↔模型檢查、兩個視角的方位（`node check.js --selftest` 會把每項故意改錯一次）；`check-all.js` 會自動跑。
- `print/`：三張列印單（跟刀清單、手術步驟圖、關鍵解剖與數字速查）的資料檔；`print.js` 讀 `anim/segments.js` 的 REFS、`anim/params.js` 與 `check.js` 的 LEDGER。
- `tts/lexicon-extra.json`：英文發音與念之前的文字替換；`ref/`：參考圖（`manifest.json`）與每章總覽（`ref/overview/`）；`publish/`：YouTube 說明欄、章節、字幕、網站條目草稿。

## 和列印單的關係
- 病灶、切除線、探頭、冰球的大小和列印單用同一組參數（`anim/params.js` 的 `WART`）。影片和列印單不同的畫法（都是示意，理由見 `overview-notes.md` 第 4–7 點）：冰球只留在眼瞼裡、局麻針從病灶下方進去、保護片往上多延伸一點、切除線較低的那一端維持在 orbicularis 之上。

## 重做步驟（在 repo 根目錄執行，`V=videos/src/upper-lid-wart-excision-cryo`）
1. 字型與語音模型照 `videos/tools/README.md` 的「準備」；`ln -s ~/.cache/ophtts/vits-melo-tts-zh_en $V/tts/`。
2. 旁白：`node videos/tools/video-kit/tts/export_lines.js $V && python3 videos/tools/video-kit/tts/tts.py $V --check && python3 videos/tools/video-kit/tts/tts.py $V && python3 videos/tools/video-kit/tts/assemble.py $V`
3. 檢查：`node videos/tools/check-all.js $V`；列印單：`node videos/tools/print/print.js $V --gray`；術前速讀包：`node videos/tools/video-kit/brief.js $V`
4. 出片：`videos/tools/video-kit/build.sh $V upper-lid-wart-excision-cryo` → `$V/out/upper-lid-wart-excision-cryo.mp4`
5. 上傳（不公開）：`python3 videos/tools/video-kit/youtube_upload.py $V/out/upper-lid-wart-excision-cryo.mp4 --title "上眼瞼 wart 切除＋cryotherapy：切除送病理、基底冷凍與睫毛毛囊" --desc-file $V/publish/youtube-description.txt`；之後照 repo 根目錄 `CLAUDE.md` 同步網站（`publish/website-entry-draft.txt` 的 `yt` 換成影片 ID）。
