# 眼窩（evisceration 後）殘留環扣帶模型卡（`socket/`）

照 `videos/models/MODEL-CARD-TEMPLATE.md` 的欄位寫。查不到的寫「[待核對出處]」，文獻沒給數值的寫「示意」。

## 適用的手術
- 已做（2026-11-13）：evisceration 後殘留的 360° encircling scleral buckle（silicone band）從結膜暴露、感染時的 scleral buckle removal。病例（去識別）：左眼 OS；2009 年 RRD 手術縫了 #41 encircling band（5-0 Dacron 縫在鞏膜上，band 從四條直肌下方穿過；當年的 radial #506 sponge 已拆掉，模型不畫；有沒有 sleeve 不知道，不畫）；2023 年 evisceration（沒有放植入物，鞏膜殼用 mattress suture 關閉，結膜與 Tenon 關閉，放 conformer）。樣本：`sample.html`。
- 之後可用（還缺的結構）：有植入物的 evisceration／enucleation socket（還缺植入物）、眼球還在時的 buckle removal（要改用 `posterior/` 的眼球）。
- 這個模型自成一體，不載入其他模型。

## 兩個同步視角與方位慣例
- 機轉切面（`SOCKET.sec`，視角 `sec`）：經某個鐘點 `h` 的子午切面。右＝`h` 點、左＝`h`＋6 點；上＝前（術者那一側）、下＝後（眶尖）。由外到內：眼瞼與穹窿（簡化）、conformer、結膜、Tenon、直肌（只在 12／3／6／9 點附近）、band（扁平長方形截面，示意）與包住它的纖維囊、Dacron mattress suture、鞏膜殼（塌陷、內部是纖維組織，形狀示意）、後方眼眶脂肪。畫面方位字串：`sec(...).orient`。
- 術者視角（`SOCKET.front`，視角 `front`）：左眼 OS 眼窩的正面，開瞼器撐開瞼裂。畫結膜表面、鞏膜殼的隆起（陰影）、四條直肌（結膜下，淡色虛線）與附著線、band 的環（被蓋住的虛線、打開或暴露處實線）、每個象限一條 Dacron 縫線、暴露處與肉芽組織、肌肉鉤、抽出的 band。
- 方位：
  - 左眼 OS。
  - 術者坐 12 點（病人頭側）：下＝12 點、右＝9 點＝nasal、左＝3 點＝temporal、上＝6 點（和 `posterior/CARD.md` 的顯微鏡俯視相同）。畫面方位字串：`front(...).orient`；鐘點字的位置：`A.hours`。
  - 影像沒有倒置或鏡像（肉眼或放大鏡直視）。
  - 鐘點以「面對病人」定義（12＝上方）；OS 的 3 點＝temporal、9 點＝nasal。1:30＝superotemporal、4:30＝inferotemporal、7:30＝inferonasal、10:30＝superonasal（`SOCKET.hourName`）。
- 兩個視角怎麼換算：正面圖的角度＝鐘點，半徑＝沿鞏膜殼外表面到前極的弧長 s（等距方位投影，和眼底繪圖紙相同，示意）。所以 band 寬度、附著點到 band 的距離、縫線咬針的位置，在兩圖是同一個 mm 數。切面上任一點用 `SOCKET.secToFront(p, h)` 換到正面圖（同鐘點、同 s），`check.js` 檢查差距小於 0.5 mm。
  - 代價：正面圖的圓周方向被拉寬（實際圓周是 2π×鞏膜殼半徑，正面圖是 2π×s），只用來表示位置，不用來量圓周長度。band 的總長用 3D 的圓周（2π×band 中線半徑）計算。

## 座標（手術的語言）
- 幾點鐘（`h`，1:30 寫成 1.5）。
- 沿鞏膜殼表面距前極的 mm（s）；band 在鞏膜殼的赤道（s＝`profile().sEq`）。
- 沿 band 的 mm（暴露長度 `expose.len`、抽出長度）。

## 尺度與放大層級
- 正面全景（`front`）：寬約 40–62 mm，看得到整個瞼裂與 band 環。
- 切面（`sec`）：全寬約 44 mm（兩側）；樣本只看 `h` 那一半（寬 22 mm），附 5 mm 比例尺。
- 局部放大：用 `shot-model.js` 的 `v` 指定幾 mm 的視窗。band 厚 0.75 mm、纖維囊 0.2 mm，在全景裡很細，講層次時要放大。

## 族群預設與出處
沒有查到 evisceration socket 或 band 的族群差異，用標準值或示意。

## 物理、液體、器械
- band 是一個不可伸長的環：剪斷後從剪斷處的一端抽出，剩下的環從另一端縮短；剩下的環＋抽出的部分＝原本的周長（`check.js`）。
- 沒剪斷的 Dacron 縫線還套著 band 時，band 整條都滑不動：`SOCKET.stuckBy(state)` 回報卡住的縫線鐘點，模型把抽出量當成 0，兩圖用紅圈標出卡住的縫線（`A.stuck`）。這是教學規則（示意），實際上縫線鬆時也可能拉得動。
- 肌肉鉤從直肌下方勾起，直肌抬起約 2 mm（示意），底下的 band 露出。
- 沒有液體與頭位。

## 手術狀態（`state` 參數，兩個視角共用）
- `conformer`：1＝conformer 在（術者視角不畫開瞼器）、0＝拿掉（畫開瞼器）。
- `expose: { h, len }`：band 暴露的鐘點與沿 band 的長度（mm）。預設樣本 1:30、6 mm（示意，見數值表）。
- `open: { h0, h1 }`：結膜與 Tenon 打開的範圍，從 `h0` 順時針（鐘點增加）到 `h1`。樣本用 7→5 點（示意）。
- `hook: h`：肌肉鉤勾起 `h` 點的直肌（12／3／6／9）。
- `sutCut: [h...]`：已剪斷的 Dacron 縫線。
- `cut: h`：band 剪斷的鐘點。
- `pull`：0–1，band 抽出的比例；`pullDir`：+1（預設，剩下的環從剪斷處往鐘點增加的方向延伸）或 −1。
- `debride`：0–1，肉芽組織清除（1＝清完）。`close`：0–1，從 `open.h0` 開始縫合結膜的比例。
- `secH`（只給 `views.js` 用）：切面經過的鐘點；沒給時用暴露處的鐘點。

### 定位點（影片放標籤與器械用）
- 正面 `front(...).A`：`expose`、`gran`、`cut`、`bandEnd`（抽出時另一端）、`pulled`（抽出的帶子上、畫面內的一點）、`hook`（鉤尖）、`hooked`（被勾的直肌）、`sut[h]`、`stuck`、`open`（結膜切口中點）、`close`、`band`（被蓋住的一段）、`rect[SR|LR|IR|MR]`、`ins[SR|LR|IR|MR]`、`conformer`、`conj`、`shell`、`fornix`、`lid`、`speculum`、`hours[12|3|6|9]`。另有 `outPts`（抽出部分的折線）。
- 切面 `sec(...).A`（右側＝`h` 點）：`band`、`bandL`（左側的 band）、`capsule`、`shell`、`fibrous`、`seam`（鞏膜殼縫合處）、`conj`、`tenon`、`rectus`、`ins`、`sut`、`stuck`、`expose`、`gran`、`hook`、`cut`、`bandEnd`、`pulled`、`open`、`close`、`conformer`、`fornix`、`lid`、`fat`。只在該鐘點有這個東西時才有值。
- `sec(...).sides[1 | -1]`：該側的鐘點、有沒有直肌（`muscle`）、band、縫線、暴露、打開、縫合，供檢查與影片判斷用。

## 數值與出處
| 項目 | 模型用的值 | 出處 |
|---|---|---|
| #41 band 寬 | 3.5 mm | Gomaa 2017（J Ophthalmol 2017:4671305，[DOI](https://doi.org/10.1155/2017/4671305)，PMID 29333292），原文 "number 41 (3.5 mm)" |
| #41 band 厚 | 0.75 mm | 廠商資料：FCI 在 FDA GUDID 的登錄（"Band (3.5 x 0.75 mm) Type 41"，DI 03760087121179），不一定是這位病人 2009 年用的品牌 |
| band 截面形狀 | 扁平長方形 | 示意 |
| band 外的纖維囊 | 有；厚 0.2 mm | 有纖維囊：Lee 2013（PMID 21701393）、Suh 2007（PMID 18091181）；厚度示意 |
| band 周長 | 2π×（鞏膜殼半徑＋纖維囊＋band 厚的一半）≈ 63.3 mm | 示意（band 貼在現在的鞏膜殼赤道；2009 年的原始長度不知道） |
| 暴露位置 | 樣本 OS 1:30（superotemporal）、長 6 mm | 位置示意；erosion 多在 superonasal（35%）或 superotemporal（35%）：Zhang 2026（J Vitreoretin Dis，PMID 41631098，延遲拆除的 50 眼）。長度示意 |
| 鞏膜殼大小（evisceration 後塌陷） | 赤道半徑 9.5、前後半徑 7.0、鞏膜厚 0.9 mm | 示意（查不到） |
| 直肌附著點到 band 中心（沿鞏膜殼） | 4.5 mm | 示意。Kim 2024（PMID 38708857）的附著點距角膜緣 MR 5.28、IR 5.72、LR 6.40、SR 6.78 mm，但這個鞏膜殼沒有角膜緣，band 距角膜緣也查不到，所以沒用 |
| 直肌寬、厚 | 9、1.4 mm | 示意 [待核對出處] |
| 結膜、Tenon 厚 | 0.35、0.6 mm | 示意 |
| Dacron 縫線位置 | 每象限一條：1:30、4:30、7:30、10:30；兩腳相距 2.2 mm、咬針超出 band 邊 1 mm | 示意（病歷只寫 5-0 Dacron） |
| 穹窿 | band 後緣再往後 1.5 mm | 示意 |
| 開瞼後的瞼裂（正面圖） | 半軸 19 × 17 mm | 示意 |
| 結膜切口 | band 前緣再往前 2.5 mm | 示意 |
| 肌肉鉤抬起 | 2 mm | 示意 |

## 必寫的檢查（`check.js`，目前 25 項，每一項都故意改錯過一次確認會報錯）
- 方位：OS 術者視角 3 點在左（temporal）、9 點在右（nasal）、12 點在下；鐘點名稱；位置↔鐘點互換。
- 兩個視角一致：暴露處、剪斷處、被勾起的直肌在兩圖同一個鐘點；切面左側（`h`＋6 點）換到正面也對得上。
- 解剖：band 在每條直肌下方（比直肌深，含纖維囊）、直肌附著點在 band 前方；band 貼在鞏膜殼外面（中間只有纖維囊）、寬厚等於參數；斜向鐘點的切面沒有直肌；肌肉鉤在 band 與抬起的直肌之間；Dacron 縫線兩邊咬在鞏膜、線環跨過 band；conformer 在結膜前面。
- 手術動作：抽出時總長不變（0.25、0.5、0.9 三種）；抽一半時另一端在對側、12 點已經沒有 band；沒剪斷的縫線會卡住並被回報；清創後兩圖都沒有肉芽；取出並縫合後兩圖都沒有 band、結膜關閉。
- 所有狀態（9 種 × 正面＋7 個切面）沒有 NaN。

## 已知的坑
- 正面圖用等距方位投影（半徑＝沿表面的弧長），圓周方向被拉寬；旁白如果講「band 長幾 mm」，要用 `band(state).L` 或 `ring3`，不要量正面圖。
- band 的寬度在真正的正面投影裡是看不到的（band 在赤道、側面朝向術者）；畫成看得到寬度是因為用了上面的投影，畫面要標「示意」。
- 暴露處與打開的範圍重疊時，以「打開」為準（不再畫暴露的洞與肉芽）。

## 檔案
- `socket.js`：模型本體（`SOCKET.P` 參數、`sec`、`front`、`band`、`stuckBy`、`secToFront`、鐘點工具）。
- `views.js`：向登記處報到（`registry.js` 的 `socket`），視角 `sec`（`variant`＝切面鐘點）與 `front`。
- `check.js`：自我檢查；`SOCKET_JS=<路徑>` 可以載入改過的副本，用來確認檢查會失敗。
- `sample.html`、`sample.jpg`：六個步驟（術前暴露、打開結膜、勾起外直肌、剪縫線與剪斷、抽出一半、取出清創縫合），2026-11-13 Claude 自檢。
