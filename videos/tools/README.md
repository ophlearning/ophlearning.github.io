# 教學影片的共用工具

這裡放做影片時用來「看清楚」和「擋錯」的工具，所有影片共用。工具都要用 Node 執行（`require('playwright')` 要能用）。

## 每次改了模型或畫面，照順序跑這三個檢查
在 repo 根目錄執行；任何一個失敗（結束代碼不是 0）就先修，不要 commit。

1. 模型自我檢查：`node videos/models/eyelid/check.js`
   會檢查解剖關係和兩個視角是否一致，例如亞洲人眶隔融合點在瞼板上緣下方、內翻時睫毛碰到角膜、切口總長 ≥ 20 mm。
2. 影片層級檢查：`node videos/tools/check-video.js videos/src/upper-lid-margin-rotation/anim/video2.html --base d758d35`
   會檢查三件事：旁白、重點框、來源、章節、參考文獻和 `--base` 那一版逐字相同；已換新畫法的段落，每句旁白時看得見的標籤都在面板內、引線指在面板內、標籤互不重疊；沒有程式錯誤。
3. 參考圖比對：`node videos/tools/ref-check.js videos/src/upper-lid-margin-rotation/ref/manifest.json`
   參考圖是站長確認過的畫面。這個檢查會重畫同一時刻，比較每個像素的亮度。有差異時會印出差異圖的位置（紅色＝變了的地方）。
   - 差異是預期中的（例如這次本來就要改那一段）：把新截圖交給站長，確認後才執行 `--update` 更新參考圖，並在 `manifest.json` 寫上確認日期。
   - 新增段落的參考圖：先在 `manifest.json` 加一筆（`approved` 填 null），再用 `--update --only <段落>` 只產生這一段，不會動到已確認的圖。
   - 差異不在預期中：代表改 A 壞了 B，先修好。

## 看清楚用的工具
- `shot-model.js`＋`model-view.html`：把模型放大到指定範圍（mm），可以並排幾個手術狀態，並加 1 mm 格線。
  例：`node videos/tools/shot-model.js 'm=sag&v=-19,-14,12&grid=1&st=[{"curl":1},{"curl":1,"cut":1,"k":1,"tuck":1}]' out.png`
  `m` 可以是 `sag`（矢狀）、`cor`（正面）、`ev`（翻瞼）；`v` 是左上角的 x、y 和寬度（mm）；`st` 是狀態清單。
- `seg-stills.js`：截某一段在指定時刻的畫面。時刻用「第幾句旁白的幾成」表示，所以語音重新合成後依然有效。
  例：`node videos/tools/seg-stills.js videos/src/upper-lid-margin-rotation/anim/video2.html 4-4 /tmp/s 0:0.05 2:0.6 6:0.9`

## 已知限制
- 參考圖比對只比亮度，不比顏色。原因是參考圖存成 JPEG，JPEG 會降低顏色解析度，比顏色的話，細的彩色線條每次都會被誤報。所以只改顏色、亮度不變的修改抓不到。
- 標籤檢查只看標籤文字和引線端點，不檢查標籤有沒有指對組織。指對與否靠模型裡的定位點，以及站長看截圖把關。
