# 下眼瞼 modified Bick 術前預習影片：原始檔

2026-11-23 下午 OS 下眼瞼 involutional entropion（horizontal laxity、trichiasis）的 modified Bick，附加：無。先做三張列印單，再做影片；影片和列印單是同一份查證過的內容。用共用影片套件（`videos/tools/video-kit/`，說明在 `videos/tools/README.md`）做；網站頁面不會連到這裡。主治沒有提供院內範本：步驟以文獻為準，文獻不一致或不知道這台怎麼做的地方說「依院內常規」。

## 檔案
- `spec.md`：規格書與進度；`script-draft.md`：定稿腳本與 13 篇參考文獻（由 `anim/segments.js` 產生）；`overview-notes.md`：出片前總覽（示意、依院內常規與沒有直接出處的內容）。
- `anim/segments.js`：旁白（＝字幕）、重點、來源、章節、參考文獻；`anim/draw.js`：每段畫面（含模型沒有的楔形與全層切線、正面的固定縫線）；`anim/params.js`：楔形的位置與寬度（示意，和列印單相同）、文獻數值、模型狀態；`anim/views-lower.js`：下眼瞼的視角包裝（從 `lower-lid-entropion-revision` 原樣複製）；`anim/video.html`：影片頁；`anim/timeline.js`：語音長度產生的時間軸（進 git）。
- `check.js`：數字帳本（列印單的速查表也讀它：`'1'`、`'8'`、`'Gioia'` … `'院內'` 是列印單的鍵，不是影片段落）與旁白↔模型檢查 M1–M10（`node check.js --selftest` 會把每項故意改錯一次）；`check-all.js` 會自動跑。
- `print/`：三張列印單的資料檔（`node videos/tools/print/print.js videos/src/lower-lid-modified-bick --gray`）。
- `tts/lexicon-extra.json`：英文發音；`ref/`：參考圖（`manifest.json`）與每章總覽（`ref/overview/`）；`publish/`：YouTube 說明欄、章節、字幕、網站條目草稿。

## 視角
- 手術步驟（第 3 章）：左邊外眥高度的水平切面（從下往上看，同 axial CT：上＝前、左＝temporal），右邊正面外眥（術者面對病人：左＝temporal）；兩圖用同一個 x 視窗（`AXC`、`CANTH`），外眥、外側眶緣、楔形的兩邊與固定點在兩圖同一個 x（`check.js` M7、M9）。
- 機轉與收尾：下眼瞼矢狀切面（左＝前、上＝上）＋正面。
- 畫面是右眼 OD；本台 OS，每個面板標題寫「本台 OS 左右相反」（M10）。
- 模型沒有 Bick 的楔形：正面三角形與水平切面的兩條全層切線由 `params.js` 的 `WEDGE` 畫（示意）；瞼板斷端接到骨膜借用模型的 `stripFix`（示意），和列印單一樣。

## 重做步驟（在 repo 根目錄執行，`V=videos/src/lower-lid-modified-bick`）
1. 字型與語音模型照 `videos/tools/README.md` 的「準備」；`ln -s ~/.cache/ophtts/vits-melo-tts-zh_en $V/tts/`。
2. 旁白：`node videos/tools/video-kit/tts/export_lines.js $V && python3 videos/tools/video-kit/tts/tts.py $V --check && python3 videos/tools/video-kit/tts/tts.py $V && python3 videos/tools/video-kit/tts/assemble.py $V`
3. 檢查：`node videos/tools/check-all.js $V`；術前速讀包：`node videos/tools/video-kit/brief.js $V`；列印單：`node videos/tools/print/print.js $V --gray`
4. 出片：`videos/tools/video-kit/build.sh $V lower-lid-modified-bick` → `$V/out/lower-lid-modified-bick.mp4`
5. 上傳（不公開）：`python3 videos/tools/video-kit/youtube_upload.py $V/out/lower-lid-modified-bick.mp4 --title "下眼瞼 modified Bick 術前預習" --desc-file $V/publish/youtube-description.txt`；之後照 repo 根目錄 `CLAUDE.md` 同步網站（`publish/website-entry-draft.txt` 的 `yt` 換成影片 ID）。
