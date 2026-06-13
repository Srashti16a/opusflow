import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import api from "../services/api";
import Navbar from "../components/Navbar";

function LeavePanel() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, refreshToken } = useSelector((state) => state.auth);
  const isApprover = user && (user.role === "admin" || user.role === "manager");

  // Standard user state
  const [myRequests, setMyRequests] = useState([]);
  const [form, setForm] = useState({
    leaveType: "Sick Leave",
    startDate: "",
    endDate: "",
    reason: ""
  });

  // Admin/Manager approval state
  const [pendingRequests, setPendingRequests] = useState([]);
  const [processedRequests, setProcessedRequests] = useState([]);
  const [rejectId, setRejectId] = useState(null);
  const [rejectionFeedback, setRejectionFeedback] = useState("");

  // UI status
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Active view tab for managers: "apply" (standard view) or "approve" (approver view)
  const [viewTab, setViewTab] = useState(isApprover ? "approve" : "apply");

  const [pendingPage, setPendingPage] = useState(1);
  const [processedPage, setProcessedPage] = useState(1);
  const [myRequestsPage, setMyRequestsPage] = useState(1);
  const pageSize = 5;

  const totalPendingPages = Math.ceil(pendingRequests.length / pageSize);
  const paginatedPendingRequests = pendingRequests.slice((pendingPage - 1) * pageSize, pendingPage * pageSize);

  const totalProcessedPages = Math.ceil(processedRequests.length / pageSize);
  const paginatedProcessedRequests = processedRequests.slice((processedPage - 1) * pageSize, processedPage * pageSize);

  const totalMyRequestsPages = Math.ceil(myRequests.length / pageSize);
  const paginatedMyRequests = myRequests.slice((myRequestsPage - 1) * pageSize, myRequestsPage * pageSize);

  useEffect(() => {
    fetchData();
  }, [user, isApprover]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Standard user fetches their requests
      const myRes = await api.get("/leaves/my-requests");
      setMyRequests(myRes.data);
      const maxMyRequestsPage = Math.max(1, Math.ceil(myRes.data.length / pageSize));
      setMyRequestsPage(prev => prev > maxMyRequestsPage ? maxMyRequestsPage : prev);

      // Approvers fetch pending and processed leaves
      if (isApprover) {
        const [pendingRes, historyRes] = await Promise.all([
          api.get("/leaves/pending"),
          api.get("/leaves/history")
        ]);
        setPendingRequests(pendingRes.data);
        const maxPendingPage = Math.max(1, Math.ceil(pendingRes.data.length / pageSize));
        setPendingPage(prev => prev > maxPendingPage ? maxPendingPage : prev);

        setProcessedRequests(historyRes.data);
        const maxProcessedPage = Math.max(1, Math.ceil(historyRes.data.length / pageSize));
        setProcessedPage(prev => prev > maxProcessedPage ? maxProcessedPage : prev);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load leave request data");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    if (!form.startDate || !form.endDate || !form.reason.trim()) return;

    setSubmitLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await api.post("/leaves", form);
      setSuccess(res.data.message);
      setForm({
        leaveType: "Sick Leave",
        startDate: "",
        endDate: "",
        reason: ""
      });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to apply for leave");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      setError(null);
      setSuccess(null);
      const res = await api.put(`/leaves/${id}/approve`);
      setSuccess(res.data.message);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to approve leave request");
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectionFeedback.trim()) return;

    try {
      setError(null);
      setSuccess(null);
      const res = await api.put(`/leaves/${rejectId}/reject`, {
        rejectionReason: rejectionFeedback
      });
      setSuccess(res.data.message);
      setRejectId(null);
      setRejectionFeedback("");
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reject leave request");
    }
  };

  return (
    <div className="dashboard-layout">
      <Navbar />

      {/* Main Content */}
      <main className="dashboard-content">
        <div style={{ textAlign: "left" }}>
          <h2>Employee Leave Management</h2>
          <p style={{ color: "var(--text-secondary)" }}>
            Apply for corporate leaves, view status history, and manage employee leave request records.
          </p>

          {success && <div className="alert alert-success">{success}</div>}
          {error && <div className="alert alert-error">{error}</div>}

          {/* Tab buttons for Admin/Manager to toggle between Applying and Approving */}
          {isApprover && (
            <div className="tab-buttons" style={{ marginTop: "1.5rem" }}>
              <button
                className={`tab-btn ${viewTab === "approve" ? "active" : ""}`}
                onClick={() => setViewTab("approve")}
              >
                Approvals Queue ({pendingRequests.length})
              </button>
              <button
                className={`tab-btn ${viewTab === "apply" ? "active" : ""}`}
                onClick={() => setViewTab("apply")}
              >
                Apply / My History
              </button>
            </div>
          )}

          {loading ? (
            <div style={{ color: "var(--text-secondary)", textAlign: "center", padding: "4rem" }}>
              Retrieving leave requests details...
            </div>
          ) : (
            <div>
              {/* APPROVER PANEL VIEW */}
              {isApprover && viewTab === "approve" && (
                <div>
                  {/* Rejection Feedback Dialog Overlay */}
                  {rejectId && (
                    <div style={{
                      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                      backgroundColor: "rgba(0,0,0,0.75)", display: "flex",
                      alignItems: "center", justifyContent: "center", zIndex: 100
                    }}>
                      <div className="glass-card" style={{ maxWidth: "400px", padding: "2rem" }}>
                        <h3 style={{ margin: "0 0 1rem 0" }}>Reason for Rejection</h3>
                        <form onSubmit={handleRejectSubmit}>
                          <div className="form-group">
                            <textarea
                              className="input-field"
                              placeholder="Please explain why the leave request is rejected..."
                              value={rejectionFeedback}
                              onChange={(e) => setRejectionFeedback(e.target.value)}
                              rows="4"
                              style={{ resize: "none" }}
                              required
                            ></textarea>
                          </div>
                          <div className="action-row" style={{ marginTop: "1.5rem" }}>
                            <button className="btn-primary" type="submit" style={{ margin: 0, width: "auto" }}>
                              Submit Rejection
                            </button>
                            <button
                              type="button"
                              className="btn-secondary"
                              onClick={() => { setRejectId(null); setRejectionFeedback(""); }}
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}

                  {/* Pending approvals table */}
                  <h3>Pending Leave Requests</h3>
                  <div className="table-wrapper">
                    <table>
                      <thead>
                        <tr>
                          <th>Employee</th>
                          <th>Department</th>
                          <th>Leave Type</th>
                          <th>Start Date</th>
                          <th>End Date</th>
                          <th>Reason</th>
                          <th style={{ width: "180px" }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedPendingRequests.length === 0 ? (
                          <tr>
                            <td colSpan="7" style={{ textAlign: "center", color: "var(--text-muted)", padding: "3rem" }}>
                              No pending leave applications. Queue is clear!
                            </td>
                          </tr>
                        ) : (
                          paginatedPendingRequests.map((req) => (
                            <tr key={req.id}>
                              <td>
                                <strong>{req.employeeProfile?.user?.name || "Unknown"}</strong>
                                <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                                  {req.employeeProfile?.user?.email}
                                </div>
                              </td>
                              <td>{req.employeeProfile?.department?.department_name || "N/A"}</td>
                              <td>
                                <span className="badge badge-skill">{req.leaveType}</span>
                              </td>
                              <td>{new Date(req.startDate).toLocaleDateString()}</td>
                              <td>{new Date(req.endDate).toLocaleDateString()}</td>
                              <td>{req.reason}</td>
                              <td>
                                <div style={{ display: "flex", gap: "0.5rem" }}>
                                  <button
                                    className="btn-primary"
                                    style={{ margin: 0, padding: "0.4rem 0.75rem", fontSize: "0.85rem", width: "auto", background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", boxShadow: "none" }}
                                    onClick={() => handleApprove(req.id)}
                                  >
                                    Approve
                                  </button>
                                  <button
                                    className="btn-danger"
                                    style={{ margin: 0, padding: "0.4rem 0.75rem", fontSize: "0.85rem", width: "auto" }}
                                    onClick={() => setRejectId(req.id)}
                                  >
                                    Reject
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {totalPendingPages > 1 && (
                    <div style={{
                      display: "flex", justifyContent: "flex-end", alignItems: "center",
                      marginTop: "1rem", marginBottom: "1.5rem", gap: "0.5rem"
                    }}>
                      <button
                        className="btn-secondary"
                        style={{ margin: 0, padding: "0.3rem 0.75rem", fontSize: "0.85rem", width: "auto" }}
                        disabled={pendingPage <= 1}
                        onClick={() => setPendingPage(pendingPage - 1)}
                      >
                        Previous
                      </button>
                      <span style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
                        Page {pendingPage} of {totalPendingPages}
                      </span>
                      <button
                        className="btn-secondary"
                        style={{ margin: 0, padding: "0.3rem 0.75rem", fontSize: "0.85rem", width: "auto" }}
                        disabled={pendingPage >= totalPendingPages}
                        onClick={() => setPendingPage(pendingPage + 1)}
                      >
                        Next
                      </button>
                    </div>
                  )}

                  {/* History processed approvals table */}
                  <h3 style={{ marginTop: "3rem" }}>Processed Approvals History</h3>
                  <div className="table-wrapper">
                    <table>
                      <thead>
                        <tr>
                          <th>Employee</th>
                          <th>Leave Type</th>
                          <th>Start Date</th>
                          <th>End Date</th>
                          <th>Status</th>
                          <th>Comments</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedProcessedRequests.length === 0 ? (
                          <tr>
                            <td colSpan="6" style={{ textAlign: "center", color: "var(--text-muted)", padding: "3rem" }}>
                              No leave history records found.
                            </td>
                          </tr>
                        ) : (
                          paginatedProcessedRequests.map((req) => (
                            <tr key={req.id}>
                              <td>
                                <strong>{req.employeeProfile?.user?.name || "Unknown"}</strong>
                                <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                                  {req.employeeProfile?.user?.email}
                                </div>
                              </td>
                              <td>{req.leaveType}</td>
                              <td>{new Date(req.startDate).toLocaleDateString()}</td>
                              <td>{new Date(req.endDate).toLocaleDateString()}</td>
                              <td>
                                <span className="badge" style={{
                                  backgroundColor: req.status === "approved" ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
                                  color: req.status === "approved" ? "var(--success)" : "var(--danger)",
                                  border: `1px solid ${req.status === "approved" ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.3)"}`
                                }}>
                                  {req.status}
                                </span>
                              </td>
                              <td style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
                                {req.status === "rejected" ? (
                                  <span>Rejection Feedback: <em>{req.rejectionReason}</em></span>
                                ) : (
                                  <span style={{ color: "var(--text-muted)" }}>None</span>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {totalProcessedPages > 1 && (
                    <div style={{
                      display: "flex", justifyContent: "flex-end", alignItems: "center",
                      marginTop: "1rem", gap: "0.5rem"
                    }}>
                      <button
                        className="btn-secondary"
                        style={{ margin: 0, padding: "0.3rem 0.75rem", fontSize: "0.85rem", width: "auto" }}
                        disabled={processedPage <= 1}
                        onClick={() => setProcessedPage(processedPage - 1)}
                      >
                        Previous
                      </button>
                      <span style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
                        Page {processedPage} of {totalProcessedPages}
                      </span>
                      <button
                        className="btn-secondary"
                        style={{ margin: 0, padding: "0.3rem 0.75rem", fontSize: "0.85rem", width: "auto" }}
                        disabled={processedPage >= totalProcessedPages}
                        onClick={() => setProcessedPage(processedPage + 1)}
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* STANDARD USER APPLY & HISTORY VIEW */}
              {(!isApprover || viewTab === "apply") && (
                <div className="responsive-split-layout">
                  {/* Left Column: Apply Form */}
                  <div className="glass-card" style={{ maxWidth: "100%", padding: "2rem", boxSizing: "border-box" }}>
                    <h3 style={{ margin: "0 0 1rem 0" }}>Apply for Leave</h3>
                    <form onSubmit={handleApplyLeave}>
                      {/* Leave Type */}
                      <div className="form-group">
                        <label className="form-label" htmlFor="leaveType">Leave Type</label>
                        <select
                          className="input-field"
                          name="leaveType"
                          id="leaveType"
                          value={form.leaveType}
                          onChange={handleChange}
                          required
                        >
                          <option value="Sick Leave">Sick Leave</option>
                          <option value="Casual Leave">Casual Leave</option>
                          <option value="Paid Leave">Paid Leave</option>
                          <option value="Unpaid Leave">Unpaid Leave</option>
                        </select>
                      </div>

                      {/* Start Date */}
                      <div className="form-group">
                        <label className="form-label" htmlFor="startDate">Start Date</label>
                        <input
                          className="input-field"
                          type="date"
                          name="startDate"
                          id="startDate"
                          value={form.startDate}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      {/* End Date */}
                      <div className="form-group">
                        <label className="form-label" htmlFor="endDate">End Date</label>
                        <input
                          className="input-field"
                          type="date"
                          name="endDate"
                          id="endDate"
                          value={form.endDate}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      {/* Reason */}
                      <div className="form-group">
                        <label className="form-label" htmlFor="reason">Reason for Leave</label>
                        <textarea
                          className="input-field"
                          name="reason"
                          id="reason"
                          placeholder="Brief explanation of your leave request..."
                          value={form.reason}
                          onChange={handleChange}
                          rows="4"
                          style={{ resize: "none" }}
                          required
                        ></textarea>
                      </div>

                      <button className="btn-primary" type="submit" disabled={submitLoading}>
                        {submitLoading ? "Submitting..." : "Apply"}
                      </button>
                    </form>
                  </div>

                  {/* Right Column: User Leave History */}
                  <div>
                    <h3>My Leave Applications</h3>
                    <div className="table-wrapper">
                      <table>
                        <thead>
                          <tr>
                            <th>Leave Type</th>
                            <th>Start Date</th>
                            <th>End Date</th>
                            <th>Status</th>
                            <th>Notes</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedMyRequests.length === 0 ? (
                            <tr>
                              <td colSpan="5" style={{ textAlign: "center", color: "var(--text-muted)", padding: "3rem" }}>
                                You have not submitted any leave applications. Apply on the left.
                              </td>
                            </tr>
                          ) : (
                            paginatedMyRequests.map((req) => (
                              <tr key={req.id}>
                                <td><strong>{req.leaveType}</strong></td>
                                <td>{new Date(req.startDate).toLocaleDateString()}</td>
                                <td>{new Date(req.endDate).toLocaleDateString()}</td>
                                <td>
                                  <span className="badge" style={{
                                    backgroundColor: req.status === "pending"
                                      ? "rgba(245, 158, 11, 0.15)"
                                      : req.status === "approved"
                                        ? "rgba(16, 185, 129, 0.15)"
                                        : "rgba(239, 68, 68, 0.15)",
                                    color: req.status === "pending"
                                      ? "var(--warning)"
                                      : req.status === "approved"
                                        ? "var(--success)"
                                        : "var(--danger)",
                                    border: `1px solid ${req.status === "pending"
                                      ? "rgba(245, 158, 11, 0.3)"
                                      : req.status === "approved"
                                        ? "rgba(16, 185, 129, 0.3)"
                                        : "rgba(239, 68, 68, 0.3)"}`
                                  }}>
                                    {req.status}
                                  </span>
                                </td>
                                <td style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                                  {req.status === "rejected" && req.rejectionReason ? (
                                    <span style={{ color: "var(--danger)" }}>
                                      Feedback: {req.rejectionReason}
                                    </span>
                                  ) : (
                                    <span>Reason: {req.reason}</span>
                                  )}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                    {totalMyRequestsPages > 1 && (
                      <div style={{
                        display: "flex", justifyContent: "flex-end", alignItems: "center",
                        marginTop: "1rem", gap: "0.5rem"
                      }}>
                        <button
                          className="btn-secondary"
                          style={{ margin: 0, padding: "0.3rem 0.75rem", fontSize: "0.85rem", width: "auto" }}
                          disabled={myRequestsPage <= 1}
                          onClick={() => setMyRequestsPage(myRequestsPage - 1)}
                        >
                          Previous
                        </button>
                        <span style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
                          Page {myRequestsPage} of {totalMyRequestsPages}
                        </span>
                        <button
                          className="btn-secondary"
                          style={{ margin: 0, padding: "0.3rem 0.75rem", fontSize: "0.85rem", width: "auto" }}
                          disabled={myRequestsPage >= totalMyRequestsPages}
                          onClick={() => setMyRequestsPage(myRequestsPage + 1)}
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default LeavePanel;
