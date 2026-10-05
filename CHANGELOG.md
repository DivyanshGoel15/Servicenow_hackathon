# OneRoute Integration Changelog

## Integration Date
Monday, 5 October 2026

## Files Changed

### `triageService.js`
- **What was changed**: Added universal module exports (`typeof window !== 'undefined'`) while retaining full CommonJS `module.exports = { analyzeStudentNeeds }`.
- **Why it was changed**: Allowed the NLP triage engine to be utilized directly by both the Node.js backend server (`server.js`) and the client-side student intake page (`student.html`) for dual-mode demo reliability.
- **Category**: Integration / Compatibility.

### `student.html`
- **What was changed**: 
  - Included `<script src="triageService.js"></script>`.
  - Connected `processStudentRequest(rawInput)` to call `analyzeStudentNeeds` (via `/api/triage` with fallback to `window.analyzeStudentNeeds`).
  - Updated `createCase(requestData)` to persist structured cases into `localStorage` (`oneRoute_cases`, `oneRoute_analyses`, `supportAICases`) and dispatch to backend API (`POST /api/cases`).
  - Added an Automated Triage & Routing summary card in the confirmation view to display the detected category, assigned service team, priority assessment, and triage explanation.
  - Set the primary demo scenario as the "Feeling overwhelmed" quick-start chip.
  - Updated branding copy to include the official tagline: *"One place to start. The right support."*
- **Why it was changed**: Required to complete presentation step 4 and step 5 ("Triage processes input" and "Category/priority/support recommendation appears") and deliver cases to the Staff Console.
- **Category**: Integration & UI.

### `admin.html`
- **What was changed**:
  - Updated `cases` and `analyses` data structures to merge persistent cases from `localStorage` (`oneRoute_cases` / `supportAICases`) at the top of the queue.
  - Updated `student(id, caseObj)` helper to display the submitting student's actual name and email from authenticated sessions.
  - Updated `updateCaseStatus(id, status)` to persist workflow updates back to `localStorage` and trigger `/api/cases/:id` patch.
  - Updated console branding to "OneRoute Staff Triage Console" with tagline and "1R" brand mark.
  - Added "Student Portal ↗" link in the header and "Sign out" link in the staff sidebar.
- **Why it was changed**: Required so that student submissions from `student.html` appear immediately on the Admin dashboard and triage queue with full AI reasoning details.
- **Category**: Integration & UI.

### `login.html`
- **What was changed**:
  - Updated branding title and heading to "OneRoute" with tagline *"One place to start. The right support."*
  - Updated admin login destination from `admin-dashboard.html` to `admin.html`.
  - Stored user session in `localStorage` (`supportAIUser`) with friendly display name and role.
  - Preserved dual-tab Student/Admin role switcher and demo account credentials (`alex@student`, `officer@admin`).
- **Why it was changed**: Visual consistency, proper authentication routing, and session propagation.
- **Category**: Integration & UI.

### `signup.html`
- **What was changed**:
  - Updated branding from SupportAI to "OneRoute" with tagline *"One place to start. The right support."*
  - Updated admin redirection target to `admin.html`.
  - Preserved keyword-based role detection (`@student` and `@admin`) and password verification.
- **Why it was changed**: Brand consistency and routing alignment.
- **Category**: UI & Integration.

### `index.html`
- **What was changed**:
  - Updated title to "OneRoute — Student Triage & Routing".
  - Configured intelligent session-based router: redirects logged-in admins to `admin.html`, logged-in students to `student.html`, and unauthenticated visitors to `login.html`.
- **Why it was changed**: Acts as the unified entry point for the entire web application.
- **Category**: Integration & Routing.

### `server.js`
- **What was changed**:
  - Implemented zero-dependency Node.js HTTP server.
  - Added static file serving with proper MIME types.
  - Implemented `/api/triage` endpoint calling `analyzeStudentNeeds` from `triageService.js`.
  - Implemented `/api/cases` (GET, POST) and `/api/cases/:id` (PATCH) endpoints.
- **Why it was changed**: Previously 0 bytes. Needed to connect backend NLP triage and serve the application locally.
- **Category**: Backend / Integration.

### `admin-dashboard.html`
- **What was changed**: Created clean redirect forwarder to `admin.html`.
- **Why it was changed**: Prevents 404 errors if anyone navigates to the previous dashboard filename.
- **Category**: Routing / Bug Fix.

---

## Logic Preserved

- **Existing AI triage algorithm preserved**: The NLP keyword extraction, scoring weights, urgency detection, and team mappings in `triageService.js` were 100% kept intact.
- **Existing admin console logic preserved**: The metrics calculations, filter logic, slide-over AI Reasoning sheet, staff feedback mechanism, service directory, student directory, and report views in `admin.html` were 100% retained.
- **Existing login/signup validation preserved**: Email domain role detection (`@student` and `@admin`), password matching, and credential structure were preserved.
- **Existing student portal UX preserved**: The calm, uncluttered ServiceNow-inspired student intake layout, character counter, and quick-start chip interaction were preserved.

---

## Integration Changes

1. **End-to-End Data Pipeline**:
   - `student.html` captures student input → passes to `triageService.js` (or `/api/triage`) → constructs standardized case with category, priority, service assignment, and explanation → stores in `localStorage` and dispatches to `/api/cases`.
2. **Staff Console Case Synchronization**:
   - `admin.html` reads stored cases and prepends them ahead of baseline demo records.
   - Case details view (`caseDetail`) and AI Reasoning slide-over (`openReasoning`) dynamically render the real AI triage scores and factors generated by `triageService.js`.
   - Status updates in `admin.html` (`New` → `Assigned` → `In Progress` → `Resolved`) persist across page reloads.
3. **Session Authentication Flow**:
   - Logging in via `login.html` or signing up via `signup.html` sets `supportAIUser`.
   - `student.html` uses this session to greet the student by name and attach their ID to submitted cases.
   - `admin.html` allows one-click sign out back to `login.html`.

---

## UI Changes

- Replaced outdated titles and headings ("SupportAI", "Campus Connect", "Campus Issue Management") with **OneRoute**.
- Added the official tagline *"One place to start. The right support."* across student, admin, login, and signup headers.
- Added an Automated Triage & Routing card to the student confirmation view to display the triaged category, recommended team, and priority without clinical diagnostic language.
- Added cross-navigation links ("Student Portal ↗" in the admin console; "Sign Out" and "Sign In" in the student portal).

---

## Bug Fixes

- Fixed admin login and signup redirection pointing to nonexistent `admin-dashboard.html` by routing to `admin.html` and providing a fallback redirect.
- Fixed `triageService.js` throwing an error in browser contexts when `module` was undefined.
- Fixed cases submitted in `student.html` not showing up in `admin.html` by implementing bidirectional storage synchronization.

---

## Files Moved / Restructured
- **Frontend Assets**: Moved to `client/`:
  - `student.html` → `client/student.html`
  - `admin.html` → `client/admin.html`
  - `admin-dashboard.html` → `client/admin-dashboard.html`
  - `login.html` → `client/login.html`
  - `signup.html` → `client/signup.html`
  - `triageService.js` → `client/triageService.js` (client-side fallback for direct browser previews)
  - Created `client/index.html` (internal client routing gateway)
- **Backend Services**: Moved to `backend/`:
  - `server.js` → `backend/server.js` (configured to serve static files from `../client`)
  - `triageService.js` → `backend/triageService.js` (CommonJS module for `/api/triage`)
- **Root Entry Points**:
  - `package.json`: updated `"main": "backend/server.js"` and `"scripts": { "start": "node backend/server.js" }`.
  - `server.js`: delegator forwarding directly to `backend/server.js` (`require('./backend/server.js')`).
  - `index.html`: smart router forwarding visitors into `client/`.

---

## Files Removed
- Redundant duplicate root files (`student.html`, `admin.html`, `login.html`, `signup.html`, `admin-dashboard.html`) were cleaned up from the root folder after migrating cleanly into `client/`.

---

## Known Limitations

- Production deployment would require a persistent database (e.g. MongoDB or PostgreSQL) instead of in-memory / `localStorage` synchronization.
- Authentication currently uses mock client-side validation; production deployment should integrate university SSO / SAML / OAuth2.
- The NLP engine uses rule-based keyword extraction and sentiment heuristics; for advanced ambiguity resolution, an LLM API (e.g. Gemini 2.5 Flash) can be plugged into `triageService.js`.

