# Orbital compartment syndrome 的 lateral canthotomy＋cantholysis 教學影片：原始檔

值班前預習用的急診床邊處置（沒有手術日期）。用共用影片套件（`videos/tools/video-kit/`，說明在 `videos/tools/README.md`）做；網站頁面不會連到這裡。解剖畫面用眼窩模型（`videos/models/orbit/`，沿用眼瞼模型的眼球與外眥）。

## 檔案
- `spec.md`：規格書與進度；`overview-notes.md`：出片前總覽（示意與沒有直接出處的內容）。
- `anim/segments.js`：旁白（＝字幕）、重點、來源、章節、參考文獻；`anim/draw.js`：每段畫面；`anim/views-orbit.js`：眼窩模型的視角包裝（`VO.ax`、`VO.fr`，和套件的 `VIEWS.sag` 同樣的回傳格式；`kit.js` 不動）；`anim/video.html`：影片頁；`anim/timeline.js`：語音長度產生的時間軸（進 git）。
- `check.js`：數字帳本與旁白↔模型檢查（`node check.js --selftest` 會把每項故意改錯一次）；`check-all.js` 會自動跑。
- `tts/lexicon-extra.json`：英文發音與念之前的文字替換；`ref/`：參考圖（`manifest.json`）與總覽（`ref/overview/`）；`publish/`：YouTube 說明欄、章節、字幕、網站條目草稿。

## 視角
- 左：眼窩水平切面，從下往上看（同 axial CT：上＝前、左＝temporal）；全景或外眥放大。
- 右：右眼外眥正面（術者面對病人：左＝temporal）；剪韌帶的段落開窗（拿掉皮膚與眼輪匝肌），看到上支、下支與 Whitnall 結節。兩圖共用 x。

## 重做步驟（在 repo 根目錄執行，`V=videos/src/lateral-canthotomy-ocs`）
1. 字型與語音模型照 `videos/tools/README.md` 的「準備」；`ln -s ~/.cache/ophtts/vits-melo-tts-zh_en $V/tts/`。
2. 旁白：`node videos/tools/video-kit/tts/export_lines.js $V && python3 videos/tools/video-kit/tts/tts.py $V --check && python3 videos/tools/video-kit/tts/tts.py $V && python3 videos/tools/video-kit/tts/assemble.py $V`
3. 檢查：`node videos/tools/check-all.js $V`
4. 出片：`videos/tools/video-kit/build.sh $V lateral-canthotomy-ocs` → `$V/out/lateral-canthotomy-ocs.mp4`
5. 上傳（不公開）：`python3 videos/tools/video-kit/youtube_upload.py $V/out/lateral-canthotomy-ocs.mp4 --title "Orbital compartment syndrome 的 lateral canthotomy＋cantholysis" --desc-file $V/publish/youtube-description.txt`；之後照 repo 根目錄 `CLAUDE.md` 同步網站。
