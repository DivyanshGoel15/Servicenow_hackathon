# OneRoute — Student Wellbeing Triage & Routing System

> **"One place to start. The right support."**  
> *ServiceNow Student Wellbeing Hackathon MVP*

---

## 📌 Problem & Solution

Universities face increasing mental health referrals, fragmented support across disparate departments, and long waiting times. Students often don't know where to seek help and struggle to navigate institutional bureaucracy.

**OneRoute** solves this by providing a single, empathetic starting point:
1. Students describe their situation in plain, natural language without having to know university departmental structures.
2. The **NLP Triage Engine** parses the input, extracts primary and secondary concerns, calculates urgency scores, and maps to the appropriate university team.
3. Cases are routed directly to the **OneRoute Staff Triage Console** where support staff can review full AI reasoning factors, adjust assignment, and manage the case lifecycle.

---

## 🚀 How to Run the Project

You can run OneRoute either with the included Node.js server or directly by opening the HTML files in any web browser.

### Option A: Using the Local Server (Recommended)
No external dependencies needed — runs on native Node.js:
```bash
npm start
# or
node server.js
# or
node backend/server.js
```
Then open your browser at:
- **Application Gateway**: [http://localhost:3000](http://localhost:3000)
- **Student Portal**: [http://localhost:3000/student.html](http://localhost:3000/student.html)
- **Staff Console**: [http://localhost:3000/admin.html](http://localhost:3000/admin.html)
- **Login**: [http://localhost:3000/login.html](http://localhost:3000/login.html)

### Option B: Direct Browser Preview
Double-click or open any HTML file directly from the [`client/`](file:///c:/Users/divya_y6vjlfl/OneDrive/Desktop/Servicenow_hackathon/client) directory:
- [`client/index.html`](file:///c:/Users/divya_y6vjlfl/OneDrive/Desktop/Servicenow_hackathon/client/index.html) (or root [`index.html`](file:///c:/Users/divya_y6vjlfl/OneDrive/Desktop/Servicenow_hackathon/index.html)) — Smart gateway
- [`client/login.html`](file:///c:/Users/divya_y6vjlfl/OneDrive/Desktop/Servicenow_hackathon/client/login.html) — Authentication
- [`client/student.html`](file:///c:/Users/divya_y6vjlfl/OneDrive/Desktop/Servicenow_hackathon/client/student.html) — Student Support Portal
- [`client/admin.html`](file:///c:/Users/divya_y6vjlfl/OneDrive/Desktop/Servicenow_hackathon/client/admin.html) — Staff Triage Console

---

## 🎭 Full Presentation Demo Flow

### 1. Authentication (`login.html`)
- Open `client/login.html` (or [http://localhost:3000/login.html](http://localhost:3000/login.html)).
- Use demo credentials:
  - **Student**: `alex@student` (Password: `1234`) → redirects to `student.html`.
  - **Admin**: `officer@admin` (Password: `1234`) → redirects to `admin.html`.

### 2. Student Intake (`student.html`)
- Greeted by name (`Alex`) with their student badge in the top-right corner.
- Click the **"Feeling overwhelmed"** chip or paste the primary demo scenario:
  > *"I've been feeling overwhelmed with my studies lately. I've missed a few classes, my attendance is dropping, and I'm worried about falling behind. I don't know whether I should talk to my professor, an academic advisor, or the counselling team."*
- Click **"Get Support"**.

### 3. Automated Triage & Recommendation
- The NLP engine analyzes the narrative.
- The confirmation screen displays:
  - **Case ID**: `STU-xxxxx`
  - **Identified Category**: `Academic Support` (with secondary mental wellbeing detected)
  - **Assigned Service Team**: `Academic Advising`
  - **Routing Priority**: `High`
  - **Triage Rationale**: Operational explanation without clinical diagnostic labels.

### 4. Staff Console Triage (`admin.html`)
- Navigate to `admin.html` (or click "Student Portal ↗" / login as admin).
- The newly submitted student case appears at the top of the **Live Cases Queue** and updates the dashboard metrics in real time.
- Click **"✦ AI Reasoning"**:
  - Slide-over sheet reveals the priority score (`100/100`), key factors considered (Academic Support indicator, Wellbeing concern, Attendance impact), and full AI explanation.
  - Staff can submit feedback rating the accuracy of the assessment.
- Click the **Case ID**:
  - Opens the full case details view with the student's exact quote, case timeline, course info, and status dropdown.
  - Change status from `New` → `Assigned` → `In Progress` → `Resolved` (persists automatically).

---

## 📂 File Architecture

```
Servicenow_hackathon/
├── client/                      # Frontend UI & Client Assets
│   ├── index.html               # Frontend router & role-based redirector
│   ├── student.html             # Student Support Portal (intake & confirmation)
│   ├── admin.html               # Staff Triage Console (queue, timeline, AI reasoning)
│   ├── admin-dashboard.html     # Compatibility forwarder redirecting to admin.html
│   ├── login.html               # Dual-role authentication (student / staff)
│   ├── signup.html              # Account registration with role detection
│   └── triageService.js         # Browser-compatible fallback for direct file:// previews
├── backend/                     # Backend Services & Server
│   ├── server.js                # Zero-dependency Node.js HTTP server & REST APIs
│   └── triageService.js         # CommonJS NLP triage engine module
├── index.html                   # Root entry point router (forwards to client/)
├── server.js                    # Root convenience runner (delegates to backend/server.js)
├── package.json                 # npm start -> node backend/server.js
├── README.md                    # System documentation & demo guide
└── CHANGELOG.md                 # Integration & change log
```

| Folder / File | Purpose |
|---|---|
| [`client/index.html`](file:///c:/Users/divya_y6vjlfl/OneDrive/Desktop/Servicenow_hackathon/client/index.html) | Frontend entry router based on logged-in role |
| [`client/student.html`](file:///c:/Users/divya_y6vjlfl/OneDrive/Desktop/Servicenow_hackathon/client/student.html) | ServiceNow-inspired student support intake & live triage confirmation |
| [`client/admin.html`](file:///c:/Users/divya_y6vjlfl/OneDrive/Desktop/Servicenow_hackathon/client/admin.html) | Staff triage console with live cases queue, AI reasoning sheet, & case timeline |
| [`client/login.html`](file:///c:/Users/divya_y6vjlfl/OneDrive/Desktop/Servicenow_hackathon/client/login.html) | Student and Staff authentication with demo accounts |
| [`client/signup.html`](file:///c:/Users/divya_y6vjlfl/OneDrive/Desktop/Servicenow_hackathon/client/signup.html) | Account creation with automatic role detection |
| [`client/triageService.js`](file:///c:/Users/divya_y6vjlfl/OneDrive/Desktop/Servicenow_hackathon/client/triageService.js) | Client-side NLP triage fallback for offline / direct browser previews |
| [`backend/server.js`](file:///c:/Users/divya_y6vjlfl/OneDrive/Desktop/Servicenow_hackathon/backend/server.js) | Native Node.js HTTP server serving static client files & REST APIs |
| [`backend/triageService.js`](file:///c:/Users/divya_y6vjlfl/OneDrive/Desktop/Servicenow_hackathon/backend/triageService.js) | Server-side NLP triage engine with rule-based heuristics & urgency calculations |
| [`package.json`](file:///c:/Users/divya_y6vjlfl/OneDrive/Desktop/Servicenow_hackathon/package.json) | NPM configuration (`npm start`) |
| [`server.js`](file:///c:/Users/divya_y6vjlfl/OneDrive/Desktop/Servicenow_hackathon/server.js) | Root runner forwarding to `backend/server.js` |
| [`index.html`](file:///c:/Users/divya_y6vjlfl/OneDrive/Desktop/Servicenow_hackathon/index.html) | Root entry point redirecting to `client/` |

---

## 🛡️ Key Principles Followed

- **Operational Triage, Not Clinical Diagnosis**: Never diagnoses mental health conditions (e.g. avoids *"Depression detected: 92%"*). Classifies operational categories and urgency levels.
- **Calm & Empathetic Student UX**: Minimalist, clean, and trustworthy interface designed to minimize cognitive friction for stressed students.
- **Dual-Mode Demo Reliability**: Works seamlessly through the Node.js API server (`npm start`) as well as client-side fallback if opened directly from local disk (`file:///`).

