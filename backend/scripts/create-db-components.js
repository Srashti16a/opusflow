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

  // 2. Create Stored Function: calculate_leave_balance
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
