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

## 章節（影片，2026-11-23）
片頭 → 1 臨床決策（1-1 內翻的機轉、1-2 為什麼這台要水平縮短、1-3 Bick 和 lateral tarsal strip）→ 2 術前評估（distraction、snap-back）→ 3 手術步驟（3-1 局麻與畫線、3-2 canthotomy＋inferior cantholysis、3-3 往外拉決定切多少、3-4 全層楔形切除、3-5 瞼板斷端縫到外側眶緣骨膜、3-6 重建外眥角與縫合）→ 4 術中狀況與收尾 → 5 術後 → 6 跟刀清單 → 參考文獻。手術步驟用外眥水平切面＋正面外眥（同 x），機轉與收尾用矢狀切面＋正面。片長見「進度」。

## 文獻
- PubMed 查證，全文引用在 `anim/segments.js` 的 REFS（13 篇）；數字與來源在 `check.js` 的 LEDGER（列印單的鍵 `'1'`、`'8'`、`'Gioia'` … `'院內'` 保留，影片段落另加）。
- 步驟：Hurwitz 1987（Bick 的改良：外眥處全層縮短、瞼緣不留 notch，成敗取決於瞼板直接縫到外側眶緣骨膜；只讀到摘要）、Tao 2025（外眥附近全層三角形切除、切除量依 laxity、斷端對齊；Bick 的缺點是外眥角變圓、往內移；讀全文）、Rubino 2024（先全層剪開、往外拉判斷切多少；有的改良保留外眥韌帶不切外眥；研究對象是 ectropion，讀全文）、Anderson 1979（影片新增：LTS 的做法——canthotomy、切斷韌帶下支、分前後層、瞼板條縫到外側眶壁骨膜；PubMed 摘要）。Bick 1966 只列為原始出處（PubMed 沒有摘要），單子與影片都沒有內容來自它。
- 結果：Vahdani 2018（641 次、非隨機：Bick 84 次解剖成功 100%、再手術 0；LTS 89.1%、9%）、Poon 2019（內翻：Bick 治癒 100%、LTS 92%／90%）、Barrett 2012（quick strip 225 個眼瞼、內翻 54、完全矯正 92.4%、沒有外眥角變圓）、Prendes 2020（modified Bick＋眼輪匝肌與脂肪切除 70 個眼瞼、平均追蹤 46.9 個月、復發 1.4%）、Auguste 2023（只做水平縮短復發 7%）。
- 機轉、評估與解剖：Pushker 2025（機轉：retractors 鬆脫為主、orbicularis 張力與上跨、整片眼瞼與外眥韌帶鬆弛；distraction > 6–8 mm、snap-back；horizontal laxity 明顯要水平縮短）、Beigi 2008（80 位單側內翻，distraction 7.5–11 mm）、Gioia 1987（Whitnall 結節在眶緣後 1.5 mm）。
- 依院內常規：局麻、外眥切開線與楔形位置、canthotomy＋inferior cantholysis 的做法（文獻不一，做不做依院內常規）、楔形寬度、固定的縫線與針數、外眥角與皮膚的縫法、不滿意時的調整、拆線與用藥、角膜追蹤。
- 待刀後確認：斷端固定到外側眶緣骨膜（Hurwitz 1987）還是外眥韌帶殘端。

## 驗收項目
- [x] 三張列印單 PASS（跟刀清單、手術步驟圖、關鍵解剖與數字速查）：`node videos/tools/print/print.js videos/src/lower-lid-modified-bick --gray` 最後一行 `all 3 sheet(s) passed`，彩色與灰階全頁看過。
- [x] 單子與旁白的每個數字在數字帳本有來源（文獻、院內常規、示意、結構、病例）：`check.js` 的 LEDGER 全部 PASS，`--selftest` 21 個改法全部抓到；列印單 `print.js --gray` 仍然 `all 3 sheet(s) passed`。
- [x] 每一步同時顯示機轉切面與術者視角，方位寫明：第 3 章每段左邊外眥水平切面（從下往上看，上＝前、左＝temporal）、右邊正面外眥（術者視角），兩圖同 x；每個右眼面板標「本台 OS 左右相反」（`check.js` M10）。
- [x] 不出現病人識別資料、主治代號與醫院名稱：2026-11-23 grep 這支影片的檔案（醫院名、年齡、性別、電話）沒有命中；片尾「製作　張博淳」。commit 前主對話再 grep 一次。
- [ ] 影片：`check-all` 全部通過 → 術前速讀包 → 出片 → 不公開上傳 → 網站同步。（前兩步已完成：`check-all` 全部 PASS、速讀包在 `out/brief/`；出片、上傳、網站同步未做）

## 進度
- 2026-11-23 11:00　病例摘要確認；三張列印單由小助手做，主對話檢查。
- 2026-11-23 11:07　三張列印單（清單 8 項、步驟圖 8 格［外眥水平切面＋正面，第 8 步矢狀切面］、速查）`print.js --gray` 全部 PASS；主對話看過彩色全頁；補上 `.gitignore`（`out/`）。三頁 PDF（A4 頁面上的 LSs 版）與 PNG 交給站長。模型沒有 Bick 的楔形切除：楔形與切線用疊圖畫（示意），斷端接骨膜借用模型的 `stripFix` 狀態（示意）。
- 2026-11-23 11:41　影片做到可以出片（小助手）：`anim/segments.js`（14 段＋章節卡，旁白 57 句）、`anim/draw.js`、`anim/params.js`、`anim/video.html`、`anim/views-lower.js`（從 revision 影片原樣複製）、`check.js`（列印單的帳本鍵保留，加影片段落與 M1–M10、`--selftest` 21 個改法全部抓到）、語音與 `anim/timeline.js`（片長 6:56＝416 秒）、參考圖 15 張（Claude 自檢）、`ref/overview/` 8 張、`overview-notes.md`、`publish/`（`yt: 'TBD'`；`dur` 先用時間軸秒數，出片後以 ffprobe 實測為準）、`script-draft.md`、`README.md`。`node videos/tools/check-all.js videos/src/lower-lid-modified-bick` 全部 PASS；`print.js --gray` 仍然 `all 3 sheet(s) passed`；術前速讀包 `out/brief/`（`旁白.md`＋14 張圖）。新增文獻 Anderson 1979（PubMed 摘要）。
- `ref/manifest.json` 的 `textBase` 暫時指向一個不在任何分支上的 commit 物件（小助手不能 commit；只寫入物件，沒動 index 與分支）：主對話 commit 後改成那個 commit 並重跑 `check-all`。
- 下一步：主對話 commit → 速讀包交站長 → 出片（`build.sh`）→ 不公開上傳 → 網站同步。
