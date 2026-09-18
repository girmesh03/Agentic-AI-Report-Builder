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
