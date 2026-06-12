import { useState, useEffect } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [health, setHealth] = useState(null);
  const [healthLoading, setHealthLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
    fetchHealth();
    
    // Poll telemetry data every 10 seconds for real-time dashboard updates
    const interval = setInterval(fetchHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/user/admin/users");
      setUsers(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load registered users");
    } finally {
      setLoading(false);
    }
  };

  const fetchHealth = async () => {
    try {
      setHealthLoading(true);
      const res = await api.get("/health");
      setHealth(res.data);
    } catch (err) {
      console.error("Failed to load health telemetry:", err);
    } finally {
      setHealthLoading(false);
    }
  };

  const formatUptime = (seconds) => {
    if (!seconds) return "0s";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h > 0 ? h + "h " : ""}${m > 0 ? m + "m " : ""}${s}s`;
  };

  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete the user account for "${name}"?`)) {
      return;
    }

    try {
      setError(null);
      setSuccess(null);
      const res = await api.delete(`/user/admin/users/${id}`);
      setSuccess(res.data.message);
      // Filter out deleted user
      setUsers(users.filter(u => u.id !== id));
      // Re-fetch health to update registered user count metric
      fetchHealth();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete user account");
    }
  };

  return (
    <div className="dashboard-layout">
      <Navbar />

      {/* Main Content */}
      <main className="dashboard-content">
        <div style={{ textAlign: "left" }}>
          <h2>Admin Control Panel</h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>
            View and manage user registration records.
          </p>

          {/* System Telemetry & Health Section */}
          <div className="telemetry-section" style={{ marginBottom: "2.5rem" }}>
            <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "1.35rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span className="telemetry-ping" style={{ 
                display: "inline-block", 
                width: "10px", 
                height: "10px", 
                borderRadius: "50%", 
                background: health?.status === "UP" ? "var(--success)" : "var(--danger)",
                boxShadow: health?.status === "UP" ? "0 0 10px var(--success)" : "0 0 10px var(--danger)" 
              }}></span>
              System Telemetry & Health Monitor
            </h3>
            
            {healthLoading && !health ? (
              <div style={{ color: "var(--text-secondary)" }}>Loading system diagnostics...</div>
            ) : health ? (
              <div className="telemetry-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.25rem", marginBottom: "2rem" }}>
                
                {/* Database Connection */}
                <div className="telemetry-card" style={{ background: "var(--bg-card)", border: "1px solid var(--border-glass)", borderRadius: "1rem", padding: "1.25rem", backdropFilter: "blur(12px)" }}>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: "500", textTransform: "uppercase" }}>Database Connection</div>
                  <div style={{ fontSize: "1.5rem", fontWeight: "700", marginTop: "0.5rem", color: health.database === "UP" ? "var(--success)" : "var(--danger)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    {health.database}
                    <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: health.database === "UP" ? "var(--success)" : "var(--danger)", display: "inline-block" }}></span>
                  </div>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>PostgreSQL Client State</div>
                </div>

                {/* Total Registered Users */}
                <div className="telemetry-card" style={{ background: "var(--bg-card)", border: "1px solid var(--border-glass)", borderRadius: "1rem", padding: "1.25rem", backdropFilter: "blur(12px)" }}>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: "500", textTransform: "uppercase" }}>Registered Users</div>
                  <div style={{ fontSize: "1.5rem", fontWeight: "700", marginTop: "0.5rem", color: "#ffffff" }}>
                    {health.totalUsers}
                  </div>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>Active Accounts</div>
                </div>

                {/* API Request Tracker */}
                <div className="telemetry-card" style={{ background: "var(--bg-card)", border: "1px solid var(--border-glass)", borderRadius: "1rem", padding: "1.25rem", backdropFilter: "blur(12px)" }}>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: "500", textTransform: "uppercase" }}>Total API Requests</div>
                  <div style={{ fontSize: "1.5rem", fontWeight: "700", marginTop: "0.5rem", color: "var(--primary)" }}>
                    {health.traffic?.totalRequests || 0}
                  </div>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>Total HTTP Hits (This Session)</div>
                </div>

                {/* Failed Login attempts */}
                <div className="telemetry-card" style={{ background: "var(--bg-card)", border: "1px solid var(--border-glass)", borderRadius: "1rem", padding: "1.25rem", backdropFilter: "blur(12px)", boxShadow: (health.traffic?.failedLogins || 0) > 0 ? "0 0 15px rgba(239, 68, 68, 0.15)" : "none" }}>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: "500", textTransform: "uppercase" }}>Failed Logins</div>
                  <div style={{ fontSize: "1.5rem", fontWeight: "700", marginTop: "0.5rem", color: (health.traffic?.failedLogins || 0) > 0 ? "var(--danger)" : "var(--success)" }}>
                    {health.traffic?.failedLogins || 0}
                  </div>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>Security Alerts</div>
                </div>

                {/* System Resources */}
                <div className="telemetry-card" style={{ background: "var(--bg-card)", border: "1px solid var(--border-glass)", borderRadius: "1rem", padding: "1.25rem", backdropFilter: "blur(12px)", gridColumn: "span 2" }}>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: "500", textTransform: "uppercase" }}>Server Diagnostics</div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.5rem", gap: "1rem" }}>
                    <div>
                      <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>Heap Used / Total</div>
                      <div style={{ fontSize: "1rem", fontWeight: "600", color: "#ffffff" }}>
                        {health.memoryUsage?.heapUsed} / {health.memoryUsage?.heapTotal}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>System RSS</div>
                      <div style={{ fontSize: "1rem", fontWeight: "600", color: "#ffffff" }}>
                        {health.memoryUsage?.rss}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>Uptime</div>
                      <div style={{ fontSize: "1rem", fontWeight: "600", color: "#ffffff" }}>
                        {formatUptime(health.uptime)}
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "0.5rem", textAlign: "right" }}>
                    Last Updated: {new Date(health.timestamp).toLocaleTimeString()}
                  </div>
                </div>

              </div>
            ) : (
              <div style={{ color: "var(--danger)" }}>Failed to fetch system telemetry.</div>
            )}
          </div>

          <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "1.35rem", marginBottom: "1rem" }}>
            Registered Users List
          </h3>

          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          {loading ? (
            <div style={{ margin: "3rem 0", textAlign: "center", color: "var(--text-secondary)" }}>
              Retrieving users list...
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email Address</th>
                    <th>Role</th>
                    <th>Verified</th>
                    <th>Registered Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: "center", color: "var(--text-muted)" }}>
                        No user accounts registered.
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u.id}>
                        <td>{u.id}</td>
                        <td><strong>{u.name}</strong></td>
                        <td>{u.email}</td>
                        <td>
                          <span className={`badge badge-${u.role}`}>{u.role}</span>
                        </td>
                        <td>
                          <span 
                            style={{ 
                              color: u.verified ? "var(--success)" : "var(--danger)",
                              fontWeight: "600"
                            }}
                          >
                            {u.verified ? "Yes" : "No"}
                          </span>
                        </td>
                        <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td>
                          <button 
                            className="btn-danger" 
                            style={{ margin: 0, width: "auto" }}
                            onClick={() => handleDeleteUser(u.id, u.name)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;
