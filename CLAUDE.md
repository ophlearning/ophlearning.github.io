# 給 Claude 的工作規則

## 教學影片（videos/）
- 影片一律以「不公開」（unlisted）上傳 YouTube，不需要再問站長同意。授權只從環境變數讀（YOUTUBE_CLIENT_ID、YOUTUBE_CLIENT_SECRET、YOUTUBE_REFRESH_TOKEN），絕不印出或寫進檔案。
- 上傳成功後，同一個 session 直接同步到網站 https://ophlearning.github.io/videos/ ，不用再問：
  1. 把 `videos/src/<影片>/publish/website-entry-draft.txt` 的 `yt` 換成新的影片 ID，`refs` 從 `script-draft.md` 文末的參考文獻清單展開成 `{c:'…', doi:'…'}`。
  2. 條目加到 `videos/index.html` 的 `VIDEOS` 最前面；章節秒數以 `publish/chapters.txt` 為準，`dur` 用 ffprobe 實測秒數四捨五入。
  3. 用瀏覽器開 `videos/#<id>` 確認沒有 JS 錯誤、影片嵌得進來，再開分支 commit、push、開 draft PR。
- 若 YouTube 回報的 privacy 不是 unlisted，照樣同步網站，但在回覆裡提醒站長到 YouTube Studio 改成「不公開」。
