# Database Optimization Report: i-SOFTZONE ERP System Upgrade

This report details the database optimization strategies, indexing, custom views, and Pl/pgSQL functions applied to transition **i-SOFTZONE Technologies** ERP database to enterprise-grade production readiness.

---

## 1. Database Indexing Scheme
To resolve query performance bottlenecks and minimize execution plan overhead for high-traffic relational tables, we added `@@index` annotations in `prisma/schema.prisma` mapping directly to PostgreSQL B-Tree index structures.

### Implemented Indexes:
| Table Name | Index Field(s) | Primary Purpose | Query Optimization |
| :--- | :--- | :--- | :--- |
| `employee_profiles` | `userId` | Speed up user profile fetching on session/token lookup | `GET /api/v1/employees/me` |
| `employee_profiles` | `departmentId` | Optimize department filter loads and split layouts | `GET /api/v1/employees?departmentId=X` |
| `leave_applications`| `employeeId` | Accelerate my-leaves requests history fetches | `GET /api/v1/leaves/my-requests` |
| `leave_applications`| `leaveTypeId` | Speed up leave balance calculations | `GET /api/v1/leaves/balance` |
| `leave_applications`| `status` | Optimize pending requests lookup for Admins/Managers | `GET /api/v1/leaves/pending` |
| `assets` | `assetCode` | Accelerate asset lookup by unique identification codes | `GET /api/v1/assets/:code` |
| `assets` | `status` | Speed up asset allocation statistics compilation | `GET /api/v1/employees/dashboard/stats` |
| `asset_allocations` | `assetId` | Speed up asset history tracking | `GET /api/v1/assets/history` |
| `asset_allocations` | `employeeId` | Speed up profile asset allocation retrieval | `GET /api/v1/employees/me` |
| `notifications` | `userId`, `isRead` | Optimize cleanup cron jobs and notifications loading | `GET /api/v1/notifications` |
| `audit_logs` | `tableName`, `actionType` | Optimize action tracking and audit logging audits | `GET /api/v1/audit-logs` |

---

## 2. PostgreSQL Stored Procedures
We defined a custom Pl/pgSQL stored function to isolate business logic calculations directly inside the database engine.

### Stored Function: `calculate_leave_balance`
- **Location**: Executed via script `scripts/create-db-components.js` and defined in database public schema.
- **Implementation**:
```sql
CREATE OR REPLACE FUNCTION calculate_leave_balance(emp_profile_id INT, type_of_leave VARCHAR)
RETURNS INTEGER AS $$
DECLARE
  total_days INTEGER;
  allowed_leaves INTEGER := 30; -- Standard maximum leaves allocation
  taken_leaves INTEGER;
BEGIN
  SELECT COALESCE(SUM(EXTRACT(DAY FROM (end_date - start_date)) + 1), 0)::INTEGER
  INTO taken_leaves
  FROM leave_requests
  WHERE employee_profile_id = emp_profile_id
    AND leave_type = type_of_leave
    AND status = 'approved';

  total_days := allowed_leaves - taken_leaves;
  RETURN total_days;
END;
$$ LANGUAGE plpgsql;
```
- **Benefit**: Computes remaining leave balance directly inside PostgreSQL on transaction threads, avoiding database roundtrip overheads of fetching history records to Node memory space.

---

## 3. SQL Database Views for Reporting
We created custom SQL views to simplify complex multi-table JOINs and optimize dashboard data ingestion.

### A. `employee_dashboard_view`
Aggregates salary, profile parameters, department listings, and counts of active approved leaves and allocated assets.
```sql
CREATE OR REPLACE VIEW employee_dashboard_view AS
SELECT
  ep.id AS employee_profile_id,
  u.name AS employee_name,
  u.email AS employee_email,
  d.department_name,
  ep.designation,
  ep.salary,
  (
    SELECT COUNT(*)::INTEGER 
    FROM leave_requests lr 
    WHERE lr.employee_profile_id = ep.id AND lr.status = 'approved'
  ) AS approved_leaves_count,
  (
    SELECT COUNT(*)::INTEGER 
    FROM asset_allocations aa 
    WHERE aa.employee_id = ep.id AND aa.status = 'allocated'
  ) AS allocated_assets_count
FROM employee_profiles ep
LEFT JOIN users u ON ep.user_id = u.id
LEFT JOIN departments d ON ep.department_id = d.id;
```

### B. `leave_summary_view`
Simplifies leave records tracking, duration calculations, status checks, and corresponding employee profiles details.
```sql
CREATE OR REPLACE VIEW leave_summary_view AS
SELECT
  lr.id AS leave_id,
  u.name AS employee_name,
  d.department_name,
  lr.leave_type,
  lr.start_date,
  lr.end_date,
  (lr.end_date - lr.start_date + interval '1 day') AS leave_duration,
  lr.status,
  lr.reason,
  lr.created_at
FROM leave_requests lr
JOIN employee_profiles ep ON lr.employee_profile_id = ep.id
LEFT JOIN users u ON ep.user_id = u.id
LEFT JOIN departments d ON ep.department_id = d.id;
```

### C. `asset_summary_view`
Links asset configurations with ongoing allocation assignments, ownership detail mappings, and returns tracking.
```sql
CREATE OR REPLACE VIEW asset_summary_view AS
SELECT
  a.id AS asset_id,
  a.asset_code,
  a.asset_name,
  a.asset_type,
  a.status AS asset_status,
  aa.status AS allocation_status,
  aa.allocated_date,
  aa.return_date,
  u.name AS owner_name
FROM assets a
LEFT JOIN asset_allocations aa ON a.id = aa.asset_id AND aa.status = 'allocated'
LEFT JOIN employee_profiles ep ON aa.employee_id = ep.id
LEFT JOIN users u ON ep.user_id = u.id;
```
