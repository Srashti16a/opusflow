# Slide Presentation Outline - OpusFlow

This document outlines the slide-by-slide structure, core content, and speaker talking points for the Project Presentation.

---

## Slide 1: Cover Page / Title Slide
- **Title:** OpusFlow Enterprise Portal
- **Subtitle:** Streamlining Corporate Workflows, Asset Inventory, Leaves and Logging
- **Presenter:** Srashti
- **Organization:** OpusFlow
- **Talking Points:**
  - Introduce yourself and state the purpose of the presentation.
  - Explain that OpusFlow is a full-stack unified dashboard resolving typical back-office workflow challenges (employees, leaves, physical inventory, telemetry checks).

---

## Slide 2: Problem Statement & Project Objectives
- **Key Challenges Solved:**
  - Isolated database silos (leaves tracker vs. hardware inventory).
  - Lack of audit accountability for data modifications.
  - Difficulty in pulling unified SaaS reports (CSV/Excel/PDF).
  - Lack of unified telemetry to check API system health checks.
- **Objectives:**
  - Build a responsive, role-based dashboard using PostgreSQL.
  - Clean architecture separation (Controller-Service-Repository).
  - Provide detailed audit logs showing diffs of changed data entries.

---

## Slide 3: Core Tech Stack
- **Frontend Stack:** React.js, Redux Toolkit, Recharts, Vanilla CSS.
- **Backend Stack:** Node.js, Express.js, Prisma ORM, MULTER, Winston Logger.
- **Infrastructure:** Neon PostgreSQL (Cloud), Render Web Services (API), Vercel (Client).
- **Talking Points:**
  - Emphasize the choice of **Vite + React** for lightning-fast SPA loads.
  - Detail why **Prisma ORM** was used (type-safe queries, migration control).
  - State the deployment platform choices (automated CI/CD pipelines via GitHub).

---

## Slide 4: Database Schema Design (Neon PostgreSQL)
- **Key Entities:**
  - `User` (Credentials, salt hash, role authorization).
  - `EmployeeProfile` & `EmployeeImage` (Details, document list).
  - `Department` & `Skill` (Lookup masters).
  - `LeaveApplication` & `LeaveBalance` (Vacation allocations).
  - `Asset` & `AssetAllocation` (Device inventories).
  - `AuditLog` (JSON old vs. new state).
- **Talking Points:**
  - Walk through the foreign-key relations connecting Users to profiles, and profiles to assets/leaves.
  - Highlight indexing on columns like `status`, `assetCode`, and `userId` to boost lookup speeds.

---

## Slide 5: Highlight Feature: Unified Navigation & RBAC
- **Aesthetics & Navigation:**
  - Unified `<Navbar />` with active state highlights.
  - Light premium CSS theme replacing basic dark backgrounds.
- **Access Roles:**
  - **Employee:** View own profile, apply for leaves, view allocated assets.
  - **Manager / HR:** Create/edit employee records, review and process leave queues.
  - **Admin:** Configure core system, view real-time diagnostics, and review full system audit logs.

---

## Slide 6: Highlight Feature: Immutable Audit Trails
- **System Telemetry Logging:**
  - Automatic logger middleware records all mutations.
  - Captures `tableName`, `actionType` (Create, Update, Delete), and timestamp.
  - Saves the precise `oldData` and `newData` as JSONB payloads.
- **Talking Points:**
  - Show how the Admin panel displays side-by-side JSON diffs.
  - Highlight the compliance benefits: complete visibility of who changed what database entries and when.

---

## Slide 7: Technical Challenges Resolved
- **Dynamic File Serving:**
  - Avoided hardcoded local API URL patterns (`http://localhost:5000`) for thumbnail paths.
  - Implemented dynamic `getBackendURL()` resolving dynamically for both local dev and production.
- **Dynamic CORS Policy:**
  - Restored dynamic CORS allowed origins (`FRONTEND_URL` + vercel domain).
- **Compilation Safety:**
  - Debugged and resolved missing return statements causing JS build-time failures.

---

## Slide 8: Deployment Configuration
- **Neon Cloud DB:** Provisioned DB and ran `prisma db push`.
- **Render Backend Web Service:**
  - Installs npm packages and boots service using `npm start` command.
  - Injects variables: `DATABASE_URL`, `JWT_SECRET`, `NODE_ENV`.
- **Vercel Frontend Client:**
  - Configures Vite variables: `VITE_API_URL` targeting render backend API.

---

## Slide 9: Learning Outcomes & Summary
- **Primary Takeaways:**
  - Mastered full-stack state management using React hooks + Redux slices.
  - Gained hands-on experience designing robust database entities.
  - Learned troubleshooting practices for deployment configurations and CORS.
- **Conclusion:**
  - OpusFlow is live, fully documented, and ready for use!
