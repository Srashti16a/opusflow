import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginStart, loginSuccess, loginFailure } from "../redux/authSlice";
import api from "../services/api";

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, token } = useSelector((state) => state.auth);

  // Redirect if already logged in
  useEffect(() => {
    if (token) {
      navigate("/dashboard");
    }
  }, [token, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(loginStart());

    try {
      const res = await api.post("/auth/login", form);
      const { user, token: accessToken, refreshToken } = res.data;
      
      dispatch(loginSuccess({ user, token: accessToken, refreshToken }));
      navigate("/dashboard");
    } catch (err) {
      const errMsg = err.response?.data?.message || "Invalid credentials. Please try again.";
      dispatch(loginFailure(errMsg));
    }
  };

  return (
    <div className="auth-container">
      <div className="glass-card">
        <div style={{ fontSize: "1.75rem", fontWeight: "800", background: "linear-gradient(135deg, #a78bfa 0%, var(--primary) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: "0.5rem", fontFamily: "'Outfit', sans-serif", textAlign: "center" }}>
          OpusFlow
        </div>
        <h2 style={{ textAlign: "center", marginBottom: "0.25rem" }}>Welcome Back</h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem", textAlign: "center" }}>
          Sign in to access the SaaS Portal
        </p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
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
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="auth-links" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <div>
            Don't have an account? <Link to="/signup">Register</Link>
          </div>
          <div>
            <Link to="/forgot-password">Forgot password?</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
