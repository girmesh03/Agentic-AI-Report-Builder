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
| Preset Persona/System Decoupling | Cleanly separates `persona` (agent persona/tone) from `system` (SOP checklists, operational rules). |
| Two-Tier Deletion & 30-Day Sweeper | Soft archive (`isArchived`, `archivedAt`) with 30-day grace period; daily midnight `node-cron` (`0 0 * * *`) physically purges documents and unlinks audio files. |
| Schema-Level Indexing Mandate | All single-field, compound, unique, sparse, and TTL indexes declared strictly via `schema.index(...)`. Zero inline field-level indexes allowed across entire codebase. |
| Dual Clock-In/Out Hierarchy | `report.clockIn`/`report.clockOut` for overall daily shift; `visit.clockIn`/`visit.clockOut` for per-branch arrival and departure intervals. |
| Zero Hardcoded Config Defaults | AI provider names, default models, quotas, paths, and timeouts must never be hardcoded in schemas or code; always loaded dynamically from `config/env.js` or runtime context. |
| Dual Chat Node Specialization | `type: 'report'` (1-to-1 active report co-pilot with mutation tools) vs `type: 'general'` (universal operations analyst & personal assistant with read-only report querying). |
| General Chat 7-Archetype Catalog | Cross-branch analytics, Google Sheets generation, management escalation memos, SOP guidance, financial calculations, glossary management, personal productivity. |
| Live Google Sheet Generation | Tool `export_to_google_sheet` creates Google Spreadsheet via `drive.file` OAuth scope and streams clickable direct link in Amharic chat. |
| Mid-Chat Dynamic Configuration | User can switch preset, provider (`addis`, `google`, `nvidia`), model, language, and reasoning at inception or mid-chat; changes apply to future messages while past turns freeze executed params. |
| Per-Chat Stream Concurrency Lock | In-memory `activeChatStreams` map rejects concurrent requests with HTTP 409 Conflict; supports clean client abort via `POST /chats/:chatId/abort`. |
| Universal `toObject` with Virtuals | Every schema implements `toObject: { virtuals: true, transform: ... }` alongside `toJSON` for consistent serialization in programmatic object access. |
| Branch Naming (Single Name + Normalized) | Retained single user-provided `name` + lowercase `normalizedName`. No separate `amharicName` field. |
| Report Date as Dynamic Virtual | `Report.date` stored exclusively as UTC midnight `Date`. `ethiopianDate` is a dynamic Mongoose virtual (`gregorianToEthiopian(this.date)`), eliminating dual-state sync drift. |
| Elimination of Glossary Collection | Removed static `Glossary` Mongoose model/CRUD. Replaced with dynamic in-context few-shot learning (retrieving user's last 3–5 approved reports) injected directly into LLM prompts. |
| RefreshToken as Dedicated Collection | Retained separate `RefreshToken` collection for RFC 6819 token family rotation, multi-device tracking, reuse/theft detection, and native MongoDB TTL cleanup. |
| Dedicated Report Edit Page (`/reports/:reportId/edit`) | Replaced cramped modal with a dedicated 2-column, click-first GUI edit page featuring time pickers, 1-click status chips, and sticky live Amharic preview. |
| Mode 3 Audio Orb Dictation Flow | Ephemeral voice notes recorded via Audio Orb are transcribed via Addis AI STT and injected directly into `ChatComposerTextArea` for user review/editing before sending; backed by a 9-point edge-case defense matrix. |
| Permanent Sidebar "New Chat" Button | Anchored permanently at the top of the Sidebar across all views; transforms into a compact icon button with tooltip in 64px collapsed mini-rail mode. |
| Zero Inner Chat Header | Chat View outlet has zero inner chat header; top bar is exclusively provided by `AppShell`'s sticky `MuiAppbar`, eliminating duplicate stacked headers. |
| Typing Performance Guarantee | Input render budget $< 5$ms per keystroke (60fps), `React.memo` isolation between composer and message stream tree, and GPU-accelerated CSS animations for Audio Orb. |
| RTK Query `baseQueryWithReauth` | Intercepts 401, acquires async mutex to prevent parallel refresh token collisions, rotates token, and clears state/redirects directly to `/login` on failure. |
| Symmetrical Report Detail/Edit Routes | Symmetrical route pair `/reports/:reportId/details` and `/reports/:reportId/edit` (with `/reports/:reportId` redirecting to `/details`). |
| Centralized Constants Files | Zero magic strings/numbers; all enums, regexes, standard phrases, limits, and quotas defined exclusively in `backend/utils/constants.js` and `client/src/utils/constants.js`. |
| Multi-Branch Visit Sorting & Invariants | `visits[]` sorted chronologically by `clockIn`; primary branch can be at any index $k$; shift boundaries sync automatically (`report.clockIn = visits[0].clockIn`, `report.clockOut = visits[n-1].clockOut`). |
| Unified Schema Naming (`transcription`, `duration`, `system`) | Normalized `Message.transcription` (symmetrical with `Report`), `aiMetadata.duration` (in ms), and `Preset.system`. |
| Mongoose ClientSession & Transaction Protocol | Multi-document writes wrapped in `session.withTransaction(async () => { ... })`; `Model.create([payload], { session })` array syntax; document middleware accesses session via `this.$session()` and attaches `.session(this.$session())` to DB queries; direct query updates (`updateOne`, `findOneAndUpdate`) prohibited for `Report` to protect `pre('save')` hooks. |
| Method 1: In-Memory Client Blob Audio Playback | Protected audio served via `res.sendFile()` as standard HTTP 200 binary; client downloads Blob and plays via `URL.createObjectURL(blob)`; completely eliminates HTTP 206 Range errors, Safari cookie-dropping, and server pipe crashes. |
| Tri-Modal Report Audio Ingestion | Row 7 supports Live Mic Recording (Audio Orb), Paperclip Browse, and Drag-and-Drop zone; all files stage into unified `audioQueue` with local Blob mini-players before single atomic multipart POST. |
| Mode 3 Ephemeral Dictation vs Mode 4 Attachment | Mode 3 ephemeral audio unlinks immediately in `finally` block and injects text into `ChatComposerTextArea` at cursor; Mode 4 attaches voice note files via chip above composer, persisting to `uploads/audio/` and MongoDB. |
| FFmpeg Acoustic Standardization & Silence Chunking | Downmixes all audio to mono 16-bit 16kHz PCM WAV; files >120s or >25MB split along natural pauses via `silencedetect=noise=-30dB:d=0.5` to eliminate mid-word truncation. |
| Addis AI STT Synchronous Ingestion | Synchronous SDK execution with `AI_TIMEOUT_MS` bounding and 1s -> 2s -> 4s exponential backoff retries on transient errors; sequential chronological concatenation into `rawNarrationText`. |
| Zero-DB-Table Dynamic Few-Shot Engine | Samples supervisor's last 3–5 approved reports to dynamically harvest real-world equipment transliterations and formatting patterns; injects them into system prompt; 0 schema migrations, 0 admin dictionary maintenance. |
| Server Tool Execution Catalog (11 Tools) | Complete declarative schemas: `query_operational_data`, `update_report_item`, `generate_operational_matrix`, `track_operational_trends`, `generate_executive_briefing`, `get_report_context` (w/ criteria & disambiguation), `update_report`, `create_report` (atomic Report + 1:1 Chat creation), `list_branches`, `create_branch`, `export_report_to_google_docs`. |
| Date Attribution Invariant | All queries and matrix outputs attach specific Ethiopian Calendar (`DD-MM-YYYY ዓ.ም`) and Gregorian dates to every activity, issue, and status record returned to the supervisor. |
| Bidirectional Chat Continuity Invariant | Report Chat can execute general multi-branch queries without losing report context; General Chat can inspect, mutate, create, and export specific reports without leaving the conversation, rendering interactive deep-link Report Reference Cards. |
| Deterministic 3-Tier Fallback Chain | Tier 1 (Google Gemini 2.5 Flash / Flash Lite) -> Tier 2 (Addis AI `addis-1-alef`) -> Tier 3 (Nvidia NIM `meta/llama-3.1-nemotron-70b-instruct`) with backoff retries and transparent failover events. |
| Concurrency Lock & Abort Protocol | Per-chat in-memory stream registry (`activeChatStreams`); HTTP 409 rejection on concurrent messages; `POST /chats/:chatId/abort` triggers `AbortController.abort()` to halt generation cleanly. |
| Zero-DB-Table Transliteration Harvester | Samples last 4 approved reports to harvest Ge'ez transliterations into `<workplace_glossary>` XML injected into LLM prompt; 0 migrations, 0 admin dictionary maintenance. |
| Novel Word Organic Learning Lifecycle | 4-step cycle: Rule-based English-to-Ge'ez syllabic phonetics -> Persistence in report -> Dynamic harvest loop -> User correction adaptation. |
| Zero-Latin Pre-Save Linter | `reportSchema.pre('save')` regex `/[a-zA-Z]/` scans `plainTextReport` and executes automatic phonetic fallback normalization to guarantee zero raw Latin script. |
| Canonical Homophone Normalizer | In-memory normalizer collapses Ge'ez homophones (`ሀ/ሐ/ኀ`, `ሰ/ሠ`, `አ/ዐ`, `ጸ/ፀ`) to canonical forms to ensure search and text indexing resilience. |
| Single-Column ChatBox & Request/Response | Single-column MUI `<ChatBox>` (Agent Left, User Right); direct request/response with zero `ChatConfirmation`; 17px default font size for Ge'ez readability; interactive `[View Full Report]` trigger. |
| Zero Inner Chat Header | ChatBox features set `conversationHeader: false` and `conversationList: false`; global AppShell sticky AppBar is sole authoritative header. |
| Custom SSE Adapter & Abort Protocol | `createChatStreamAdapter` maps SSE chunks to typed MUI X Chat events; stop button triggers client abort and `POST /chats/:chatId/abort` releasing concurrency lock. |
| Centered Composer & Sub-5ms Latency | Fixed bottom container max-width 880px; `React.memo` and uncontrolled state isolate typing from message list, ensuring <5ms keystroke latency. |
| Mode 3 Audio Dictation Flow | Ephemeral spoken Amharic dictation via Audio Orb; transient STT via Addis AI; text injected at cursor; zero audio files saved to server disk. |
| Transliteration Chips in Composer | Real-time suggestion bar surfaces novel word chips (e.g. `chiller ➔ ቺለር [Convert]`); reinforces 4-stage organic learning lifecycle. |
| In-Stream Action Cards & Matrices | Assistant bubbles render `[ View Full Report ]`, `[ Edit in Form ]`, `[ Copy Report Text ]`, responsive comparison matrices, and Google Sheets links. |
| Mode Switching & Plan Mode Non-Destruction | Mode switches occur only on user request/confirmation; Plan Mode never overrides existing implementation_plan.md, only appends. |
| Model Selector vs Preset Selector Decoupling | Model Selector manages runtime LLM params (Google/Addis/Nvidia, model, lang, reasoning) via Popover; Preset Selector manages full personas via MUI Dialog with EmptyState & react-hook-form. |
| STT Provider Invariance | Model Selector LLM changes have 0 impact on STT; STT is always and exclusively handled by Addis AI. |
| Universal `xs` Control Iconification | All text-labeled buttons and compound controls collapse to icon-only buttons on `xs` (<600px) with tooltips to prevent overflow. |
| AppShell AppBar Control Cleanliness | Right-side of AppShell AppBar strictly limited to 3 items: Global Search, Theme Toggle, User Avatar (no bell, no font buttons). |
| Strict Route Boundary Invariant | Authenticated users locked out of public routes (`/`, `/login`, `/register`) with immediate replace redirect to `/dashboard`. |
| Unified `BranchDialog` (No Dedicated Routes) | Branch creation and edit handled by a single `BranchDialog` (`MuiDialog`), eliminating `/branches/new` and `/branches/:branchId/edit`. |
| Universal `react-hook-form` & onBlur helperText | All forms use `react-hook-form` with `mode: 'onBlur'`; validation errors rendered strictly as inline red `helperText`. |
| Consolidated `/profile` Route | Replaces standalone `/settings`; houses profile info, security/password, preferences, and account deletion with dual entry from AppBar and Sidebar. |
| Universal Reusable Inputs & Adornment Law | `MuiTextField`, `MuiSelect`, `MuiAutocomplete` etc. must feature both Start Adornment (context icon) and End Adornment (clear icon/visibility/caret). |
| Self-Service Account Deletion Protocol | `DELETE /api/v1/users/me` on `/profile` runs atomic 7-collection transaction cascade and cookie clearance; admin user deletion remains forbidden. |
| In-Canvas Report Creation Flow | Report creation is hosted strictly inside `/chat`; zero `/reports/new` route. Initiation form replaces composer; cancel restores composer, submit launches SSE stream. |
| Direct Symmetrical Routes | Direct links to `/reports/:reportId/details`, `/reports/:reportId/edit`, and `/branches/:branchId/details` without redirect hops. |
| Global Search Dialog (`MuiDialog`) | Fullscreen absolute on `xs` and `sm-landscape`, centered on `sm+`; strict scroll isolation (only `DialogContent` scrolls); left arrow close and end clear adornment. |
| 13 Reusable UI Components (`client/src/components/reusable/*`) | Explicit catalog: `MuiAudioPlayer`, `MuiFileInput`, `MuiButton`, `MuiPageHeader`, `MuiConfirmDialog`, `MuiPagination`, `MuiTextField`, `MuiDataGrid`, `MuiRecorder`, `LoadingSpinner`, `MuiDialog` (with action buttons), `MuiSelect`, `MuiAutocomplete`, plus `Logo`. |
| Dedicated Columns Directory | `client/src/components/columns/*` contains DataGrid column definitions (`branch.jsx`, `report.jsx`) with flex sizing and styled actions. |
| Domain-Based Redux Architecture | Segregated domain feature slices including `dashboardSlice` & `dashboardApi` under `client/src/features/*`. |
| Option A Product Landing Page | Clean public landing page at `/` with Hero, 3 feature highlight cards, CTAs to `/register` and `/login`, and footer. |
| The Unstated Requirement Law | Any ambiguous or unstated requirement must never be proactively assumed or implemented; created strictly upon explicit user confirmation. |
| Standard Response Envelope | All non-streaming API responses strictly formatted as `{ success, message, data }`. |
| Paginated Envelope Standard | Paginated collections use `mongoose-paginate-v2` (`docs`, `totalDocs`, `limit`, `page`, `totalPages`); default page: 1, default limit: 10, max limit: 100. |
| Zero Numeric Status Literals | HTTP status codes imported strictly from `config/httpStatus.js`. Numeric literals strictly prohibited in code. |
| Centralized Error Pipeline | All controllers and middlewares forward errors via `next(error)`. No controller responds directly with an error. |
| Bilingual 429 Rate Limiter | Rate limit threshold breaches emit HTTP 429 with English and Amharic message: `Rate limit exceeded. እባክዎ ትንሽ ቆይተው እንደገና ይሞክሩ።`. |
| Ephemeral Audio Transcribe Endpoint | Live voice dictation runs via `POST /api/v1/audio/transcribe` with memory buffer and 0 disk files saved. |
| Forbidden Endpoints Enforcement | Explicit prohibition of `GET /auth/me`, `GET /users`, `DELETE /users/:userId`, session management lists, automated email/telegram endpoints, and translation/TTS endpoints. |
| Fixed 11-Step Middleware Sequence | Strictly linear in `backend/src/app.js`: helmet ➔ cors ➔ compression ➔ cookieParser ➔ morgan ➔ json ➔ urlencoded ➔ mongoSanitize ➔ rateLimiter ➔ /api/v1 ➔ 404 ➔ errorHandler. |
| MongoDB Exponential Backoff Reconnection | Retries on disconnect/failure with exponential delay (`1s ➔ 2s ➔ 4s ➔ 8s ➔ 16s ➔ 30s max` + 10% jitter) and Winston warning logs. |
| Deeply Frozen Environment Configurations | Both `backend/src/config/env.js` and `client/src/config/env.js` enforce immutable configuration via `Object.freeze()`. |
| Morgan Dual-Mode Request Logging | Colorized console output in development (`dev` format); piped to Winston daily rotating files in production with PII field masking. |
| 30-Day Daily Rotating Winston Logs | `combined-%DATE%.log` and `error-%DATE%.log` with 30-day retention, 20MB file cap, and gzip compression. |
| Sanitized `req.validated` Standard | Centralized `validate` middleware populates `req.validated = { body, params, query }` via `matchedData()`. Controllers never read raw `req.body/params/query`. |
| Universal Controller `asyncHandler` & Arrow Functions | All controllers wrapped in `asyncHandler` and written as arrow functions. Codebase-wide arrow function law strictly enforced. |
| Universal Form Fields `React.forwardRef` | All reusable inputs wrapped in `React.forwardRef` with explicit `displayName` for `react-hook-form` ref integration. |
| Unified `CustomError` Hierarchy | Domain subclasses inherit from `CustomError` with HTTP status code and details; formatted via centralized `errorHandler.js`. |
| 30-Day Sweeper Cron (`0 0 * * *` UTC) | Midnight UTC job purges soft-archived reports and branches older than 30 days, cascades clip deletion in transaction, and cleans up disk files. |
| Mutex-Protected RTK Query Re-Auth | `baseQueryWithReauth` in `client/src/features/api/apiSlice.js` serializes 401 token refresh requests using `async-mutex`. |


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
