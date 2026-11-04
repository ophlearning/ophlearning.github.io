# Upper lid margin rotation（PLTR）教學影片：原始檔

這個資料夾是影片的原始檔，用來重做影片或修改後重新上傳；網站頁面不會連到這裡。
影片本身放在 YouTube（不公開），網站 videos/index.html 嵌入播放。

## 檔案
- script-draft.md：完整腳本與 22 篇參考文獻（PubMed 已查證）
- anim/engine.js：上眼瞼矢狀切面、正面觀、翻瞼後結膜面的繪圖模型
- anim/segments.js：每段的旁白（＝畫面字幕）、重點框、來源與動畫
- anim/video.html：版面與時間軸（anim/timeline.js 由語音長度產生，不進 git）
- anim/render.js：逐格輸出，可用 --from/--to 分段平行
- tts/export_lines.js：從 segments.js 匯出旁白句子
- tts/tts.py：數字與縮寫轉念法、補充發音表、MeloTTS 合成；tts/assemble.py：排時間軸、旁白音軌、字幕檔、章節表
- build.sh：4 個 worker 平行輸出 → 接起來 → 旁白音量 −16 LUFS → out/upper-lid-margin-rotation-PLTR.mp4
- youtube_upload.py：以「不公開」上傳 YouTube；授權只從環境變數讀（YOUTUBE_CLIENT_ID、YOUTUBE_CLIENT_SECRET、YOUTUBE_REFRESH_TOKEN）
- publish/：YouTube 說明欄文字、章節表、字幕檔、網站影片條目草稿
- redo-spec.md：換成新眼瞼模型（`videos/models/eyelid/`）的重做規格與驗收項目
- anim/video2.html、anim/views.js、anim/draw2.js：重做中的新版面。已換成新模型的段落寫在 draw2.js，其餘段落暫時沿用舊畫法；全部換完後取代 video.html。截圖：`node render.js video2.html <輸出檔名前綴> --stills <秒數>`

## 重做步驟（在這個資料夾執行）
1. 字型：`mkdir -p anim/fonts && cd anim/fonts && npm pack @fontsource/noto-sans-tc@5.1.1 && tar xzf fontsource-noto-sans-tc-5.1.1.tgz && cd ../..`
2. 語音：`pip install sherpa-onnx opencc-python-reimplemented`，再到 tts/ 下載並解壓
   https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/vits-melo-tts-zh_en.tar.bz2
3. 旁白：`node tts/export_lines.js && python3 tts/tts.py --check && python3 tts/tts.py && python3 tts/assemble.py`
4. 出片：`./build.sh`（4 核心約 8 分鐘）
5. 上傳：`python3 youtube_upload.py out/upper-lid-margin-rotation-PLTR.mp4 --title "上眼瞼 margin rotation（PLTR）教學" --desc-file publish/youtube-description.txt`
   上傳後直接同步網站（不用再問）：印出的影片 ID 填進 publish/website-entry-draft.txt 的 yt，再加進 videos/index.html 的 VIDEOS；細節見 repo 根目錄 CLAUDE.md。
   若 YouTube 回報 privacy 不是 unlisted（未通過 Google 稽核的 API 專案會被鎖成私人），要到 YouTube Studio 改成「不公開」。
