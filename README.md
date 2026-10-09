# BaHaSideWatch

巴哈姆特動畫瘋的「側欄全螢幕」瀏覽器擴充功能：讓動畫瘋觀看頁像 **YouTube 直播全螢幕** 一樣——
整個螢幕黑底，左側影片盡量放大，右側是動畫瘋原生的「彈幕列表」面板貼齊螢幕右緣。

支援 Chrome、Edge、Brave 等 Chromium 系瀏覽器（Manifest V3）。

> 本專案為個人製作的非官方工具，與巴哈姆特電玩資訊站無關。

## 下載

**[⬇ 下載 BaHaSideWatch.zip（最新版）](https://github.com/a25776711/BaHaSideWatch/releases/latest/download/BaHaSideWatch.zip)**

或到 [Releases 頁面](https://github.com/a25776711/BaHaSideWatch/releases) 選擇版本。

## 安裝

本擴充功能沒有上架商店，需用「開發人員模式」自行載入：

1. 下載上面的 `BaHaSideWatch.zip`，**解壓縮**到一個不會被刪除的位置
   （例如 `D:\Tools\BaHaSideWatch`）。解壓後資料夾內應直接看得到 `manifest.json`。
2. 在網址列開啟擴充功能頁：
   - Chrome：`chrome://extensions`
   - Edge：`edge://extensions`
   - Brave：`brave://extensions`
3. 開啟「**開發人員模式**」（Chrome / Brave 在右上角，Edge 在左側欄）。
4. 按「**載入未封裝項目**」（Edge 為「載入解壓縮」），選擇剛剛解壓出來、含 `manifest.json` 的資料夾。
5. 清單出現 **BaHaSideWatch** 即完成。建議點網址列右邊的拼圖圖示，把它釘到工具列。
6. 開啟（或重新整理）任一動畫瘋觀看頁 `https://ani.gamer.com.tw/animeVideo.php?sn=...` 即可使用。

注意：

- 解壓出來的資料夾**不要刪除或搬移**，瀏覽器是直接讀取該資料夾。
- 瀏覽器啟動時可能提示「停用開發人員模式擴充功能」，按關閉即可，不要停用。

### 更新

下載新版 zip，解壓覆蓋原資料夾，到擴充功能頁按 BaHaSideWatch 的「重新載入」(↻)，再重新整理動畫瘋頁面。

## 使用方式

| 操作 | 作用 |
| --- | --- |
| 控制列「側欄全螢幕」按鈕 / `Shift + F` | 進入 / 離開側欄全螢幕 |
| `Esc` | 離開 |
| `Shift + C`（模式內） | 隱藏 / 顯示右側彈幕列表，隱藏時影片鋪滿 |
| `F`、原生全螢幕鈕、雙擊影片（模式內） | 離開側欄全螢幕 |

### 開關：原生全螢幕改為側欄模式

點工具列的 BaHaSideWatch 圖示，可開啟「原生全螢幕改為側欄模式」（預設關閉，立即生效）：

- **關閉**：動畫瘋原本的 `F` / 全螢幕鈕完全不變。
- **開啟**：按 `F`、原生全螢幕鈕或雙擊影片，直接進入側欄全螢幕。

控制列按鈕與 `Shift + F` 不受開關影響，隨時可用。

## 隱私與權限

- 只在 `https://ani.gamer.com.tw/animeVideo.php*` 頁面執行。
- 唯一權限是 `storage`，只用來記住上面的開關設定。
- 不連線到任何外部伺服器、不收集任何資料。

## 已知限制

- 右側面板是動畫瘋原生的彈幕列表，不會像 YouTube 聊天室那樣隨播放時間自動冒出新訊息。
- 播放廣告期間動畫瘋會隱藏控制列，按鈕也跟著看不到，請用 `Shift + F`。
- 若動畫瘋改版調整全螢幕樣式，全螢幕時右側面板可能會消失（瀏覽器拒絕全螢幕時的網頁全螢幕版面不受影響）。

更多技術細節見 [extension/README.md](extension/README.md)。
