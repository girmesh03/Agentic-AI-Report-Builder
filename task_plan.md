# Task Plan: Master Specification - MERN Stack Agentic AI Report Builder

Use this file as the durable roadmap for creating the complete, exhaustive specification for the MERN Stack Agentic AI Report Builder.

## Goal

Produce a comprehensive, unambiguous 14-section master specification for a MERN Stack Agentic AI Report Builder that an AI can use for complete, defect-free end-to-end implementation with zero unstated assumptions.

## Next Step

Switch mode to Plan Mode for Phase 5: Section 5 - Chat, Message & Conversation Node Architecture.

## Current Phase

Phase 5: Section 5 - Chat, Message & Conversation Node Architecture

## Phases

### Phase 1: Section 1 - System Vision, Operational Architecture & Constraints Registry
- [x] Detail product philosophy, supervisor workflow, Amharic-first domain, and delivery model
- [x] Document strict scope boundaries and architecture constraints
- [x] Write complete Section 1 to `docs/specifications/master_specification.md`
- [x] User review and confirmation of Section 1
- [x] Commit Section 1 to `phase-0-specification`
- **Status:** complete

### Phase 2: Section 2 - User Persona, Authentication & Session Security
- [x] Detail Email+Password and Google OAuth raw flow (state + PKCE)
- [x] Detail User entity, automatic name derivation from email, and virtuals
- [x] Detail dual JWT httpOnly cookie architecture, RefreshToken rotation, reuse detection, and session rules
- [x] Write complete Section 2 to `docs/specifications/master_specification.md`
- [x] User review and confirmation of Section 2
- [x] Commit Section 2 to `phase-0-specification`
- **Status:** complete

### Phase 3: Section 3 - Locked Plain-Text Amharic Report Engine & Formatting Rules
- [x] Detail exact Amharic plain-text layout for single-branch and multi-branch visits
- [x] Detail Ethiopian date (`DD-MM-YY`), 24h times (`HH:mm`), headers, bullets, and footer lines
- [x] Detail rule for `no_issue` bullet and hidden internal statuses
- [x] Detail the six linguistic guardrails (acoustic quality gate, first-person activities, impact-and-solution issues, comments fallback, shorthand expansion, no_issue)
- [x] Write complete Section 3 to `docs/specifications/master_specification.md`
- [x] User review and confirmation of Section 3
- [x] Commit Section 3 to `phase-0-specification`
- **Status:** complete

### Phase 4: Section 4 - Domain Data Models, Schemas & Lifecycle Management
- [x] Detail User, Branch, Report, RefreshToken, Chat, Message, Preset, and Glossary Mongoose schemas
- [x] Detail indexes, compound uniqueness, validations, virtuals, JSON transforms (stripping `id` and `__v`)
- [x] Detail soft-delete lifecycle (`isArchived`, `archivedAt`) and 30-day cron sweeper with audio unlinking
- [x] Review in Plan Mode with user
- [x] Write complete Section 4 to `docs/specifications/master_specification.md`
- [x] User review and confirmation of Section 4
- [x] Commit Section 4 to `phase-0-specification`
- **Status:** complete

### Phase 5: Section 5 - Chat, Message & Conversation Node Architecture
- [ ] Detail Chat and Message schemas (`report` vs `free` types, autoTitle, presets, refs)
- [ ] Detail unique index (one conversation node per report)
- [ ] Detail message threading and attachment references
- [ ] Review in Plan Mode with user
- [ ] Output specification content in Build Mode and commit
- **Status:** pending

### Phase 6: Section 6 - Audio Pipeline, FFmpeg Preprocessing & Addis AI STT Engine
- [ ] Detail MediaRecorder browser capture (WebM/Opus with MP4 fallback)
- [ ] Detail Multer ingestion rules (25MB/file, max 10 files, MIME allowlist)
- [ ] Detail FFmpeg normalization to mono 16-bit 16kHz PCM and chunking (>120s / >25MB)
- [ ] Detail Addis AI STT SDK integration, synchronous execution, error handling, and retries
- [ ] Detail ephemeral Mode 3 clip handling and Blob URL playback
- [ ] Review in Plan Mode with user
- [ ] Output specification content in Build Mode and commit
- **Status:** pending

### Phase 7: Section 7 - Agentic Reasoning, Multi-Tier Fallback & Gemini Runtime
- [ ] Detail prompt architecture (System, Persona, zero-shot/few-shot in Amharic)
- [ ] Detail server-executed tool contracts (`get_report_context`, `update_report`, `list_branches`, `create_branch`, `get_glossary`)
- [ ] Detail streaming token-by-token loop with per-chat concurrency lock
- [ ] Detail fallback chain: addis -> gemini -> nvidia with exponential backoff and 502 exhaustion
- [ ] Detail Presets model and per-user daily AI quota tracking
- [ ] Review in Plan Mode with user
- [ ] Output specification content in Build Mode and commit
- **Status:** pending

### Phase 8: Section 8 - Workplace Transliteration Engine & Per-User Glossary
- [ ] Detail Glossary schema and default seeded restaurant/technical equipment terms
- [ ] Detail phonetic Ge'ez transliteration rules (e.g. `deep fryer` -> `ዲፕ ፍራየር`)
- [ ] Detail agent prompt enforcement (zero raw Latin in report body)
- [ ] Review in Plan Mode with user
- [ ] Output specification content in Build Mode and commit
- **Status:** pending

### Phase 9: Section 9 - Conversational Agent UI & MUI X Chat Integration
- [ ] Detail MUI X Chat `ChatBox` configuration, centered composer, and free chat
- [ ] Detail custom `sendMessage` streaming adapter (ReadableStream of typed chunks)
- [ ] Detail 10-row report initiation form with Ethiopian date picker, branch autocomplete, time pickers, audio orb, and narration cards
- [ ] Review in Plan Mode with user
- [ ] Output specification content in Build Mode and commit
- **Status:** pending

### Phase 10: Section 10 - Frontend Routing, Shell Layout & Component Matrix
- [ ] Detail `main.jsx` route configuration with `PublicRoute`, `ProtectedRoute`, and lazy `Component` loading
- [ ] Detail `App.jsx`, `AppTheme`, `AppErrorBoundary`, `AppToastContainer`
- [ ] Detail `MuiAppbar` (fixed in PublicLayout, sticky in AppShell) and `Logo.jsx`
- [ ] Detail responsive `AppShell` (mini/temporary sidebar, Recent chats, User menu, Global Search Dialog)
- [ ] Detail Dashboard KPI cards and 4 charts (`@mui/x-charts`)
- [ ] Detail Branches and Reports pages (`MuiDataGrid`, filter drawer, pagination)
- [ ] Detail BranchDetail, ReportDetail (text copy, .txt download, print-PDF, Google Docs export), and Settings tabs
- [ ] Review in Plan Mode with user
- [ ] Output specification content in Build Mode and commit
- **Status:** pending

### Phase 11: Section 11 - REST API Endpoint Inventory, Validation Chains & Envelopes
- [ ] Detail all `/api/v1/*` route definitions, HTTP methods, controllers, and services
- [ ] Detail `express-validator` rule chains and 422 `{ details: [{ field, message }] }` responses
- [ ] Detail `{ success, message, data }` and paginated envelopes
- [ ] Detail centralized error handling and `httpStatus.js` usage
- [ ] Review in Plan Mode with user
- [ ] Output specification content in Build Mode and commit
- **Status:** pending

### Phase 12: Section 12 - Backend Infrastructure, Winston Logging & Sweeper Tasks
- [ ] Detail fixed middleware order in `app.js` (helmet -> cors -> compression -> cookie-parser -> express.json -> express-mongo-sanitize -> rate-limit)
- [ ] Detail Winston logging with daily rotation, 30-day retention, and environment log levels
- [ ] Detail `node-cron` 30-day archived items sweeper
- [ ] Detail native fetch `apiClient` with `credentials: 'include'`, token refresh retry, and `features/apiSlice.js`
- [ ] Review in Plan Mode with user
- [ ] Output specification content in Build Mode and commit
- **Status:** pending

### Phase 13: Section 13 - Verification Protocols, Quality Gates & Zero-Error Checklists
- [ ] Detail `node --check` backend validation
- [ ] Detail `npx vite build` zero-error requirement with post-build `dist/*` cleanup
- [ ] Detail code hygiene checklists (no unused imports, vars, params, missing JSDoc, magic numbers, or deprecated props)
- [ ] Detail phase commit protocol (`feat: phase N description` / `chore: phase N description`)
- [ ] Review in Plan Mode with user
- [ ] Output specification content in Build Mode and commit
- **Status:** pending

### Phase 14: Section 14 - Deployment, Environment Variables, Locked Dependencies & Execution Roadmap
- [ ] Detail `config/env.js` and `backend/.env` variable definitions
- [ ] Detail locked backend runtime and dev dependencies
- [ ] Detail locked frontend runtime dependencies
- [ ] Detail complete project directory tree layout (`backend/` and `client/`)
- [ ] Detail execution sequence for downstream builder AI
- [ ] Review in Plan Mode with user
- [ ] Output specification content in Build Mode and commit
- **Status:** pending

## Key Decisions Made

| Decision | Rationale |
|---|---|
| Pure JavaScript (ES Modules backend, React+Vite frontend) | User mandate: Never use TypeScript, Next.js, or Remix. |
| Vanilla MUI (`sx` and `styled`) Community edition | User mandate: Never use Tailwind; tree-shaken single imports. |
| Addis AI for STT, Gemini Free Tier for LLM | User mandate: Addis AI mandatory for STT; free AI tier without credit card. |
| Locked Plain-Text Amharic Report Format | User mandate: Fixed format, zero markdown syntax, strict Ethiopian date and 24h clock. |
| Dual httpOnly JWT Cookie Authentication | User mandate: 15m access, 7d refresh, RefreshToken rotation with reuse detection, no server session store. |
| Single User Scope | User mandate: No RBAC, no org multi-tenancy, every entity scoped to `req.user._id.toString()`. |
| Branch `phase-0-specification` | User mandate: Feature branches named `phase-N-description`, specification created on single dedicated branch. |

## Errors Encountered

| Error | Attempt | Resolution |
|---|---|---|
| None | 1 | N/A |

## Notes

- Work proceeds section-by-section.
- Each section is detailed in Plan Mode until user confirmation, then output in Build Mode and committed.
- Never commit directly to `main` and never merge.
