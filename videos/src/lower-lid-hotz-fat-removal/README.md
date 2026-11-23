# 下眼瞼 Hotz＋去眼袋（OS，recurrent involutional entropion＋lid bag）術前預習影片：原始檔

影片 id `lower-lid-hotz-fat-removal`。2026-11-23 手術當天下午的術前預習：先做三張列印單（`print/`），再做影片。用共用影片套件（`videos/tools/video-kit/`，說明在 `videos/tools/README.md`）做；網站頁面不會連到這裡。步驟依院內範本的 Hotz（旁白說「依院內常規」）與 PubMed 查證的文獻，內容和列印單一致，不等 OP note。

## 檔案
- `spec.md`：規格書（病例情境、文獻、驗收項目）與進度；`script-draft.md`：定稿腳本與 9 篇參考文獻（由 `anim/segments.js` 產生）；`overview-notes.md`：出片前總覽（示意、範本的解讀與沒有直接出處的內容）。
- `anim/segments.js`：旁白（＝字幕）、重點、來源、章節、參考文獻（列印單的頁尾與數字檢查也讀這裡的 `REFS`）；`anim/draw.js`：每段畫面（含這支影片自己畫的：開眶隔後三團脂肪的正面範圍 `FAT_WIN`、切除線 `hzEdge`、SPK 的點，都標示意）；`anim/params.js`：手術參數與下眼瞼的累積狀態（`HZP`、`HS`；和列印單 `print/video.js` 同一組狀態，刀後依 OP note 改這裡）；`anim/views-lower.js`：下眼瞼與眼窩的視角包裝（`VL.lsag`、`VL.lcor`、`VO.ax`、`VO.fr`；放在這支影片裡，`kit.js` 不動）；`anim/video.html`：影片頁；`anim/timeline.js`：語音長度產生的時間軸（進 git）。
- `check.js`：數字帳本（`LEDGER`；列印單的速查表用 `case`、`tmpl`、`plt`、`rbh`、`ocs`、`fat`、`dip`、`dry`、`fus` 這幾個鍵）、旁白↔模型檢查與方位檢查；`node check.js --selftest` 會把每項故意改錯一次；`check-all.js` 會自動跑。
- `print/`：三張列印單（跟刀清單、手術步驟圖、關鍵解剖與數字速查）；`tts/lexicon-extra.json`：英文發音與念之前的文字替換；`ref/`：參考圖（`manifest.json`）與出片前總覽（`ref/overview/`，每章一張）；`publish/`：YouTube 說明欄、章節、字幕、網站條目草稿。

## 視角
- 下眼瞼的步驟：左邊下眼瞼矢狀切面（瞳孔中央；左＝前、上＝上），右邊正面（檢查者面對病人：左＝temporal）。每個正面面板的標題寫「右眼 OD 示意（本台 OS 左右相反）」，`check.js` 檢查每段都有。
- 術後球後出血：左邊眼窩水平切面（從下往上看，同 axial CT：上＝前、左＝temporal；用 `videos/models/orbit/`，和 lateral canthotomy 影片同一個模型），右邊正面外眥開窗。

## 重做步驟（在 repo 根目錄執行，`V=videos/src/lower-lid-hotz-fat-removal`）
1. 字型與語音模型照 `videos/tools/README.md` 的「準備」；`ln -s ~/.cache/ophtts/vits-melo-tts-zh_en $V/tts/`。
2. 旁白：`node videos/tools/video-kit/tts/export_lines.js $V && python3 videos/tools/video-kit/tts/tts.py $V --check && python3 videos/tools/video-kit/tts/tts.py $V && python3 videos/tools/video-kit/tts/assemble.py $V`
3. 檢查：`node videos/tools/check-all.js $V`；列印單：`node videos/tools/print/print.js $V --gray`；術前速讀包：`node videos/tools/video-kit/brief.js $V`
4. 出片：`videos/tools/video-kit/build.sh $V lower-lid-hotz-fat-removal` → `$V/out/lower-lid-hotz-fat-removal.mp4`
5. 上傳（不公開）：`python3 videos/tools/video-kit/youtube_upload.py $V/out/lower-lid-hotz-fat-removal.mp4 --title "下眼瞼 Hotz＋去眼袋：術前預習" --desc-file $V/publish/youtube-description.txt`；之後照 repo 根目錄 `CLAUDE.md` 同步網站（`publish/website-entry-draft.txt` 的 `yt` 換成影片 ID）。
