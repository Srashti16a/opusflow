import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";

function VerifyEmail() {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const verifyCalled = useRef(false);

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const res = await api.get(`/auth/verify-email/${token}`);
        setMessage(res.data.message);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || "Invalid or expired email verification link.");
        setMessage(null);
      } finally {
        setLoading(false);
      }
    };

    if (token && !verifyCalled.current) {
      verifyCalled.current = true;
      verifyToken();
    }
  }, [token]);

  return (
    <div className="auth-container">
      <div className="glass-card" style={{ textAlign: "center" }}>
        <div style={{ fontSize: "1.75rem", fontWeight: "800", background: "linear-gradient(135deg, #a78bfa 0%, var(--primary) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: "0.5rem", fontFamily: "'Outfit', sans-serif" }}>
          eventhub360
        </div>
        <h2>Email Verification</h2>
        <div style={{ margin: "1.5rem 0" }}>
          {loading && (
            <div style={{ color: "var(--text-secondary)" }}>
              Verifying your email, please wait...
            </div>
          )}
          {message && (
            <div>
              <div className="alert alert-success">{message}</div>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                Thank you for verifying your email. You can now access your account.
              </p>
            </div>
          )}
          {error && (
            <div>
              <div className="alert alert-error">{error}</div>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                The link may have expired or is already used.
              </p>
            </div>
          )}
        </div>

        <div className="auth-links">
          Go to <Link to="/login">Log in</Link>
        </div>
      </div>
    </div>
  );
}

export default VerifyEmail;
