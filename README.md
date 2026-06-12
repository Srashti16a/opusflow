# eventhub360 - Employee & Asset Management System

A unified enterprise workflow management portal built to streamline employee profiles registry, leaves queue approvals, corporate asset inventories allocation, audit logging, and high-performance SaaS reporting.

## Features

- **Role-Based Access Control (RBAC):** Admin, Manager, HR, and Employee roles with customized navigation menus.
- **Unified Navigation Header:** Consistent look, feel, and context-dependent links across all views.
- **Employee Management:** Full-featured CRUD, designations, salary records, skills tags assignment, and multi-file document uploads (Aadhar, Resume, Certificate).
- **Corporate Asset Inventory:** Track stock distribution (allocated vs. available), request/allocate devices, and manage return flows.
- **Leave Panel Engine:** Casual, sick, and paid leave applications, dynamic balances calculations, and instant manager approval/rejection overrides with feedback details.
- **SaaS Reporting Monitor:** Dynamic Excel workbooks, CSV spreadsheets downloads, and high-resolution PDF exports with advanced multi-parameter server-side searching/filtering.
- **System Diagnostics Monitor:** Real-time system diagnostics telemetry, HTTP request traffic counters, registered account numbers, and heap/RSS memory analysis.
- **Enterprise Audit Logging:** Immutable trail logging tracking data mutations (old vs. new JSON states diffing) and transactional values.

---

## Tech Stack

- **Frontend:** React.js (Vite), Redux Toolkit, React Router DOM, Recharts, Vanilla CSS.
- **Backend:** Node.js, Express.js, Prisma ORM, Multer, Node-cron.
- **Database:** PostgreSQL (Cloud Neon Database).
- **Aesthetics:** Elegant Premium Light Theme, dynamic hover effects, and modular layouts.

---

## Installation Steps

### Prerequisites
- Node.js (v18+)
- PostgreSQL Database instance

### 1. Database Setup
1. Create a database on [Neon PostgreSQL](https://neon.tech/).
2. Run database migrations to provision the schema:
   ```bash
   cd backend
   npx prisma migrate dev
   ```

### 2. Backend Installation & Setup
1. Navigate to the backend directory and install dependencies:
   ```bash
   cd backend
   npm install
   ```
2. Create a `.env` file in the `backend/` root with:
   ```env
   PORT=5000
   DATABASE_URL=your_neon_postgresql_connection_string
   JWT_SECRET=your_super_secret_jwt_key
   NODE_ENV=production
   ```
3. Start the server:
   ```bash
   npm start
   ```

### 3. Frontend Installation & Setup
1. Navigate to the frontend directory and install dependencies:
   ```bash
   cd frontend
   npm install
   ```
2. Create a `.env` file in the `frontend/` root with:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

---

## Deployment URLs

- **Live Frontend URL:** `https://eventhub360-srashti.vercel.app`
- **Live Backend API URL:** `https://eventhub360-kbam.onrender.com`
- **Cloud Database:** Hosted on Neon PostgreSQL.

---

## Credits

- **Developer Name:** Srashti
- **Organization:** eventhub360
