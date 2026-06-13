import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/authSlice";
import api from "../services/api";
import NotificationDropdown from "./NotificationDropdown";

function Navbar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { user, refreshToken } = useSelector((state) => state.auth);

  const isApprover = user && (user.role === "admin" || user.role === "manager" || user.role === "hr");
  const isAdmin = user && user.role === "admin";

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout", { refreshToken });
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      dispatch(logout());
      navigate("/login");
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar no-print">
      <div className="navbar-brand-container">
        <Link to="/dashboard" className="navbar-brand">OpusFlow</Link>
      </div>

      <div className="navbar-links">
        <Link to="/dashboard" className={isActive("/dashboard") ? "active" : ""}>
          Dashboard
        </Link>
        {isApprover && (
          <Link to="/employees" className={isActive("/employees") ? "active" : ""}>
            Employees
          </Link>
        )}
        <Link to="/assets" className={isActive("/assets") ? "active" : ""}>
          Assets
        </Link>
        <Link to="/leaves" className={isActive("/leaves") ? "active" : ""}>
          Leaves
        </Link>
        <Link to="/reports" className={isActive("/reports") ? "active" : ""}>
          Reports
        </Link>
        {isAdmin && (
          <Link to="/audit-logs" className={isActive("/audit-logs") ? "active" : ""}>
            Audit Logs
          </Link>
        )}
      </div>

      <div className="navbar-user">
        <NotificationDropdown />
        
        {isAdmin && (
          <Link to="/admin" className="admin-panel-link">
            Admin Panel
          </Link>
        )}
        
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
  );
}

export default Navbar;
