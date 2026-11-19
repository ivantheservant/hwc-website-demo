# 內容檔的寫法

內容只有這一份，四款設計都由這裏取用。改完之後執行 `node build.js`。

## 檔案

- `zh\` 及 `en\`：一頁一個 `.md` 檔，兩邊的檔名相同（例如 `zh\services.md` 及 `en\services.md` 是同一頁的中文版及英文版）。
- 檔名以 `_` 開頭的是共用段落（例如 `_fellowships.md`），可以在多於一頁內使用。
- `site.json`：堂名、聯絡資料、四堂崇拜、公告條、最新消息、最新講道、介面文字。中英文共用。
- `downloads.json`：文件下載清單。中英文共用。

## 每頁開頭的資料

```
---
title: 聚會時間            頁面標題
nav: 聚會時間              選單上顯示的名稱（可省略，預設用 title）
status: existing           existing＝現有內容；demo＝整頁是示範內容；mixed＝部分是示範；placeholder＝只有按鈕位置
source: backup/pages/…     文字的出處
current: chi/meetings      這一頁在 /current/ 的路徑；沒有這一行，/current/ 就沒有這一頁
current_title: MEETINGS    /current/ 選單上的名稱（可省略）
only: current              只在 /current/ 出現（例如沒有空缺時的 Vacancies）
summary: …                 一句簡介，只用於網頁的 description
---
```

首頁（`index.md`）另有 `hero_title`、`about_text`、`welcome_text` 等欄位，供三款設計的首頁使用。

## 正文

用一般的 Markdown：`##` 標題、段落、`-` 清單、`1.` 編號清單、`|` 表格、`---` 分隔線、`**粗體**`、`[文字](網址)`、`![說明](img:檔名.jpg)`。

連結的寫法：

| 寫法 | 意思 |
|---|---|
| `[聚會時間](page:services)` | 連到同一種語言的另一頁 |
| `[English](other:services)` | 連到另一種語言的同一頁 |
| `![說明](img:church-building.jpg)` | `assets\img\` 內的圖片 |
| `![說明](ph:)` | 沒有使用相片的位置，顯示「相片從略」的圖案方塊 |
| `[文字](網址){.btn}`、`{.btn2}` | 顯示成主要按鈕、次要按鈕 |

區塊（以 `:::名稱` 開始，以單獨一行 `:::` 結束，可以一層套一層）：

| 區塊 | 用途 |
|---|---|
| `:::demo` | 示範內容：三款設計會加上虛線框及「示範內容」標籤；/current/ 不顯示 |
| `:::new` | 只在三款新設計顯示 |
| `:::current` | 只在 /current/ 顯示 |
| `:::note` | 備註 |
| `:::timeline`、`:::item` | 歷史：每個 `:::item` 是一件事（相片、`####` 標題、日期、說明） |
| `:::people`、`:::person` | 同工：每個 `:::person` 是一位（相片、`####` 姓名、簡介） |
| `:::creed`、`:::faq` | 信仰綱要、常問問題 |

獨立一行的標記：

| 標記 | 顯示 |
|---|---|
| `{{services}}` | 四堂崇拜（資料在 `site.json`） |
| `{{contact}}`、`{{map}}` | 聯絡資料、地圖 |
| `{{downloads}}` | 文件下載清單（資料在 `downloads.json`） |
| `{{news}}` | 最新消息（資料在 `site.json`） |
| `{{youtube:影片編號}}`、`{{embed:網址}}` | 嵌入影片、嵌入文件 |
| `{{> fellowships}}` | 插入共用段落 `_fellowships.md` |
