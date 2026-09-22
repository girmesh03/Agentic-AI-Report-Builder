# Task Plan: Master Specification - MERN Stack Agentic AI Report Builder

Use this file as the durable roadmap for creating the complete, exhaustive specification for the MERN Stack Agentic AI Report Builder.

## Goal

Produce a comprehensive, unambiguous 14-section master specification for a MERN Stack Agentic AI Report Builder that an AI can use for complete, defect-free end-to-end implementation with zero unstated assumptions.

## Next Step

Awaiting user review and confirmation of Phase 5 comprehensive implementation plan.

## Current Phase

Phase 5: Audio Pipeline, Addis AI STT & Multi-Modal Dictation (Exhaustive Analysis & Planning)

## Implementation Phases (9 Full-Stack Vertical Slices)

### Phase 1: Foundation, Monorepo Scaffolding & Option A Landing Page
- [x] Step 1 (Pre-Git): Verify clean tree on main, check branch tracking, pull main, checkout `phase-1-foundation-scaffolding`
- [x] Step 2 (Deep Codebase Analysis): Review Section 14 monorepo architecture, pre-scaffolded client assets, dependencies, and backend pipeline
- [x] Step 3 (Execution & Validation):
  - [x] Create root `package.json` with npm workspaces (`backend`, `client`) and `concurrently`
  - [x] Initialize `backend/package.json` with locked dependencies
  - [x] Initialize `backend/scripts/verifyCodebase.js` and `backend/scripts/killPort.js`
  - [x] Implement backend core infrastructure: `server.js`, `app.js` (11-step pipeline), `config/env.js` (frozen), `config/db.js` (exponential backoff), `config/logger.js` (Winston 30d), `config/httpStatus.js` (frozen)
  - [x] Implement backend error hierarchy: `errors/CustomError.js`, `errors/index.js`, `middlewares/errorHandler.js`
  - [x] Implement backend middleware: `middlewares/requestLogger.js` (Morgan/Winston), `middlewares/rateLimiter.js`
  - [x] Implement initial health route: `routes/index.js` (`GET /health`, `GET /api/v1/health`)
  - [x] Install backend dependencies via npm
  - [x] Update `client/package.json` with locked dependencies
  - [x] Create `client/scripts/cleanDist.js`
  - [x] Update `client/vite.config.js` (`strictPort: true`)
  - [x] Install client dependencies via npm
  - [x] Implement `client/src/config/env.js` (frozen)
  - [x] Implement `client/src/theme/typography.js` (Noto Sans Ethiopic 17px, 1.75 line-height) and `client/src/theme/AppTheme.jsx`
  - [x] Implement `client/src/components/reusable/Logo.jsx` and `client/src/components/reusable/MuiButton.jsx`
  - [x] Implement `client/src/layouts/PublicLayout.jsx` with AppBar (Theme toggle, Login, Sign Up) and `<Outlet />`
  - [x] Implement Option A `client/src/pages/Landing.jsx` with Hero section (using `hero.png`), 3 highlight cards, and responsive typography
  - [x] Configure `client/src/routes/router.jsx` and `client/src/App.jsx`
  - [x] Verify backend: `node scripts/verifyCodebase.js`
  - [x] Verify client build & cleanup: `npm run verify --workspace=client`
  - [x] Launch application and conduct Mandatory Browser Control Session (audit visual polish, responsive `xs`/`sm`/`md+`, 0 console errors)
  - [x] Align entire `client/src/*` with newly introduced `client/src/theme/*` setup (remediate datePickers & charts import bugs, enforce universal small sizing & JSDoc, update layouts & pages)
- [x] Step 4 (User Review & Approval): Present walkthrough, update planning files, user confirmed and commanded merge to main
- [x] Step 5 (Post-Git Merge & Cleanup): Stage, commit, push, merge to main, delete feature branch
- [x] Post-Merge Invariant 13 & Vite/Rolldown Remediation: Restored user's 9 devDependencies in `client/package.json`, resolved `Missing field moduleType` pre-transform error by terminating orphaned Vite 6 process (PID 5020) and hoisting Vite 8, eliminated shadowed `react@19` from `client/node_modules/`, resolved fast-refresh component export boundary in `theme/useThemeMode.js`, verified clean ESLint and `npm run verify` pass
- **Status:** complete

### Phase 2: Authentication, Session Security & Consolidated Profile
- [x] Step 1 (Pre-Git): Clean tree check, checkout `phase-2-authentication-session-profile`
- [x] Step 2 (Deep Codebase Analysis): Review Sections 2, 4, 10, 11, 14 requirements, session rotation, dual cookies, and profile tabs
- [x] Step 3 (Phase Execution & Validation):
  - [x] Backend: User & RefreshToken models, auth/user services & controllers, dual httpOnly cookies, family token rotation with theft detection, account cascade deletion, 13/13 native integration tests passed (`testAuth.js`)
  - [x] Frontend: Redux store, `apiSlice.js` (with mutex reauth), `authSlice.js`, `authApi.js`, `PublicRoute`, `ProtectedRoute`, `LoginForm.jsx`, `RegisterForm.jsx`, `Login.jsx` (< 35 lines), `Register.jsx` (< 35 lines), `Sidebar.jsx`, `MuiAppbar.jsx`, `AppShell.jsx` (isolated scroll), `WelcomeBanner.jsx`, `Dashboard.jsx` (< 35 lines), `ProfileInfoTab.jsx`, `SecurityTab.jsx`, `PreferencesTab.jsx`, `DangerZoneTab.jsx`, `Profile.jsx` (< 35 lines), router.jsx, App.jsx
  - [x] Codebase-Wide 12-Point Remediation:
    - [x] 1. Root logs/uploads elimination via `fileURLToPath(import.meta.url)` absolute anchoring and updated `.gitignore`
    - [x] 2. Redux architecture consolidation to `client/src/redux/app/*` and `client/src/redux/features/*`, aligning all imports and Master Spec sections 2.4.5, 10.9, 10.10, 12.11, 14.4, 14.5
    - [x] 3. `normalizeResult(result)` returning result directly in `apiSlice.js` conforming to Section 2.7 / Section 12.11.1
    - [x] 4. `'Dashboard'` tag added to `apiSlice.js` and invalidation added to `authApi.js`
    - [x] 5. Modern MUI v6 `slotProps={{ paper: ... }}` and `slotProps={{ input: ..., formHelperText: ... }}` in `MuiConfirmDialog.jsx` and `MuiTextField.jsx`
    - [x] 6. `MuiButton.jsx` overhaul: `disabled={disabled || loading}`, consistent loading spinner, zero layout shift or icon jumping, span wrap for Tooltip
    - [x] 7. Centralized `backend/src/utils/constants.js` and `client/src/utils/constants.js` with full JSDoc and zero magic strings
    - [x] 8. Accessibility enhancements: `disableEnforceFocus` & `disableRestoreFocus` on modals and menus
    - [x] 9. User profile menu parity in `Sidebar.jsx` footer matching `MuiAppbar.jsx`
    - [x] 10. `MuiAppbar.jsx` sidebar hamburger toggle visible only on `< md` (`xs`, `sm`)
    - [x] 11. Tooltip disabled child bug resolved codebase-wide with `<Box component="span" sx={{ display: 'inline-flex' }}>`
    - [x] 12. Dedicated `RootHydrateFallback.jsx` integrated into `router.jsx` satisfying React Router v7 and `react-refresh/only-export-components`
  - [x] Token Refresh & Session Bootstrapping Resolution:
    - [x] Eliminated `resetApiState()` from `baseQueryWithReauth` in `client/src/redux/features/api/apiSlice.js` (per Spec 12.11.1), eliminating RTK Query mounted query hook subscription wipe re-trigger loop
    - [x] Added `skip: isInitialized` to `useGetProfileQuery` in `client/src/App.jsx`, guaranteeing profile bootstrap runs strictly once on cold boot
    - [x] Guarded `baseQueryWithReauth` against superfluous `/auth/refresh` attempts when user state is already known unauthenticated (`isInitialized && !isAuthenticated`)
    - [x] Synchronized Redux `authSlice` user credentials upon successful token refresh (`POST /auth/refresh` 200)
    - [x] Verified in live Chrome DevTools: exactly one 401 error is logged upon expired request, followed by successful refresh and retried query; exactly 2 requests on unauthenticated boot with 0 loops and 0 rate limits
    - [x] Monorepo verification: `npm run verify` passed 100% (29 backend files, 1,513 client modules transformed, 0 syntax/build errors, dist cleaned)
    - [x] ESLint: 0 errors, 0 warnings across client codebase
    - [x] 13/13 native integration tests passed on live backend (`node backend/scripts/testAuth.js`)
    - [x] Scratch test suite passed: `testBaseQueryWithReauth.js`
    - [x] Ports 3000 and 4000 verified clean, 0 background tasks running
  - [x] Phase 2 UI Enhancements, Accessibility & Profile Overhaul:
    - [x] 1. Profile Page UI Overhaul:
      - [x] Extracted `ProfileContainer.jsx` with Breadcrumbs ("Dashboard / Profile"), Header, subtitle, and modern `Paper` framing
      - [x] Decomposed and kept `Profile.jsx` lean (< 25 lines) satisfying Invariant 9
      - [x] `ProfileInfoTab.jsx`: Identity hero banner with 80px avatar, hover camera button, role chip, active badge, and responsive 2-column grid
      - [x] `SecurityTab.jsx`: Security policy guidance banner, current/new/confirm password inputs with visibility toggles, and live password criteria checklist tracker (8+ chars, uppercase, lowercase, number)
      - [x] `PreferencesTab.jsx`: Interactive modern visual theme cards (Light Mode, Dark Mode, System Default) with active highlight; excluded shift hours per user directive
      - [x] `DangerZoneTab.jsx`: Refined outlined subtle red card with 1px border, 7-collection atomic cascade checklist, and `MuiConfirmDialog` with DELETE sentinel input
    - [x] 2. Sidebar Bottom User Menu Triggers:
      - [x] In expanded mode: renders avatar + text (name/role) + 3-dot `IconButton` (`MoreVertIcon`) on the right; menu opens ONLY when the 3-dot button is clicked
      - [x] In mini mode: renders avatar + 3-dot button; menu opens when either mini avatar or mini 3-dot is clicked
    - [x] 3. Mini Sidebar Expand Mechanism:
      - [x] When sidebar is collapsed to mini-rail (64px), header renders `ChevronRightIcon` ONLY (with tooltip "Expand sidebar") to expand back to 240px
    - [x] 4. Deprecated MUI Props Eradication:
      - [x] Eradicated `primaryTypographyProps` codebase-wide (replaced with `slotProps={{ primary: ... }}` in `Sidebar.jsx`, `MuiAppbar.jsx`, and `DangerZoneTab.jsx`)
      - [x] Eradicated `InputProps` and `FormHelperTextProps` (replaced with `slotProps.input` and `slotProps.formHelperText` in `MuiTextField.jsx`)
      - [x] Confirmed 0 deprecated props (`InputProps`, `FormHelperTextProps`, `TypographyProps`, `PaperProps`, `BackdropProps`, `MenuProps`) in `client/src`
    - [x] 5. Placeholder Pages with `MuiEmptyState`:
      - [x] Created reusable `MuiEmptyState.jsx` per Master Spec Section 14.4
      - [x] Created `Branches.jsx`, `Reports.jsx`, and `Chat.jsx` (< 35 lines) directly reusing `<MuiEmptyState />`
      - [x] Registered routes in `router.jsx` preventing 404 navigation errors
    - [x] 6. Accessibility `aria-hidden` Focus Warning Eradication:
      - [x] Added `event.currentTarget.blur()` on user menu trigger clicks in `Sidebar.jsx` and `MuiAppbar.jsx`
      - [x] Added `autoFocus={true}` and `disableRestoreFocus={false}` on `Menu` components
      - [x] Verified in live Chrome DevTools: 0 `aria-hidden` warnings or console errors upon opening user menu
    - [x] 7. Disabled Button Contrast & Form Submit Accessibility Resolution:
      - [x] Enhanced theme palette `text.disabled`, `action.disabled`, and `action.disabledBackground` in `themePrimitives.js`
      - [x] Injected high-contrast disabled overrides for contained (`color: rgba(255, 255, 255, 0.9) !important`), outlined, and text buttons in `inputs.js` and `MuiButton.jsx`
      - [x] Overrode `MuiOutlinedInput` disabled styling to preserve `-webkit-text-fill-color: text.primary !important`
      - [x] Updated `ProfileInfoTab.jsx` and `SecurityTab.jsx` submit buttons to remain enabled on initial page load, disabling only during active async network mutations
      - [x] Compacted vertical padding and card spacing across Profile views to comfortably fit standard viewports
    - [x] 8. Profile Tab Centering Resolution (`SecurityTab`, `PreferencesTab`, `DangerZoneTab`):
      - [x] Wrapped `SecurityTab` in `<Box sx={{ maxWidth: 560, mx: 'auto' }}>` with `width: '100%'` form, eliminating asymmetric right empty space
      - [x] Wrapped `PreferencesTab` in `<Box sx={{ maxWidth: 560, mx: 'auto' }}>` with `width: '100%'` theme cards, centering title and cards
      - [x] Wrapped `DangerZoneTab` in `<Box sx={{ maxWidth: 600, mx: 'auto' }}>` with `width: '100%'` card, centering title and danger zone
      - [x] Verified in live Chrome: exactly equal left and right margins (145px/145px and 125px/125px)
    - [x] 9. Sidebar Active Nav Item Primary Accent Color Alignment:
      - [x] Replaced generic gray `action.selected` background with theme primary accent blue (`alpha(primary.main, 0.1)` light, `0.2` dark) with `!important`
      - [x] Enforced 3px solid primary border, primary icon, primary text, and primary hover background
      - [x] Verified in live Chrome: computed styles confirm `backgroundColor: rgba(19, 91, 236, 0.2)` and `borderLeftColor: rgb(19, 91, 236)`
    - [x] 10. Complete `aria-hidden` Eradication on Menu Outside Clicks:
      - [x] Added `document.activeElement.blur()` to both `handleMenuClose` (`MuiAppbar.jsx`) and `handleCloseUserMenu` (`Sidebar.jsx`)
      - [x] Set `autoFocus={false}`, `disableAutoFocusItem={true}`, and `disableRestoreFocus={true}` on both `Menu` instances
      - [x] Verified in live Chrome: 0 `aria-hidden` console warnings across multiple open and outside-click stress tests
- [x] Step 4 (User Review & Explicit Approval): Present walkthrough, obtain user confirmation
- [x] Step 5 (Post-Git Merge & Cleanup): Stage, commit, push, merge to main, delete feature branch
- **Status:** complete

### Phase 3: Branch Management & Reusable BranchDialog
- [x] Step 1 (Pre-Git): Clean tree check, checkout `phase-3-branch-management`
- [x] Step 2 (Deep Codebase Analysis): Exhaustive analysis of Master Spec (Sections 3, 10, 11, 13, 14), Invariants, and design constraints
- [x] Step 3 (Phase Execution & Validation):
  - [x] Pure Community Version `@mui/x-data-grid` (zero Pro/Premium features)
  - [x] Agnostic generic `MuiDataGrid.jsx` with external slots and slotProps passthrough
  - [x] Standalone reusable `MuiDataGridToolbar.jsx` with quick search, clear button, columns selector, density toggle, and page-injected actions
  - [x] Page-level empty overlay `BranchEmptyOverlay.jsx` wrapping canonical `MuiEmptyState.jsx`
  - [x] Standalone reusable `MuiDialog.jsx` modal container
  - [x] Pure flex column schema `client/src/components/columns/branch.jsx`
  - [x] Responsive card component `client/src/components/branches/BranchCard.jsx`
  - [x] Unified `BranchDialog.jsx` for Create and Edit with `react-hook-form` (`mode: 'onBlur'`), Ethiopian phone regex (`+2519...`), and 409 Conflict duplicate name error handler
  - [x] Domain containers: `BranchContainer.jsx` (table/card views, tabs, search, pagination, dialogs) and `BranchDetailContainer.jsx`
  - [x] Lean orchestrator pages: `Branches.jsx` (19 lines) and `BranchDetail.jsx` (19 lines) strictly conforming to Invariant 9 (< 35 lines)
  - [x] Redux domain state: `branchSlice.js`, `branchApi.js` (with `['Branch', 'Dashboard']` tag invalidation), and `rootReducer.js`
  - [x] Backend architecture: `Branch.js` (compound unique index `{ user: 1, normalizedName: 1 }`, soft-archive, pagination), `branchValidator.js`, `branchService.js`, `branchController.js`, `branchRoutes.js`
  - [x] Automated integration test suite: `backend/scripts/testBranches.js` (18/18 tests passed 100%)
  - [x] Full monorepo verify: `npm run verify` passed 100% (34 backend files in 3168ms, 1,570 client modules built in 10.96s, 0 errors, dist cleaned)
  - [x] ESLint: 0 errors across all Phase 3 files
  - [x] Live Chrome DevTools Browser Testing: Verified table view, card view, branch creation, duplicate name collision prevention, address edit, detail page navigation, archive confirmation dialog, empty state overlay, archived tab inspection, restore workflow, mobile responsive (390px, 0px overflow), and 0 console errors
  - [x] Defensive shutdown: Terminated all background daemons; ports 3000 & 4000 100% free
- [x] Step 4 (User Review & Explicit Approval): Present walkthrough, obtain user confirmation
- [x] Step 5 (Post-Git Merge & Cleanup): Stage, commit, push, merge to main, delete feature branch
- **Status:** complete

### Phase 4: Amharic Report Engine & In-Canvas 10-Row Form
- [x] Step 1 (Pre-Git): Verify clean tree on main, checkout `phase-4-amharic-report-engine`
- [x] Step 2 (Deep Codebase Analysis): Review Master Spec Sections 1.4.7, 3, 4.2.3, 8.4, 9.7, 10, 11, 12, 13, 14
- [x] Step 3 (Execution & Validation):
  - [x] Backend Utilities & Services:
    - [x] `backend/src/utils/ethiopianDate.js` (bidirectional calendar converter)
    - [x] `backend/src/utils/amharicNormalizer.js` (homophone normalization & zero-Latin linter)
    - [x] `backend/src/services/reportFormatter.js` (deterministic plain-text synthesis engine)
  - [x] Backend Data Layer:
    - [x] `backend/src/models/Report.js` (Mongoose schema with visits, activities, issues, indexes, pre-save hook)
    - [x] `backend/src/models/Chat.js` (Mongoose Chat model for atomic 1:1 chat instantiation)
  - [x] Backend API:
    - [x] `backend/src/validators/reportValidator.js`
    - [x] `backend/src/services/reportService.js` (atomic creation inside ClientSession transaction)
    - [x] `backend/src/controllers/reportController.js`
    - [x] `backend/src/routes/reportRoutes.js`
    - [x] Mount reportRoutes in `backend/src/routes/index.js`
    - [x] Integration test suite: `backend/scripts/testReports.js` (8/8 passed 100%)
  - [x] Frontend Utilities & Redux:
    - [x] `client/src/utils/ethiopianDate.js`
    - [x] `client/src/utils/reportFormatter.js`
    - [x] `client/src/redux/features/reports/reportSlice.js`
    - [x] `client/src/redux/features/reports/reportApi.js`
    - [x] Register `reports` in `client/src/redux/app/rootReducer.js`
  - [x] Frontend Components & UI:
    - [x] `client/src/components/reports/VisitDialog.jsx`
    - [x] `client/src/components/reports/ReportForm.jsx` (Rows 1–10)
    - [x] `client/src/components/reports/ReportLivePreview.jsx` (sticky plain-text Amharic card)
    - [x] `client/src/components/reports/ReportFormContainer.jsx` (symmetrical 2-column layout)
    - [x] `client/src/components/chat/ChatComposer.jsx` (centered composer with `[ + New Report ]`)
    - [x] `client/src/components/chat/ChatContainer.jsx` (orchestrates form mounting vs chat view)
    - [x] `client/src/pages/Chat.jsx` (lean orchestrator < 35 lines)
  - [x] Monorepo Build & Browser Verification:
    - [x] Verify backend static syntax compilation (`node backend/scripts/verifyCodebase.js`: 43 files passed)
    - [x] Verify client production build (`npm run verify`: 1,586 modules transformed, passed 100%)
    - [x] Run backend integration suite (`testReports.js`: 8/8 passed 100%)
    - [x] Run ESLint across codebase (0 errors)
    - [x] Live Chrome browser testing (form mounting, live Amharic preview sync, modal save, cancel dialog, submission, mobile responsive 390px, 0 console errors)
    - [x] Defensive shutdown (ports 3000/4000 free, 0 background tasks)
- [x] Step 4 (User Review & Explicit Approval): Present walkthrough, obtain user confirmation
- [x] Step 5 (Post-Git Merge & Cleanup): Stage, commit, push, merge to main, delete feature branch
- **Status:** complete

### Phase 5: Audio Pipeline, Addis AI STT & Multi-Modal Dictation
- [ ] Backend: FFmpeg mono 16kHz WAV pipeline, `addisai` SDK, audio clip upload, ephemeral transcription
- [ ] Frontend: Web Audio API recording orb, 120s timer, in-memory Blob player `MuiAudioPlayer.jsx`
- **Status:** pending

### Phase 6: Conversational Agent, Gemini Multi-Tier Fallback & SSE Streaming
- [ ] Backend: `agentService.js`, 11-tool execution loop, SSE endpoint, abort protocol, `testChats.js`
- [ ] Frontend: `<ChatBox>` canvas, SSE adapter, Model Selector Popover, Preset Selector Dialog
- **Status:** pending

### Phase 7: Reports Ledger, Details View & Multi-Channel Export Actions
- [ ] Backend: Reports listing, pagination, filters, Google Docs export via Drive API
- [ ] Frontend: `Reports.jsx`, `ReportDetail.jsx`, clipboard copy, .txt download, print-PDF, Google Docs export
- **Status:** pending

### Phase 8: Dashboard Visual Analytics & Multi-Entity Global Search Dialog
- [ ] Backend: Dashboard KPI aggregations, 4 chart pipelines, global search, `testDashboard.js`, `testSearch.js`
- [ ] Frontend: `Dashboard.jsx` (KPI cards, 4 charts), `GlobalSearchDialog.jsx`
- **Status:** pending

### Phase 9: Background Sweepers, Quality Gates & Project Handover
- [ ] Backend: `sweeperService.js` (daily 00:00 UTC purge), master test runner `testAll.js`
- [ ] Frontend: Final build verification, multi-viewport audit, zero console error gate
- **Status:** pending

---

## Historical Phase 0: Master Technical Specification Phases (Completed)

### Phase 0.1: Section 1 - System Vision, Operational Architecture & Constraints Registry
- [x] Detail product philosophy, supervisor workflow, Amharic-first domain, and delivery model
- [x] Document strict scope boundaries and architecture constraints
- [x] Detail Section 1.4.7 Mongoose ClientSession & Atomic Transaction Architectural Law
- [x] Detail dual document instantiation (Report + Chat) inside atomic transaction session
- [x] Write complete Section 1 to `docs/specifications/master_specification.md`
- [x] User review and confirmation of Section 1
- [x] Commit Section 1 to `phase-0-specification`
- **Status:** complete

### Phase 2: Section 2 - User Persona, Authentication & Session Security
- [x] Detail Email+Password and Google OAuth raw flow (state + PKCE)
- [x] Detail User entity, automatic name derivation from email, and virtuals
- [x] Detail dual JWT httpOnly cookie architecture, RefreshToken rotation, reuse detection, and session rules
- [x] Detail RefreshToken rotation and family revocation inside atomic transaction session with array syntax `RefreshToken.create([{ ... }], { session })`
- [x] Detail User Account Self-Service Deletion (`DELETE /api/v1/users/me`) with 7-collection atomic transaction cascade
- [x] Detail client-side RTK Query `baseQueryWithReauth` with async-mutex concurrency protection, auto-logout, and redirect to `/login`
- [x] Detail synchronized `refreshTokenSchema` with descriptive error tuples and `toObject`/`toJSON` transforms
- [x] Write complete Section 2 to `docs/specifications/master_specification.md`
- [x] User review and confirmation of Section 2
- [x] Commit Section 2 to `phase-0-specification`
- **Status:** complete

### Phase 3: Section 3 - Locked Plain-Text Amharic Report Engine & Formatting Rules
- [x] Detail exact Amharic plain-text layout for single-branch and multi-branch visits
- [x] Detail Ethiopian date (`DD-MM-YY`), 24h times (`HH:mm`), headers, bullets, and footer lines
- [x] Detail multi-branch itinerary chronological sorting, primary branch position flexibility, and shift boundary synchronization (`report.clockIn = visits[0].clockIn`, `report.clockOut = visits[n-1].clockOut`)
- [x] Detail rule for `no_issue` bullet and hidden internal statuses
- [x] Detail the six linguistic guardrails (acoustic quality gate, first-person activities, impact-and-solution issues, comments fallback, shorthand expansion, no_issue)
- [x] Write complete Section 3 to `docs/specifications/master_specification.md`
- [x] User review and confirmation of Section 3
- [x] Commit Section 3 to `phase-0-specification`
- **Status:** complete

### Phase 4: Section 4 - Domain Data Models, Schemas & Lifecycle Management
- [x] Detail User, Branch, Report, RefreshToken, Chat, Message, and Preset Mongoose schemas (eliminated separate Glossary table)
- [x] Detail indexes, compound uniqueness, validations, virtuals, JSON/Object transforms (`toObject` with `virtuals: true`, stripping `id` and `__v`)
- [x] Detail Report date as UTC Date + dynamic Ethiopian virtual; Branch single name + normalizedName
- [x] Detail Report pre-save hook for chronological visit sorting, primary branch validation, and shift clockIn/clockOut sync
- [x] Detail `reportSchema.pre('save')` session awareness via `this.$session()`, `.session(this.$session())` for DB queries, and retrieve-and-save requirement
- [x] Detail unified schema field names: `Message.transcription`, `aiMetadata.duration`, and `Preset.system`
- [x] Detail soft-delete lifecycle (`isArchived`, `archivedAt`) with cascading Report-Chat archive in transactions
- [x] Detail 30-day cron sweeper (`sweeperJob.js`) with atomic per-report transaction purges and post-commit audio unlinking
- [x] Review in Plan Mode with user
- [x] Write complete Section 4 to `docs/specifications/master_specification.md`
- [x] User review and confirmation of Section 4
- [x] Commit Section 4 to `phase-0-specification`
- **Status:** complete

### Phase 5: Section 5 - Chat, Message & Conversation Node Architecture
- [x] Detail Report Chat (1-to-1 co-pilot with mutation tools) vs General Chat (operations analyst & personal assistant)
- [x] Detail General Chat 7-archetype request catalog and Google Sheets export pipeline (`export_to_google_sheet`)
- [x] Detail mid-chat dynamic preset selection/creation and AI configuration (`addis`, `google`, `nvidia`, model, language, reasoning)
- [x] Detail permanent Sidebar "+ New Chat" button (with 64px mini-rail adaptation) and zero inner chat header outlet architecture
- [x] Detail linear downstream truncation mechanics on prompt Edit and agent Retry within atomic `session.withTransaction(...)`
- [x] Detail Mode 3 Audio Orb dictation flow with in-composer inspection and 9-point edge-case defense matrix
- [x] Detail sub-5ms typing performance guarantee (60fps), React.memo isolation, and GPU-accelerated CSS animations
- [x] Detail symmetrical detail/edit routes `/reports/:reportId/details` and `/reports/:reportId/edit`
- [x] Write complete Section 5 to `docs/specifications/master_specification.md`
- [x] User review and confirmation of Section 5
- [x] Commit Section 5 to `phase-0-specification`
- **Status:** complete

### Phase 6: Section 6 - Audio Pipeline, FFmpeg Preprocessing & Addis AI STT Engine
- [x] Detail MediaRecorder browser capture (WebM/Opus with MP4 fallback)
- [x] Detail Multer ingestion rules (25MB/file, max 10 files, MIME allowlist)
- [x] Detail FFmpeg normalization to mono 16-bit 16kHz PCM and chunking (>120s / >25MB)
- [x] Detail Addis AI STT SDK integration, synchronous execution, error handling, and retries
- [x] Detail ephemeral Mode 3 clip handling and Method 1 in-memory Blob URL playback
- [x] Detail 3 ingestion modalities in Row 7 (Live mic, Paperclip browse, Drag-and-drop) with Row 8/9 queue deck
- [x] Detail Chat Composer Mode 3 ephemeral dictation and Mode 4 audio attachment chips
- [x] Write complete Section 6 to `docs/specifications/master_specification.md`
- [x] User review and confirmation of Section 6
- [x] Commit Section 6 to `phase-0-specification`
- **Status:** complete

### Phase 7: Section 7 - Agentic Reasoning, Multi-Tier Fallback & Gemini Runtime
- [x] Detail prompt architecture (System, Persona, Zero-DB-Table dynamic few-shot vocabulary harvesting)
- [x] Detail server-executed tool contracts (11 tools: `query_operational_data`, `update_report_item`, `generate_operational_matrix`, `track_operational_trends`, `generate_executive_briefing`, `get_report_context` w/ criteria & disambiguation, `update_report`, `create_report` w/ atomic 1:1 chat creation, `list_branches`, `create_branch`, `export_report_to_google_docs`)
- [x] Detail mandatory Date Attribution Invariant (all query/matrix records carry Ethiopian & Gregorian dates)
- [x] Detail Bidirectional Chat Continuity Invariant (Report Chat can query multi-branch data; General Chat can inspect, mutate, create, and export specific reports with interactive deep-link cards)
- [x] Detail streaming SSE protocol (`event: text_delta`, `tool_call_start`, `tool_call_result`, `report_updated`, etc.)
- [x] Detail per-chat concurrency lock (`activeChatStreams` map, HTTP 409 rejection, `POST /chats/:chatId/abort`)
- [x] Detail fallback chain: Tier 1 (Gemini) -> Tier 2 (Addis AI) -> Tier 3 (Nvidia NIM) with backoff and error isolation
- [x] Detail context window pruning (sliding 10-message window + summary) and daily token quota tracking
- [x] Write complete Section 7 to `docs/specifications/master_specification.md`
- [x] User review and confirmation of Section 7
- [x] Commit Section 7 to `phase-0-specification` (`33477ef`)
- **Status:** complete

### Phase 8: Section 8 - Workplace Transliteration Engine & In-Context Phonetic Guidance
- [x] Detail dynamic few-shot learning from last 4 approved reports (zero static glossary tables)
- [x] Detail phonetic Ge'ez transliteration rules (e.g. `deep fryer` -> `ዲፕ ፍራየር`, `POS` -> `ፒኦኤስ`)
- [x] Detail canonical homophone normalizer (`ሀ/ሐ/ኀ`, `ሰ/ሠ`, `አ/ዐ`, `ጸ/ፀ`) for search and indexing
- [x] Detail agent prompt enforcement & deterministic pre-save linter (`/[a-zA-Z]/` zero-Latin check)
- [x] Detail composer phonetic suggestion chips and Addis AI STT transliteration harmonization
- [x] Detail novel technical word 4-stage organic learning lifecycle (detection -> persistence -> harvest loop -> user correction)
- [x] Output complete Section 8 specification content to `docs/specifications/master_specification.md`
- [x] User review and confirmation of Section 8
- [x] Commit Section 8 to `phase-0-specification` (`9eb67c2`)
- **Status:** complete

### Phase 9: Section 9 - Conversational Agent UI & MUI X Chat Integration
- [x] Detail MUI X Chat `ChatBox` configuration, centered composer, and single-column canvas
- [x] Detail custom `createChatStreamAdapter` streaming adapter and abort protocol (`POST /chats/:chatId/abort`)
- [x] Detail sub-5ms typing latency guarantee with `React.memo` isolation and zero global context churn
- [x] Detail Mode 3 Audio Dictation flow (Audio Orb -> Addis AI STT -> cursor injection -> 0 disk files)
- [x] Detail interactive report action cards (`[ View Full Report ]`, `[ Edit in Form ]`, `[ Copy Report Text ]`)
- [x] Detail App Bar Preset Selector (`[ Preset: Operations Assistant ▾ ]`) and `[ + Create New Preset ]` modal
- [x] Detail 10-row symmetrical report initiation form (`/reports/new`) with Method 1 in-memory Blob players
- [x] Detail cross-section implementation guardrails and novel workplace term UI lifecycle
- [x] Detail strict separation between Model Selector (popover/menu for runtime LLM params) and Preset Selector (MUI Dialog with empty state and `react-hook-form`)
- [x] Detail Universal Responsive Control Iconification mandate (`xs` screen protection with `MuiTooltip`)
- [x] Detail Universal Reusable Input Components & Mandatory Start/End Adornments Law
- [x] User review and confirmation of Section 9 and active review amendments
- [x] Commit Section 9 specification amendments to `phase-0-specification` (`858614e`)
- **Status:** complete

### Phase 10: Section 10 - Frontend Routing, Shell Layout & Component Matrix
- [x] Detail `main.jsx` route configuration with `PublicRoute` (authenticated lockout to `/dashboard`), `ProtectedRoute`, and lazy `Component` loading
- [x] Detail `App.jsx`, `AppTheme`, `AppErrorBoundary`, `AppToastContainer`
- [x] Detail `MuiAppbar` in PublicLayout (Theme, Login, Register) and AppShell (Search, Theme, Avatar only; zero bell, zero font stepper)
- [x] Detail responsive `AppShell` (mini/temporary sidebar, Recent chats, User menu, Global Search Dialog)
- [x] Detail consolidated `/profile` route replacing `/settings` (Profile info, Security, Preferences, Account Deletion) with dual entry from AppBar and Sidebar
- [x] Detail unified `BranchDialog` (Create/Edit modes) eliminating dedicated `/branches/new` and `/branches/:branchId/edit` routes
- [x] Detail universal `react-hook-form` with `mode: 'onBlur'` and inline `helperText` error rendering
- [x] Detail universal start and end adornments on all `client/src/components/reusable/*` input components
- [x] Detail complete 13-component catalog in `client/src/components/reusable/*` and `MuiDialog` with standardized action buttons
- [x] Detail `client/src/components/columns/*` directory for `MuiDataGrid` column schemas (`branch.jsx`, `report.jsx`)
- [x] Detail domain-based Redux architecture including `dashboardSlice` & `dashboardApi` in `client/src/features/*`
- [x] Detail Dashboard KPI cards and 4 charts (`@mui/x-charts`)
- [x] Detail Branches and Reports pages (`MuiDataGrid`, filter drawer, pagination)
- [x] Detail BranchDetail, ReportDetail (text copy, .txt download, print-PDF, Google Docs export)
- [x] Detail in-canvas report creation flow in `/chat` with 10-Row Form lifecycle (Cancel/Submit)
- [x] Detail Unstated Requirement Law (zero assumptions without explicit user confirmation)
- [x] Review in Plan Mode with user
- [x] Output Section 10 specification content to `docs/specifications/master_specification.md` in Build Mode
- **Status:** complete

### Phase 11: Section 11 - REST API Endpoint Inventory, Validation Chains & Envelopes
- [x] Detail all `/api/v1/*` route definitions, HTTP methods, controllers, and services
- [x] Detail `express-validator` rule chains and 422 `{ details: [{ field, message }] }` responses
- [x] Detail `{ success, message, data }` and paginated envelopes
- [x] Detail centralized error handling and `httpStatus.js` usage
- [x] Harmonize Section 1–10 spec invariants (no `/reports/new`, clean AppBar 3 controls, `/profile`, `MuiAutocomplete.jsx`)
- [x] Review in Plan Mode with user
- [x] Output Section 11 specification content to `docs/specifications/master_specification.md` in Build Mode (pending user commit instruction)
- **Status:** complete

### Phase 12: Section 12 - Backend Infrastructure, Winston Logging & Sweeper Tasks
- [x] Detail fixed 11-step middleware order in `app.js` (helmet -> cors -> compression -> cookie-parser -> morgan -> express.json -> express.urlencoded -> express-mongo-sanitize -> rate-limit -> routes -> 404 -> errorHandler)
- [x] Detail Winston daily rotating logger (`combined-%DATE%.log`, `error-%DATE%.log`, 30-day retention, 20MB cap, gzip)
- [x] Detail Morgan request logger (terminal on dev, Winston stream on prod, PII masking)
- [x] Detail MongoDB exponential backoff retry reconnection (`1s ➔ 2s ➔ 4s ➔ 8s ➔ 16s ➔ 30s max`)
- [x] Detail `node-cron` 30-day archived items sweeper (`0 0 * * *` UTC / 03:00 EAT) with transaction and disk file cleanup
- [x] Detail immutable environment constants (`Object.freeze`) for backend and frontend
- [x] Detail centralized `validate` middleware populating `req.validated = { body, params, query }` and controller consumption
- [x] Detail universal controller `asyncHandler` wrapping and codebase-wide arrow function law
- [x] Detail universal form fields `React.forwardRef` wrapping with explicit `displayName`
- [x] Detail domain `CustomError` hierarchy and centralized error pipeline
- [x] Detail native fetch `apiClient` with `credentials: 'include'`, token refresh retry, and `features/api/apiSlice.js`
- [x] Review in Plan Mode with user
- [x] Output Section 12 specification content to `docs/specifications/master_specification.md` in Build Mode (uncommitted per user command)
- **Status:** complete

### Phase 13: Section 13 - Verification Protocols, Quality Gates & Zero-Error Checklists
- [x] Detail ultra-fast `node --check` backend validation runner (`backend/scripts/verifyCodebase.js`) with sub-second execution
- [x] Detail frontend `npx vite build` zero-error requirement with post-build `dist/*` cleanup (`client/scripts/cleanDist.js`)
- [x] Detail native Postman-like domain API test suites under `backend/scripts/test*.js` via pure `fetch` with zero new packages against live DB
- [x] Detail port conflict auto-termination protocol for ports 4000 & 3000
- [x] Detail mandatory implementing-agent browser verification protocol (UI polish, interactive functionality, mobile responsiveness across `xs`/`sm`/`md+`, Chrome DevTools console audit)
- [x] Detail UI Specification Adherence & Anti-Invention Law (strict compliance with stated UI, interactive planning on underspecified cases)
- [x] Detail code hygiene checklists (no unused imports, vars, params, missing JSDoc, magic numbers, universal arrow functions, universal `forwardRef`)
- [x] Detail phase commit protocol (`feat: phase N description` / `chore: phase N description`)
- [x] Review in Plan Mode with user
- [x] Output Section 13 specification content to `docs/specifications/master_specification.md` in Build Mode (uncommitted per user command)
- **Status:** complete

### Phase 14: Section 14 - Deployment, Environment Variables, Locked Dependencies & Execution Roadmap
- [x] Detail Option A root monorepo architecture & npm workspaces (`package.json`)
- [x] Detail `config/env.js`, `backend/.env`, and `client/.env` variable definitions (no `.env.example`, no `GOOGLE_*` LLM confusion)
- [x] Detail locked backend runtime and dev dependencies (20 backend packages)
- [x] Detail locked frontend runtime dependencies (18 frontend packages)
- [x] Detail complete project directory tree layout (`backend/` and `client/`)
- [x] Detail 9 incremental full-stack vertical slice phases
- [x] Detail the 5-step implementation protocol & git lifecycle
- [x] Detail superpowers, MCP skills & specification immutability invariant
- [x] Review in Plan Mode with user
- [x] Output Section 14 specification content to `docs/specifications/master_specification.md` in Build Mode (uncommitted per user command)
- **Status:** complete

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
| User Pre-Scaffolded `client/*` | User initialized `client/` containing `client/.env`, `vite.config.js` (port 3000), `src/assets/hero.png`, `src/assets/notFound_404.svg`, and `public/favicon.svg`. Phase 1 builds on this foundation. |

## Errors Encountered

| Error | Attempt | Resolution |
|---|---|---|
| None | 1 | N/A |

## Notes

- Work proceeds section-by-section.
- Each section is detailed in Plan Mode until user confirmation, then output in Build Mode and committed.
- Never commit directly to `main` and never merge.
- `client/*` is pre-created by the user with existing assets (`hero.png`, `notFound_404.svg`, `favicon.svg`) and `.env` (`VITE_API_BASE_URL`, `VITE_APP_NAME`); Phase 1 implementation will incorporate these assets directly.
- **12 Strict Quality & Architectural Invariants (Never To Be Repeated)**:
  1. *Zero Bare React Imports*: Modern React (Vite JSX transform) does not need `import React from 'react'`. Use named imports only.
  2. *Comprehensive JSDoc Everywhere*: Every file must have `@module`; every component, function, hook, typedef, middleware, and route handler must have full JSDoc tags (`@param`, `@returns`, `@type`, `@typedef`).
  3. *Mandatory Asset Integration*: Dedicated pre-scaffolded visual assets (`client/src/assets/notFound_404.svg`, `hero.png`) must be styled, responsive, and prominently mounted in dedicated views (`NotFound.jsx` in `PublicLayout`).
  4. *Zero Unused Imports*: No unconsumed imported symbols (e.g. `CustomError` in `errorHandler.js`).
  5. *Zero `.npmrc` Policy*: Never generate `.npmrc` in the repository. Handle dependencies natively.
  6. *Background Task Discipline*: Cleanly terminate all background server and daemon processes when handing control to user. Keep running tasks at 0 so ports are completely available.
  7. *Zero Commit Communication Invariant*: Never prompt for commits, never ask about committing, and never commit unless explicitly commanded by user.
  8. *Automated Pre-Dev Port Freeing & Defensive Shutdown*: Automatically run `killPort.js` in all `dev` scripts to guarantee clean port acquisition on 4000 & 3000, and guard `server.close()` with `if (server.listening)` to prevent `ERR_SERVER_NOT_RUNNING`.
  9. *Domain Component Decomposition*: Never flood `client/src/pages/*` with UI code. Pages act strictly as lean orchestrators (< 35 lines) that import cleanly decomposed domain components from `client/src/components/<domain>/*`.
  10. *Reusable LoadingSpinner Navigation Wrap*: Standardize `LoadingSpinner.jsx` in `client/src/components/reusable/LoadingSpinner.jsx` (`message`, `height`, `size` props) and wrap `<Outlet />` in all layouts using `useNavigation()`: `{navigation.state === "loading" ? <LoadingSpinner message="Navigating..." height="100%" /> : <Outlet />}`.
  11. *Fixed-Header Isolated Scroll Architecture*: In both public and protected shells, only the inner main content area (`<Box component="main" sx={{ flexGrow: 1, overflowY: 'auto' }}>`) scrolls. The `AppBar` must remain rigid (`flexShrink: 0; position: sticky`) and the outer layout locked (`height: 100vh; maxHeight: 100vh; overflow: hidden; display: flex; flex-direction: column`). The AppBar must never scroll with the page.
  12. *Canonical Route Import Path Standard*: All route definitions in `router.jsx` and Section 10.1.1 must use exact canonical relative paths (`../pages/<Name>.jsx`). Never use fictitious nested directories (e.g. `./pages/Landing/Landing`, `./pages/Auth/Login`). Wildcard error boundary is `NotFound` from `client/src/pages/NotFound.jsx` (not `NotFoundPage`).



