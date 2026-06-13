import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import API from "../api/axios";
import "./Dashboard.css";
import toast, { Toaster } from "react-hot-toast";
import { 
  FiGrid, FiUser, FiLogOut, FiLink, FiActivity, FiCheckCircle, 
  FiTrendingUp, FiCopy, FiBarChart2, FiTrash2, FiSearch, 
  FiDownload, FiX, FiCalendar, FiClock, FiGlobe, FiEdit, FiUpload
} from "react-icons/fi";

function Dashboard() {
  const [urls, setUrls] = useState([]);
  const [originalUrl, setOriginalUrl] = useState("");
  const [showQR, setShowQR] = useState(false);
  const [qrValue, setQrValue] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [expiryDays, setExpiryDays] = useState("never");
  const [overview, setOverview] = useState(null);

  // Edit Link States
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUrlId, setEditingUrlId] = useState("");
  const [editOriginalUrl, setEditOriginalUrl] = useState("");

  // CSV Bulk Upload States
  const [csvFile, setCsvFile] = useState(null);
  const [uploadingCsv, setUploadingCsv] = useState(false);
  const [csvSummary, setCsvSummary] = useState(null);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const fetchUrls = async () => {
    try {
      const res = await API.get("/urls", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUrls(res.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchOverview = async () => {
    try {
      const res = await API.get("/analytics/overview", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setOverview(res.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const createUrl = async () => {
    if (!originalUrl.trim()) {
      toast.error("Enter a URL");
      return;
    }

    try {
      await API.post(
        "/urls",
        { 
          originalUrl: originalUrl.trim(), 
          customCode: customCode.trim(),
          expiryDays, 
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Short URL Created");
      setOriginalUrl("");
      setCustomCode("");
      setExpiryDays("never");
      fetchUrls();
      fetchOverview();
    } catch (error) {
      console.error(error);
      toast.error("Failed to create URL");
    }
  };

  const deleteUrl = async (id) => {
    try {
      await API.delete(`/urls/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("URL Deleted");
      fetchUrls();
      fetchOverview();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete URL");
    }
  };

  const copyUrl = (shortCode) => {
    navigator.clipboard.writeText(
      `http://localhost:5000/${shortCode}`
    );
    toast.success("Link Copied");
  };

  const checkHealth = async (id) => {
    const loadingToast = toast.loading("Testing connection...");
    try {
      const res = await API.get(`/urls/${id}/health`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success(`Target is ${res.data.status}!`, { id: loadingToast });
      fetchUrls();
      fetchOverview();
    } catch (error) {
      console.error(error);
      toast.error("Connection test failed", { id: loadingToast });
    }
  };

  const downloadQR = () => {
    const canvas = document.getElementById("qrCode");
    const pngUrl = canvas
      .toDataURL("image/png")
      .replace("image/png", "image/octet-stream");

    const downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = "LinkForge-QRCode.png";

    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    toast.success("QR Downloaded");
  };

  const handleEditUrl = async (e) => {
    e.preventDefault();
    if (!editOriginalUrl.trim()) {
      toast.error("Original URL is required");
      return;
    }

    const loadingToast = toast.loading("Updating destination URL...");
    try {
      await API.put(
        `/urls/${editingUrlId}`,
        { originalUrl: editOriginalUrl.trim() },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Destination URL updated", { id: loadingToast });
      setShowEditModal(false);
      setEditingUrlId("");
      setEditOriginalUrl("");
      fetchUrls();
      fetchOverview();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to update URL", { id: loadingToast });
    }
  };

  const handleCsvUpload = async (fileToUpload) => {
    const targetFile = fileToUpload || csvFile;
    if (!targetFile) {
      toast.error("Please select a CSV file first");
      return;
    }

    setUploadingCsv(true);
    const loadingToast = toast.loading("Processing bulk import...");
    const formData = new FormData();
    formData.append("file", targetFile);

    try {
      const res = await API.post(
        "/urls/bulk",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success("CSV file processed successfully", { id: loadingToast });
      setCsvSummary(res.data);
      setCsvFile(null);
      fetchUrls();
      fetchOverview();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to upload CSV", { id: loadingToast });
    } finally {
      setUploadingCsv(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && (file.type === "text/csv" || file.name.endsWith(".csv"))) {
      setCsvFile(file);
      handleCsvUpload(file);
    } else {
      toast.error("Only CSV files are supported");
    }
  };

  useEffect(() => {
    fetchUrls();
    fetchOverview();

    const interval = setInterval(() => {
      fetchUrls();
      fetchOverview();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

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

  const getRankBadge = (clicks) => {
    if (clicks >= 50) return { label: "Gold", emoji: "🥇", class: "badge-gold" };
    if (clicks >= 10) return { label: "Silver", emoji: "🥈", class: "badge-silver" };
    return { label: "Bronze", emoji: "🥉", class: "badge-bronze" };
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

  const filteredUrls = urls.filter(
    (url) =>
      url.originalUrl
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      url.shortCode
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  const stats = overview?.summary || {
    totalUrls: urls.length,
    totalClicks: urls.reduce((sum, u) => sum + u.clickCount, 0),
    activeUrls: urls.filter(u => !u.expiresAt || new Date(u.expiresAt) > new Date()).length,
    mostActiveLink: null,
    topCountry: "N/A",
    weeklyGrowth: "0.0",
    averagePerformanceScore: 0
  };

  const hasAnyInsights = !!(
    overview?.insights &&
    (overview.insights.mostPopular ||
      overview.insights.fastestGrowing ||
      overview.insights.topCountry ||
      overview.insights.mostUsedBrowser ||
      overview.insights.mostUsedDevice ||
      overview.insights.bestPerforming ||
      overview.insights.expiringSoon?.length > 0 ||
      overview.insights.trafficAlerts?.length > 0)
  );

  return (
    <div className="dashboard-layout">
      <Toaster position="top-right" />

      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-top">
          <div className="sidebar-brand" onClick={() => navigate("/")}>
            🚀 LinkForge
          </div>

          <div className="sidebar-menu">
            <div 
              className="menu-item active"
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
        {/* Welcome Header */}
        <header className="dashboard-header">
          <div>
            <h1>Executive Dashboard</h1>
            <p>Welcome back! Monitor and manage your short links in real-time.</p>
          </div>
        </header>

        {/* Stats Section */}
        <section className="dashboard-stats-section">
          <div className="stats-kpi-grid executive-grid">
            <div className="kpi-card premium">
              <div className="kpi-icon-wrapper purple">
                <FiLink />
              </div>
              <div className="kpi-info">
                <span>Active URLs</span>
                <h2>{stats.activeUrls} <span className="total-span">/ {stats.totalUrls}</span></h2>
              </div>
            </div>

            <div className="kpi-card premium">
              <div className="kpi-icon-wrapper cyan">
                <FiActivity />
              </div>
              <div className="kpi-info">
                <span>Total Clicks</span>
                <h2>{stats.totalClicks}</h2>
              </div>
            </div>

            <div className="kpi-card premium">
              <div className="kpi-icon-wrapper emerald">
                <FiGlobe />
              </div>
              <div className="kpi-info">
                <span>Top Country</span>
                <h2>{getCountryFlag(stats.topCountry)} {stats.topCountry}</h2>
              </div>
            </div>

            <div className="kpi-card premium">
              <div className="kpi-icon-wrapper amber">
                <FiTrendingUp />
              </div>
              <div className="kpi-info">
                <span>Weekly Growth</span>
                <h2 className={Number(stats.weeklyGrowth) >= 0 ? "positive-growth" : "negative-growth"}>
                  {Number(stats.weeklyGrowth) >= 0 ? `+${stats.weeklyGrowth}%` : `${stats.weeklyGrowth}%`}
                </h2>
              </div>
            </div>

            <div className="kpi-card premium">
              <div className="kpi-icon-wrapper rose">
                <FiCheckCircle />
              </div>
              <div className="kpi-info">
                <span>Performance Score</span>
                <h2>{stats.averagePerformanceScore} <span className="total-span">/ 100</span></h2>
              </div>
            </div>
          </div>
        </section>

        {/* Layout Grid: Main Actions on Left, Activity on Right */}
        <div className="dashboard-body-grid">
          <div className="body-main-col">
            {/* Create URL Form section */}
            <section className="create-url-section">
              <h2>Shorten a new URL</h2>
              <div className="create-url-form">
                <div className="form-group url-input">
                  <label>Original URL</label>
                  <input
                    type="text"
                    placeholder="https://example.com/very-long-link-destination"
                    value={originalUrl}
                    onChange={(e) => setOriginalUrl(e.target.value)}
                  />
                </div>

                <div className="form-group custom-code-input">
                  <label>Custom Alias (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. promo2026"
                    value={customCode}
                    onChange={(e) => setCustomCode(e.target.value)}
                  />
                </div>

                <div className="form-group expiry-select-group">
                  <label>Expiration</label>
                  <select
                    value={expiryDays}
                    onChange={(e) => setExpiryDays(e.target.value)}
                  >
                    <option value="never">Never Expire</option>
                    <option value="1">1 Day</option>
                    <option value="7">7 Days</option>
                    <option value="30">30 Days</option>
                  </select>
                </div>

                <button className="create-url-btn" onClick={createUrl}>
                  Create Link
                </button>
              </div>
            </section>

            {/* CSV Bulk Upload Card */}
            <section className="create-url-section csv-upload-section">
              <h2>Bulk Shorten via CSV</h2>
              <div 
                className={`csv-dropzone ${csvFile ? "has-file" : ""}`}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <FiUpload className="upload-icon" style={{ fontSize: "28px", color: "var(--accent)" }} />
                {csvFile ? (
                  <div className="file-info-container">
                    <p className="filename" style={{ fontWeight: 600, color: "white" }}>{csvFile.name}</p>
                    <p className="filesize" style={{ color: "var(--text-secondary)", fontSize: "12px" }}>({(csvFile.size / 1024).toFixed(2)} KB)</p>
                  </div>
                ) : (
                  <div>
                    <p className="dropzone-text" style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "12px" }}>
                      Drag and drop your .csv file here, or click to upload
                    </p>
                    <input
                      type="file"
                      accept=".csv"
                      style={{ display: "none" }}
                      id="csvFileInput"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setCsvFile(file);
                          handleCsvUpload(file);
                        }
                      }}
                    />
                    <label htmlFor="csvFileInput" className="csv-browse-btn" style={{
                      backgroundColor: "rgba(139, 92, 246, 0.1)",
                      border: "1px solid rgba(139, 92, 246, 0.3)",
                      color: "white",
                      padding: "8px 16px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "13px",
                      fontWeight: 600,
                      display: "inline-block",
                      transition: "var(--transition-smooth)"
                    }}>
                      Browse Files
                    </label>
                  </div>
                )}
              </div>

              {/* Upload Summary Metrics Card */}
              {csvSummary && (
                <div className="csv-summary-card" style={{
                  marginTop: "16px",
                  background: "rgba(255, 255, 255, 0.02)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "12px",
                  padding: "16px"
                }}>
                  <div className="summary-title-row" style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "12px"
                  }}>
                    <h3 style={{ fontSize: "14px", color: "white" }}>Bulk Import Results</h3>
                    <button className="summary-close-btn" onClick={() => setCsvSummary(null)} style={{
                      background: "transparent",
                      border: "none",
                      color: "var(--text-muted)",
                      cursor: "pointer"
                    }}>
                      <FiX />
                    </button>
                  </div>
                  <div className="summary-metrics-grid" style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "12px",
                    textAlign: "center"
                  }}>
                    <div className="metric-item">
                      <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Total Processed</span>
                      <h4 style={{ fontSize: "16px", color: "white", marginTop: "4px" }}>{csvSummary.totalRows}</h4>
                    </div>
                    <div className="metric-item success">
                      <span style={{ fontSize: "11px", color: "#34d399" }}>Created</span>
                      <h4 style={{ fontSize: "16px", color: "#10b981", marginTop: "4px" }}>{csvSummary.created}</h4>
                    </div>
                    <div className="metric-item error">
                      <span style={{ fontSize: "11px", color: "#f87171" }}>Failed / Skipped</span>
                      <h4 style={{ fontSize: "16px", color: "#ef4444", marginTop: "4px" }}>{csvSummary.failed}</h4>
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* Links List Header & Search */}
            <section className="links-list-section">
              <div className="links-section-header">
                <h2>Your Short Links</h2>
                
                <div className="dashboard-search-box">
                  <FiSearch className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search links..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {urls.length > 0 ? (
                <div className="urls-cards-grid">
                  {filteredUrls.map((url) => {
                    const isExpired = url.expiresAt && new Date() > new Date(url.expiresAt);
                    const rank = getRankBadge(url.clickCount);
                    
                    // Health statuses colors
                    let healthColor = "#9CA3AF"; // Gray for unknown
                    if (url.healthStatus === "Healthy") healthColor = "#10B981"; // Green
                    if (url.healthStatus === "Slow") healthColor = "#F59E0B"; // Amber
                    if (url.healthStatus === "Down") healthColor = "#EF4444"; // Red

                    return (
                      <div key={url._id} className="url-saas-card">
                        {/* Top status & clicks row */}
                        <div className="card-top-row">
                          <div className="left-badges">
                            <span className={`saas-badge ${isExpired ? "expired" : "active"}`}>
                              <span className="badge-dot"></span>
                              {isExpired ? "Expired" : "Active"}
                            </span>

                            {/* Category Badge */}
                            <span className={`category-badge ${getCategoryClass(url.category)}`}>
                              {url.category || "Uncategorized"}
                            </span>

                            {/* Rank Badge */}
                            <span className={`rank-badge-item ${rank.class}`}>
                              {rank.emoji} {rank.label}
                            </span>
                          </div>

                          <div className="right-indicators">
                            {/* Health Dot */}
                            <span 
                              className="health-indicator-btn"
                              onClick={() => checkHealth(url._id)}
                              title={`Health: ${url.healthStatus || "Unknown"} (Click to retest)`}
                            >
                              <span className="health-dot" style={{ backgroundColor: healthColor }}></span>
                              <span className="health-text">{url.healthStatus || "Unknown"}</span>
                            </span>

                            <span className="card-clicks-indicator">
                              <FiActivity className="clicks-icon" />
                              {url.clickCount} clicks
                            </span>
                          </div>
                        </div>

                        {/* Middle URLs information */}
                        <div className="card-body-info">
                          <div className="card-short-url">
                            <a
                              href={`http://localhost:5000/${url.shortCode}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              localhost:5000/{url.shortCode}
                            </a>
                          </div>

                          <div className="card-original-url" title={url.originalUrl}>
                            {url.originalUrl}
                          </div>

                          <div className="card-meta-dates">
                            {url.createdAt && (
                              <div className="date-item">
                                <FiCalendar className="date-icon" />
                                <span>Created: {new Date(url.createdAt).toLocaleDateString()}</span>
                              </div>
                            )}

                            {url.expiresAt && (
                              <div className="date-item expiry">
                                <FiClock className="date-icon" />
                                <span>Expires: {new Date(url.expiresAt).toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Bottom action buttons aligned in a single row */}
                        <div className="card-action-row">
                          <button
                            className="action-btn copy"
                            onClick={() => copyUrl(url.shortCode)}
                            title="Copy Link"
                          >
                            <FiCopy /> Copy
                          </button>

                          <button
                            className="action-btn stats"
                            onClick={() => navigate(`/analytics/${url._id}`)}
                            title="View Analytics"
                          >
                            <FiBarChart2 /> Analytics
                          </button>

                          <button
                            className="action-btn qr"
                            onClick={() => {
                              setQrValue(`http://localhost:5000/${url.shortCode}?source=qr`);
                              setShowQR(true);
                            }}
                            title="QR Code"
                          >
                            <FiGrid /> QR
                          </button>

                          <button
                            className="action-btn edit"
                            onClick={() => {
                              setEditingUrlId(url._id);
                              setEditOriginalUrl(url.originalUrl);
                              setShowEditModal(true);
                            }}
                            title="Edit Destination URL"
                          >
                            <FiEdit /> Edit
                          </button>

                          <button
                            className="action-btn delete"
                            onClick={() => deleteUrl(url._id)}
                            title="Delete Link"
                          >
                            <FiTrash2 /> Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="saas-empty-state">
                  <div className="empty-state-icon">
                    <FiLink />
                  </div>
                  <h3>No Short Links Yet</h3>
                  <p>Get started by shortening a long URL in the form above.</p>
                </div>
              )}
            </section>
          </div>

          {/* Sidebar Widgets: Live Activity Feed */}
          <div className="body-widgets-col">
            {/* Smart Insights Widget */}
            <div className="widget-card insights-widget-card">
              <div className="widget-header">
                <h3>🧠 Smart Insights</h3>
                <span className="insights-sparkle">✨</span>
              </div>
              
              <div className="insights-list">
                {!hasAnyInsights ? (
                  <div className="empty-widget-state">
                    <p>Analytics insights will unlock once your short links start receiving traffic.</p>
                  </div>
                ) : (
                  <>
                    {/* Alerts section */}
                    {((overview?.insights?.trafficAlerts && overview.insights.trafficAlerts.length > 0) || 
                      (overview?.insights?.expiringSoon && overview.insights.expiringSoon.length > 0)) && (
                      <div className="insights-alerts-section">
                        {overview.insights.trafficAlerts?.map((alert, idx) => (
                          <div key={`traffic-${idx}`} className="insight-alert-item traffic">
                            <span className="alert-emoji">🚨</span>
                            <div className="alert-content">
                              <span className="alert-title">Traffic Spike Alert</span>
                              <p>
                                <span className="text-highlight">/{alert.shortCode}</span> has received <strong>{alert.recentClicks}</strong> clicks in the last 24h!
                              </p>
                            </div>
                          </div>
                        ))}
                        
                        {overview.insights.expiringSoon?.map((alert, idx) => (
                          <div key={`expiry-${idx}`} className="insight-alert-item expiry">
                            <span className="alert-emoji">⏰</span>
                            <div className="alert-content">
                              <span className="alert-title">Expiring Soon</span>
                              <p>
                                <span className="text-highlight">/{alert.shortCode}</span> expires in <strong>{alert.daysLeft}</strong> {alert.daysLeft === 1 ? 'day' : 'days'}.
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* standard metrics */}
                    <div className="insights-metrics-list">
                      {overview?.insights?.mostPopular && (
                        <div className="insight-metric-item">
                          <div className="insight-item-header">
                            <span className="metric-emoji">🔥</span>
                            <div className="metric-info">
                              <span className="metric-label">Most Popular Link</span>
                              <span className="metric-value">/{overview.insights.mostPopular.shortCode}</span>
                            </div>
                          </div>
                          <div className="metric-meta">
                            <strong>{overview.insights.mostPopular.clicks}</strong> total clicks
                          </div>
                        </div>
                      )}

                      {overview?.insights?.fastestGrowing && (
                        <div className="insight-metric-item">
                          <div className="insight-item-header">
                            <span className="metric-emoji">📈</span>
                            <div className="metric-info">
                              <span className="metric-label">Fastest Growing (7d)</span>
                              <span className="metric-value">/{overview.insights.fastestGrowing.shortCode}</span>
                            </div>
                          </div>
                          <div className="metric-meta">
                            <strong>+{overview.insights.fastestGrowing.recentClicks}</strong> clicks
                          </div>
                        </div>
                      )}

                      {overview?.insights?.bestPerforming && (
                        <div className="insight-metric-item">
                          <div className="insight-item-header">
                            <span className="metric-emoji">🏆</span>
                            <div className="metric-info">
                              <span className="metric-label">Best Performing</span>
                              <span className="metric-value">/{overview.insights.bestPerforming.shortCode}</span>
                            </div>
                          </div>
                          <div className="metric-meta text-emerald">
                            Score: <strong>{overview.insights.bestPerforming.score}</strong> ({overview.insights.bestPerforming.label})
                          </div>
                        </div>
                      )}

                      {overview?.insights?.topCountry && (
                        <div className="insight-metric-item">
                          <div className="insight-item-header">
                            <span className="metric-emoji">🌍</span>
                            <div className="metric-info">
                              <span className="metric-label">Top Location</span>
                              <span className="metric-value">
                                {getCountryFlag(overview.insights.topCountry.country)} {overview.insights.topCountry.country}
                              </span>
                            </div>
                          </div>
                          <div className="metric-meta">
                            <strong>{overview.insights.topCountry.visits}</strong> visitors
                          </div>
                        </div>
                      )}

                      {overview?.insights?.mostUsedBrowser && (
                        <div className="insight-metric-item">
                          <div className="insight-item-header">
                            <span className="metric-emoji">🖥</span>
                            <div className="metric-info">
                              <span className="metric-label">Top Browser</span>
                              <span className="metric-value">{overview.insights.mostUsedBrowser.browser}</span>
                            </div>
                          </div>
                          <div className="metric-meta">
                            <strong>{overview.insights.mostUsedBrowser.percentage}%</strong> share
                          </div>
                        </div>
                      )}

                      {overview?.insights?.mostUsedDevice && (
                        <div className="insight-metric-item">
                          <div className="insight-item-header">
                            <span className="metric-emoji">📱</span>
                            <div className="metric-info">
                              <span className="metric-label">Top Device</span>
                              <span className="metric-value">{overview.insights.mostUsedDevice.device}</span>
                            </div>
                          </div>
                          <div className="metric-meta">
                            <strong>{overview.insights.mostUsedDevice.percentage}%</strong> share
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="widget-card activity-feed-card">
              <div className="widget-header">
                <h3>Live Activity Feed</h3>
                <span className="live-pulse"></span>
              </div>
              
              <div className="activity-list">
                {overview && overview.activityFeed && overview.activityFeed.length > 0 ? (
                  overview.activityFeed.map((visit) => {
                    const shortUrlCode = visit.url ? `/${visit.url.shortCode}` : "/link";
                    const isQrScan = visit.isQr;
                    const timestampStr = new Date(visit.visitedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    
                    return (
                      <div key={visit._id} className="activity-item">
                        <div className="activity-badge-icon">
                          {isQrScan ? "📱" : "🌐"}
                        </div>
                        <div className="activity-detail">
                          <p>
                            {isQrScan ? (
                              <>QR scan detected on <span className="text-highlight">{shortUrlCode}</span></>
                            ) : (
                              <>Someone visited <span className="text-highlight">{shortUrlCode}</span> from {getCountryFlag(visit.country)} {visit.country}</>
                            )}
                          </p>
                          <span className="activity-time">{timestampStr} • {visit.browser}</span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="empty-widget-state">
                    <p>Waiting for link traffic...</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* QR Modal */}
        {showQR && (
          <div className="modal-backdrop" onClick={() => setShowQR(false)}>
            <div className="qr-saas-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>QR Code Generated</h3>
                <button className="close-modal-btn" onClick={() => setShowQR(false)}>
                  <FiX />
                </button>
              </div>

              <div className="modal-body">
                <div className="qr-canvas-wrapper">
                  <QRCodeCanvas id="qrCode" value={qrValue} size={200} />
                </div>
                <a
                  href={qrValue}
                  target="_blank"
                  rel="noreferrer"
                  className="modal-qr-link"
                >
                  {qrValue}
                </a>
              </div>

              <div className="modal-footer">
                <button className="download-qr-btn" onClick={downloadQR}>
                  <FiDownload className="btn-icon" /> Download PNG
                </button>
                <button className="cancel-qr-btn" onClick={() => setShowQR(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && (
          <div className="modal-backdrop" onClick={() => {
            setShowEditModal(false);
            setEditingUrlId("");
            setEditOriginalUrl("");
          }}>
            <div className="qr-saas-modal edit-saas-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Edit Destination URL</h3>
                <button className="close-modal-btn" onClick={() => {
                  setShowEditModal(false);
                  setEditingUrlId("");
                  setEditOriginalUrl("");
                }}>
                  <FiX />
                </button>
              </div>

              <form onSubmit={handleEditUrl}>
                <div className="modal-body">
                  <p className="modal-subtitle" style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "16px", lineHeight: "1.4" }}>
                    Update original destination URL for this short link. Click analytics and visits history will be preserved.
                  </p>
                  <div className="form-group edit-url-input" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)" }}>Destination URL</label>
                    <input
                      type="text"
                      value={editOriginalUrl}
                      onChange={(e) => setEditOriginalUrl(e.target.value)}
                      placeholder="https://example.com/new-destination"
                      required
                      style={{
                        width: "100%",
                        backgroundColor: "rgba(255, 255, 255, 0.02)",
                        border: "1px solid var(--border-color)",
                        color: "white",
                        padding: "12px 14px",
                        borderRadius: "var(--radius-md)",
                        fontSize: "14px",
                        outline: "none"
                      }}
                    />
                  </div>
                </div>

                <div className="modal-footer edit-modal-footer" style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                  <button type="submit" className="save-edit-btn" style={{
                    flex: 1,
                    backgroundColor: "var(--accent)",
                    border: "none",
                    color: "white",
                    padding: "12px",
                    borderRadius: "var(--radius-md)",
                    fontWeight: 600,
                    fontSize: "14px",
                    cursor: "pointer",
                    transition: "var(--transition-smooth)"
                  }}>
                    Save Changes
                  </button>
                  <button type="button" className="cancel-edit-btn" onClick={() => {
                    setShowEditModal(false);
                    setEditingUrlId("");
                    setEditOriginalUrl("");
                  }} style={{
                    flex: 1,
                    backgroundColor: "rgba(255, 255, 255, 0.02)",
                    border: "1px solid var(--border-color)",
                    color: "white",
                    padding: "12px",
                    borderRadius: "var(--radius-md)",
                    fontWeight: 600,
                    fontSize: "14px",
                    cursor: "pointer",
                    transition: "var(--transition-smooth)"
                  }}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Dashboard;