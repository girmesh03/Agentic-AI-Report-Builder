# Findings & Decisions: Master Specification

Use this file as the durable knowledge base for requirements, discoveries, technical constraints, and decisions for the MERN Stack Agentic AI Report Builder master specification.

## Core Requirements & Domain Constraints

- **Product Vision**: MERN application where an area supervisor narrating their day in spoken Amharic audio generates a fixed-template Amharic workplace report. Generic (applicable to any multi-branch company), Amharic-first domain. Manual delivery to boss (copy text, download `.txt`, print to PDF, Google Docs export).
- **Zero RBAC / Single-User Scoping**: Single user type only. No organization setup, no billing, no roles. Every collection except User carries a required `user` field, scoped by `req.user._id.toString()`.
- **Linguistic Policy**:
  - UI shell, navigation, labels, buttons, dialogs, validation messages: 100% English.
  - Spoken audio, transcription, generated reports: Amharic.
  - Workplace equipment / technical terms: Transliterated to natural Amharic Ge'ez phonetics (e.g. `deep fryer` -> `ዲፕ ፍራየር`, `POS machine` -> `ፒኦኤስ ማሽን`). Never raw English in report body.
  - Zero automated machine translation and zero text-to-speech.
- **Report Structure (LOCKED)**:
  - Plain text (zero markdown `#`, `**`, `*`).
  - Header: `ቀን: DD-MM-YY` (Ethiopian calendar), `ብራንች: <branch or visits-joined names (፣ + እና)>`, `ስም: <fullName>`, `ስራ የገባሁበት ሰዓት: HH:mm` (24h).
  - Visits (optional, format-only): `ከ HH:mm – HH:mm (<branch> ብራንች)` per visit. Omitted entirely if no visits.
  - Body:
    - `የተሰሩ ስራዎች:` bullets.
    - `መፍትሄ የሚፈልጉ ጉዳዮች:` bullets. If no issues: single bullet ` - በዕለቱ በብራንቹ አፋጣኝ መፍትሄ የሚፈልግ የተለየ ጉዳይ አልነበረም።`
    - `አጠቃላይ አስተያየት:` bullets.
  - Footer: `ከስራ የወጣሁበት ሰዓት: HH:mm` (24h).
  - Statuses/priorities are internal only; never rendered in plain text.
- **Tech Stack & Libraries**:
  - Pure JavaScript (ES Modules in backend, React + Vite in frontend).
  - MUI Community edition (`sx` and `styled()`). No Tailwind CSS. Tree-shaken single imports.
  - State: `@reduxjs/toolkit` with `redux-persist`.
  - API Client: Native `fetch` wrapper in `features/apiSlice.js` (`createApi` + `injectEndpoints`), `credentials: 'include'`.
  - Audio: Browser MediaRecorder -> Multer upload (max 25MB, max 10 files) -> FFmpeg conversion to mono 16-bit 16kHz PCM -> Addis AI STT SDK.
  - LLM: Free tier Gemini (`gemini-2.5-flash`, `gemini-2.5-flash-lite`) or Addis (`addis-1-alef`). Fallback chain: addis -> gemini -> nvidia.
  - Validation: `express-validator`. Never use `zod`.
  - No automated test frameworks.

## Technical Decisions & Conventions

| Decision | Rationale |
|---|---|
| Entity Names in PascalCase | Enforces consistent Mongoose and component architecture. |
| Status Enums in Lowercase | Standardized across activities, issues, and chat nodes. |
| Domain Dates: Ethiopian `DD-MM-YY` | Strict requirement; converted bidirectionally with Gregorian UTC `Date`. |
| 24-hour `HH:mm` Times | Strict requirement; validated via regex `^([01]\d\|2[0-3]):([0-5]\d)$`. |
| Component Prefix `Mui*` | Standardizes all reusable custom wrappers (`MuiAppbar`, `MuiPageHeader`, etc.). |
| UPPER_SNAKE_CASE for Env & Constants | Consistent configuration management. |
| Envelope `{ success, message, data }` | Standardized API contract. |
| Paginated `{ success, message, data: { docs, page, limit, totalDocs, totalPages } }` | Integrates with `mongoose-paginate-v2`. |
| Route params `<resource>Id` | Replaces bare `:id` (e.g. `:reportId`, `:branchId`, `:chatId`). |
| Plain Model Name for Refs | Uses `user`, `branch`, `report` instead of `userId`, `branchId`. |
| Arrow functions everywhere | Modern, clean functional standard. |
| Single imports for MUI & Icons | Guarantees tree-shaking without bundler overhead. |
| Winston logging with daily rotation | Replaces `console.log` entirely in backend. Auto-deletes after 30 days. |
| Dual httpOnly JWT Cookie Auth | Maximum security against XSS. 15m access, 7d refresh with rotation and reuse detection. |
| Exactly one TTL index | Placed on `RefreshToken` collection. |
| 30-day Sweeper | `node-cron` sweeps archived branches and reports after 30 days. |
| Multi-turn ChatGPT/Gemini Thread | Persistent ongoing conversation inside AppShell; 3 entry points (Sidebar Recent, Reports Card/List, Reports DataGrid). |
| In-Thread Message Action Icons | Agent: Copy & Retry; User: Copy & Edit (inline `MuiTextField` editor + Update button). |
| Downstream Message Truncation | Editing user prompt or retrying agent response permanently truncates all subsequent messages below it to maintain context integrity. |
| Profile Update (`PATCH /auth/profile`) | Updates `firstName`, `lastName`, `email` (409 on duplicate), `position` via Settings Profile tab; syncs Redux in memory. |
| Avatar Upload Constraints | Max 15MB single file, storage `uploads/avatars/`, allowed types: `jpeg`, `jpg`, `png`, `webp`. |
| Server-Side Report Renderer | Pure deterministic assembly in `utils/reportRenderer.js`; LLM never formats plain-text string directly. |
| Activities Tone | Strictly first-person active voice (`አረጋግጫለሁ`, `ተከታትያለሁ`); hidden status (`completed`, `in_progress`). |
| Issues Tone & Structure | Problem + Impact + Urgent Action Required; heading never gets `(አፋጣኝ)`; hidden status (`reported`, `in_progress`, `completed`, `no_issue`). |
| No-Issue Invariant | Renders `በዕለቱ በብራንቹ አፋጣኝ መፍትሄ የሚፈልግ የተለየ ጉዳይ አልነበረም።` when zero issues are identified. |
| Empty Comments Fallback | Renders `በዕለቱ በብራንቹ የነበረው አጠቃላይ የስራ እንቅስቃሴ ደህና ነበር።` when comments are absent (never outputs "ምንም ተጨማሪ..."). |
| Acoustic Quality Gate | Agent asks clarifying questions if STT transcript is empty or garbled; zero hallucination on noisy audio. |
| Vague Shorthand Expansion | Expands terse workplace phrases (e.g. `ቼክሊስት`) into professional SOP supervisory documentation. |
| Branch Metadata & Uniqueness | `name`, `normalizedName`, optional `phone`, optional `address`, compound unique `{ user: 1, normalizedName: 1 }`. |
| Report plain text field `generated` | Renamed from `generatedReportText`; stores locked assembled string. Accompanied by `rawTranscript` and `audioFiles[]`. |
| Zero-Lookup Historical Snapshots | `Report` stores immutable snapshots of `branchName`, `supervisorName`, and per-visit `branchName` to guarantee rendering resilience even if branches are purged. |
| Multi-Provider AI Metadata | Tracked on `Message` and `Report`: `provider` ('addis', 'google', 'nvidia'), `model`, `language`, `reasoning` trace, `tokensUsed`. |
| Chat Title Dynamics | `type: 'report'` titled `Report - <branchName> - <DD-MM-YY>`; `type: 'general'` auto-generated from first user message prompt. |
| Preset Persona/System Decoupling | Cleanly separates `persona` (agent persona/tone) from `systemPrompt` (SOP checklists, operational rules). |
| Two-Tier Deletion & 30-Day Sweeper | Soft archive (`isArchived`, `archivedAt`) with 30-day grace period; daily midnight `node-cron` (`0 0 * * *`) physically purges documents and unlinks audio files. |
| Schema-Level Indexing Mandate | All single-field, compound, unique, sparse, and TTL indexes declared strictly via `schema.index(...)`. Zero inline field-level indexes allowed across entire codebase. |
| Dual Clock-In/Out Hierarchy | `report.clockIn`/`report.clockOut` for overall daily shift; `visit.clockIn`/`visit.clockOut` for per-branch arrival and departure intervals. |
| Zero Hardcoded Config Defaults | AI provider names, default models, quotas, paths, and timeouts must never be hardcoded in schemas or code; always loaded dynamically from `config/env.js` or runtime context. |
| Dual Chat Node Specialization | `type: 'report'` (1-to-1 active report co-pilot with mutation tools) vs `type: 'general'` (universal operations analyst & personal assistant with read-only report querying). |
| General Chat 7-Archetype Catalog | Cross-branch analytics, Google Sheets generation, management escalation memos, SOP guidance, financial calculations, glossary management, personal productivity. |
| Live Google Sheet Generation | Tool `export_to_google_sheet` creates Google Spreadsheet via `drive.file` OAuth scope and streams clickable direct link in Amharic chat. |
| Mid-Chat Dynamic Configuration | User can switch preset, provider (`addis`, `google`, `nvidia`), model, language, and reasoning at inception or mid-chat; changes apply to future messages while past turns freeze executed params. |
| Per-Chat Stream Concurrency Lock | In-memory `activeChatStreams` map rejects concurrent requests with HTTP 409 Conflict; supports clean client abort via `POST /chats/:chatId/abort`. |

## Locked Package Manifest

### Backend Dependencies (`package.json`)
```bash
npm install addisai bcryptjs compression cookie-parser cors dotenv express express-async-handler express-mongo-sanitize express-rate-limit express-validator helmet jsonwebtoken mongoose mongoose-paginate-v2 multer winston winston-daily-rotate-file
npm install --save-dev morgan nodemon
```

### Frontend Dependencies (`package.json`)
```bash
npm install @emotion/react @emotion/styled @mui/material @mui/x-chat @fontsource/inter @mui/icons-material @mui/x-charts @mui/x-data-grid @mui/x-date-pickers @reduxjs/toolkit dayjs react-error-boundary react-hook-form react-redux react-router react-toastify redux-persist
```

## Resources & Reference Paths

- Local `.env`: `backend/.env` (pre-configured with Mongo URI, Addis AI, Gemini, Nvidia, FFmpeg paths).
- Addi AI SDK: `https://www.npmjs.com/package/addisai` and `https://docs.addisassistant.com/docs/get-started/introduction`.
