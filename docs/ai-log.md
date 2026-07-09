# AI Log

這份紀錄用來留下小組如何使用 AI / Coding Agent 的操作脈絡。重點不是逐字保存所有對話，而是記錄重要協作、取捨與人類判斷。

## 什麼時候要記錄

請在以下情況更新本檔案：

- AI 協助分析原始資訊。
- AI 協助找出不能判斷處。
- AI 協助判斷哪些資訊不能直接相信。
- AI 協助判斷哪些資訊不能直接變成任務。
- AI 協助修改畫面標示或前端工作台。
- AI 可能補了原文沒有的資訊。
- AI 建議被小組拒絕，且拒絕原因和安全 / 正確性 / scope 有關
- AI 輸出可能造成誤導，例如把未確認資料寫成已確認事實

## 不需要記錄

- 不需要逐字貼完整對話
- 不需要記錄每一次小型 autocomplete
- 不需要記錄單純修 typo 或格式化

## 紀錄格式

| 時間        | 階段       | 任務                     | AI / Agent 建議                                                                           | 採用 / 拒絕    | 人類判斷理由                                                                                 | 相關檔案 / commit                                                                                             |
| ----------- | ---------- | ------------------------ | ----------------------------------------------------------------------------------------- | -------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| 10:00-11:15 | Phase 0    | 改善原始資訊與整理工作台 | Agent 建議用顏色、資料品質提示、草稿表單、排序與工種標籤呈現原始資訊風險                  | 採用           | 這些功能能讓下一位協作者看見來源、查核狀態、缺漏資料與目前草稿狀態，但仍標示為推測與草稿     | `src/app/App.tsx`, `src/features/phase-0/*`, `src/components/RecordCard.tsx`, `src/styles/global.css`         |
| 10:00-11:15 | Phase 0    | 決定草稿互動方式         | Agent 一開始把整理依據與卡住原因做成文字框，後來依人類回饋改成 checkbox 多選加其他欄位    | 採用修正版     | 多選比大段輸入更適合快速整理，降低使用者不想填的負擔                                         | `src/features/phase-0/Phase0JudgementCard.tsx`                                                                |
| 10:00-11:15 | Phase 0    | 顯示工種要求             | Agent 先把工種做成關鍵字推測標籤，後續依人類回饋改成草稿可編輯多選欄位                    | 採用修正版     | 工種要求不能只是自動推測，必須能人工修正，且一筆資訊可能有多個工種                           | `src/features/phase-0/phase0-work-type.ts`, `src/features/phase-0/phase0-types.ts`                            |
| 10:00-11:15 | Phase 0    | 是否串真實 AI API        | Agent 說明若串 API 必須由後端保管 token，且 Phase 0 文件禁止外部 API 與 runtime LLM       | 拒絕現在串 API | 課程限制是前端-only，且不能把 API key 放入 repo 或前端                                       | `README.md`, `SAFETY.md`, `docs/student-context.md`, `docs/tasks/01-phase-0-messy-sprint.md`                  |
| 13:55-14:15 | Release 01 | 使用者訪談               | 啟用三個 persona sub-agent，分別模擬回報者、資訊整理者、行動者，並彙整共同風險            | 採用並人工補充 | 三個 persona 都指出 `工種要求`、`推測地點` 可能被誤認為已確認；本階段只寫文件，不修改 `src/` | `docs/interview-notes.md`, `docs/interview-summary.md`, `docs/decisions.md`                                   |
| 14:20-14:40 | v1         | 依行動者決策改寫前端     | Agent 建議新增 `/v1/` 行動者視角，優先顯示「先不要出發」「先確認來源」「只作為線索」      | 採用           | 人類已確認 v1 優先服務行動者；改寫仍只使用 Phase 0 原始資料，不做真實派工、後端或 API        | `src/app/App.tsx`, `src/features/v1/*`, `src/styles/global.css`, `tests/app-smoke.test.tsx`                   |
| 14:40-14:55 | v1         | 補足可出發確認狀態       | 使用者指出三種狀態缺少「可以出發確認資訊」，且現場幫手需要知道具體要做什麼                | 採用           | 新增「可以出發確認資訊」狀態，但仍限定為核對資訊，不代表正式派工或直接救災                   | `src/features/v1/*`, `src/styles/global.css`, `tests/app-smoke.test.tsx`                                      |
| 14:55-15:00 | v1         | 改善視角切換標籤         | 使用者指出右上切換鈕只顯示 0/1 資訊不足，應顯示不同視角分類                               | 採用           | 將切換鈕改為「整理者視角」「行動者視角」，保留 Phase 0 與 V1 路徑切換                        | `src/components/VersionSwitch.tsx`, `src/styles/global.css`, `tests/app-smoke.test.tsx`                       |
| 15:00-15:10 | v1         | 修正 GitHub Pages 404    | Agent 判斷 `/v1/` 在 Pages 會被當成真實目錄，先改用 `?view=v1` 切換視角                   | 採用後再修正   | localhost 會 fallback 到 app，但 Pages 沒有 `/v1/index.html`；後續改為 build 產生 v1 入口    | `src/app/App.tsx`, `src/components/VersionSwitch.tsx`, `src/features/v1/V1ActionDesk.tsx`                     |
| 15:10-15:30 | Release 02 | 補流程設計與維護文件     | Agent 依 `release-packs/02-flow-design-kit` 建議補自然語言流程、Mermaid、人工確認點       | 採用           | 流程圖能讓接手者先理解四種行動者狀態，不把「可以出發確認資訊」誤改成正式派工                 | `docs/flow.md`, `docs/decisions.md`, `AGENTS.md`, `docs/ai-log.md`                                            |
| 15:30-15:45 | v1         | 將 V1 放回 `/v1/`        | Agent 建議 build 後複製 `index.html` 到 `dist/v1/index.html`，讓 GitHub Pages 可開 `/v1/` | 採用           | 使用者希望 V1 前端放在 `/v1/`；靜態站台需要實體入口，並保留 `?view=v1` 作為 fallback         | `package.json`, `scripts/create-v1-entry.mjs`, `src/components/VersionSwitch.tsx`, `tests/app-smoke.test.tsx` |

## 範例

| 時間  | 階段    | 任務         | AI / Agent 建議                        | 採用 / 拒絕 | 人類判斷理由                              | 相關檔案 / commit             |
| ----- | ------- | ------------ | -------------------------------------- | ----------- | ----------------------------------------- | ----------------------------- |
| 09:45 | Phase 0 | 分析原始資訊 | 建議把社群貼文直接轉成 verified report | 拒絕        | 社群貼文來源未確認，應保持 `needs_review` | `docs/phase0-observations.md` |

## 課後反思

### AI 幫助最大的地方

- 快速把口頭需求轉成可操作 UI，並補上測試與 build 驗證。
- 協助找出狀態、工種、草稿與排序之間的資料流。
- 協助檢查 Markdown 中是否有可用 AI token；結論是沒有，且文件明確禁止真實 LLM runtime API。
- Release 01 中，sub-agent 能快速提供不同使用者視角，讓「工種要求太像已確認分類」這個共同風險浮出來。

### AI 最容易誤導的地方

- 一開始容易把提示文字放進可編輯欄位，讓使用者以為要手動刪除。
- 工種要求若只靠關鍵字推測，可能把否定句或過期資訊也分類成任務需求。
- UI checklist 若顯示在畫面上，可能混淆課程檢查與使用者工作流程。
- sub-agent 容易把回饋包裝成設計建議，因此主 agent 彙整時要保留「使用者說了什麼」和「我們推論什麼」的差異。

### 下次使用 AI 開發前，我們會先準備

- 先定義哪些欄位是草稿、哪些只是提示、哪些是已確認資料。
- 先確認課程限制，例如不可用後端、外部 API、localStorage、真實 LLM runtime。
- 先列出使用者實際工作流程，避免讓表單欄位太多或太像工程檢查表。
- 訪談階段先明確要求 sub-agent 不要提供完整產品設計，只給使用者角度回饋。
