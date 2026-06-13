import { useState, useEffect } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";

function SkillsMaster() {
  const [skills, setSkills] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const totalPages = Math.ceil(skills.length / pageSize);
  const paginatedSkills = skills.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      setLoading(true);
      const res = await api.get("/skills");
      setSkills(res.data);
      const maxPage = Math.max(1, Math.ceil(res.data.length / pageSize));
      setCurrentPage(prev => prev > maxPage ? maxPage : prev);
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

  return (
    <div className="dashboard-layout">
      <Navbar />

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
                <>
                  <div className="table-wrapper">
                    <table>
                      <thead>
                        <tr>
                          <th style={{ width: "80px" }}>ID</th>
                          <th>Skill Name</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedSkills.length === 0 ? (
                          <tr>
                            <td colSpan="2" style={{ textAlign: "center", color: "var(--text-muted)" }}>
                              No skills found. Add one on the left.
                            </td>
                          </tr>
                        ) : (
                          paginatedSkills.map((s) => (
                            <tr key={s.id}>
                              <td>{s.id}</td>
                              <td><strong>{s.skill_name}</strong></td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {totalPages > 1 && (
                    <div style={{
                      display: "flex", justifyContent: "flex-end", alignItems: "center",
                      marginTop: "1rem", gap: "0.5rem"
                    }}>
                      <button
                        className="btn-secondary"
                        style={{ margin: 0, padding: "0.3rem 0.75rem", fontSize: "0.85rem", width: "auto" }}
                        disabled={currentPage <= 1}
                        onClick={() => setCurrentPage(currentPage - 1)}
                      >
                        Previous
                      </button>
                      <span style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        className="btn-secondary"
                        style={{ margin: 0, padding: "0.3rem 0.75rem", fontSize: "0.85rem", width: "auto" }}
                        disabled={currentPage >= totalPages}
                        onClick={() => setCurrentPage(currentPage + 1)}
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default SkillsMaster;
