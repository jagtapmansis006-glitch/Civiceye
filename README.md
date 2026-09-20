🏛️ CivicEye

A professional, modular civic issue reporting and resolution platform empowering citizens, field workers, and municipal authorities.

📌 Overview

CivicEye bridges the gap between citizens and local government authorities. It provides a seamless platform for reporting public infrastructure issues—such as potholes, garbage accumulation, broken streetlights, and drainage problems—while offering end-to-end tracking from submission to resolution.

Designed with modularity and scalability at its core, CivicEye relies on Supabase for real-time data persistence, authentication, and storage, while laying the architectural foundation for multi-modal AI processing (Claude API + YOLOv11 Computer Vision).

✨ Key Features

👥 Multi-Role Access Control

Citizen Portal: Report issues with geo-location and media attachments, track live report statuses, and verify completed work.

Field Worker View: Inspect assigned tasks, update on-site resolution statuses, and upload proof of work.

Authority / Admin Dashboard: Manage regional issue queues, route tickets to field workers, analyze resolution metrics, and manage user roles.

📝 Citizen Report Lifecycle

[ Submitted ] ➔ [ AI Analysis ] ➔ [ Verified ] ➔ [ Assigned ]
                                                       │
[ Closed ] ◄── [ Citizen Verification ] ◄── [ Resolved ] ◄── [ In Progress ]


🎯 Core Infrastructure

Clean Service Layer: Decoupled backend operations (/src/services/supabase) ensure zero hardcoded mock data and keep UI components lean.

Role-Based Auth: Secure authentication powered by Supabase Auth and Row Level Security (RLS).

Media Uploads: High-resolution image/video uploads integrated directly with Supabase Storage buckets.

Location Capture: Interactive mapping and GPS coordinate extraction for precise issue pinning.

🛠️ Tech Stack

Frontend: React, TypeScript, Vite, Tailwind CSS, Lucide Icons

Backend & Database: Supabase (PostgreSQL, PostGIS, Realtime, Storage)

State & Data Fetching: TanStack Query / React Hooks

Prepared AI Pipeline: Claude API (for natural language triage) & YOLOv11 (for automated image severity detection) via Supabase Edge Functions.

📁** Repository Architecture**

```text
CivicEye/
├── public/                 # Static assets & public resources
├── src/
│   ├── assets/             # Brand logos, icons, and media
│   ├── components/         # Reusable UI components
│   │   ├── common/         # Layouts, Navigation, Badges
│   │   └── reports/        # Issue-specific components & status timeline
│   ├── hooks/              # Custom React hooks (useAuth, useReports, useGeoLocation)
│   ├── pages/              # Page views matching core routes
│   │   ├── Landing.tsx
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── CitizenDashboard.tsx
│   │   ├── CreateReport.tsx
│   │   ├── MyReports.tsx
│   │   ├── ReportDetails.tsx
│   │   ├── FieldWorkerDashboard.tsx
│   │   ├── AuthorityDashboard.tsx
│   │   └── AdminDashboard.tsx
│   ├── services/           # Supabase client & clean API abstraction layer
│   │   └── supabase/
│   │       ├── auth.ts
│   │       ├── reports.ts
│   │       └── storage.ts
│   ├── types/              # TypeScript definitions & Supabase DB schemas
│   └── utils/              # Helper functions (date formatting, geo-parsers)
├── supabase/
│   ├── functions/          # Edge Functions (Claude/YOLO stubs)
│   └── migrations/         # SQL schema & RLS policies
├── .env.example            # Environment variables placeholder schema
├── package.json            # Project dependencies & build scripts
└── vite.config.ts          # Vite configuration

🚀 Getting Started

Prerequisites

Ensure you have the following installed on your machine:

Node.js (v18.x or higher)

npm

A Supabase project instance

Local Installation

Clone the repository:

git clone https://github.com/jagtapmansis006-glitch/Civiceye.git
cd Civiceye


Install dependencies:

npm install


Configure Environment Variables:
Copy .env.example to create your local .env file:

cp .env.example .env


Open .env and fill in your Supabase project credentials:

VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key


Run the local development server:

npm run dev


Navigate to http://localhost:5173 in your browser.

🗄️ Database Setup (Supabase)

To enable the backend functionality, run the provided migrations in your Supabase SQL Editor:

Tables Required:

profiles (links with auth.users, stores user role: citizen, field_worker, authority, admin)

reports (stores title, description, category, latitude/longitude, status, user_id)

report_media (stores image/video URLs linked to reports)

assignments (tracks field worker assignments and resolution proof)

Storage Buckets:

Create a public bucket named report-media for upload attachments.

🤖 Future Roadmap (AI Integration)

The frontend architecture is explicitly structured to support secure, server-side AI integrations without client-side API key exposure:

Claude API (via Supabase Edge Functions): Automated categorization, summary generation, and urgency detection from citizen descriptions.

YOLOv11 Computer Vision: Automated visual verification of uploaded images to classify issue severity (e.g., measuring pothole depth/surface area).

PostGIS Geospatial Queries: Automated proximity clustering to identify duplicated issue reports within a tight geographic radius.

🤝 Contributing

Fork the project repository.

Create your Feature Branch (git checkout -b feature/AmazingFeature).

Commit your changes (git commit -m 'feat: Add some AmazingFeature').

Push to the Branch (git push origin feature/AmazingFeature).

Open a Pull Request.

📄 License

Distributed under the MIT License. See LICENSE for more information.
