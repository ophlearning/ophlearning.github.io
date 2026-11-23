# DALK 失敗後 descemetocele 的 tectonic PK：助手版術前預習（規格書）

2026-11-23 訂（草稿）。眼球前段模型（`videos/models/globe/`）的新類別：穿透性角膜移植（PK）。PK 的共用模組（`globe/pk.js`，選用式 `st.pk`）同時給同日第二台「failed DMEK 後的 PK」（`videos/src/pk-failed-dmek/`）用。沒有真實錄影，兩個視角都用 mm 模型動畫。

## 目標與觀眾
- 觀眾：在這台刀當**助手**的眼科住院醫師（站長本人），之後給其他住院醫師。
- 看完要能做到（每一項都是「上刀時的動作或判斷會不一樣」）：
  1. **說得出為什麼這台要做 PK**：neurotrophic＋HSV 的角膜，兩次 DALK 都失敗（rejection、melting、DM rolling），AMG 也蓋不住，現在 descemetocele；tectonic PK 的目標是讓眼球保持完整，視力是次要。
  2. **知道 open sky 前後哪裡最危險**：descemetocele 很薄、不能壓眼球；眼壓很低、眼球軟，trephine 不好切；有晶體眼，水晶體要保護；open sky 時 suprachoroidal hemorrhage 的徵象。
  3. **知道步驟的順序與理由**：trephine 的大小要涵蓋病灶與舊 graft 交界、先部分深度再剪開、供體從內皮面 punch、四針 cardinal sutures 的順序、補完縫線、重建前房、測 watertight。
  4. **助手自己的動作做對**：保持供體內皮濕潤不碰、0.12 forceps 固定的位置、遞針剪線、記針數、open sky 時不壓眼球不扳開瞼器、看到異狀馬上講。
  5. **術後**：HSV 病史要口服抗病毒藥預防；neurotrophic 角膜上皮難長，可能要 TSCL、AMG 或 tarsorrhaphy；360° NV 加上兩次 graft，rejection 風險高。
- 主刀才做的判斷（trephine 大小、縫法、要不要合併 AMG 或 tarsorrhaphy）只講到看得懂為止，標「依主刀決定」。
- 片長目標 6–9 分鐘（時間壓力下先求正確、精簡）。

## 病例情境（站長 2026-11-23 確認）
- 站長 2026-11-23 確認：兩台都是當天的 PK，順序「先B再A」（這台是 B）。
- 站長確認的摘要（去識別版：原摘要的檢查數值與病程日期因 repo 公開而省略，原文只留在對話裡）：「OS tectonic PK：neurotrophic keratopathy 加 HSV 病史，DALK 兩次失敗後出現 descemetocele，做過兩次 AMG；phakic；眼壓很低；受體與供體大小、縫法、要不要合併 AMG 或 tarsorrhaphy 都等刀後確認；站長當助手」。
- 影片用到的病程只有：neurotrophic＋HSV 的角膜 → 兩次 DALK 失敗（rejection、melting、DM rolling）→ AMG 補不住 → descemetocele；周邊有 NV；有晶體眼；眼壓很低。
- **隱私**：網站 repo 是公開的。影片、網站、這份規格書都不寫病人姓名、病歷號、生日、年齡、性別、院內人員、主治代號與醫院名稱，也不寫病程日期、檢查數值與其他病史。
- 站長沒有指定、病歷也沒寫的：受體與供體 trephine 大小、縫法（interrupted／running）、針數、有沒有合併 AMG／tarsorrhaphy／縮瞳、麻醉方式。畫面標「示意」，旁白說「依主刀決定」，標「待刀後補」。

## 時程
- 這部在刀前做不完；刀前已在對話中交純文字術前速讀（兩台共用，附出處）。
- 之後照流程：模型＋文獻（小助手並行）→ 旁白與畫面 → `check-all` → 術前速讀包（`brief.js`）→ 三張列印單 → 出片 → 上傳（不公開）→ 網站。然後做 A 台（`pk-failed-dmek`）。

## 章節（暫定；數值與做法等文獻查證後定稿）
| 章 | 內容 | 助手的重點 |
|---|---|---|
| 片頭 | 左眼 tectonic PK；助手版；細節以主刀為準 | — |
| 1 為什麼是 PK | 病程地圖：neurotrophic＋HSV → DALK×2 失敗 → AMG → descemetocele；tectonic 的目標；為什麼這時要全層 | 先記住：這顆眼睛很脆、很軟、有晶體 |
| 2 下刀前的危險 | descemetocele 不能壓；軟眼；有晶體眼要保護；麻醉；suprachoroidal hemorrhage 的危險因子與徵象 | 開瞼器、量角膜時手不壓眼球 |
| 3 Trephination 與取下病變角膜 | trephine 大小涵蓋病灶與舊 graft 交界（依主刀）；部分深度 → 進前房 → 剪刀剪完；open sky | open sky 時不壓、不扳、注意紅光與虹膜 |
| 4 供體與四針 cardinal sutures | 供體從內皮面 punch、oversize（依主刀）；12 → 6 → 3 → 9 | 內皮濕潤不碰；0.12 forceps 固定在主刀下針的對側 |
| 5 補完縫線、重建前房、watertight | interrupted／running（依主刀）；埋結；BSS 重建前房；Seidel 測漏 | 遞針、剪線、記針數；乾 Weck-cel 測漏 |
| 6 收尾與術後 | 結膜下注射與包眼（院內常規）；口服 acyclovir 預防 HSV；neurotrophic 的上皮保護；rejection 高風險 | 病理檢體 |
| 7 會出錯的地方 | suprachoroidal hemorrhage、水晶體受傷、虹膜脫出、傷口漏、上皮缺損與 melting、rejection、HSV 復發 | 看到就講 |

## 畫面
- 兩個同步視角：經 12–6 點子午切面（機轉）＋手術顯微鏡俯視（術者視角）。左眼 OS，術者坐 12 點：術者視角下＝12 點、左＝3 點 temporal（同 SB removal 的 OS 方位），寫成檢查。
- PK 共用模組（`globe/pk.js`）：descemetocele（局部變薄、前凸）、舊 DALK graft 與交界、周邊 NV、trephine 部分深度與全層、open sky、供體、cardinal 與 interrupted 縫線、前房重建、watertight；前段模型卡（`globe/CARD.md`）加 PK 一節、樣本 `globe/sample-pk.html` 自檢。

## 文獻
- 細節、PMID、讀摘要或全文的範圍見 `lit-notes.md`（小助手查）。沒有出處的說「依主刀」或標「示意」。

## 沒問但 Claude 自己決定的事（交總覽時一起列）
- 兩台各做一部：B 台（這部）是 tectonic，A 台是 failed DMEK 後的 PK；PK 的步驟動畫共用 `globe/pk.js`，A 台只重做病例情境、前房處理（hyphema、沾黏、LI、IOL）與術後不同的段落。
- 助手版（站長兩台都當助手，依刀前確認的摘要）。
- 術者坐 12 點（PK 常規；本台實際坐位待刀後補）。
- 縫法示範 interrupted（針數依文獻，旁白說「依主刀」）；running 只在一句旁白提到。
- 麻醉、消毒、點藥包眼各一句旁白，不做動畫。

## 驗收項目
1. 眼別（OS）、術者方位（坐 12 點、temporal 在左）在旁白、畫面、模型一致：模型 `check.js` 檢查。
2. 同一個結構（trephine 邊緣、cardinal sutures 的鐘點、descemetocele 的位置）在兩個視角落在同一個鐘點與位置，寫成檢查。
3. PK 的幾何寫成檢查：trephine 全層後切面上角膜連續性中斷、供體直徑 ≥ 受體直徑、縫線兩端跨過交界且在角膜內、cardinal 順序 12 → 6 → 3 → 9、open sky 時前房沒有角膜覆蓋。
4. 旁白每個數字在數字帳本都有出處；`node videos/tools/check-all.js videos/src/pk-tectonic-descemetocele` 全部 PASS。
5. 不出現病人識別資料、院內人員、主治代號與醫院名稱（commit 前 grep 檢查）。
6. 三張列印單 PASS（跟刀清單、手術步驟圖、關鍵解剖與數字速查）：`node videos/tools/print/print.js videos/src/pk-tectonic-descemetocele --gray` 全部 PASS。

## 進度
- 2026-11-23　規格書草稿；刀前在對話中交純文字術前速讀（兩台共用）。模型（`globe/pk.js`）與文獻（`lit-notes.md`）交給兩個小助手並行。
