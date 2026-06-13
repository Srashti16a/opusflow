import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import api from "../services/api";
import Navbar from "../components/Navbar";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
  AreaChart, Area
} from "recharts";

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

function Dashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, refreshToken } = useSelector((state) => state.auth);
  const isApprover = user && (user.role === "admin" || user.role === "manager" || user.role === "hr");

  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState(null);

  const [stats, setStats] = useState({
    employees: 0,
    departments: 0,
    skills: 0,
    images: 0,
    assets: 0,
    allocatedAssets: 0,
    pendingLeaves: 0,
    approvedLeaves: 0,
    rejectedLeaves: 0,
    totalSalary: 0,
    departmentStats: []
  });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setProfileLoading(true);
        const res = await api.get("/user/profile");
        setProfile(res.data);
      } catch (err) {
        setProfileError(err.response?.data?.message || "Failed to load profile details");
      } finally {
        setProfileLoading(false);
      }
    };

    const fetchStats = async () => {
      try {
        setStatsLoading(true);
        const res = await api.get("/employees/dashboard/stats");
        setStats(res.data);
      } catch (err) {
        console.error("Failed to load dashboard statistics:", err);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchProfile();
    fetchStats();
  }, [user]);


  // Mock Trend Data for Charts
  const hiringTrendData = [
    { name: "Jan", Hires: 2 },
    { name: "Feb", Hires: 5 },
    { name: "Mar", Hires: 3 },
    { name: "Apr", Hires: 8 },
    { name: "May", Hires: 6 },
    { name: "Jun", Hires: 10 }
  ];

  const assetDistributionData = [
    { name: "Available", count: stats.assets - stats.allocatedAssets || 0 },
    { name: "Allocated", count: stats.allocatedAssets || 0 }
  ];

  return (
    <div className="dashboard-layout">
      <Navbar />

      {/* Main Content */}
      <main className="dashboard-content">
        <div style={{ textAlign: "left" }}>
          <h2>Enterprise Portal Dashboard</h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>
            Welcome to the OpusFlow unified workflow, asset inventory, and reporting control system.
          </p>

          {/* Stats Cards Grid */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">Total Employees</div>
              <div className="stat-number">{statsLoading ? "..." : stats.employees}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Total Departments</div>
              <div className="stat-number">{statsLoading ? "..." : stats.departments}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Total Skills</div>
              <div className="stat-number">{statsLoading ? "..." : stats.skills}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Pending Leaves</div>
              <div className="stat-number" style={{ color: stats.pendingLeaves > 0 ? "var(--warning)" : "inherit" }}>
                {statsLoading ? "..." : stats.pendingLeaves}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Approved Leaves</div>
              <div className="stat-number" style={{ color: "var(--success)" }}>
                {statsLoading ? "..." : stats.approvedLeaves}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Rejected Leaves</div>
              <div className="stat-number" style={{ color: "var(--danger)" }}>
                {statsLoading ? "..." : stats.rejectedLeaves}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Total Salary Expense</div>
              <div className="stat-number">
                {statsLoading ? "..." : `₹${Number(stats.totalSalary).toLocaleString("en-IN")}`}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Corporate Assets</div>
              <div className="stat-number">{statsLoading ? "..." : stats.assets}</div>
            </div>
          </div>

          {/* Charts Row */}
          {!statsLoading && (
            <div className="charts-grid">
              {/* Pie Chart: Department Distribution */}
              <div className="glass-card" style={{ maxWidth: "100%", padding: "1.5rem 2rem" }}>
                <h4 style={{ marginBottom: "1rem", color: "var(--text-primary)" }}>Department Distribution</h4>
                <div style={{ width: "100%", height: 300, position: "relative" }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={stats.departmentStats.filter(d => d.value > 0)}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {stats.departmentStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-glass)" }}
                        itemStyle={{ color: "var(--text-primary)" }}
                      />
                      <Legend verticalAlign="bottom" height={36} formatter={(value, entry) => {
                        const payload = entry.payload;
                        return `${payload.name} (${payload.value})`;
                      }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Bar Chart: Asset Status */}
              <div className="glass-card" style={{ maxWidth: "100%", padding: "1.5rem 2rem" }}>
                <h4 style={{ marginBottom: "1rem", color: "var(--text-primary)" }}>Asset Stock Distribution</h4>
                <div style={{ width: "100%", height: 300, position: "relative" }}>
                  <ResponsiveContainer>
                    <BarChart data={assetDistributionData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                      <XAxis dataKey="name" stroke="var(--text-muted)" />
                      <YAxis stroke="var(--text-muted)" allowDecimals={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-glass)" }}
                        itemStyle={{ color: "var(--text-primary)" }}
                      />
                      <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]}>
                        <Cell fill="var(--success)" />
                        <Cell fill="var(--primary)" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Area Chart: Hiring Trend */}
              <div className="glass-card" style={{ maxWidth: "100%", padding: "1.5rem 2rem" }}>
                <h4 style={{ marginBottom: "1rem", color: "var(--text-primary)" }}>Monthly Hiring Trends</h4>
                <div style={{ width: "100%", height: 300, position: "relative" }}>
                  <ResponsiveContainer>
                    <AreaChart data={hiringTrendData}>
                      <defs>
                        <linearGradient id="colorHires" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                      <XAxis dataKey="name" stroke="var(--text-muted)" />
                      <YAxis stroke="var(--text-muted)" allowDecimals={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-glass)" }}
                        itemStyle={{ color: "var(--text-primary)" }}
                      />
                      <Area type="monotone" dataKey="Hires" stroke="var(--primary)" fillOpacity={1} fill="url(#colorHires)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* Operations Menu */}
          <h3 style={{ marginBottom: "1rem" }}>System Operations</h3>
          <div className="nav-grid">
            {isApprover && (
              <Link to="/employees" className="nav-card">
                <div>
                  <h3>Employee Profiles</h3>
                  <p>Register profile info, assign departments/skills, and perform global database searches.</p>
                </div>
                <div className="nav-card-action">Manage Employees &rarr;</div>
              </Link>
            )}

            <Link to="/assets" className="nav-card">
              <div>
                <h3>Corporate Asset Inventory</h3>
                <p>Register, track, allocate, and return equipment like Laptops, access cards, and licenses.</p>
              </div>
              <div className="nav-card-action">Manage Assets &rarr;</div>
            </Link>

            <Link to="/leaves" className="nav-card">
              <div>
                <h3>
                  Leave Management
                  {stats.pendingLeaves > 0 && (
                    <span className="badge badge-admin" style={{ textTransform: "none", fontSize: "0.7rem", padding: "0.15rem 0.45rem", verticalAlign: "middle", marginLeft: "0.5rem" }}>
                      {stats.pendingLeaves} Pending
                    </span>
                  )}
                </h3>
                <p>Apply for casual/sick leaves, verify balances, and review team approval queues.</p>
              </div>
              <div className="nav-card-action">Manage Leaves &rarr;</div>
            </Link>

            <Link to="/reports" className="nav-card">
              <div>
                <h3>SaaS Reporting Engine</h3>
                <p>Extract and download Excel worksheets, CSV sheets, and print high-resolution PDF summaries.</p>
              </div>
              <div className="nav-card-action">Generate Reports &rarr;</div>
            </Link>

            {user?.role === "admin" && (
              <Link to="/audit-logs" className="nav-card">
                <div>
                  <h3>Enterprise Audit Trails</h3>
                  <p>Track history, who changed what data, transaction values, and compare old/new JSON database states.</p>
                </div>
                <div className="nav-card-action">Browse Audit Logs &rarr;</div>
              </Link>
            )}

          </div>

          {/* Profile Section */}
          <h3 style={{ marginTop: "3rem", marginBottom: "1rem" }}>Logged In User Details</h3>
          {profileLoading ? (
            <div style={{ color: "var(--text-secondary)" }}>Loading profile details...</div>
          ) : (
            <div className="glass-card" style={{ maxWidth: "100%", margin: "0", textAlign: "left", padding: "2rem" }}>
              {profileError && <div className="alert alert-error">{profileError}</div>}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem" }}>
                <div>
                  <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem", display: "block" }}>Full Name</span>
                  <strong style={{ fontSize: "1.1rem" }}>{profile?.name}</strong>
                </div>
                <div>
                  <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem", display: "block" }}>Email Address</span>
                  <strong style={{ fontSize: "1.1rem" }}>{profile?.email}</strong>
                </div>
                <div>
                  <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem", display: "block" }}>System Role</span>
                  <span className={`badge badge-${profile?.role}`} style={{ display: "inline-block", marginTop: "0.25rem" }}>
                    {profile?.role}
                  </span>
                </div>
                <div>
                  <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem", display: "block" }}>Status</span>
                  <span 
                    className="badge" 
                    style={{ 
                      backgroundColor: profile?.verified ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)",
                      color: profile?.verified ? "var(--success)" : "var(--danger)",
                      border: `1px solid ${profile?.verified ? "rgba(16, 185, 129, 0.4)" : "rgba(239, 68, 68, 0.4)"}`,
                      display: "inline-block",
                      marginTop: "0.25rem"
                    }}
                  >
                    {profile?.verified ? "Verified" : "Unverified"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
