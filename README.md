# Employee Enquiry Management System — Frontend

A clean, responsive, and functional React + Vite frontend built using the **Model-View-Controller (MVC)** architectural pattern to interface with the Spring Boot backend running at `http://localhost:8080`.

---

## 🏛️ MVC Architecture Overview

The codebase is organized following strict separation of concerns, making it easy to identify where changes should be implemented:

```text
employee-enquiry/
├── src/
│   ├── models/                          # [M] DATA MODELS & BUSINESS LOGIC
│   │   ├── authModel.js                 # Auth validation, credentials schema, session storage helpers
│   │   └── enquiryModel.js              # Status progression order, one-way transition rules, filter & sort algorithms, validation
│   │
│   ├── services/                        # [M/S] SERVICE LAYER (API & STORAGE)
│   │   ├── apiService.js                # Centralized Axios client with JWT interceptors & error extractor
│   │   ├── authService.js               # Admin authentication API & session management
│   │   └── enquiryService.js            # Enquiry endpoints (submit, fetch, updateStatus, updateEnquiry, delete)
│   │
│   ├── controllers/                     # [C] CONTROLLERS (STATE & WORKFLOW HOOKS)
│   │   ├── useAuthController.js         # Controls login form, authentication lifecycle, logout
│   │   ├── useEnquiryFormController.js  # Controls public submission form, field validation, feedback, auto-reset
│   │   └── useDashboardController.js    # Controls enquiry fetching, search, status filter, sorting, one-way transitions, edit modal, delete dialog
│   │
│   ├── views/                           # [V] PRESENTATIONAL VIEWS & COMPONENTS
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── ConfirmDialog.jsx    # Modal dialog for confirmation (e.g. deletion)
│   │   │   │   ├── Loading.jsx          # Reusable loading spinner
│   │   │   │   ├── Navbar.jsx           # Global header with active navigation, admin badge, and logout
│   │   │   │   └── ProtectedRoute.jsx   # Route guard for protected admin pages
│   │   │   └── enquiry/
│   │   │       ├── EnquiryEditModal.jsx # Admin modal dialog to edit enquiry fields and forward status
│   │   │       ├── EnquiryFilterBar.jsx # Real-time search, status filter, sort dropdown, and reset button
│   │   │       ├── EnquiryStatsGrid.jsx # Interactive KPI count cards (Total, New, In-Progress, Resolved, and Closed)
│   │   │       └── EnquiryTable.jsx     # Responsive enquiry table with one-way status dropdown and action buttons
│   │   └── pages/
│   │       ├── AdminDashboardPage.jsx   # Active enquiries dashboard (route: `/admin/dashboard`)
│   │       ├── AdminLoginPage.jsx       # Admin login card (route: `/admin/login`)
│   │       ├── ClosedEnquiriesPage.jsx  # Dedicated closed enquiries archive (route: `/admin/enquiries/closed`)
│   │       └── PublicEnquiryPage.jsx    # Public enquiry submission page (route: `/`)
│   │
│   ├── styles/
│   │   └── global.css                   # Responsive layout, interactive KPI cards, filter toolbars, status badges
│   ├── App.jsx                          # Router configuration
│   └── main.jsx                         # Application entry point
├── .env.example                         # VITE_API_BASE_URL=http://localhost:8080
├── .env                                 # Local configuration
├── package.json
└── vite.config.js                       # Vite configuration with fallback proxy
```

---

## 🌟 Key Features & Workflow Rules

### 1. One-Way Status Progression
- **Workflow Order**: `NEW` &rarr; `IN_PROGRESS` &rarr; `RESOLVED` &rarr; `CLOSED`
- **Strict Rule**: Enquiries can only advance forward. Reverting to any previous status is blocked both at the model level (`canTransitionStatus`) and in the UI:
  - An enquiry in `NEW` can transition to `IN_PROGRESS`, `RESOLVED`, or `CLOSED`.
  - An enquiry in `IN_PROGRESS` can transition to `RESOLVED` or `CLOSED` (cannot go back to `NEW`).
  - An enquiry in `RESOLVED` can transition to `CLOSED` (cannot go back to `IN_PROGRESS` or `NEW`).
  - An enquiry in `CLOSED` is archived.

### 2. Automatic Removal of Closed Enquiries & Dedicated Closed Archive
- **Active Dashboard (`/admin/dashboard`)**:
  - Enquiries marked `CLOSED` are automatically removed from the active view.
  - Interactive KPI cards display live counts: **Active Total**, **New**, **In-Progress**, **Resolved**, and **Closed**.
- **Clicking on the Closed Count Card**:
  - Immediately navigates to the dedicated **Closed Enquiries Archive** (`/admin/enquiries/closed`).
  - Displays all closed enquiries with full search, sorting, and action controls.
  - Includes a quick navigation link: `← Back to Active Enquiries`.

### 3. Admin Enquiry Editing
- Every enquiry row features an **"Edit"** button.
- Opens `EnquiryEditModal` pre-populated with:
  - Full Name (`name`)
  - Email (`email`)
  - Phone Number (`phone`)
  - City (`city`)
  - Enquiry Message (`message`)
  - Status (`status` showing allowed forward progressions)
- Validates data on the client and persists updates via `enquiryService.updateEnquiry(id, data)`.

### 4. Real-Time Search & Sorting
- **Search Bar**: Real-time multi-field search across:
  - Name, Email, Phone, City, Message, and ID.
- **Status Filter**:
  - Filter by `All Active`, `NEW`, `IN_PROGRESS`, `RESOLVED`.
- **Sorting Options**:
  - **Latest Enquiry (Newest First)** — Default (by date or descending ID)
  - **Oldest Date First**
  - **Name (A &rarr; Z)**
  - **Name (Z &rarr; A)**
  - **City (A &rarr; Z)**
- **Reset Button**: Quickly clears search keywords and resets filters.

---

## ⚙️ Running the Application

```bash
# Navigate to the project directory
cd C:\Users\theso\.gemini\antigravity\scratch\employee-enquiry

# Install dependencies
npm install

# Start development server
npm run dev
```
The app runs at: **`http://localhost:5173`**

---

## 🔌 API Testing Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/enquiry` | Public enquiry submission |
| `POST` | `/api/admin/auth/login` | Admin authentication |
| `GET` | `/api/admin/auth/enquiries` | Retrieve enquiries list |
| `PATCH`| `/api/admin/auth/enquiries/{id}/status` | Update enquiry status (`NEW`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`) |
| `PUT` / `PATCH` | `/api/admin/auth/enquiries/{id}` | Update enquiry details (Admin edit) |
| `DELETE` | `/api/admin/auth/enquiries/{id}` | Delete an enquiry |
