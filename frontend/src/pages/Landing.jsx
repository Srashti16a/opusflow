import { Link } from "react-router-dom";

function Landing() {
  return (
    <div className="landing-container">
      {/* Dynamic Background Gradients */}
      <div className="landing-bg-gradient-top"></div>
      <div className="landing-bg-gradient-bottom"></div>

      {/* Header/Navbar */}
      <header className="landing-header">
        <div className="landing-logo">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="32" height="32" rx="8" fill="url(#logoGrad)" />
            <path d="M8 12C8 9.79086 9.79086 8 12 8H20C22.2091 8 24 9.79086 24 12V20C24 22.2091 22.2091 24 20 24H12C9.79086 24 8 22.2091 8 20V12Z" fill="white" fillOpacity="0.2" />
            <circle cx="16" cy="16" r="6" fill="white" />
            <path d="M13 16H19" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" />
            <path d="M16 13V19" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" />
            <defs>
              <linearGradient id="logoGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                <stop stopColor="#6366f1" />
                <stop offset="1" stopColor="#4f46e5" />
              </linearGradient>
            </defs>
          </svg>
          <span className="logo-text">OpusFlow</span>
        </div>
        <div className="landing-auth-buttons">
          <Link to="/login" className="btn-landing-login">Sign In</Link>
          <Link to="/signup" className="btn-landing-signup">Sign Up</Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="landing-hero-section">
        <div className="landing-hero-content">
          <div className="badge-promo">
            ✨ Introducing OpusFlow Enterprise
          </div>
          <h1 className="hero-title">
            The Smart, Unified <br />
            <span>Enterprise Control Center</span>
          </h1>
          <p className="hero-subtitle">
            Streamline your corporate operations. Manage employee directories, assign assets, approve leaves, audit databases, and generate SaaS worksheets on one seamless dashboard.
          </p>

          <div className="hero-actions">
            <Link to="/login" className="btn-hero-primary">
              Get Started Now &rarr;
            </Link>
            <a href="#features" className="btn-hero-secondary">
              Explore Features
            </a>
          </div>

          {/* Social Proof/Stats */}
          <div className="hero-stats">
            <div className="stat-item">
              <strong>99.9%</strong>
              <span>Uptime</span>
            </div>
            <div className="stat-line"></div>
            <div className="stat-item">
              <strong>100%</strong>
              <span>Audit Logging</span>
            </div>
            <div className="stat-line"></div>
            <div className="stat-item">
              <strong>Instant</strong>
              <span>Reporting</span>
            </div>
          </div>
        </div>

        {/* Hero Interactive Graphics */}
        <div className="landing-hero-graphics">
          <div className="graphics-container-glass">
            {/* Dashboard Mockup SVG */}
            <svg width="100%" height="100%" viewBox="0 0 500 340" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ borderRadius: "12px", overflow: "hidden" }}>
              <rect width="500" height="340" fill="#f8fafc" />
              {/* Sidebar mockup */}
              <rect x="0" y="0" width="80" height="340" fill="#ffffff" />
              <rect x="20" y="25" width="40" height="8" rx="4" fill="#e2e8f0" />
              <circle cx="40" cy="70" r="12" fill="#e0e7ff" />
              <rect x="25" y="105" width="30" height="6" rx="3" fill="#cbd5e1" />
              <rect x="25" y="130" width="30" height="6" rx="3" fill="#cbd5e1" />
              <rect x="25" y="155" width="30" height="6" rx="3" fill="#cbd5e1" />
              
              {/* Header mockup */}
              <rect x="80" y="0" width="420" height="50" fill="#ffffff" />
              <rect x="100" y="18" width="120" height="14" rx="7" fill="#f1f5f9" />
              <circle cx="450" cy="25" r="12" fill="#6366f1" />
              
              {/* Dashboard Content Mockup */}
              {/* Card 1 */}
              <rect x="100" y="70" width="110" height="70" rx="10" fill="#ffffff" stroke="#f1f5f9" strokeWidth="2" />
              <circle cx="125" cy="95" r="10" fill="#e0e7ff" />
              <rect x="120" y="115" width="70" height="8" rx="4" fill="#cbd5e1" />
              
              {/* Card 2 */}
              <rect x="225" y="70" width="110" height="70" rx="10" fill="#ffffff" stroke="#f1f5f9" strokeWidth="2" />
              <circle cx="250" cy="95" r="10" fill="#d1fae5" />
              <rect x="245" y="115" width="70" height="8" rx="4" fill="#cbd5e1" />

              {/* Card 3 */}
              <rect x="350" y="70" width="120" height="70" rx="10" fill="#ffffff" stroke="#f1f5f9" strokeWidth="2" />
              <circle cx="375" cy="95" r="10" fill="#fee2e2" />
              <rect x="370" y="115" width="80" height="8" rx="4" fill="#cbd5e1" />

              {/* Chart mockup */}
              <rect x="100" y="160" width="370" height="150" rx="12" fill="#ffffff" stroke="#f1f5f9" strokeWidth="2" />
              <path d="M120 280 L180 230 L240 250 L300 190 L360 210 L420 170" stroke="#6366f1" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M120 280 L180 230 L240 250 L300 190 L360 210 L420 170 L420 290 L120 290 Z" fill="url(#chartGrad)" opacity="0.1" />
              <defs>
                <linearGradient id="chartGrad" x1="270" y1="170" x2="270" y2="290" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#6366f1" />
                  <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
            <div className="floating-bubble-1">
              <span>🔒 Encrypted Audit Trails</span>
            </div>
            <div className="floating-bubble-2">
              <span>🚀 SaaS Report Engines</span>
            </div>
          </div>
        </div>
      </main>

      {/* Feature Section */}
      <section id="features" className="landing-features-section">
        <div className="section-header">
          <h2>Standard Infrastructure Pillars</h2>
          <p>Everything you need to manage your corporate assets and teams in real-time.</p>
        </div>

        <div className="features-grid">
          {/* Card 1 */}
          <div className="feature-card-glass">
            <div className="feature-icon icon-blue">👥</div>
            <h3>Employee Profiles Directory</h3>
            <p>Maintain accurate profiles, designations, and upload physical verification documentation easily.</p>
          </div>
          {/* Card 2 */}
          <div className="feature-card-glass">
            <div className="feature-icon icon-green">📦</div>
            <h3>Corporate Asset Registry</h3>
            <p>Log physical machines, assign serial numbers, track purchase costs, and allocate items dynamically.</p>
          </div>
          {/* Card 3 */}
          <div className="feature-card-glass">
            <div className="feature-icon icon-yellow">📅</div>
            <h3>Normalized Leave Queues</h3>
            <p>Manage leave balance allocations, request absences, and process manager approvals instantly.</p>
          </div>
          {/* Card 4 */}
          <div className="feature-card-glass">
            <div className="feature-icon icon-purple">📊</div>
            <h3>SaaS Reports Engine</h3>
            <p>Export details to Excel, spreadsheets, or save high-resolution PDF pages with server filters.</p>
          </div>
          {/* Card 5 */}
          <div className="feature-card-glass">
            <div className="feature-icon icon-red">🛡️</div>
            <h3>Immutable System Auditing</h3>
            <p>Secure audit trails logging old vs. new database states in JSON payloads for complete traceability.</p>
          </div>
          {/* Card 6 */}
          <div className="feature-card-glass">
            <div className="feature-icon icon-indigo">📈</div>
            <h3>Diagnostics Telemetry</h3>
            <p>Monitor HTTP traffic, database health states, and memory metrics on the fly.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>&copy; {new Date().getFullYear()} OpusFlow. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Landing;
