const prisma = require("../config/db");

async function main() {
  console.log("Setting up database view and stored functions...");

  // 1. Create View: employee_summary
  console.log("Creating SQL view: employee_summary...");
  await prisma.$executeRawUnsafe(`
    CREATE OR REPLACE VIEW employee_summary AS
    SELECT
      u.name,
      d.department_name,
      ep.designation
    FROM users u
    JOIN employee_profiles ep ON u.id = ep.user_id
    JOIN departments d ON d.id = ep.department_id;
  `);
  console.log("View employee_summary created/updated.");

  // 2. Create View: employee_dashboard_view
  console.log("Creating SQL view: employee_dashboard_view...");
  await prisma.$executeRawUnsafe(`
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
  `);
  console.log("View employee_dashboard_view created/updated.");

  // 3. Create View: leave_summary_view
  console.log("Creating SQL view: leave_summary_view...");
  await prisma.$executeRawUnsafe(`
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
  `);
  console.log("View leave_summary_view created/updated.");

  // 4. Create View: asset_summary_view
  console.log("Creating SQL view: asset_summary_view...");
  await prisma.$executeRawUnsafe(`
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
  `);
  console.log("View asset_summary_view created/updated.");

  // 5. Create Stored Function: calculate_leave_balance
  console.log("Creating Pl/pgSQL function: calculate_leave_balance...");
  await prisma.$executeRawUnsafe(`
    CREATE OR REPLACE FUNCTION calculate_leave_balance(emp_profile_id INT, type_of_leave VARCHAR)
    RETURNS INTEGER AS $$
    DECLARE
      total_days INTEGER;
      allowed_leaves INTEGER := 30; -- standard maximum leaves
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
  `);
  console.log("Stored function calculate_leave_balance created/updated.");
  console.log("Database components setup completed successfully!");
}

main()
  .catch((err) => {
    console.error("Error setting up database components:", err);
    process.exit(1);
  })
  .finally(async () => {
    try {
      await prisma.$disconnect();
    } catch (err) {}
  });
