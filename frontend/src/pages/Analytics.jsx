import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";
import "./Analytics.css";
import jsPDF from "jspdf";
import { 
  FiGrid, FiUser, FiLogOut, FiArrowLeft, FiActivity, FiCheckCircle, 
  FiClock, FiTrendingUp, FiDownload, FiLink, FiGlobe, FiSmartphone, FiFileText
} from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

function Analytics() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState(null);
  const [loadingHealth, setLoadingHealth] = useState(false);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await API.get(`/analytics/${id}/details`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setAnalytics(res.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [id]);

  const checkHealth = async () => {
    setLoadingHealth(true);
    const loadingToast = toast.loading("Checking link response time...");
    try {
      const token = localStorage.getItem("token");
      const res = await API.get(`/urls/${id}/health`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success(`Target server is ${res.data.status}!`, { id: loadingToast });
      fetchAnalytics();
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch health check", { id: loadingToast });
    } finally {
      setLoadingHealth(false);
    }
  };

  if (!analytics) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading Analytics...</p>
      </div>
    );
  }

  const { url, metrics, distributions } = analytics;

  // Transform recent visits for chart (Reverse order for chronological flow)
  const chartData = metrics.recentVisits
    .slice()
    .reverse()
    .map((visit, index) => ({
      name: `Visit ${index + 1}`,
      clicks: index + 1
    }));

  const COLORS = ["#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ec4899", "#ef4444"];

  const getCountryFlag = (countryName) => {
    const flags = {
      "United States": "🇺🇸",
      "India": "🇮🇳",
      "United Kingdom": "🇬🇧",
      "Germany": "🇩🇪",
      "Canada": "🇨🇦",
      "France": "🇫🇷",
      "Australia": "🇦🇺",
      "Singapore": "🇸🇬"
    };
    return flags[countryName] || "🏳️";
  };

  const getRankBadge = (rank) => {
    if (rank === "Gold") return { emoji: "🥇", label: "Gold", class: "badge-gold" };
    if (rank === "Silver") return { emoji: "🥈", label: "Silver", class: "badge-silver" };
    return { emoji: "🥉", label: "Bronze", class: "badge-bronze" };
  };

  const getCategoryClass = (cat) => {
    const classes = {
      "Technology": "badge-tech",
      "Education": "badge-edu",
      "Social Media": "badge-social",
      "Shopping": "badge-shop",
      "Entertainment": "badge-ent",
      "News": "badge-news"
    };
    return classes[cat] || "badge-uncategorized";
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-top">
          <div className="sidebar-brand" onClick={() => navigate("/")}>
            🚀 LinkForge
          </div>

          <div className="sidebar-menu">
            <div 
              className="menu-item"
              onClick={() => navigate("/dashboard")}
            >
              <FiGrid className="menu-icon" />
              <span>Dashboard</span>
            </div>

            <div 
              className="menu-item"
              onClick={() => navigate("/profile")}
            >
              <FiUser className="menu-icon" />
              <span>Profile</span>
            </div>
          </div>
        </div>

        <button
          className="sidebar-logout-btn"
          onClick={() => {
            localStorage.removeItem("token");
            window.location.href = "/login";
          }}
        >
          <FiLogOut className="menu-icon" />
          <span>Logout</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Header with Breadcrumb & Actions */}
        <header className="analytics-header">
          <div className="breadcrumb-row">
            <span className="breadcrumb-parent" onClick={() => navigate("/dashboard")}>Dashboard</span>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-active">Link Analytics</span>
          </div>

          <div className="analytics-title-row">
            <div className="title-left-side">
              <h1>Link Performance</h1>
              <p className="original-url-subtitle" title={url.originalUrl}>Target: {url.originalUrl}</p>
              
              <div className="analytics-badges-row">
                <span className={`category-badge ${getCategoryClass(url.category)}`}>
                  {url.category || "Uncategorized"}
                </span>

                <span className={`rank-badge-item ${getRankBadge(metrics.ranking).class}`}>
                  {getRankBadge(metrics.ranking).emoji} {metrics.ranking} Rank
                </span>
              </div>
            </div>

            <div className="analytics-actions">
              <button className="export-report-btn" onClick={() => navigate(`/report/${url._id}`)}>
                <FiFileText className="btn-icon" /> Printable Report
              </button>
              
              <button className="back-dashboard-btn" onClick={() => navigate("/dashboard")}>
                <FiArrowLeft className="btn-icon" /> Back
              </button>
            </div>
          </div>
        </header>

        {/* KPI Grid */}
        <section className="analytics-kpi-section">
          <div className="analytics-kpi-grid four-cols">
            <div className="kpi-card premium">
              <div className="kpi-icon-wrapper purple">
                <FiActivity />
              </div>
              <div className="kpi-info">
                <span>Total Traffic</span>
                <h2>{metrics.totalClicks}</h2>
              </div>
            </div>

            <div className="kpi-card premium">
              <div className="kpi-icon-wrapper cyan">
                <FiGrid />
              </div>
              <div className="kpi-info">
                <span>QR Clicks</span>
                <h2>{metrics.qrClicks}</h2>
              </div>
            </div>

            <div className="kpi-card premium">
              <div className="kpi-icon-wrapper emerald">
                <FiGlobe />
              </div>
              <div className="kpi-info">
                <span>Country Reach</span>
                <h2>{distributions.countries.length}</h2>
              </div>
            </div>

            <div className="kpi-card premium">
              <div className="kpi-icon-wrapper amber">
                <FiClock />
              </div>
              <div className="kpi-info">
                <span>Last Visited</span>
                <h2>
                  {metrics.lastVisited
                    ? new Date(metrics.lastVisited).toLocaleDateString()
                    : "N/A"}
                </h2>
              </div>
            </div>
          </div>
        </section>

        {/* New Analytics Layout Grid */}
        <section className="analytics-dashboard-grid">
          
          {/* Performance score dial card */}
          <div className="analytics-large-card score-gauge-card">
            <div className="card-header">
              <h3>URL Performance Score</h3>
              <p>Overall rating based on traffic volume, health accessibility, and geographic reach.</p>
            </div>

            <div className="radial-score-wrapper">
              <div className="score-radial-progress">
                <svg className="radial-svg" viewBox="0 0 100 100">
                  <circle className="radial-bg" cx="50" cy="50" r="45" />
                  <circle 
                    className="radial-fill" 
                    cx="50" cy="50" r="45" 
                    style={{ strokeDashoffset: 282.6 - (282.6 * metrics.performanceScore) / 100 }}
                  />
                </svg>
                <div className="score-center-text">
                  <span className="score-percentage">{metrics.performanceScore}</span>
                  <span className="score-max-val">/100</span>
                </div>
              </div>
              <div className="score-classification">
                <h4>{metrics.performanceLabel}</h4>
                <p>Calculated score across clicks, devices, and server response.</p>
              </div>
            </div>
          </div>

          {/* Health monitor card */}
          <div className="analytics-large-card connection-health-card">
            <div className="card-header">
              <h3>Connection Health Monitor</h3>
              <p>Status of original destination address accessibility.</p>
            </div>

            <div className="health-card-body">
              <div className="health-status-layout">
                <div className={`health-badge-status ${metrics.healthStatus.toLowerCase()}`}>
                  <span className="health-dot-large"></span>
                  <span className="status-label">{metrics.healthStatus}</span>
                </div>

                <div className="health-meta-details">
                  <p>
                    {metrics.healthStatus === "Healthy" && "🟢 Target URL is online and responding normally (< 1.5s)."}
                    {metrics.healthStatus === "Slow" && "🟡 Target URL is online but experiences higher latencies (> 1.5s)."}
                    {metrics.healthStatus === "Down" && "🔴 Target URL is unreachable or returning error codes."}
                    {metrics.healthStatus === "Unknown" && "⚪ Target health has not been tested yet."}
                  </p>
                </div>
              </div>

              <button 
                className="recheck-health-btn" 
                onClick={checkHealth}
                disabled={loadingHealth}
              >
                {loadingHealth ? "Testing server..." : "Check Response Health"}
              </button>
            </div>
          </div>

          {/* Recharts Click activity timeline */}
          <div className="chart-large-card span-2">
            <div className="chart-header">
              <h3>Click Activity Over Time</h3>
              <p>Tracking the sequential history of visits to this link.</p>
            </div>
            
            <div className="chart-wrapper">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                    <XAxis dataKey="name" stroke="#9CA3AF" fontSize={11} tickLine={false} />
                    <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#111827', 
                        borderColor: '#1F2937', 
                        borderRadius: '12px',
                        color: '#fff' 
                      }} 
                    />
                    <Line
                      type="monotone"
                      dataKey="clicks"
                      stroke="#8b5cf6"
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 0 }}
                      activeDot={{ r: 6, fill: '#8b5cf6', stroke: '#fff', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="chart-empty-state">No click data available yet.</div>
              )}
            </div>
          </div>

          {/* Browser distribution */}
          <div className="chart-small-card">
            <div className="chart-header">
              <h3>Browser Breakdown</h3>
              <p>Client browser types registered.</p>
            </div>

            <div className="chart-wrapper pie-chart-wrapper">
              {distributions.browsers.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie
                        data={distributions.browsers}
                        dataKey="value"
                        nameKey="name"
                        outerRadius={75}
                        innerRadius={50}
                        paddingAngle={4}
                      >
                        {distributions.browsers.map((entry, index) => (
                          <Cell key={index} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#111827', 
                          borderColor: '#1F2937', 
                          borderRadius: '8px',
                          color: '#fff'
                        }} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  
                  <div className="pie-legends">
                    {distributions.browsers.map((entry, index) => (
                      <div key={index} className="legend-item">
                        <span className="legend-dot" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                        <span className="legend-name">{entry.name}</span>
                        <span className="legend-val">({entry.value})</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="chart-empty-state">No browser data.</div>
              )}
            </div>
          </div>

          {/* Device distribution (New Pie/Donut Chart) */}
          <div className="chart-small-card">
            <div className="chart-header">
              <h3>Device Distribution</h3>
              <p>Hardware platform breakdown.</p>
            </div>

            <div className="chart-wrapper pie-chart-wrapper">
              {distributions.devices.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie
                        data={distributions.devices}
                        dataKey="value"
                        nameKey="name"
                        outerRadius={75}
                        innerRadius={50}
                        paddingAngle={4}
                      >
                        {distributions.devices.map((entry, index) => (
                          <Cell key={index} fill={COLORS[(index + 3) % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#111827', 
                          borderColor: '#1F2937', 
                          borderRadius: '8px',
                          color: '#fff'
                        }} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  
                  <div className="pie-legends">
                    {distributions.devices.map((entry, index) => (
                      <div key={index} className="legend-item">
                        <span className="legend-dot" style={{ backgroundColor: COLORS[(index + 3) % COLORS.length] }}></span>
                        <span className="legend-name">{entry.name}</span>
                        <span className="legend-val">({entry.value})</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="chart-empty-state">No device data.</div>
              )}
            </div>
          </div>

          {/* Geo Analytics Chart (New Bar Chart for top countries) */}
          <div className="chart-large-card span-2">
            <div className="chart-header">
              <h3>Geographic Distribution</h3>
              <p>Top countries originating clicks on this link.</p>
            </div>
            
            <div className="chart-wrapper">
              {distributions.countries.length > 0 ? (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={distributions.countries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                    <XAxis dataKey="name" stroke="#9CA3AF" fontSize={11} tickLine={false} />
                    <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#111827', 
                        borderColor: '#1F2937', 
                        borderRadius: '12px',
                        color: '#fff' 
                      }} 
                    />
                    <Bar dataKey="value" fill="#06B6D4" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="chart-empty-state">No country data available yet.</div>
              )}
            </div>
          </div>

        </section>

        {/* Timeline & Summary Section */}
        <section className="analytics-bottom-section">
          
          {/* Countries reach flag summary */}
          <div className="link-summary-card">
            <h3>Geographic Traffic Breakdown</h3>
            <div className="summary-list">
              {distributions.countries.length > 0 ? (
                distributions.countries.map((item, idx) => (
                  <div key={idx} className="summary-row">
                    <span className="row-label">
                      <span style={{ marginRight: '8px', fontSize: '16px' }}>{getCountryFlag(item.name)}</span>
                      {item.name}
                    </span>
                    <span className="row-value">{item.value} click{item.value > 1 ? 's' : ''}</span>
                  </div>
                ))
              ) : (
                <div className="no-data-text">No geographic clicks recorded.</div>
              )}
            </div>
          </div>

          {/* Visits Timeline */}
          <div className="timeline-activity-card">
            <h3>Recent Visit Timeline</h3>
            
            <div className="timeline-container">
              {metrics.recentVisits.length === 0 ? (
                <div className="timeline-empty">
                  <FiGlobe className="empty-icon" />
                  <p>No analytics data yet. Share your short URL to start tracking clicks.</p>
                </div>
              ) : (
                <div className="timeline-list">
                  {metrics.recentVisits.map((visit, index) => (
                    <div key={visit._id || index} className="timeline-node">
                      <div className="node-line"></div>
                      <div className="node-bullet"></div>
                      
                      <div className="node-content">
                        <div className="node-header">
                          <span className="node-device-info">
                            <span style={{ marginRight: '8px' }}>{getCountryFlag(visit.country)}</span>
                            {!visit.browser || visit.browser.toLowerCase() === "unknown" ? "Browser" : visit.browser} 
                            <span className="separator">•</span>
                            <FiSmartphone className="meta-icon" />
                            {!visit.device || visit.device.toLowerCase() === "unknown" ? "Device" : visit.device}
                            {visit.isQr && (
                              <>
                                <span className="separator">•</span>
                                <span className="timeline-qr-badge">QR Scan</span>
                              </>
                            )}
                          </span>
                          
                          <span className="node-timestamp">
                            {new Date(visit.visitedAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Analytics;