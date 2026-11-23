# 上眼瞼 wart 切除＋cryotherapy：術前預習（規格書）

2026-11-23 訂（草稿）。手術當天下午，先做三張列印單，影片之後做。

## 目標與觀眾
- 觀眾：跟這台刀的眼科住院醫師。看完要知道：切除與送病理的理由、cryotherapy 怎麼做與怎麼保護眼球、病灶在皮膚面或靠近瞼緣時哪裡不同（睫毛毛囊），以及術後要注意什麼。
- 畫面：右眼、亞洲人、`videos/models/eyelid/` 的 mm 模型（上眼瞼矢狀切面＋正面）；病灶、切除線、冷凍探頭與冰球是示意。本台 OD，和模型同側。

## 病例情境（站長 2026-11-23 確認）
- 確認的摘要（原樣）：「OD 上眼瞼 wart，2 週，位置 [瞼緣／皮膚面]、大小 [ ] mm：切除後送病理 → 基底做 cryotherapy。附加：無。」
- 門診紀錄（站長提供；只摘和手術有關的，年齡、性別、電話、醫師代號不寫）：upper lid mass OD noted for 2 weeks；impression upper lid warts OD；診斷碼為 benign neoplasm of skin of right upper eyelid。位置與大小紀錄沒寫，單子留 [ ]。

## 時程
- 手術 2026-11-23 下午。順序：三張列印單 → 影片（旁白與畫面、`check-all`、術前速讀包、出片）。

## 術式依據與保密
- 主治沒有提供院內範本：切除方式（shave 或 excision）、冷凍次數與時間沒有出處時標「依院內常規」。
- 影片、網站、這份規格書都不寫主治代號與醫院名稱。

## 文獻
- PubMed 查證，全文引用在 `anim/segments.js` 的 REFS；數字與來源在 `check.js` 的 LEDGER。

## 驗收項目
- [ ] 三張列印單 PASS（跟刀清單、手術步驟圖、關鍵解剖與數字速查）：`node videos/tools/print/print.js videos/src/upper-lid-wart-excision-cryo --gray` 最後一行 `all 3 sheet(s) passed`，彩色與灰階全頁看過。
- [ ] 單子與旁白的每個數字在數字帳本有來源（文獻、院內常規、示意、結構、病例）。
- [ ] 每一步同時顯示機轉切面與術者視角，方位寫明。
- [ ] 不出現病人識別資料、主治代號與醫院名稱（commit 前 grep）。
- [ ] 影片：`check-all` 全部通過 → 術前速讀包 → 出片 → 不公開上傳 → 網站同步。

## 進度
- 2026-11-23 11:00　病例摘要確認；三張列印單由小助手做，主對話檢查。
