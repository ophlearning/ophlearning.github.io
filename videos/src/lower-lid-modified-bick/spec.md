# 下眼瞼 modified Bick：術前預習（規格書）

2026-11-23 訂（草稿）。手術當天下午，先做三張列印單，影片之後做。

## 目標與觀眾
- 觀眾：跟這台刀的眼科住院醫師。看完要知道：這個下眼瞼內翻為什麼要做水平縮短；modified Bick 每一步動到哪一層；切多少怎麼決定；斷端怎麼接回外眥；收尾要看什麼。
- 畫面：右眼、亞洲人、`videos/models/eyelid/` 的 mm 模型（下眼瞼矢狀切面、正面、外眥水平切面）；本台 OS，圖註明左右相反。

## 病例情境（站長 2026-11-23 確認）
- 確認的摘要（原樣）：「OS 下眼瞼 involutional entropion（horizontal laxity、trichiasis）：modified Bick（外眥處全層楔形切除做水平縮短，斷端接回外眥）；附加：無。」
- 門診紀錄（站長提供；只摘和手術有關的，年齡、性別、電話、醫師代號不寫）：OS lower entropion with laxity；角膜 inferior scattered SPK；替代方案 Botox injection；全身 DM（口服藥）、抽菸。

## 時程
- 手術 2026-11-23 下午。順序：三張列印單 → 影片（旁白與畫面、`check-all`、術前速讀包、出片）。

## 術式依據與保密
- 主治沒有提供 modified Bick 的院內範本：步驟以文獻為準；文獻不一致、或不知道這台怎麼做的地方（切除寬度、縫線種類與針數）標「依院內常規」。刀後依 OP note 校正，只在站長給 OP note 時才做。
- 影片、網站、這份規格書都不寫主治代號與醫院名稱。

## 文獻
- PubMed 查證，全文引用在 `anim/segments.js` 的 REFS；數字與來源在 `check.js` 的 LEDGER。

## 驗收項目
- [ ] 三張列印單 PASS（跟刀清單、手術步驟圖、關鍵解剖與數字速查）：`node videos/tools/print/print.js videos/src/lower-lid-modified-bick --gray` 最後一行 `all 3 sheet(s) passed`，彩色與灰階全頁看過。
- [ ] 單子與旁白的每個數字在數字帳本有來源（文獻、院內常規、示意、結構、病例）。
- [ ] 每一步同時顯示機轉切面與術者視角，方位寫明。
- [ ] 不出現病人識別資料、主治代號與醫院名稱（commit 前 grep）。
- [ ] 影片：`check-all` 全部通過 → 術前速讀包 → 出片 → 不公開上傳 → 網站同步。

## 進度
- 2026-11-23 11:00　病例摘要確認；三張列印單由小助手做，主對話檢查。
