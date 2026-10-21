# Sevadeep CivicConnect 🌿🤝
### Community Issue Reporting & Grassroots Resolution Platform
**Customized for Sevadeep NGO, Pune, Maharashtra, India**  
*Inspired by the concept of CivicSeva*

> **"Your Community. Your Voice. Together, We Create Change."**

Sevadeep CivicConnect is a modern, responsive, full-stack civic engagement platform that empowers residents of Pune to report local public problems (overflowing garbage dumps, dirty public spaces, drinking water leakages, damaged public facilities, riverbed hyacinth pollution, and environmental hazards). 

Sevadeep NGO coordinators review reports, organize weekend volunteer improvement drives, assign tasks, coordinate with Pune Municipal Corporation (PMC), track progress through verified on-site outcomes, and keep citizens informed via real-time alerts.

---

## 1. System Architecture & Tech Stack

```
Frontend (React 18 + Vite + Tailwind CSS + Leaflet + OpenStreetMap + Recharts)
     │ (REST API / JSON / JWT Bearer Authentication / Multipart Uploads)
     ▼
Backend (Node.js + Express REST API Gateway + Multer File Storage)
     │ (MySQL Connection Pool via mysql2/promise)
     ▼
Database (MySQL Server 8.0 on localhost:3306 - Database: sevadeep_civicconnect)
```

- **Frontend**: React 18 with Vite, Tailwind CSS with custom NGO civic palette (deep forest green, teal accents, clean neutrals), Lucide React icons.
- **Mapping & Geolocation**: Leaflet & OpenStreetMap tiles for Pune. Features interactive point-and-click location pinning, drag-and-drop marker picker, browser GPS detection, and custom category-colored markers with popup summaries.
- **Charts & Data Visualization**: Recharts (Monthly submission volume, issue category distribution, open vs resolved ratio, volunteer contribution podium).
- **Backend**: Node.js with Express, modular MVC pattern, bcryptjs password hashing, JWT authentication, and automated audit logging.
- **Database**: MySQL 8.0 with 11 relational tables, foreign key constraints, indexes, and automated schema migrations.
- **Image Evidence**: Validated uploads via Multer (JPEG, PNG, WebP with 5MB limit).

---

## 2. Distinctive Platform Innovations

| Innovation | Implementation | Real-World Impact |
|---|---|---|
| **Bilingual Language Switcher** | `LanguageContext.jsx` & Navbar switch | Instant toggle between **English ⇄ मराठी** for Pune citizens and ground workers. |
| **Interactive Before & After Slider** | `BeforeAfterSlider.jsx` | Drag split-screen slider on resolved tickets to verify on-site cleanup proof. |
| **Chronic Black-Spot Hotspot Layer** | `LeafletMap.jsx` spatial clustering | Pulsing crimson dashed circles on map highlighting recurring waste dumping zones (<250m). |
| **Proximity Duplicate Alert** | Haversine formula in `ReportIssuePage.jsx` | Warns if an open issue exists within 100m of dropped pin to prevent duplicate tickets. |
| **PMC RTS SLA Watchdog & Legal Notice** | `PmcEscalationModal.jsx` | Statutory SLA tracker under Maharashtra RTS Act 2015; generates print-ready legal notices for Ward Officers. |
| **Verifiable Volunteer Certificate** | `VolunteerCertificateModal.jsx` | Print/PDF credential recognizing verified volunteer hours for college credits & CSR appraisals. |
| **Official CSR & Donor Impact Brief** | `CsrImpactBriefModal.jsx` | 1-click executive disclosure PDF aligned with UN SDG 11 & SDG 12 for donors and sponsors. |
| **WhatsApp Community Mobilization** | 1-click share in `IssueDetailPage.jsx` | Direct WhatsApp sharing to society/neighborhood groups to rally upvotes. |

---

## 3. Seeded Demonstration Personas

The platform includes a **1-Click Quick Demo Switcher** directly in the top header and login page for instantaneous evaluator testing:

| Role | Name | Email | Password | Permissions & Capabilities |
|---|---|---|---|---|
| **Sevadeep Coordinator** | Dr. Ananya Joshi | `coordinator@sevadeep.org` | `Password@123` | Full administrative control: Review incoming citizen reports, approve/reject with notes, assign field volunteers, add municipal PMC docket numbers, publish activities, moderate comments, and view impact analytics. |
| **Municipal Affairs Liaison** | Vikram Deshmukh | `admin@sevadeep.org` | `Password@123` | Coordinator permissions, PMC escalations, and system audit logs review. |
| **Field Volunteer** | Aarav Kulkarni | `volunteer@sevadeep.org` | `Password@123` | Browse activities, register for weekend drives, view assigned community tasks, submit field progress and completion photo proofs. |
| **Field Volunteer** | Priya Patil | `priya@sevadeep.org` | `Password@123` | Assigned to Deccan Gymkhana water leakage response. |
| **Community Member** | Sunita Deshmukh | `citizen@sevadeep.org` | `Password@123` | Submit civic grievances with map pin and photo, track submitted tickets, confirm neighbor issues (+2 pts), add comments, and rate resolved outcomes. |
| **Community Member** | Rahul Sharma | `rahul@sevadeep.org` | `Password@123` | Mandai market area resident; submitted public cleanliness grievances. |

---

## 4. Database Schema (11 Relational Tables)

1. `users`: Stores citizen, volunteer, and coordinator profiles, bcrypt password hashes, contact details, Pune neighborhood, points, and active status.
2. `reports`: Core community reports with unique reference codes (`SVD-2026-XXXX`), coordinates (`latitude`, `longitude`), Pune street address, category, severity, status, coordinator notes, and municipal referral docket.
3. `report_photographs`: Initial photo proofs, progress updates, and verified before/after evidence photos.
4. `status_history`: Immutable status transitions (`Submitted` → `Under Review` → `Approved` → `In Progress` → `Resolved` / `Rejected`) with timestamps and coordinator audit notes.
5. `community_confirmations`: Unique user-to-report confirmations preventing duplicate votes.
6. `comments`: Citizen discussion thread with coordinator moderation tools (`is_hidden` and audit reason).
7. `events`: Volunteer activities & cleanup drives with Pune site coordinates, dates, capacity slots, waste collected in kg, and saplings planted.
8. `event_registrations`: Volunteer sign-ups, attendance status (`Registered`, `Attended`, `Cancelled`), and verified service hours.
9. `volunteer_assignments`: Specific task assignments linking volunteers to community reports.
10. `notifications`: In-app notification stream with read/unread flags.
11. `audit_logs`: Immutable security audit events tracking user, action, target, and timestamp.

---

## 5. Key Functional Workflows

### A. Community Issue Reporting & Privacy
- Residents pick an exact problem spot in Pune on Leaflet OpenStreetMap or click **"Use My Current Location"**.
- Categories: *Garbage and Waste Management*, *Public Cleanliness*, *Water Leakage*, *Damaged Public Facilities*, *Environmental Problems*, *Other Community Issues*.
- **Privacy Policy**: Personal phone numbers and private addresses are strictly hidden from the public. Reports initially remain in **Submitted (Pending Review)** status and are not mapped publicly until approved by a Sevadeep coordinator.

### B. Coordinator Triage & Status Lifecycle
```
Submitted ──> Under Review ──> Approved ──> In Progress ──> Resolved
     │             │                                           │
     ▼             ▼                                           ▼
  Rejected    Needs More Info                         Reporter Verification
```
- Coordinators can formally log **Pune Municipal Corporation (PMC)** escalation docket numbers for issues requiring municipal engineering work.
- Once marked resolved, the original reporter is prompted to verify the outcome and rate satisfaction (1 to 5 stars).

### C. Volunteer Activities & Attendance
- Sevadeep publishes riverbed cleanups (Mutha Riverfront), tekdi sapling plantations (Vetal Tekdi), and lake restorations (Katraj Lake).
- Volunteers register with 1 click; coordinators record physical attendance to credit certified service hours and impact points.

---

## 6. Local Setup & Running Instructions

### Prerequisites
- Node.js v18+ (tested on Node.js v20/v24)
- npm v10+
- MySQL Server 8.0 running on `localhost:3306` (or use seed dataset)

### Quick Launch (Concurrent Full-Stack)
From the project root:
```bash
# 1. Start both backend and frontend together
npm run dev
# or
node start-dev.js
```
This automatically starts:
- **Backend API**: `http://localhost:5000` (Health check: `http://localhost:5000/api/health`)
- **Frontend Client**: `http://localhost:5173`

Open your browser to `http://localhost:5173`.

### Running Services Individually

1. **Backend Server**:
   ```bash
   cd server
   npm install
   node schema/initDb.js   # Initializes tables and seeds demo data
   npm run dev
   ```

2. **Frontend Client**:
   ```bash
   cd client
   npm install
   npm run dev
   ```

---

## 7. Environment Configuration

### Backend (`server/.env`)
```env
PORT=5000
JWT_SECRET=sevadeep_civicconnect_jwt_secret_pune_2026_secure
JWT_EXPIRES_IN=7d

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=Shriya@26
DB_NAME=sevadeep_civicconnect

CLIENT_ORIGIN=http://localhost:5173
NODE_ENV=development
```
*(An accompanying `server/.env.example` is also provided in the repository)*.
