import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/authSlice";
import api from "../services/api";

function AdminDashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { refreshToken } = useSelector((state) => state.auth);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchUsers();
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
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete user account");
    }
  };

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout", { refreshToken });
    } catch (err) {
      console.error("Logout request failed:", err);
    } finally {
      dispatch(logout());
      navigate("/");
    }
  };

  return (
    <div className="dashboard-layout">
      {/* Navigation Navbar */}
      <nav className="navbar">
        <div className="navbar-brand">i-SOFTZONE Technologies Admin</div>
        <div className="navbar-user">
          <Link to="/dashboard" style={{ color: "var(--primary)", fontWeight: "600", textDecoration: "none", fontSize: "0.95rem" }}>
            User Profile
          </Link>
          <button className="btn-logout" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="dashboard-content">
        <div style={{ textAlign: "left" }}>
          <h2>Admin Control Panel</h2>
          <p style={{ color: "var(--text-secondary)" }}>
            View and manage user registration records.
          </p>

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
