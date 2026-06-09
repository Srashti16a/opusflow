import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const res = await api.post("/auth/forgot-password", { email });
      setMessage(res.data.message);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
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
        <h2 style={{ textAlign: "center", marginBottom: "0.25rem" }}>Forgot Password</h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem", textAlign: "center" }}>
          Enter your email address to receive a recovery link
        </p>

        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input
              className="input-field"
              type="email"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <div className="auth-links">
          Back to <Link to="/">Log in</Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
