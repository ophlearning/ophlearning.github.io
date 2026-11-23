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
- Kersten 1997（臨床看似良性的 692 個眼瞼病灶，13 個［1.9%］是惡性、其中 10 個 BCC → 切下的都送病理）；Custer 2024（瞼緣 nevus 150 個 superficial excision＋cauterization，術後可見 trichiasis）；Sullivan 1976（瞼緣 2 個 freeze–thaw 到 −30 °C 破壞睫毛，治 trichiasis 的做法）；Fraunfelder 1979（色素深的人瞼緣冷凍治 trichiasis 列為禁忌）；Wingfield 1979（冷凍的早期、晚期副作用；眼球受傷見於治療結膜、角膜病灶時）；Elder 1997（上眼瞼睫毛毛囊 1.8 mm、碰到 95% 要 2.4 mm，沿用三合一影片已查證的帳本）。
- Luk 2006（皮膚 common wart 液態氮 10 秒 × 2 個 freeze–thaw）留在 REFS 與帳本，但 2026-11-23 從單子拿掉：非眼瞼的劑量貼在牆上容易被當成眼瞼劑量。
- 沒有出處、標「依院內常規」：保護眼球的方式、局麻藥量、shave 或 excision、冷凍機器與 freeze–thaw 次數時間、止血與縫合。

## 驗收項目
- [x] 三張列印單 PASS（跟刀清單、手術步驟圖、關鍵解剖與數字速查）：`node videos/tools/print/print.js videos/src/upper-lid-wart-excision-cryo --gray` 最後一行 `all 3 sheet(s) passed`，彩色與灰階全頁看過。
- [ ] 單子與旁白的每個數字在數字帳本有來源（文獻、院內常規、示意、結構、病例）。
- [ ] 每一步同時顯示機轉切面與術者視角，方位寫明。
- [ ] 不出現病人識別資料、主治代號與醫院名稱（commit 前 grep）。
- [ ] 影片：`check-all` 全部通過 → 術前速讀包 → 出片 → 不公開上傳 → 網站同步。

## 進度
- 2026-11-23 11:00　病例摘要確認；三張列印單由小助手做，主對話檢查。
- 2026-11-23 11:20　三張列印單（清單 8 項、步驟圖 8 格、速查）`print.js --gray` 全部 PASS；主對話看過彩色全頁，拿掉 Luk 2006 的注意與速查列後重跑 PASS；三頁 PDF（A4 頁面上的 LSs 版）與 PNG 交給站長。病灶、切除線、探頭、冰球、保護片都是示意。
- 下一步：影片（旁白與畫面、`check-all`、術前速讀包、出片）。
