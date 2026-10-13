# Sitting Chart

A modern, full-featured wedding and event seating arrangement management application built with React and Material-UI. It streamlines guest list management, interactive table assignments, drag-and-drop seating, multi-format PDF generation, and secure cloud synchronization.

---

## Features

### 💍 Wedding & Event Management
- **Multi-Wedding Dashboard:** Create, list, search, and manage multiple weddings and events.
- **Event Metadata:** Track event name, partner names, date, and venue details.
- **Collaboration & Sharing:** Share wedding seating arrangements with other registered users via email.
- **Access Control:** User-scoped wedding access integrated with cloud authentication.

### 👥 Guest Management
- **Guest Manager Modal:** Add, edit, rename, and delete individual guests or party groups.
- **Party & Companion Support:** Add Plus-One (`+1`, `+2`) companions and flag child guests (`isChild`).
- **Group Categorization:** Organize guests into custom groups/parties (e.g., Family, Groom Friends, Bride Colleagues).
- **Table Captains:** Assign table captain designations for seating leaders.
- **CSV Bulk Import:** Import guest lists directly from CSV with auto-detection of party sizes, children, and groups (includes downloadable sample template).
- **Search & Filter:** Real-time search across all guests, tables, and unassigned guest pools.

### 🪑 Table & Seating Canvas
- **Interactive Seating Workspace:** Visual table cards with real-time seat counts and capacity badges.
- **Customizable Tables:** Configure table numbers, aliases (custom names), and max seat capacities.
- **Drag-and-Drop & Context Actions:** Move or swap guests between tables seamlessly.
- **Visual Occupancy Indicators:** Instant color cues for available, full, and over-capacity tables.
- **Multi-View Modes:** Switch between standard list views, grouped views, and visual layout views.
- **Undo History:** Built-in multi-level undo stack (up to 10 historical actions) for table and seating modifications.
- **Unsaved Changes Protection:** Navigation warnings prevent accidental loss of arrangement data.

### 📄 Export & Reporting
- **Alphabetical Guest List PDF:** Export comprehensive guest directories sorted alphabetically by last name, with separate sections for adults and children.
- **Table-Grouped Seating PDF:** Print seating charts organized by table number with table captain badges and guest lists.
- **Guest Tickets PDF:** Generate printable place-cards / ticket lists showing guest names, companion counts, and assigned tables.
- **Group Tickets PDF:** Export tickets organized by party group.
- **JSON Backup & Restore:** Export full raw arrangement datasets in JSON format for offline backups or migration.

### 🎨 Planner Branding & White-labeling
- **Company Name & Tagline:** Set your event planning business name and contact information/website.
- **Custom Logo Upload:** Upload your planner logo (PNG/JPG/WEBP).
- **Workspace & PDF Integration:** Custom branding and logo automatically appear on the seating arrangement top bar and header of all exported PDF reports (Alphabetical, Grouped, and Guest Tickets).

### 👤 User Account & Subscriptions
- **User Profile Menu:** Quick-access dropdown on both dashboard and seating canvas showing user details, settings shortcut, and logout.
- **Account & Subscription Management:** Dedicated `/account` view detailing user credentials, active plan status, and subscription tier comparison tailored for event planners (Básico, Profesional, and Agencia / Ilimitado).

### 🕒 Automatic Backups & Recovery
- **Weekly Rolling Backups:** Automatically creates snapshot backups (`_backup_<timestamp>`) when arrangements are saved and at least 7 days have passed since the previous backup.
- **Retention Policy:** Automatically prunes old snapshots to keep up to 2 rolling backups per wedding.
- **Restore Interface:** View existing backup history and restore previous arrangement states directly from the settings modal.

### 🌐 Internationalization (i18n)
- **Bilingual Interface:** Full support for English and Spanish (Español).
- **Configurable Settings:** Persisted language preferences and default table size settings stored locally.

### 🔒 Authentication & Cloud Storage
- **OIDC Authentication:** Secure sign-in powered by AWS Cognito via OIDC with automatic silent token renewal.
- **Cloud Persistence:** S3-backed JSON storage through AWS Lambda serverless endpoints, with localStorage fallbacks for offline resilience.

---

## Tech Stack

| Category | Technology |
| :--- | :--- |
| **Frontend Framework** | React 19, React DOM |
| **Routing** | React Router DOM v7 |
| **UI Components & Icons** | Material-UI (MUI v7), `@mui/icons-material`, `@mui/x-data-grid` |
| **Styling** | Emotion (`@emotion/react`, `@emotion/styled`), CSS3 |
| **PDF Generation** | jsPDF |
| **Authentication** | AWS Cognito, `react-oidc-context`, `oidc-client-ts` |
| **Backend / Storage** | AWS Lambda (Serverless REST API), AWS S3 |
| **Testing** | Jest, React Testing Library (`@testing-library/react`, `@testing-library/jest-dom`) |

---

## Project Structure

```
sitting-chart/
├── public/                     # Static assets and HTML template
├── src/
│   ├── components/             # React UI components
│   │   ├── buttonAddWedding/   # Wedding list, create forms, and dialogs
│   │   ├── common/             # Global providers & UserMenu
│   │   ├── AccountPage         # Account info & subscription tiers view
│   │   ├── ConfigurationModal  # Settings, CSV import/export & backup restore modal
│   │   ├── ContextMenu         # Contextual table/guest actions
│   │   ├── CSVImporter         # CSV parser and sample generator
│   │   ├── GuestManagerModal   # Guest management, groups, and companions
│   │   ├── Login               # Authentication entry point
│   │   ├── ProtectedRoute      # OIDC route guard
│   │   ├── SeatingCanvas       # Main seating arrangement workspace
│   │   ├── TableList           # Table grid and seat cards
│   │   └── TopActionBar        # Top controls, save, undo, and PDF export menu
│   ├── config/
│   │   └── api.js              # Centralized API and backend endpoints
│   ├── hooks/                  # Custom React hooks (useWeddings, useSeatingTranslation)
│   ├── utils/                  # Helper utilities (backupService, guests, translations, slug, debug)
│   │   └── translations/       # English & Spanish translation dictionaries
│   ├── App.js                  # App router configuration
│   └── index.js                # App entry point with OIDC provider setup
└── package.json
```

---

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/rraygoza/sitting-chart.git
   cd sitting-chart
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables (optional):
   Create a `.env` file in the root directory:
   ```env
   REACT_APP_S3_API_BASE=https://<your-lambda-url>.on.aws/api/s3
   REACT_APP_WEDDINGS_API_BASE=https://<your-weddings-api-url>
   ```

### Running Locally

Start the development server:
```bash
npm start
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## Available Scripts

In the project directory, you can run:

- `npm start` – Runs the app in development mode with live reload.
- `npm test` – Runs the test suite in interactive watch mode.
- `npm run build` – Bundles the app for production in the `build/` folder.
- `npm run eject` – Ejects Create React App configuration (one-way operation).

---

## License

This project is private and intended for event and wedding seating chart management.
