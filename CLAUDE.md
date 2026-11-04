# 給 Claude 的工作規則

## 教學影片（videos/）
- 影片一律以「不公開」（unlisted）上傳 YouTube，不需要再問站長同意。授權只從環境變數讀（YOUTUBE_CLIENT_ID、YOUTUBE_CLIENT_SECRET、YOUTUBE_REFRESH_TOKEN），絕不印出或寫進檔案。
- 上傳成功後，同一個 session 直接同步到網站 https://ophlearning.github.io/videos/ ，不用再問：
  1. 把 `videos/src/<影片>/publish/website-entry-draft.txt` 的 `yt` 換成新的影片 ID，`refs` 從 `script-draft.md` 文末的參考文獻清單展開成 `{c:'…', doi:'…'}`。
  2. 條目加到 `videos/index.html` 的 `VIDEOS` 最前面；章節秒數以 `publish/chapters.txt` 為準，`dur` 用 ffprobe 實測秒數四捨五入。
  3. 用瀏覽器開 `videos/#<id>` 確認沒有 JS 錯誤、影片嵌得進來，再開分支 commit、push、開 draft PR。
- 若 YouTube 回報的 privacy 不是 unlisted，照樣同步網站，但在回覆裡提醒站長到 YouTube Studio 改成「不公開」。
- 畫面的解剖用 `videos/models/` 的共用模型，遵守 `videos/models/README.md` 的「通用原則」（適用所有手術）：以 mm 建模並附出處；族群差異有文獻證實才用亞洲人數值；標籤一律「中文 English」並列；手術步驟同時顯示「機轉切面＋術者視角」兩個同步視角；座標用手術的語言；術者視角寫明方位；旁白的數值寫成檢查。每一類手術的特殊處寫在該模型的模型卡（`CARD.md`）；開始做新類別前，先照 `videos/models/MODEL-CARD-TEMPLATE.md` 寫模型卡，並交一張樣本圖給站長確認，再做影片。
- 接手教學影片的工作前，先讀 `videos/models/README.md`、要用到的模型卡，以及該影片規格書的「進度」。改了模型或畫面，跑 `node videos/tools/check-all.js videos/src/<影片>`，全部通過才 commit；參考圖有變化，先交截圖給站長確認，確認後才更新參考圖。
