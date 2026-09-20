# CivicEye

Build the initial CivicEye web application as a professional, modular civic issue reporting and resolution platform.

IMPORTANT:

Do NOT create one giant file.

Use a clean component-based architecture.

Keep pages, components, services, hooks, and utilities separated.

Do not create fake backend functionality.

Do not use hardcoded mock data for functionality that should come from Supabase.

Use Supabase as the backend.

The application must be designed so Claude AI and YOLO-based computer vision can be integrated later through secure server-side functions.

Never expose secret API keys in frontend code.

Keep the architecture easy to maintain and extend.

PRODUCT:
CivicEye allows citizens to report civic problems such as:

potholes

garbage accumulation

broken streetlights

damaged roads

drainage problems

water leakage

public infrastructure damage

other civic issues

INITIAL USER ROLES:

Citizen

Field Worker

Authority/Admin

INITIAL PAGES:

Landing page

Login

Register

Citizen Dashboard

Create Report

My Reports

Report Details

Authority Dashboard

Field Worker Dashboard

Admin Dashboard

Profile/Settings

DESIGN:

Professional

Modern

Simple

Government/public-service appropriate

Clean typography

Accessible

Responsive

Desktop and mobile friendly

Avoid excessive gradients, animations, glassmorphism, or flashy effects

Use a consistent design system

Use reusable UI components

CITIZEN REPORT FLOW:
Citizen logs in
→ opens Create Report
→ selects issue category
→ adds description
→ uploads image/video if applicable
→ captures location
→ submits report
→ receives report ID
→ can track status

REPORT STATUS:
Submitted
→ AI Analysis
→ Verified
→ Assigned
→ In Progress
→ Resolved
→ Citizen Verification
→ Closed

IMPORTANT:
For now, implement the UI and application structure cleanly, but do not pretend that AI analysis, computer vision, or authority workflows are functional unless they are actually connected to Supabase.

Use Supabase Auth for authentication.

Create a clear service layer for Supabase operations so backend interactions are not scattered throughout UI components.

Prepare the project for:

PostgreSQL

PostGIS

Supabase Storage

Supabase Realtime

Supabase Edge Functions

Claude API

YOLOv11 computer vision

Do not create the Claude or YOLO integration yet.

First establish a clean, working CivicEye frontend connected to Supabase.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/d92c3c9d-6a26-49fb-af64-97f52ac0faaf).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
