# Progress Log: Master Specification

Use this file as the chronological record of work performed, files created, git actions, and phase status during the creation of the master specification.

## Session: 2026-09-18

### Phase 0: Specification Setup & Planning Initialization
- **Status:** complete
- **Started:** 2026-09-18T01:49:00+03:00
- **Completed:** 2026-09-18T01:51:00+03:00
- Actions taken:
  - Explored existing repository state, `.env` configurations, and skills.
  - Formulated 14-section specification structure in Plan Mode.
  - Incorporated full 15-point Decision Ledger and technical mandates from user.
  - User approved `implementation_plan.md` artifact.
  - Switched to Build Mode.
  - Created and checked out dedicated branch `phase-0-specification`.
  - Initialized `planning-with-files` structure: `task_plan.md`, `findings.md`, `progress.md`.
- Files created/modified:
  - `task_plan.md`
  - `findings.md`
  - `progress.md`

### Phase 1: Section 1 - System Vision, Operational Architecture & Constraints Registry
- **Status:** complete
- **Started:** 2026-09-18T01:57:00+03:00
- **Completed:** 2026-09-18T03:09:00+03:00
- Actions taken:
  - Aligned with user on application name "Report Builder".
  - Created `docs/specifications/master_specification.md` with complete, exhaustive Section 1 (Executive Summary, Supervisor Routine, Scope & The Never List, Engineering Constraints Registry).
  - Deepened Subsection 1.2.5 with complete ChatGPT/Gemini conversational architecture: multi-turn thread model, 3 navigation entry points (Sidebar Recent, Reports Card/List, Reports DataGrid), in-thread action icons (Agent: Copy & Retry; User: Copy & Edit with inline `MuiTextField` editor and Update button), and strict linear downstream message truncation on prompt Edit and agent Retry.
  - User reviewed and approved Section 1.
  - Staged, committed, and pushed Section 1 to `phase-0-specification`.
- Files created/modified:
  - `docs/specifications/master_specification.md`
  - `findings.md`
  - `task_plan.md`
  - `progress.md`

### Phase 2: Section 2 - User Persona, Authentication & Session Security
- **Status:** complete
- **Started:** 2026-09-18T03:10:00+03:00
- **Completed:** 2026-09-18T03:25:00+03:00
- Actions taken:
  - Aligned on avatar upload parameters (path `uploads/avatars/`, max 15MB single file, allowed types: jpeg, jpg, png, webp).
  - Appended complete, exhaustive Section 2 into `docs/specifications/master_specification.md` (User model & virtuals, registration/login anti-enumeration, raw Google OAuth 2.0 PKCE, dual httpOnly JWT architecture with family-based theft detection and sole TTL index, profile update `PATCH /api/v1/auth/profile`, password change, avatar upload/serving, and forbidden endpoints).
  - User reviewed and approved Section 2.
  - Staged, committed, and pushed Section 2 to `phase-0-specification`.
- Files created/modified:
  - `docs/specifications/master_specification.md`
  - `findings.md`
  - `task_plan.md`
  - `progress.md`

### Phase 3: Section 3 - Locked Plain-Text Amharic Report Engine & Formatting Rules
- **Status:** complete
- **Started:** 2026-09-18T03:33:00+03:00
- **Completed:** 2026-09-18T04:12:00+03:00
- Actions taken:
  - Formulated Section 3 specifications covering single-branch vs multi-branch plain-text layouts, Ethiopian `DD-MM-YY` dates, 24h times, and server-side deterministic assembly.
  - Formulated the 6 non-negotiable linguistic and cognitive guardrails: acoustic quality gate & clarification fallback, empty comments fallback (`በዕለቱ በብራንቹ የነበረው አጠቃላይ የስራ እንቅስቃሴ ደህና ነበር።`), first-person active voice for activities (`አረጋግጫለሁ`, `ተከታትያለሁ`), action-oriented impact-and-solution tone for issues, shorthand expansion engine (e.g. `ቼክሊስት`), and the `no_issue` invariant.
  - Appended complete Section 3 to `docs/specifications/master_specification.md` and activated TOC link.
  - User reviewed and approved Section 3.
  - Staged, committed, and pushed Section 3 to `phase-0-specification`.
- Files created/modified:
  - `docs/specifications/master_specification.md`
  - `findings.md`
  - `task_plan.md`
  - `progress.md`

### Phase 4: Section 4 - Domain Data Models, Schemas & Lifecycle Management
- **Status:** complete
- **Started:** 2026-09-18T05:14:00+03:00
- **Completed:** 2026-09-18T05:47:00+03:00
- Actions taken:
  - Addressed user feedback: added `normalizedName`, optional `phone`, and optional `address` to `Branch`; renamed `generatedReportText` to `generated` on `Report`; added `rawTranscript` and `audioFiles[]` to `Report`.
  - Formulated comprehensive schema definitions for all 8 application models (`User`, `Branch`, `Report`, `RefreshToken`, `Chat`, `Message`, `Preset`, `Glossary`).
  - Integrated multi-provider AI metadata (`provider`, `model`, `language`, `reasoning`, `tokensUsed`) across `Message` and `Report`.
  - Standardized provider enums to `['addis', 'google', 'nvidia']`.
  - Designed dynamic chat titling: report-context derived for `type: 'report'` and auto-generated from first prompt for `type: 'general'`.
  - Decoupled `Preset` prompt into `persona` and `systemPrompt`.
  - Defined two-tier deletion lifecycle (Tier 1 soft-archive, Tier 2 physical purge via 30-day `node-cron` daily midnight sweeper with audio file unlinking and cascade deletion).
  - Authored complete Section 4 into `docs/specifications/master_specification.md` and activated TOC link.
  - Refactored all 8 models to eliminate inline field-level indexes/uniqueness, centralizing all index declarations into `schema.index(...)`.
  - Updated `visits[]` subdocuments to use `clockIn` and `clockOut` for per-branch arrival/departure, decoupled from overall daily shift `clockIn`/`clockOut`.
  - Eliminated hardcoded AI provider and model defaults from schemas, enforcing dynamic injection via `config/env.js`.
  - User reviewed and approved Section 4.
  - Staged, committed, and pushed Section 4 to `phase-0-specification`.
- Files created/modified:
  - `docs/specifications/master_specification.md`
  - `findings.md`
  - `task_plan.md`
  - `progress.md`

### Phase 5: Section 5 - Chat, Message & Conversation Node Architecture
- **Status:** complete
- **Started:** 2026-09-18T05:50:00+03:00
- **Completed:** 2026-09-18T06:27:00+03:00
- Actions taken:
  - Formulated Section 5 specifications covering the dual conversation node taxonomy (`type: 'report'` active co-pilot vs `type: 'general'` operations analyst and personal assistant).
  - Defined the comprehensive 7-archetype catalog of General Chat user requests (cross-branch analytics, Google Sheets generation, management escalation memos, SOP guidance, financial calculations, glossary management, personal productivity).
  - Specified the live Google Sheets export pipeline (`export_to_google_sheet`) using Google OAuth tokens (`drive.file` scope) returning clickable edit URLs in chat.
  - Formulated mid-chat dynamic preset selection/creation (`MuiDialog` modal) and AI runtime configuration switching (`addis`, `google`, `nvidia`, model, language, reasoning).
  - Documented the 3 navigation entry points (Sidebar Recent, Reports Card/List, Reports DataGrid).
  - Documented linear downstream message truncation mechanics for prompt edits and agent retries.
  - Documented Mode 3 multi-modal voice notes and per-chat in-memory stream locking (HTTP 409 Conflict + abort control).
  - Appended complete Section 5 to `docs/specifications/master_specification.md` and activated TOC link.
  - User reviewed and approved Section 5.
  - Staged, committed, and pushed Section 5 to `phase-0-specification`.
- Files created/modified:
  - `docs/specifications/master_specification.md`
  - `findings.md`
  - `task_plan.md`
  - `progress.md`

## Session: 2026-09-20

### Section 4 & Section 5 Specification Refinement & Harmonization
- **Status:** complete
- **Started:** 2026-09-20T01:42:00+03:00
- **Completed:** 2026-09-20T02:30:00+03:00
- Actions taken:
  - Harmonized Section 4 Domain Data Models:
    - Added universal `toObject: { virtuals: true, transform: ... }` with `toJSON` across all schemas.
    - Standardized `Report.date` to UTC midnight `Date` with dynamic `ethiopianDate` Mongoose virtual (`gregorianToEthiopian(this.date)`).
    - Preserved single user-provided `name` + `normalizedName` on `Branch` (no `amharicName`).
    - Completely removed static `Glossary` Mongoose collection and CRUD; replaced with dynamic in-context few-shot learning (retrieving user's last 3–5 approved reports).
    - Preserved dedicated `RefreshToken` collection for RFC 6819 token family rotation, multi-device tracking, and native TTL cleanup.
    - Updated `Report` subdocument naming (`visitSchema`, `audioSchema`, `transcription`), compound index `{ user: 1, type: 1, date: -1 }`, and error tuples.
    - Updated `Chat` model with `isPinned: Boolean`, compound index `{ user: 1, isArchived: 1, isPinned: -1, updatedAt: -1 }`, deterministic 35-char word-wrapped title auto-derivation, and multi-branch titling.
    - Refactored `Message` schema with normalized `aiMetadata` subdocument (`durationMs`, `providerMetadata: Mixed`).
    - Added AI runtime execution parameters (`provider`, `model`, `language`, `reasoning`) to `Preset` schema.
  - Harmonized Section 5 Chat Architecture:
    - Added permanent Sidebar `[ + New Chat ]` button with 64px mini-rail adaptation.
    - Specified Chat View outlet layout with zero inner chat header, ensuring single header invariant under `AppShell`'s `MuiAppbar`.
    - Formulated Mode 3 Audio Orb dictation flow with in-composer inspection (Amharic text injected directly into `ChatComposerTextArea` for review/editing) and zero audio persistence.
    - Formulated complete 9-Point Edge-Case Defense Matrix for voice dictation.
  - Integrated 8 Active Review Refinements:
    - Added Centralized Constants Architecture mandate to Section 1.4 (`backend/utils/constants.js` and `client/src/utils/constants.js`).
    - Synchronized Section 2.3 `refreshTokenSchema` with descriptive error tuples, fields (`replacedByTokenHash`, `userAgent`, `ipAddress`), and `toObject`/`toJSON` transforms.
    - Specified RTK Query `baseQueryWithReauth` in `client/src/redux/features/apiSlice.js` with `credentials: 'include'`, async-mutex concurrency protection, infinite loop prevention on `/auth/refresh`, state purging, and direct redirect to `/login`.
    - Formalized multi-branch itinerary rules in Section 3 and Section 4.2.3: `visits[]` sorted chronologically by `clockIn`, primary branch membership without forced index 0, and shift boundary synchronization `report.clockIn === visits[0].clockIn`, `report.clockOut === visits[visits.length - 1].clockOut`.
    - Added pre-save lifecycle hook to `reportSchema` for automatic chronological visit sorting, primary branch validation, and shift clockIn/clockOut sync.
    - Standardized unified field naming: `Message.transcription`, `Message.aiMetadata.duration`, `Report.aiMetadata.duration`, and `Preset.system`.
    - Standardized symmetrical report detail route `/reports/:reportId/details` alongside `/reports/:reportId/edit`.
    - Integrated Mongoose ClientSession & Atomic Transaction Protocol across the specification:
      - Added Section 1.4.7 "Mongoose ClientSession & Atomic Transaction Architectural Law" mandating multi-document session boundaries, `{ session }` propagation, array syntax for `Model.create([payload], { session })`, middleware session inheritance via `this.$session()`, and prohibition of direct query updates (`Report.updateOne`, `Report.findOneAndUpdate`) in favor of Retrieve -> Mutate -> `report.save({ session })`.
      - Wrapped Section 1.2 dual document creation (Report + Chat) in `session.withTransaction(...)` to eliminate orphaned reports.
      - Updated Section 2.4.3 refresh token rotation and family revocation to execute within atomic transactions with array syntax.
      - Added Section 2.5.4 User Account Self-Service Deletion Protocol (`DELETE /api/v1/users/me`) specifying atomic 7-collection cascade deletion with `{ session }`.
      - Enhanced Section 4.2.3 `reportSchema.pre('save')` with session awareness documentation, `.session(this.$session())` requirement for async lookups, and retrieve-and-save invariant.
      - Updated Section 4.3 with cascading soft archive/restore and wrapped `sweeperJob.js` physical purge cascades in per-report atomic transactions.
      - Updated Section 5.5 downstream message truncation to execute within atomic transactions with `{ session }`.
    - Section 6 (Audio Pipeline, FFmpeg Preprocessing & Addis AI STT Engine) drafted and integrated into `master_specification.md`:
      - Detailed in-browser audio capture (MediaRecorder WebM/Opus with MP4 fallback, 120s countdown guardrail, silence detection).
      - Formalized tri-modal audio ingestion in Row 7 of 10-Row Form (Live mic Audio Orb, Paperclip browse, Drag-and-drop zone).
      - Structured client-side `audioQueue` with local mini-player preview (Method 1 in-memory Blob URL) and atomic multipart submission.
      - Specified Multer server-side ingress: strict 7-format MIME allowlist, 25MB limits, cryptographic random filename sanitization.
      - Specified FFmpeg normalization engine: dynamic binary resolution, `ffprobe` metadata probing, standardization to mono 16-bit 16kHz PCM WAV (`-ac 1 -ar 16000 -c:a pcm_s16le`).
      - Engineered silence-based segmentation filter (`silencedetect=noise=-30dB:d=0.5`) for clips >120s or >25MB to eliminate mid-word Amharic truncation.
      - Specified Addis AI STT synchronous integration with `AI_TIMEOUT_MS` bounding, 1s -> 2s -> 4s exponential backoff, and sequential transcript concatenation into `rawNarrationText`.
      - Detailed Mode 3 Ephemeral Voice Dictation with zero-persistence Express `finally` block unlinking and in-composer textarea cursor injection.
      - Detailed Mode 4 Chat Composer Audio Attachment flow with pre-send chip and multipart message ingestion.
      - Standardized on Method 1 (Authenticated Binary Fetch -> `URL.createObjectURL(blob)`) for all audio playback routes (`/reports/:reportId/clips/:clipId` and `/chats/:chatId/messages/:messageId/audio`), eliminating HTTP 206 Range bugs and Safari cookie-dropping.
      - User reviewed and confirmed Section 6 specification.
      - Committed Section 6 to `phase-0-specification`.
    - Section 7 (Agentic Reasoning, Multi-Tier Fallback & Gemini Runtime) drafted and integrated into `master_specification.md`:
      - Engineered Zero-DB-Table Dynamic Few-Shot Harvesting architecture: ingests supervisor's last 3–5 approved reports to dynamically extract workplace Ge'ez transliterations (`ዲፕ ፍራየር`, `ፒኦኤስ ማሽን`, `ቺለር`, etc.) and solution phrasing, injecting them into LLM system prompt with zero database migrations or static dictionary tables.
      - Defined complete Server Tool Execution Catalog across 11 tools (`query_operational_data`, `update_report_item`, `generate_operational_matrix`, `track_operational_trends`, `generate_executive_briefing`, `get_report_context` w/ multi-criteria lookup & disambiguation, `update_report`, `create_report` w/ atomic Report + 1:1 Chat creation, `list_branches`, `create_branch`, `export_report_to_google_docs`) with full JSON schemas, parameter types, Mongoose transaction wrappers, and operational workflows.
      - Mandated Date Attribution Invariant: every activity, issue, or opinion returned in multi-branch queries and matrices carries both Ethiopian Calendar (`DD-MM-YYYY ዓ.ም`) and Gregorian dates.
      - Formalized Bidirectional Chat Continuity Invariant (Universal Continuity Doctrine): Report Chat can query general multi-branch operational data without losing report context; General Chat can inspect, mutate, create, and export specific reports without leaving the conversation, rendering interactive deep-link Report Reference Cards.
      - Detailed Deterministic 3-Tier Fallback Chain: Tier 1 (Google Gemini 2.5 Flash / Flash Lite) -> Tier 2 (Addis AI `addis-1-alef`) -> Tier 3 (Nvidia NIM `meta/llama-3.1-nemotron-70b-instruct`) with backoff retries (1s -> 2s -> 4s), circuit breaking, and transparent client SSE fallback notification.
      - Standardized SSE Streaming Protocol with full event catalog (`text_delta`, `tool_call_start`, `tool_call_result`, `report_updated`, `provider_fallback`, `stream_end`, `error`) and 15s keep-alive heartbeat.
      - Engineered stream concurrency lock (`activeChatStreams` in-memory Map) with HTTP 409 rejection and clean interruption endpoint (`POST /chats/:chatId/abort`) utilizing `AbortController`.
      - Detailed context window pruning (sliding 10-message window + summary) and token budgeting for Gemini Free Tier rate limits (15 RPM / 1M TPM / 1500 RPD).
      - User reviewed and confirmed Section 7.
      - Committed Section 7 to `phase-0-specification` (`33477ef`).
    - Section 8 (Workplace Transliteration Engine & In-Context Phonetic Guidance) drafted and integrated into `master_specification.md`:
      - Detailed sociolinguistic failure modes in Ethiopian field operations (raw Latin leaks, literal translations like `ጥልቅ መጥበሻ`, spelling fragmentation).
      - Engineered Zero-DB-Table Dynamic Vocabulary Harvesting architecture: ingests last 4 approved reports to dynamically construct `<workplace_glossary>` XML injected into LLM system prompt.
      - Standardized canonical Ge'ez orthography mapping matrix across kitchen/restaurant equipment, IT/electrical hardware, and operations/inventory supplies.
      - Specified in-memory canonical homophone normalizer (`ሀ/ሐ/ኀ`, `ሰ/ሠ`, `አ/ዐ`, `ጸ/ፀ`) for search and text indexing resilience.
      - Specified two-tier zero-Latin guardrail: LLM system prompt directive + deterministic pre-save linter (`reportSchema.pre('save')` regex check `/[a-zA-Z]/`) with automated phonetic fallback.
      - Detailed in-composer real-time phonetic suggestion chips for QWERTY typing and Addis AI STT transliteration harmonization.
      - Formalized 4-stage organic learning lifecycle for novel technical words (detection & syllabic phonetics -> document persistence -> dynamic harvest loop -> user correction adaptation).
      - User reviewed and confirmed Section 8.
      - Committed Section 8 to `phase-0-specification` (`9eb67c2`).
    - Section 9 (Conversational Agent UI & MUI X Chat Integration) drafted and integrated into `master_specification.md`:
      - Engineered Single-Column `<ChatBox>` Canvas (`@mui/x-chat`): Assistant on Left (`#1E293B`, dark slate, avatar), User on Right (`#2563EB`, primary blue, avatar); prohibited 2-column desktop split views for chat.
      - Enforced 100% English App Shell (navigation, chrome, buttons, badges) vs Amharic/Mixed conversational content.
      - Formalized Direct Request/Response Interaction Model (zero `ChatConfirmation` approval dialogs).
      - Implemented Zero Inner Chat Header Architecture: Chat mounts directly into AppShell; `ChatBox` sets `features={{ conversationHeader: false, conversationList: false }}`; global sticky `AppBar` is sole header.
      - Standardized Ge'ez Typography: 17px default font size (`lineHeight: 1.75`, `Noto Sans Ethiopic`) with dynamic font scaling controls (`[ A- A+ ]` adjusting `fontSizeDelta` `-2`, `0`, `+2`, `+4` with localStorage persistence).
      - Engineered custom SSE streaming adapter (`createChatStreamAdapter`) mapping `POST /chats/:chatId/messages` stream to typed MUI X Chat events (`text_delta`, `tool_call_start`, `tool_call_result`, `report_updated`, `provider_fallback`, `stream_end`).
      - Detailed clean client stream abort protocol: stop button fires client abort and `POST /chats/:chatId/abort` to halt Gemini generation and release in-memory concurrency lock in <50ms.
      - Established Centered Composer (max-width 880px, sticky bottom) with sub-5ms typing latency guarantee via `React.memo` isolation and zero parent Redux churn.
      - Detailed Mode 3 Ephemeral Audio Dictation Flow (Audio Orb -> Addis AI STT -> cursor injection -> 0 disk files) with 9-point edge-case defense matrix.
      - Specified in-composer transliteration guidance chips (`chiller ➔ ቺለር [Convert]`) reinforcing 4-stage organic learning lifecycle.
      - Embedded in-stream interactive action triggers: `[ 📄 View Full Report ]`, `[ ✏️ Edit in Form ]`, `[ 📋 Copy Report Text ]`, dynamic multi-branch comparison matrices, and Google Sheets live export chips.
      - Detailed App Bar Preset Selector (`[ Preset: Operations Assistant ▾ ]`) and `[ + Create New Preset ]` modal with mid-chat dynamic persona switching.
      - Specified 10-Row Symmetrical Report Initiation Surface at `/reports/new` (2-column layout: structured form on left, sticky live Amharic plain-text preview on right; Rows 1–10 with Tri-Modal Audio Ingestion and Method 1 in-memory Client Blob audio player deck).
      - Documented cross-section implementation guardrails to prevent downstream developer errors in Sections 10–14.
- Files created/modified:
  - `docs/specifications/master_specification.md`
  - `findings.md`
  - `task_plan.md`
  - `progress.md`

### Section 9 Active Review & 10 Architectural Amendments
- **Status:** complete
- **Started:** 2026-09-20T17:40:00+03:00
- **Completed:** 2026-09-20T18:40:00+03:00
- Actions taken:
  - Reviewed Section 9 Conversational Agent UI with user in Plan Mode.
  - Re-anchored Plan Mode preservation principle: Plan Mode never wipes or overrides `implementation_plan.md`; only appends new items additively. Mode switching occurs strictly on user request/confirmation.
  - Formulated strict architectural separation between **Model Selector** (runtime LLM configuration popover/menu: Google/Addis/Nvidia, model, lang, reasoning with provider doc capabilities and default Google/Gemini/Amharic/max) and **Preset Selector** (MUI Dialog with `MuiEmptyState` and `react-hook-form` creation modal).
  - Confirmed STT Provider Invariance: Model Selector changes have zero impact on STT; STT is always and exclusively executed by Addis AI.
  - Established Universal Responsive Control Iconification Mandate: on `xs` (<600px), all text-labeled buttons and compound controls collapse into compact icon-only buttons (`MuiIconButton` wrapped in `MuiTooltip`) to eliminate overflow.
  - Cleaned up AppShell `MuiAppbar`: right side strictly limited to 3 controls (Global Search `[ 🔍 ]`, Theme Toggle `[ 🌓 ]`, User Avatar `[ 👤 ]`), completely removing bell notifications and font stepper buttons `[ A- A+ ]`.
  - Specified PublicLayout `MuiAppbar` right side: Theme Toggle, Login, Sign Up/Register.
  - Formalized Strict Public vs. Protected Route Boundaries: authenticated users are locked out of public routes (`/`, `/login`, `/register`) with immediate replace redirect to `/dashboard`.
  - Specified unified `BranchDialog` (`MuiDialog`) for both Create and Edit modes, eliminating dedicated `/branches/new` and `/branches/:branchId/edit` routes.
  - Formalized universal `react-hook-form` validation standard: `mode: 'onBlur'` with inline red `helperText` error rendering across all forms.
  - Specified consolidated `/profile` route replacing `/settings`, housing Profile details, Security, Preferences, and Danger Zone with dual navigation from AppBar and Sidebar.
  - Standardized universal input components under `client/src/components/reusable/*` (`MuiTextField`, `MuiSelect`, `MuiAutocomplete`, `MuiDatePicker`, `MuiTimePicker`) with mandatory Start and End Adornments.
  - Confirmed user self-service account deletion protocol (`DELETE /api/v1/users/me`) with 7-collection atomic transaction cascade, while forbidding third-party admin user deletion.
  - User reviewed, approved, and authorized transition to Build Mode.
  - Appended all 10 architectural amendments to `implementation_plan.md`.
  - Updated `findings.md`, `task_plan.md`, and `progress.md`.
- Files created/modified:
  - `implementation_plan.md`
  - `findings.md`
  - `task_plan.md`
  - `progress.md`
  - `docs/specifications/master_specification.md`

### Phase 10: Section 10 - Frontend Routing, Shell Layout & Component Matrix
- **Status:** complete
- **Started:** 2026-09-20T18:57:00+03:00
- **Completed:** 2026-09-20T19:47:00+03:00
- Actions taken:
  - Formulated complete Section 10 specification in Plan Mode with user.
  - Aligned on Option A Product Landing Page (`Landing.jsx`) with Hero section, 3 feature highlight cards, CTAs to `/register` and `/login`, and clean footer.
  - Formalized in-canvas report creation lifecycle: zero `/reports/new` page route; clicking "+ New Report" hides composer and renders 10-Row Form in `/chat` canvas; Cancel restores composer, Submit launches SSE streaming and renders report reference card in thread.
  - Symmetrized direct routes: `/reports/:reportId/details`, `/reports/:reportId/edit`, and `/branches/:branchId/details` link directly without redirect hops.
  - Specified `BranchDialog.jsx` (`MuiDialog`) as a reusable `react-hook-form` modal for both Create and Edit modes, eliminating `/branches/new` and `/branches/:branchId/edit`.
  - Detailed Global Search Dialog (`GlobalSearchDialog.jsx`): absolute edge-to-edge on `xs` and `sm-landscape`; centered modal on `sm+`; strict scroll isolation (only `DialogContent` scrolls); left arrow close button and clear end adornment.
  - Cataloged all 13 reusable UI components under `client/src/components/reusable/*` (`MuiAudioPlayer`, `MuiFileInput`, `MuiButton`, `MuiPageHeader`, `MuiConfirmDialog`, `MuiPagination`, `MuiTextField`, `MuiDataGrid`, `MuiRecorder`, `LoadingSpinner`, `MuiDialog` with standardized action buttons, `MuiSelect`, `MuiAutocomplete`, plus `Logo`).
  - Specified dedicated column schemas under `client/src/components/columns/*` (`branch.jsx`, `report.jsx`) with flex sizing and styled actions.
  - Formulated domain-based Redux architecture including `dashboardSlice` & `dashboardApi` in `client/src/features/*`.
  - Documented the Unstated Requirement Law: downstream agents must never assume or implement unstated requirements without explicit user confirmation.
  - Switched to Build Mode on explicit user instruction ("proceed -> don't commit").
  - Authored and appended complete Section 10 to `docs/specifications/master_specification.md` (now 5,619 lines).
  - Updated `task_plan.md`, `findings.md`, and `progress.md`.
- Files created/modified:
  - `docs/specifications/master_specification.md`
  - `findings.md`
  - `task_plan.md`
  - `progress.md`

### Phase 11: Section 11 - REST API Endpoint Inventory, Validation Chains & Response Envelopes
- **Status:** complete
- **Started:** 2026-09-20T20:13:00+03:00
- **Completed:** 2026-09-20T20:25:00+03:00
- Actions taken:
  - Harmonized specification invariants across Sections 1–10:
    - Removed `/reports/new` route references, standardizing on in-canvas 10-Row Form mounting inside `/chat`.
    - Removed bell notification and font stepper buttons `[ A- A+ ]` from `MuiAppbar` (toggle moved to sidebar header; font scaling moved to User Preferences in `/profile`).
    - Standardized `MuiAutocomplete.jsx` with lowercase 'c' per user decision.
    - Updated RTK Query path to `client/src/features/api/apiSlice.js`.
    - Activated Section 11 link in Master Specification Table of Contents.
  - Formulated, authored, and appended complete Section 11 (REST API Endpoint Inventory, Validation Chains & Response Envelopes) to `docs/specifications/master_specification.md` (6,782 total lines):
    - Specified standard three-key JSON envelope (`{ success, message, data }`), paginated list envelope (`mongoose-paginate-v2` with default page: 1, limit: 10, max: 100), and SSE streaming event envelopes (`text_delta`, `tool_call`, `report_card`, `done`, `error`).
    - Detailed centralized error pipeline (`next(error)` only; zero direct error responses) and immutable HTTP status code dictionary (`config/httpStatus.js`, zero numeric literals).
    - Specified rate limiting tiers (Health exempt, Auth 10 req/15min/IP, CRUD 300 req/15min/user, AI Stream burst 10 req/min, Ephemeral Audio 20 req/15min) and bilingual HTTP 429 response message.
    - Cataloged complete inventory of all 45 API endpoints across System, Auth, User Self-Service, Dashboard, Branches, Reports & Audio Clips, Chats & Messages, Mode 3 Audio, Presets, and Global Search.
    - Documented Forbidden Endpoints Registry prohibiting redundant auth checks, administrative user lists, external session inspectors, automated email/bot distribution, and translation/TTS endpoints.
    - Formulated Section 11 Invariants & Non-Negotiable Rules Table.
  - Updated `task_plan.md`, `findings.md`, and `progress.md`.
  - **STRICTLY PRESERVED UNCOMMITTED WORKING DIRECTORY** per user explicit command ("don't commit").
- Files created/modified:
  - `docs/specifications/master_specification.md`
  - `findings.md`
  - `task_plan.md`
  - `progress.md`

## 5-Question Reboot Check

| Question | Answer |
|---|---|
| Where am I? | Section 11 (REST API Endpoint Inventory, Validation Chains & Response Envelopes) completed and appended to `master_specification.md` in Build Mode. All changes left in working tree uncommitted per explicit user command ("don't commit"). |
| Where am I going? | Awaiting user review of Section 11 and instruction to switch to Plan Mode for Section 12 (Backend Infrastructure, Winston Logging & Sweeper Tasks). |
| What's the goal? | Complete, defect-free 14-section master specification for MERN Stack Agentic AI Report Builder on branch `phase-0-specification`. |
| What have I learned? | Strict adherence to `{ success, message, data }` and `mongoose-paginate-v2` with `httpStatus.js` imports guarantees contract uniformity across all 45 endpoints; in-memory audio dictation via `POST /api/v1/audio/transcribe` ensures zero server disk storage; explicit forbidden endpoint registry blocks architectural creep. |
| What have I done? | Harmonized legacy mismatches in Sections 1–10; authored Section 11 in `master_specification.md` (lines 5619–6782); updated `task_plan.md`, `findings.md`, and `progress.md`; kept changes uncommitted. |

