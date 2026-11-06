# 第五部：外傷性 marginal eyelid laceration 的治療室一期縫合（規格書）

2026-11-06 訂。和前四部不同：不是跟特定的一台刀，而是值班時在治療室自己縫的準備。

## 目標與觀眾
- 觀眾：值班時第一次要在治療室縫 margin laceration 的眼科住院醫師。看完要能回答：
  - 縫之前要先排除什麼？哪些傷口不能在治療室縫、要轉 OR 或叫 senior？
  - 每一針縫在哪一層、離傷口幾 mm、為什麼是這個順序？
  - Notching（瞼緣癒合後留下的凹口）怎麼來的、怎麼避免？
  - 術後給什麼、幾天拆哪一種線？
- 畫面：右眼、亞洲人單眼皮、`videos/models/eyelid/` 的 mm 模型動畫，不用手術錄影。
- 定位：值班前的預習。沒有特定病人與手術日期，所以不做術前速讀包；照一般流程，出片前交總覽。

## 病例情境（站長 2026-11-06 確認）
- 不是特定病人，是值班治療室最典型的情況。站長選「兩個都做」：以上眼瞼為主，最後一章講下眼瞼哪裡不同。
- 確認的摘要（原樣）：「成人外傷、局麻、治療室；OD 上眼瞼 central full-thickness margin laceration，未傷及 canaliculus、levator，無組織缺損：術前評估（排除 open globe、probe canaliculus、局麻前記錄 levator function）→ 消毒、局麻、沖洗清創 → margin 第一針 6-0 silk vertical mattress 對齊 gray line，先不打結 → tarsus 打 2–3 針 partial-thickness Vicryl → margin 打結並外翻 → lash line 第二針 → orbicularis、skin → silk 線尾綁進皮膚縫線；附加：何時轉 OR（只講判斷）」
- 下眼瞼那一章：tarsus 縫 1–2 針、沒有 levator 評估、punctum 內側的探查講多一點。
- 眼別 OD 只是示範用。
- 摘要裡的縫線種類、粗細、針數是 Claude 提的常見做法，站長確認的是範圍與順序；旁白用到的每個數字仍要有出處，查不到的寫「各院做法不同」或標示意。

## 術式依據
- 這部沒有主治範本；步驟依文獻與教科書。站長之後若提供院內治療室的 SOP 或主治習慣，以那份為準並改參數。
- 不講 canalicular repair、levator repair、組織缺損重建、canthal tendon 修補的做法，只講「看到什麼就轉 OR」。

## 章節大綱（草稿）
| 章 | 內容 | 主要出處 |
|---|---|---|
| 片頭 | 值班時遇到 margin laceration | — |
| 1 先排除什麼 | 1-1 open globe 的徵象，懷疑時不量 IOP、不壓眼；1-2 穿入傷與異物：什麼機轉要排 CT | Anant 2025；其餘 [待查證] |
| 2 能不能在治療室縫 | 2-1 punctum 內側要 probe／irrigation，canalicular laceration 轉 OR；2-2 看到 orbital fat、levator 受傷、組織缺損、canthal tendon avulsion、小孩：轉 OR；2-3 等多久還可以修 | Savar 2008；Huang 2022；Chu 2017；Wu 2010；Truong 2025；其餘 [待查證] |
| 3 術前準備 | 局麻前記錄 ptosis 與 levator function、拍照、器械與縫線、消毒、局麻 | [待查證] |
| 4 縫合步驟（上眼瞼） | 4-1 沖洗與少量清創；4-2 margin 第一針 vertical mattress，先不打結、檢查對齊；4-3 tarsus partial-thickness；4-4 margin 打結並外翻；4-5 lash line 第二針；4-6 orbicularis 與皮膚；4-7 線尾綁進皮膚縫線 | [待查證] |
| 5 常見錯誤 | notching 的三個原因、tarsal suture 穿到結膜刮傷角膜、漏查 canaliculus 造成 epiphora | Huang 2022；其餘 [待查證] |
| 6 下眼瞼哪裡不同 | 瞼板只有約 4 mm 高（1–2 針）、沒有 levator 評估、canalicular 受傷較常見 | Lim 2004（模型卡已有）；Savar 2008；Huang 2022 |
| 7 術後 | 藥膏、冰敷、咬傷的抗生素與 tetanus、拆線天數、回診 | [待查證] |
| 8 值班清單 | 一頁看完的步驟與轉 OR 條件 | 前面各章 |
| 參考文獻 | — | — |

## 兩個同步視角（寫進模型卡時定案）
- 縫 margin 的段落（4-2、4-4、4-5）：
  - 機轉切面：**瞼緣俯視**（新視角，從上方看上瞼緣的表面）。由前到後排出皮膚、睫毛線、gray line、meibomian 開口、MCJ、結膜，兩側傷口邊緣對不齊時看得到錯位。左右方向和正面圖共用 x，前後方向和矢狀切面共用（瞼緣上各結構的深度沿用 `lid.js` 的 `U_MCJ`、`U_ORIF`、`U_GREY`、`U_SKIN`）。
  - 術者視角：正面皮膚面，畫出垂直的全層裂傷與兩邊分開的缺口（新狀態）。
- 縫 tarsus 的段落（4-3）：
  - 機轉切面：經傷口的矢狀切面。傷口在中央、垂直於瞼緣，所以傷口的切面本身就是矢狀面；在這個面上畫每一針咬在哪個高度、不穿到結膜。用現有的 `LID.draw`。
  - 術者視角：正面開窗到瞼板層（現有的 `CORONAL.strip`），看得到每一針的高度。
- 皮膚與線尾（4-6、4-7）：矢狀切面＋正面。
- 下眼瞼那一章：同樣的視角，換成 `lower.js`、`lower-coronal.js`。
- 術者在治療室坐在病人頭側：瞼緣俯視和術者實際看到的方向接近，面板標題要寫明「從上方看」與哪邊是 nasal。

## 模型要補的部分（先寫進 `videos/models/eyelid/CARD.md`，數值逐項找出處）
- 選用式加進去（新檔加上只有給參數才執行的接點），舊影片的畫面逐字不變，和下眼瞼的做法相同。
- 新狀態：
  - 裂傷：中央、垂直、全層，從瞼緣往上延伸的長度與兩邊分開的寬度（示意，旁白不講數字就不需要出處）。
  - 錯位：兩側 gray line 對不齊（教「第一針要對準」用）。
  - Margin vertical mattress：進出針離傷口邊緣的距離與深度、先不打結、打結後瞼緣外翻。
  - Tarsal sutures：部分厚度，上眼瞼 2–3 針、下眼瞼 1–2 針，咬的高度。
  - Lash line 第二針、orbicularis、皮膚縫線、silk 線尾綁進皮膚縫線。
  - 錯誤示範：tarsal suture 穿到結膜面、打平沒外翻後癒合成 notching（示意）。
- 新視角：瞼緣俯視（新檔，例如 `margin.js`），向 `views.js` 報到。
- 淚道：現有模型沒有。第 2 章的 punctum 位置先查出處；查不到就只畫正面的示意點並標「示意」，不做 canaliculus 的立體模型。
- 檢查（`check.js`）：進出針離傷口的距離與深度等於旁白的數字；tarsal suture 離結膜面與前表面都 ≥ 0.3 mm；兩個視角同一針的 x 與高度差 < 0.3 mm；打結後兩側 gray line 對齊、瞼緣外翻；線尾的方向離開角膜；所有新狀態沒有 NaN／undefined；舊畫面逐字不變。

## 文獻（PubMed 已查證，2026-11-06；技術細節的出處還在查）
1. Savar A, Kirszrot J, Rubin PA. Canalicular involvement in dog bite related eyelid lacerations. Ophthalmic Plast Reconstr Surg 2008;24(4):296-8. doi:10.1097/IOP.0b013e318177e21f — 狗咬傷的眼瞼裂傷 66% 傷到 canaliculus，對照組 37%；狗咬傷組 73% 只傷到下 canaliculus。
2. Huang J, et al. Pediatric Eyelid and Canalicular Lacerations: Epidemiology and Outcomes. J Pediatr Ophthalmol Strabismus 2023;60(1):33-38（2022 年先上線，本片稱 Huang 2022）. doi:10.3928/01913913-20220321-02 — 165 位兒童：margin 受傷 65%、canaliculus 47%；canalicular 受傷的危險因子是鉤子造成的傷、margin 受傷、下眼瞼；術後併發症 24%（ptosis 5%、stent 提早掉出 5%、margin notching 4%），和延後修補、抗生素、傷口分級無關。
3. Chu YC, et al. Early Versus Late Canalicular Laceration Repair Outcomes. Am J Ophthalmol 2017;182:155-159. doi:10.1016/j.ajo.2017.08.006 — 334 位：48 小時內修補失敗 7.6%、超過 48 小時 9.1%（P = .732）；延後的主因是腦傷與其他骨折。
4. Wu SY, et al. Analysis of bicanalicular nasal intubation in the repair of canalicular lacerations. Jpn J Ophthalmol 2010;54(1):24-31. doi:10.1007/s10384-009-0755-7 — 98 位：修補時機和通暢率無關；作者認為有經驗的團隊可以延到 11 天內；stent 留超過 90 天的通暢率較好。
5. Raj A, et al. Canalicular lacerations in a tertiary eye hospital: our experience with monocanalicular stents. Rom J Ophthalmol 2020;64(2):146-152. PMC7339683 — 30 位：超過 24 小時才修與狗咬傷的結果較差（和 Chu 2017 不一致，旁白要講「研究結果不一致」）。
6. Truong PN, et al. Characterization, Epidemiology, and Outcomes of Periocular Dog Bites in Children. Ophthalmic Plast Reconstr Surg 2026;42(2):189-195（2025 年先上線，本片稱 Truong 2025）. doi:10.1097/IOP.0000000000003048 — 150 位兒童：canalicular 受傷 25.3%、感染 10%；2 歲以下是感染的預測因子；在急診或 OR 修補、受傷到修補 ≥ 12 小時都不是感染的預測因子。
7. Anant S, et al. Demographic and Clinical Factors Associated with Mechanisms of Open Globe Injury in the United States: A Multi-Center Study. Clin Ophthalmol 2025;19:1543-1556. doi:10.2147/OPTH.S520082 — 1570 位 open globe：合併眼瞼裂傷和 Zone III 傷口有關（PR 1.62）。用來支持「看到眼瞼裂傷要仔細查眼球」。
8. Zhao J, et al. Evaluation and implementation of a mannequin-based surgical simulator for margin-involving eyelid laceration repair. BMC Med Educ 2021;21(1):170. doi:10.1186/s12909-021-02600-3 — margin laceration repair 對剛開始的住院醫師是挑戰；模擬器練習後信心顯著提高。

## 驗收項目
- [x] 站長確認的病例摘要原樣寫進「病例情境」並註明日期（2026-11-06）。
- [ ] 模型卡加上裂傷、縫線與瞼緣俯視的段落與出處；樣本圖自己放大檢查；`eyelid/check.js` 的新檢查全部通過，每一項都故意改錯過一次。
- [ ] 舊影片畫面不變：前四部與 PLTR 的 `check-all.js` 不更新參考圖即通過。
- [ ] 每段縫合步驟同時顯示兩個視角，同一針在兩圖的位置差 < 0.3 mm。
- [ ] 第 2 章每一個「轉 OR」條件都有出處；沒有出處的標示意或拿掉。
- [ ] 旁白每個數值都有出處並寫成檢查（數字帳本）；沒有出處的標「示意」或拿掉，列在出片前的總覽（`overview-notes.md`）。
- [ ] 下眼瞼那一章完成。
- [ ] `node videos/tools/check-all.js videos/src/eyelid-margin-laceration-repair` 全部通過；每章至少一張參考圖。
- [ ] 出片前交總覽（每章一張）；上傳為不公開並同步網站。

## 進度
- 2026-11-06：站長確認病例情境（以上眼瞼為主、最後一章講下眼瞼）；規格書與第一批文獻（8 篇）完成。
- 下一步：補縫合技術細節的出處（進出針距離與深度、縫線、拆線天數、轉 OR 條件、清創原則）→ 寫 `script-draft.md` 第 1 版 → 模型卡與模型（裂傷、縫線、瞼緣俯視）→ 樣本圖自檢 → 影片。依 `videos/models/README.md`，一個對話只做一章（或 3–4 段），做完寫進這裡再換新對話。
