const prisma = require("../config/db");

async function main() {
  console.log("Setting up database view and stored functions...");

  console.log("Dropping existing views if any...");
  await prisma.$executeRawUnsafe(`DROP VIEW IF EXISTS employee_summary CASCADE;`);
  await prisma.$executeRawUnsafe(`DROP VIEW IF EXISTS employee_dashboard_view CASCADE;`);
  await prisma.$executeRawUnsafe(`DROP VIEW IF EXISTS leave_summary_view CASCADE;`);
  await prisma.$executeRawUnsafe(`DROP VIEW IF EXISTS asset_summary_view CASCADE;`);

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
        FROM leave_applications la 
        WHERE la.employee_id = ep.id AND la.status = 'Approved'
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
      la.id AS leave_id,
      u.name AS employee_name,
      d.department_name,
      lt.leave_name AS leave_type,
      la.from_date AS start_date,
      la.to_date AS end_date,
      la.total_days AS leave_duration,
      la.status,
      la.reason,
      la.created_at
    FROM leave_applications la
    JOIN leave_types lt ON la.leave_type_id = lt.id
    JOIN employee_profiles ep ON la.employee_id = ep.id
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
      remaining_leaves INTEGER;
      allowed_leaves INTEGER;
      taken_leaves INTEGER;
    BEGIN
      SELECT COALESCE(total_days, 30) INTO allowed_leaves
      FROM leave_types
      WHERE leave_name = type_of_leave;

      IF allowed_leaves IS NULL THEN
        allowed_leaves := 30;
      END IF;

      SELECT COALESCE(SUM(la.total_days), 0)::INTEGER
      INTO taken_leaves
      FROM leave_applications la
      JOIN leave_types lt ON la.leave_type_id = lt.id
      WHERE la.employee_id = emp_profile_id
        AND lt.leave_name = type_of_leave
        AND la.status = 'Approved';

      remaining_leaves := allowed_leaves - taken_leaves;
      RETURN remaining_leaves;
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
