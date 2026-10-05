# Landslide Gaurd NER Disaster Dashboard — Frontend

Modern React + TypeScript + Vite frontend for the **AI-Powered Real-Time Landslide Risk Monitoring & Early-Warning Platform for North Eastern Region (NER), India**.

## Overview

The Landslide Gaurd NER Disaster Dashboard provides a dual-role interface:
1. **Public Citizen Portal**: Designed for citizens and visitors in landslide-prone regions of North Eastern India. Offers real-time risk zone maps, localized risk levels, emergency guidance, multilingual support (English, Assamese, Bengali, Hindi), and a one-tap SOS distress trigger.
2. **Officer & Admin Dashboard**: Designed for SDRF/NDRF emergency response teams, field officers, and district disaster administrators. Provides live spatial telemetry, active alert management, field report verification, incident dispatch controls, and cross-agency situational awareness.

---

## Tech Stack

- **Framework**: React 18 (Vite 6, TypeScript 5.7)
- **Styling**: Modern CSS variables system with glassmorphism UI, emergency color palettes, and responsive design
- **Mapping**: Leaflet 1.9 (`react-leaflet` / native Leaflet bindings) with custom risk zone polygons, pin overlays, and satellite/terrain basemaps
- **Icons**: Lucide React (`lucide-react`)
- **Backend & Auth Integration**:
  - Direct connection to **Supabase Auth** & **Supabase Database** via `@supabase/supabase-js`
  - Integration with **Spring Boot API Gateway** (`/api/v1/`) for risk evaluation, predictions, and alerts

---

## Key Features

- **Dual-Role Switching**: Seamlessly toggle between `PUBLIC` (Citizen) and `OFFICER` (Emergency Response) operating modes.
- **Interactive Risk Map**: Visualizes high-risk zones across NER states (Sikkim, Meghalaya, Assam, Arunachal Pradesh, Mizoram, Nagaland, Manipur, Tripura) with color-coded risk levels (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`).
- **Emergency Alert Banner**: Dynamic sticky notification bar highlighting active critical alerts with quick acknowledgment and resolution actions for emergency officers.
- **SOS Distress Panel**: One-touch distress signal dispatcher supporting location auto-capture, emergency contact triggers, and direct alert broadcast.
- **Multilingual Support**: Supports English (`en`), Assamese (`as`), Bengali (`bn`), and Hindi (`hi`).
- **Real-Time Data Sync**: Listens to active risk predictions, weather events, and field officer reports with fallback mock data when offline.

---

## Project Structure

```
src/
├── components/          # UI Components
│   ├── Header.tsx                 # Top navigation bar with role switcher, language picker & live status
│   ├── PublicPortal.tsx           # Citizen view with risk maps, safety guidelines & zone search
│   ├── OfficerDashboard.tsx       # Responder view with live telemetry, field reports & dispatch actions
│   ├── EmergencyAlertBanner.tsx   # Top banner displaying high-priority active alerts
│   ├── EmergencyActionPanel.tsx   # SOS modal for citizen emergency assistance
│   └── AuthModal.tsx              # Supabase Auth modal (Login / Registration / Role selection)
├── services/            # API & Auth Services
│   ├── api.ts                     # REST Client for Spring Boot backend & local fallbacks
│   └── authService.ts             # Supabase Authentication helper service
├── styles/              # Global CSS & Variables
│   ├── variables.css              # Design tokens (colors, typography, shadows, z-index)
│   └── index.css                  # Global styles & responsive rules
├── types/               # TypeScript interfaces & type definitions
└── utils/               # Helper utilities & language translation keys
```

---

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher

### Environment Setup

Create a `.env` file in the `frontend/` directory (or use `.env.example` if available):

```env
VITE_SUPABASE_URL=https://<your-supabase-project>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

### Installation & Execution

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Build for production
npm run build

# 4. Preview production build
npm run preview
```

The application will be accessible at `http://localhost:5173` (or the port output by Vite).

---

## Connecting with Backends

1. **Authentication**: Handled directly via `@supabase/supabase-js` contacting Supabase Auth.
2. **Disaster Data**: Fetches risk zones, weather statistics, field reports, and active alerts from the Spring Boot Backend API (`http://localhost:8080/api/v1`).
3. **Fallback Mode**: If the Spring Boot backend or Supabase service is unreachable, the dashboard automatically operates in **Offline Fallback Mode** with sample risk zones for NER to ensure operational availability during network disruptions.
