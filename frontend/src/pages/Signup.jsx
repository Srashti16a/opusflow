import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function Signup() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
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

    try {
      const res = await api.post("/auth/signup", form);
      setMessage(res.data.message);
      setForm({ name: "", email: "", password: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong during signup");
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
        <h2 style={{ textAlign: "center", marginBottom: "0.25rem" }}>Create Account</h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem", textAlign: "center" }}>
          Join the unified SaaS platform today
        </p>

        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="name">Full Name</label>
            <input
              className="input-field"
              type="text"
              name="name"
              id="name"
              placeholder="John Doe"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input
              className="input-field"
              type="email"
              name="email"
              id="email"
              placeholder="john@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              className="input-field"
              type="password"
              name="password"
              id="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? "Registering..." : "Create Account"}
          </button>
        </form>

        <div className="auth-links">
          Already have an account? <Link to="/">Log in</Link>
        </div>
      </div>
    </div>
  );
}

export default Signup;
