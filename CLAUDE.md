# 給 Claude 的工作規則

## 教學影片（videos/）
- 站長（網站主人，也就是使用者）只訂目標與驗收結果：手術影片要讓眼科住院醫師簡單且正確地學習。過程（模型、畫面、工具、檢查）由 Claude 依專業規劃，不拿過程問站長。回覆時直接稱呼使用者，不用「站長」這個詞。
- 手術影片有時間壓力（2026-11-06 站長同意的做法）：
  1. 開工前只問站長一件事：這台刀的日期與時間（沒有手術日期就不問）。排程從手術時間倒推；同時有好幾部時，手術最早的那部先做完，不要為了一次做完而讓它等。
  2. 有手術日期時，旁白與畫面一通過 `check-all`，就先跑 `node videos/tools/video-kit/brief.js videos/src/<影片>`，把術前速讀包（`旁白.md`＋每段一張圖）傳給站長，再出 mp4。速讀包和影片是同一份檢查過的內容，不因為趕而少檢查。
  3. 出片一次只跑一部（`build.sh` 有鎖，兩部搶 4 核各慢一倍）。出片加速只用不改畫面的方法（沿用不變的格子、分段平衡），不降 fps 或解析度；改出片工具時跑 `check-all` 和幾段 `render.js --verify`，證明畫面相同到肉眼分不出（任何像素差都不超過 8/255，只容許極少數單一像素）。
- 列印用的一頁式圖（跟刀清單、手術步驟圖、關鍵解剖與數字速查；工具與規則見 `videos/tools/print/README.md`）：一律照院內的兩孔影印紙「LSs」**210 × 270 mm 橫式**設計（`print.js` 的預設 `--paper lss`），上緣兩個預打孔的周圍不放東西；A4 或 Letter 只在站長要求時另外出。傳給站長的是 PDF（列印時選實際大小／100%）與 PNG。
- 影片一律以「不公開」（unlisted）上傳 YouTube，不需要再問站長同意。授權只從環境變數讀（YOUTUBE_CLIENT_ID、YOUTUBE_CLIENT_SECRET、YOUTUBE_REFRESH_TOKEN），絕不印出或寫進檔案。
- 上傳成功後，同一個 session 直接同步到網站 https://ophlearning.github.io/videos/ ，不用再問：
  1. 把 `videos/src/<影片>/publish/website-entry-draft.txt` 的 `yt` 換成新的影片 ID，`refs` 從 `script-draft.md` 文末的參考文獻清單展開成 `{c:'…', doi:'…'}`。
  2. 條目加到 `videos/index.html` 的 `VIDEOS` 最前面；章節秒數以 `publish/chapters.txt` 為準，`dur` 用 ffprobe 實測秒數四捨五入。
  3. 用瀏覽器開 `videos/#<id>` 確認沒有 JS 錯誤、影片嵌得進來，再開分支 commit、push、開 draft PR。
- 若 YouTube 回報的 privacy 不是 unlisted，照樣同步網站，但在回覆裡提醒站長到 YouTube Studio 改成「不公開」。
- 畫面的解剖用 `videos/models/` 的共用模型，遵守 `videos/models/README.md` 的「通用原則」（適用所有手術）：以 mm 建模並附出處；族群差異有文獻證實才用亞洲人數值；標籤一律「中文 English」並列；手術步驟同時顯示「機轉切面＋術者視角」兩個同步視角；座標用手術的語言；術者視角寫明方位；旁白的數值寫成檢查。每一類手術的特殊處寫在該模型的模型卡（`CARD.md`）；開始做新類別前，先照 `videos/models/MODEL-CARD-TEMPLATE.md` 寫模型卡、做樣本圖並自己放大檢查，再做影片。
- 接手教學影片的工作前，先讀 `videos/models/README.md`、要用到的模型卡，以及該影片規格書的「進度」。改了模型或畫面，跑 `node videos/tools/check-all.js videos/src/<影片>`，全部通過才 commit；畫面問題自己放大檢查、修好，參考圖註記「Claude 自檢」。過程中不問站長（唯一例外是開工前問手術時間）；交給站長看的是出片前的總覽（每章一張），有手術日期時再加上先交的術前速讀包。新類別的模型樣本圖自己放大檢查；沒有出處的醫學內容不當成事實講（標「示意」或拿掉），並列在總覽裡。
