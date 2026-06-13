import { useNavigate } from "react-router-dom";
import { FiLink, FiBarChart2, FiActivity, FiCpu, FiClock, FiTrendingUp, FiArrowRight } from "react-icons/fi";
import "./Landing.css";

function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing">
      {/* Background glow effects */}
      <div className="glow-sphere sphere-1"></div>
      <div className="glow-sphere sphere-2"></div>

      <nav className="navbar">
        <div className="brand" onClick={() => navigate("/")}>
          <span className="brand-logo">🚀</span>
          <span className="brand-name">LinkForge</span>
        </div>

        <div className="nav-buttons">
          <button
            className="login-btn"
            onClick={() => navigate("/login")}
          >
            Login
          </button>

          <button
            className="register-btn"
            onClick={() => navigate("/register")}
          >
            Get Started
          </button>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-badge">
          <span className="badge-glow"></span>
          <span className="badge-text">✨ Redesigned for Teams & Creators</span>
        </div>

        <h1>
          Shorten Links.
          <br />
          <span className="gradient-text">Track Analytics.</span>
          <br />
          Grow Faster.
        </h1>

        <p className="hero-subtitle">
          The open-source URL shortening platform for modern teams. 
          Generate custom branded links, monitor real-time browser analytics, 
          and track click event metrics instantly.
        </p>

        <div className="hero-buttons">
          <button
            className="hero-register"
            onClick={() => navigate("/register")}
          >
            Get Started Free <FiArrowRight className="btn-icon" />
          </button>

          <button
            className="hero-login"
            onClick={() => navigate("/login")}
          >
            Request Demo
          </button>
        </div>
      </section>

      <div className="stats-row">
        <div className="stat-box">
          <div className="stat-icon-wrapper">
            <FiLink className="stat-icon purple" />
          </div>
          <h2>1,200+</h2>
          <p>Links Created</p>
        </div>

        <div className="stat-box">
          <div className="stat-icon-wrapper">
            <FiActivity className="stat-icon cyan" />
          </div>
          <h2>8,500+</h2>
          <p>Tracked Clicks</p>
        </div>

        <div className="stat-box">
          <div className="stat-icon-wrapper">
            <FiCpu className="stat-icon emerald" />
          </div>
          <h2>99.99%</h2>
          <p>Uptime Guarantee</p>
        </div>
      </div>

      <section className="features-section">
        <div className="section-header">
          <h2>Everything you need to analyze your traffic</h2>
          <p>Built with speed, reliability, and security in mind.</p>
        </div>

        <div className="features">
          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <FiLink />
            </div>
            <h3>Custom Short URLs</h3>
            <p>Create clean, memorable links that build trust and increase click-through rates.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <FiBarChart2 />
            </div>
            <h3>Click Analytics</h3>
            <p>Get deep insights into who is clicking your links, with breakdown stats and reports.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <FiActivity />
            </div>
            <h3>Browser Tracking</h3>
            <p>Understand your audience's environment by analyzing OS, browsers, and devices.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <FiCpu />
            </div>
            <h3>QR Code Generator</h3>
            <p>Generate downloadable QR codes for any shortened link with one simple click.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <FiClock />
            </div>
            <h3>URL Expiry</h3>
            <p>Set links to expire after a certain duration to secure temporary campaigns.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <FiTrendingUp />
            </div>
            <h3>Top Performing Links</h3>
            <p>Instantly pinpoint high-traffic URLs that drive the most engagement for your brand.</p>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <p>© {new Date().getFullYear()} LinkForge. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Landing;