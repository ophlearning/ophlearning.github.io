# OU 上眼瞼 levator resection（2026-11-24 這台刀）

## 病例情境（站長 2026-11-24 確認）
- 站長原話：「OU LMR 手術三張表及影片」；LMR 的意思站長確認為「Levator muscle resection」；手術日期「今天 11/24」（沒有給時間）。
- 一行摘要：**OU 上眼瞼：levator muscle resection**；沒有提到 brow fixation、marginal rotation 或其他附加處置，所以這台的單子不放眉毛固定。
- 主治的術式範本沒有另外提供：單子沿用已上線影片 `levator-resection-brow-fixation` 的院內範本數字（切口 2.5／4／4 mm、切除寬 5 mm、4-0 vicryl ×3、6-0 Prolene ×4、7-0 ethilone、GM 藥膏），照舊標「依院內常規」，刀後依 OP note 確認。

## 這個資料夾
- 目前只有三張列印單（`print/`）。還沒有自己的影片：`print/sources.json` 讓列印工具讀 `levator-resection-brow-fixation` 的帳本與文獻，`print/video.js` 載入那支影片的 `anim/segments.js`、`anim/params.js`，圖的狀態沿用那支影片（拿掉眉毛固定那一步，7 步）。
- 單子頁尾的網址指向已上線的 `videos/#levator-resection-brow-fixation`（levator resection 在第 1–4 章）。

## 驗收
- [x] 三張列印單 PASS（`node videos/tools/print/print.js videos/src/levator-resection-ou --gray`：all 3 sheet(s) passed，2026-11-24）。
- [x] Claude 自檢：彩色與灰階全頁、步驟 6 與速查右圖放大檢查（標籤引線指對、沒有壓字）。

## 進度
- 2026-11-24：三張表已交。影片：待決定要不要另做（見下一步）。
- 下一步：影片的做法（沿用已上線影片，或另做一支不含眉毛固定的版本）。
