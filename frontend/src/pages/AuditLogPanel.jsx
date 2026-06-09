import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/authSlice";
import api from "../services/api";
import FormSelect from "../components/FormBuilder/FormSelect";
import FormTable from "../components/FormBuilder/FormTable";

function AuditLogPanel() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, refreshToken } = useSelector((state) => state.auth);

  // Data states
  const [logs, setLogs] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [tableName, setTableName] = useState("");
  const [actionType, setActionType] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Detail overlay states
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: currentPage,
        limit: pageSize
      };

      if (tableName) params.tableName = tableName;
      if (actionType) params.actionType = actionType;

      const res = await api.get("/audit-logs", { params });
      setLogs(res.data.logs);
      setTotalItems(res.data.total);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to retrieve audit trail logs");
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, tableName, actionType]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
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

  // Helper to render JSON comparisons
  const renderJSONDifference = (oldData, newData) => {
    if (!oldData && !newData) return <div>No data available</div>;

    const allKeys = new Set([
      ...Object.keys(oldData || {}),
      ...Object.keys(newData || {})
    ]);

    // Ignore relations or metadata keys to keep comparison clean
    const ignoreKeys = ["id", "createdAt", "updatedAt", "images", "employeeSkills", "user", "department", "allocations", "history", "leaveRequests"];

    const diffs = [];

    allKeys.forEach(key => {
      if (ignoreKeys.includes(key)) return;

      const oldVal = oldData ? oldData[key] : undefined;
      const newVal = newData ? newData[key] : undefined;

      // Handle Stringification for objects/arrays if present
      const oldStr = typeof oldVal === "object" ? JSON.stringify(oldVal) : String(oldVal ?? "");
      const newStr = typeof newVal === "object" ? JSON.stringify(newVal) : String(newVal ?? "");

      if (oldStr !== newStr) {
        diffs.push({
          key,
          oldVal: oldVal === undefined ? null : oldStr,
          newVal: newVal === undefined ? null : newStr
        });
      }
    });

    if (diffs.length === 0) {
      return <div style={{ color: "var(--text-muted)", fontStyle: "italic" }}>No fields changed.</div>;
    }

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {diffs.map(d => (
          <div key={d.key} style={{
            borderBottom: "1px solid var(--border-glass)",
            paddingBottom: "0.5rem"
          }}>
            <div style={{ fontWeight: "600", fontSize: "0.9rem", color: "var(--primary)", marginBottom: "0.25rem" }}>
              {d.key.charAt(0).toUpperCase() + d.key.slice(1)}:
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", fontSize: "0.85rem", alignItems: "center" }}>
              {d.oldVal !== null && (
                <span style={{ color: "var(--danger)", textDecoration: "line-through", backgroundColor: "rgba(239, 68, 68, 0.1)", padding: "0.1rem 0.35rem", borderRadius: "0.25rem" }}>
                  {d.oldVal}
                </span>
              )}
              {d.oldVal !== null && d.newVal !== null && <span style={{ color: "var(--text-muted)" }}>➔</span>}
              {d.newVal !== null && (
                <span style={{ color: "var(--success)", backgroundColor: "rgba(16, 185, 129, 0.1)", padding: "0.1rem 0.35rem", borderRadius: "0.25rem" }}>
                  {d.newVal}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const columns = [
    { key: "id", label: "Log ID" },
    {
      key: "tableName",
      label: "Table Name",
      render: (row) => <span className="badge badge-skill">{row.tableName}</span>
    },
    {
      key: "actionType",
      label: "Action",
      render: (row) => (
        <span className="badge" style={{
          backgroundColor: row.actionType === "INSERT"
            ? "rgba(16, 185, 129, 0.15)"
            : row.actionType === "UPDATE"
              ? "rgba(245, 158, 11, 0.15)"
              : "rgba(239, 68, 68, 0.15)",
          color: row.actionType === "INSERT"
            ? "var(--success)"
            : row.actionType === "UPDATE"
              ? "var(--warning)"
              : "var(--danger)"
        }}>
          {row.actionType}
        </span>
      )
    },
    { key: "recordId", label: "Record ID" },
    {
      key: "performedBy",
      label: "Performed By",
      render: (row) => `User ID: ${row.performedBy || "System"}`
    },
    {
      key: "createdAt",
      label: "Timestamp",
      render: (row) => new Date(row.createdAt).toLocaleString()
    },
    {
      key: "details",
      label: "Audit Details",
      render: (row) => (
        <button
          className="btn-secondary"
          style={{ margin: 0, padding: "0.3rem 0.6rem", fontSize: "0.8rem", width: "auto" }}
          onClick={() => setSelectedLog(row)}
        >
          Compare Changes
        </button>
      )
    }
  ];

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
          <h2>Enterprise Audit Trail Logs</h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>
            Real-time change logs auditing inserts, updates, and deletes of employee profiles, assets, and leave requests.
          </p>

          {error && <div className="alert alert-error">{error}</div>}

          {/* Details Overlay Modal */}
          {selectedLog && (
            <div style={{
              position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: "rgba(0,0,0,0.85)", display: "flex",
              alignItems: "center", justifyContent: "center", zIndex: 100
            }}>
              <div className="glass-card" style={{ maxWidth: "550px", width: "90%", padding: "2rem" }}>
                <h3 style={{ margin: "0 0 0.5rem 0" }}>Compare Record Mutations</h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
                  Auditing <strong>{selectedLog.tableName}</strong> ID {selectedLog.recordId} modified by User {selectedLog.performedBy || "System"} at {new Date(selectedLog.createdAt).toLocaleString()}
                </p>

                <div style={{
                  maxHeight: "350px", overflowY: "auto", paddingRight: "0.5rem",
                  marginBottom: "1.5rem", textAlign: "left"
                }}>
                  {renderJSONDifference(selectedLog.oldData, selectedLog.newData)}
                </div>

                <div className="action-row" style={{ justifyContent: "flex-end", marginTop: "1rem" }}>
                  <button
                    className="btn-secondary"
                    onClick={() => setSelectedLog(null)}
                  >
                    Close Compare
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Filters Bar */}
          <div className="glass-card" style={{ maxWidth: "100%", padding: "1.25rem 2rem", marginBottom: "1.5rem" }}>
            <div className="responsive-filter-grid">
              <FormSelect
                label="Filter by Table"
                name="tableName"
                value={tableName}
                onChange={(e) => { setTableName(e.target.value); setCurrentPage(1); }}
                placeholder="All Tables"
                options={[
                  { value: "users", label: "Users Table" },
                  { value: "employee_profiles", label: "Employee Profiles Table" },
                  { value: "leave_requests", label: "Leave Requests Table" },
                  { value: "assets", label: "Assets Table" }
                ]}
                style={{ marginBottom: 0 }}
              />

              <FormSelect
                label="Filter by Action"
                name="actionType"
                value={actionType}
                onChange={(e) => { setActionType(e.target.value); setCurrentPage(1); }}
                placeholder="All Actions"
                options={[
                  { value: "INSERT", label: "INSERT (Creation)" },
                  { value: "UPDATE", label: "UPDATE (Modification)" },
                  { value: "DELETE", label: "DELETE (Removal)" }
                ]}
                style={{ marginBottom: 0 }}
              />

              <FormSelect
                label="Logs Per Page"
                name="pageSize"
                value={pageSize.toString()}
                onChange={(e) => { setPageSize(parseInt(e.target.value)); setCurrentPage(1); }}
                options={[
                  { value: "10", label: "10 logs" },
                  { value: "25", label: "25 logs" },
                  { value: "50", label: "50 logs" }
                ]}
                style={{ marginBottom: 0 }}
              />

              <button
                className="btn-secondary"
                style={{ margin: 0, padding: "0.55rem", fontSize: "0.9rem", width: "100%" }}
                onClick={() => { setTableName(""); setActionType(""); setCurrentPage(1); }}
              >
                Reset
              </button>
            </div>
          </div>

          <FormTable
            columns={columns}
            data={logs}
            loading={loading}
            currentPage={currentPage}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            emptyMessage="No audit logs records found in PostgreSQL."
          />
        </div>
      </main>
    </div>
  );
}

export default AuditLogPanel;
