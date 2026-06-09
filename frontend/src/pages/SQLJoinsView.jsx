import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/authSlice";
import api from "../services/api";

// SQL query strings for display
const QUERIES = {
  join1: {
    title: "Query 1: Employee + Department",
    description: "INNER JOIN between employee_profiles, users, and departments tables.",
    sql: `SELECT
  u.name,
  ep.designation,
  d.department_name
FROM employee_profiles ep
INNER JOIN users u
  ON ep.user_id = u.id
INNER JOIN departments d
  ON ep.department_id = d.id;`
  },
  join2: {
    title: "Query 2: Employee + Skills",
    description: "INNER JOIN linking employee_skills → employee_profiles → users → skills.",
    sql: `SELECT
  u.name,
  s.skill_name
FROM employee_skills es
INNER JOIN employee_profiles ep
  ON es.employee_id = ep.id
INNER JOIN users u
  ON ep.user_id = u.id
INNER JOIN skills s
  ON es.skill_id = s.id;`
  },
  join3: {
    title: "Query 3: Pending Leaves",
    description: "INNER JOIN leave_applications + users + leave_types filtered by status = 'Pending'.",
    sql: `SELECT
  u.name,
  lt.leave_name,
  la.status
FROM leave_applications la
INNER JOIN employee_profiles ep
  ON la.employee_id = ep.id
INNER JOIN users u
  ON ep.user_id = u.id
INNER JOIN leave_types lt
  ON la.leave_type_id = lt.id
WHERE la.status = 'Pending';`
  },
  join4: {
    title: "Query 4: Department-wise Employee Count (GROUP BY)",
    description: "GROUP BY department_name to count employees per department.",
    sql: `SELECT
  d.department_name,
  COUNT(*) AS total_employees
FROM employee_profiles ep
INNER JOIN departments d
  ON ep.department_id = d.id
GROUP BY d.department_name;`
  }
};

function SQLJoinsView() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, refreshToken } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState("join1");
  const [data, setData] = useState({ join1: [], join2: [], join3: [], join4: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchJoins();
  }, []);

  const fetchJoins = async () => {
    try {
      setLoading(true);
      const res = await api.get("/employees/queries/joins");
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load SQL query results");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout", { refreshToken });
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      dispatch(logout());
      navigate("/");
    }
  };

  const tabs = ["join1", "join2", "join3", "join4"];
  const tabLabels = {
    join1: "Q1 — Employee + Dept",
    join2: "Q2 — Employee + Skills",
    join3: "Q3 — Pending Leaves",
    join4: "Q4 — Dept COUNT (GROUP BY)"
  };

  const renderTable = () => {
    const rows = data[activeTab] || [];
    if (rows.length === 0) {
      return (
        <tr>
          <td colSpan="5" style={{ textAlign: "center", color: "var(--text-muted)", padding: "2rem" }}>
            No records returned.
          </td>
        </tr>
      );
    }

    if (activeTab === "join1") {
      return rows.map((row, idx) => (
        <tr key={idx}>
          <td>{idx + 1}</td>
          <td><strong>{row.name}</strong></td>
          <td style={{ color: "var(--text-secondary)" }}>{row.designation}</td>
          <td>
            <span className="badge badge-manager" style={{ backgroundColor: "rgba(245,158,11,0.15)" }}>
              {row.department_name}
            </span>
          </td>
        </tr>
      ));
    }

    if (activeTab === "join2") {
      return rows.map((row, idx) => (
        <tr key={idx}>
          <td>{idx + 1}</td>
          <td><strong>{row.name}</strong></td>
          <td>
            <span className="badge badge-skill" style={{ backgroundColor: "rgba(99,102,241,0.15)", color: "var(--primary)" }}>
              {row.skill_name}
            </span>
          </td>
        </tr>
      ));
    }

    if (activeTab === "join3") {
      return rows.map((row, idx) => (
        <tr key={idx}>
          <td>{idx + 1}</td>
          <td><strong>{row.name}</strong></td>
          <td>{row.leave_name}</td>
          <td style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>{row.reason}</td>
          <td>
            <span className="badge badge-admin" style={{ backgroundColor: "rgba(245,158,11,0.2)", color: "#f59e0b" }}>
              {row.status}
            </span>
          </td>
        </tr>
      ));
    }

    if (activeTab === "join4") {
      return rows.map((row, idx) => (
        <tr key={idx}>
          <td>{idx + 1}</td>
          <td>
            <span className="badge badge-manager" style={{ backgroundColor: "rgba(245,158,11,0.12)" }}>
              {row.department_name}
            </span>
          </td>
          <td>
            <strong style={{ fontSize: "1.1rem", color: "var(--primary)" }}>
              {String(row.total_employees)}
            </strong>
          </td>
        </tr>
      ));
    }

    return null;
  };

  const getHeaders = () => {
    if (activeTab === "join1") return ["#", "Employee Name", "Designation", "Department"];
    if (activeTab === "join2") return ["#", "Employee Name", "Skill"];
    if (activeTab === "join3") return ["#", "Employee Name", "Leave Type", "Reason", "Status"];
    if (activeTab === "join4") return ["#", "Department", "Total Employees"];
    return [];
  };

  return (
    <div className="dashboard-layout">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-brand">i-SOFTZONE Technologies</div>
        <div className="navbar-user">
          <Link to="/dashboard" style={{ color: "var(--text-secondary)", fontWeight: "600", textDecoration: "none", fontSize: "0.95rem" }}>
            Dashboard
          </Link>
          {user && (
            <span className={`badge badge-${user.role}`} style={{ marginLeft: "1rem" }}>
              {user.role}
            </span>
          )}
          <button className="btn-logout" onClick={handleLogout} style={{ marginLeft: "1rem" }}>
            Log out
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="dashboard-content">
        <div style={{ textAlign: "left" }}>
          <h2>SQL JOIN Practice Queries</h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
            Live execution of all 4 practice queries on the i-SOFTZONE PostgreSQL database.
            Demonstrates INNER JOIN, GROUP BY, and WHERE clause filtering.
          </p>

          {error && <div className="alert alert-error">{error}</div>}

          {/* Tab Buttons */}
          <div className="tab-buttons" style={{ flexWrap: "wrap", gap: "0.5rem" }}>
            {tabs.map((tab) => (
              <button
                key={tab}
                className={`tab-btn ${activeTab === tab ? "active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tabLabels[tab]}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ color: "var(--text-secondary)", textAlign: "center", padding: "4rem" }}>
              Executing SQL queries against database...
            </div>
          ) : (
            <div>
              {/* Query Info */}
              <h3 style={{ margin: "1.5rem 0 0.4rem 0" }}>{QUERIES[activeTab].title}</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "1rem" }}>
                {QUERIES[activeTab].description}
              </p>

              {/* SQL Code Block */}
              <div className="sql-code-block" style={{ whiteSpace: "pre" }}>
                {QUERIES[activeTab].sql}
              </div>

              {/* Result Badge */}
              <div style={{ margin: "1rem 0 0.5rem", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                ✅ <strong style={{ color: "var(--success)" }}>{(data[activeTab] || []).length} rows</strong> returned
              </div>

              {/* Results Table */}
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      {getHeaders().map((h, i) => <th key={i}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {renderTable()}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default SQLJoinsView;
