import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/authSlice";
import api from "../services/api";

function SkillsMaster() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, refreshToken } = useSelector((state) => state.auth);
  const [skills, setSkills] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      setLoading(true);
      const res = await api.get("/skills");
      setSkills(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load skills");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setBtnLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await api.post("/skills", { skill_name: name });
      setSuccess(res.data.message);
      setName("");
      fetchSkills();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create skill");
    } finally {
      setBtnLoading(false);
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
            <span className={`badge badge-${user.role}`}>
              {user.role}
            </span>
          )}
          <button className="btn-logout" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="dashboard-content">
        <div style={{ textAlign: "left" }}>
          <h2>Skills Management</h2>
          <p style={{ color: "var(--text-secondary)" }}>
            Create and view skills to assign to employee profiles.
          </p>

          <div className="responsive-split-layout">
            {/* Create Skill Form */}
            <div className="glass-card" style={{ maxWidth: "100%", padding: "1.75rem", boxSizing: "border-box" }}>
              <h3 style={{ margin: "0 0 1rem 0" }}>Add Skill</h3>
              {success && <div className="alert alert-success">{success}</div>}
              {error && !loading && <div className="alert alert-error">{error}</div>}

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label" htmlFor="skillName">Skill Name</label>
                  <input
                    className="input-field"
                    type="text"
                    id="skillName"
                    placeholder="e.g. Docker"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <button className="btn-primary" type="submit" disabled={btnLoading}>
                  {btnLoading ? "Adding..." : "Add Skill"}
                </button>
              </form>
            </div>

            {/* Skills List */}
            <div>
              {loading ? (
                <div style={{ color: "var(--text-secondary)", textAlign: "center", padding: "3rem" }}>
                  Loading skills...
                </div>
              ) : (
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th style={{ width: "80px" }}>ID</th>
                        <th>Skill Name</th>
                      </tr>
                    </thead>
                    <tbody>
                      {skills.length === 0 ? (
                        <tr>
                          <td colSpan="2" style={{ textAlign: "center", color: "var(--text-muted)" }}>
                            No skills found. Add one on the left.
                          </td>
                        </tr>
                      ) : (
                        skills.map((s) => (
                          <tr key={s.id}>
                            <td>{s.id}</td>
                            <td><strong>{s.skill_name}</strong></td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default SkillsMaster;
