import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";

function ResetPassword() {
  const { token } = useParams();
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const res = await api.post("/auth/reset-password", {
        token,
        newPassword: form.password
      });
      setMessage(res.data.message);
      setForm({ password: "", confirmPassword: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired password reset link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="glass-card">
        <div style={{ fontSize: "1.75rem", fontWeight: "800", background: "linear-gradient(135deg, #a78bfa 0%, var(--primary) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: "0.5rem", fontFamily: "'Outfit', sans-serif", textAlign: "center" }}>
          i-SOFTZONE Technologies
        </div>
        <h2 style={{ textAlign: "center", marginBottom: "0.25rem" }}>Reset Password</h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem", textAlign: "center" }}>
          Enter your new password below
        </p>

        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="password">New Password</label>
            <input
              className="input-field"
              type="password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
            <input
              className="input-field"
              type="password"
              name="confirmPassword"
              placeholder="••••••••"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <div className="auth-links">
          Back to <Link to="/">Log in</Link>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
