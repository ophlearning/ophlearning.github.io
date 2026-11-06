# 下眼瞼 entropion 復發的 revision 教學影片：原始檔

三部組合刀影片的第二部（OD 下眼瞼 marginal rotation 一年後復發）。用共用影片套件（`videos/tools/video-kit/`，說明在 `videos/tools/README.md`）做；網站頁面不會連到這裡。依院內範本的「marginal rotation＋lateral tarsal strip」版本與文獻，不等 OP note。

## 檔案
- `spec.md`：規格書與進度；`script-draft.md`：定稿腳本與 16 篇參考文獻（由 `anim/segments.js` 產生）；`overview-notes.md`：出片前總覽（示意、範本的解讀與沒有直接出處的內容）。
- `anim/segments.js`：旁白（＝字幕）、重點、來源、章節、參考文獻；`anim/draw.js`：每段畫面；`anim/params.js`：手術參數與下眼瞼的累積狀態（`LLP`、`LS`；範本值與示意值，刀後依 OP note 改這裡）；`anim/views-lower.js`：下眼瞼的視角包裝（`VL.lsag`、`VL.lcor`、`VL.axial`，和套件的 `VIEWS.sag`／`VIEWS.cor` 同樣的回傳格式；放在這支影片裡，`kit.js` 不動）；`anim/video.html`：影片頁；`anim/timeline.js`：語音長度產生的時間軸（進 git）。
- `check.js`：數字帳本與旁白↔模型檢查（`node check.js --selftest` 會把每項故意改錯一次）；`check-all.js` 會自動跑。
- `tts/lexicon-extra.json`：這支影片的英文發音與念之前的文字替換；`ref/`：參考圖（`manifest.json`）與出片前總覽（`ref/overview/`）；`publish/`：YouTube 說明欄、章節、字幕、網站條目草稿。

## 視角
- 下眼瞼的步驟：左邊下眼瞼矢狀切面（瞳孔中央；左＝前、上＝上），右邊正面（檢查者面對病人：左＝temporal）。
- Lateral tarsal strip：左邊外眥高度的水平切面（從下往上看，同 axial CT：上＝前、左＝temporal），右邊正面外眥特寫；兩圖用同一個 x 視窗，外眥、外側眶緣、Whitnall 結節、瞼板條末端與固定點在兩圖同一個 x。4-2 往外拉緊瞼板條時，水平切面用 `CANTHUS` 的 `stripFix`（< 1）把瞼板條拉到正面圖瞼板條末端的 x，並拿掉還沒縫的縫線（`draw.js` 的 `axialStrip`）。

## 重做步驟（在 repo 根目錄執行，`V=videos/src/lower-lid-entropion-revision`）
1. 字型與語音模型照 `videos/tools/README.md` 的「準備」；`ln -s ~/.cache/ophtts/vits-melo-tts-zh_en $V/tts/`。
2. 旁白：`node videos/tools/video-kit/tts/export_lines.js $V && python3 videos/tools/video-kit/tts/tts.py $V --check && python3 videos/tools/video-kit/tts/tts.py $V && python3 videos/tools/video-kit/tts/assemble.py $V`
3. 檢查：`node videos/tools/check-all.js $V`
4. 出片：`videos/tools/video-kit/build.sh $V lower-lid-entropion-revision`（4 核心約 25–30 分鐘）→ `$V/out/lower-lid-entropion-revision.mp4`
5. 上傳（不公開）：`python3 videos/tools/video-kit/youtube_upload.py $V/out/lower-lid-entropion-revision.mp4 --title "下眼瞼 entropion 復發的 revision 教學" --desc-file $V/publish/youtube-description.txt`；之後照 repo 根目錄 `CLAUDE.md` 同步網站（`publish/website-entry-draft.txt` 的 `yt` 換成影片 ID）。
