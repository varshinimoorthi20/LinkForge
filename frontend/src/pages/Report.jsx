import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";
import "./Report.css";
import jsPDF from "jspdf";
import { 
  FiFileText, FiPrinter, FiDownload, FiArrowLeft, FiActivity, 
  FiGrid, FiCheckCircle, FiGlobe, FiClock, FiSmartphone
} from "react-icons/fi";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

function Report() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await API.get(`/analytics/${id}/details`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setReportData(res.data.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchReport();
  }, [id]);

  if (!reportData) {
    return (
      <div className="report-loading">
        <div className="loading-spinner"></div>
        <p>Generating Report...</p>
      </div>
    );
  }

  const { url, metrics, distributions } = reportData;

  const COLORS = ["#8B5CF6", "#06B6D4", "#10B981", "#F59E0B"];

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.setTextColor(17, 24, 39);
    doc.text("LinkForge Executive Report", 20, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 28);
    doc.line(20, 32, 190, 32);

    doc.setFontSize(12);
    doc.setTextColor(55, 65, 81);
    doc.text(`Shortened URL: http://localhost:5000/${url.shortCode}`, 20, 42);
    doc.text(`Original URL: ${url.originalUrl}`, 20, 50);
    doc.text(`Category: ${url.category || "Uncategorized"}`, 20, 58);

    doc.line(20, 64, 190, 64);

    doc.setFontSize(14);
    doc.setTextColor(17, 24, 39);
    doc.text("Performance & Health Metrics", 20, 74);

    doc.setFontSize(11);
    doc.setTextColor(55, 65, 81);
    doc.text(`Total Clicks: ${metrics.totalClicks}`, 20, 84);
    doc.text(`QR Code Clicks: ${metrics.qrClicks}`, 20, 92);
    doc.text(`Performance Score: ${metrics.performanceScore}/100 (${metrics.performanceLabel})`, 20, 100);
    doc.text(`Link Health: ${metrics.healthStatus}`, 20, 108);
    doc.text(`Global Rank: ${metrics.ranking}`, 20, 116);
    doc.text(`Last Visited: ${metrics.lastVisited ? new Date(metrics.lastVisited).toLocaleString() : "N/A"}`, 20, 124);

    doc.line(20, 132, 190, 132);

    doc.setFontSize(14);
    doc.setTextColor(17, 24, 39);
    doc.text("Recent Activity Timeline (Last 15 Visits)", 20, 142);

    let y = 152;
    const recent = metrics.recentVisits.slice(0, 15);
    if (recent.length === 0) {
      doc.setFontSize(11);
      doc.setTextColor(107, 114, 128);
      doc.text("No click events recorded yet.", 20, y);
    } else {
      doc.setFontSize(9);
      doc.setTextColor(75, 85, 99);
      recent.forEach((visit, index) => {
        const timeStr = new Date(visit.visitedAt).toLocaleString();
        const type = visit.isQr ? "QR Code" : "Web Direct";
        doc.text(
          `${index + 1}. ${timeStr} - ${visit.browser} (${visit.device}) - ${visit.country} - ${type}`,
          20,
          y
        );
        y += 8;
      });
    }

    doc.save(`Report-${url.shortCode}.pdf`);
  };

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

  return (
    <div className="report-page-container">
      {/* Action Bar - Hidden in Print */}
      <div className="report-action-bar no-print">
        <button className="back-btn" onClick={() => navigate(`/analytics/${id}`)}>
          <FiArrowLeft /> Back to Analytics
        </button>
        
        <div className="action-buttons">
          <button className="print-btn" onClick={handlePrint}>
            <FiPrinter /> Print Report
          </button>
          <button className="pdf-btn" onClick={handleDownloadPDF}>
            <FiDownload /> Save PDF
          </button>
        </div>
      </div>

      {/* Main Report Page */}
      <div className="report-paper">
        <header className="report-header">
          <div className="header-left">
            <span className="logo-icon">🚀</span>
            <div>
              <h1>LinkForge Executive Report</h1>
              <p className="subtitle">Enterprise Analytics & Health Audit</p>
            </div>
          </div>
          <div className="header-right">
            <p className="generation-date">Generated: {new Date().toLocaleDateString()}</p>
            <p className="report-id">Ref ID: {url._id.substring(0, 8).toUpperCase()}</p>
          </div>
        </header>

        <section className="report-url-details">
          <h3>Link Identity</h3>
          <div className="url-grid">
            <div className="url-col">
              <label>Shortened Link</label>
              <p className="url-val highlight">localhost:5000/{url.shortCode}</p>
            </div>
            <div className="url-col">
              <label>Original URL</label>
              <p className="url-val truncate" title={url.originalUrl}>{url.originalUrl}</p>
            </div>
            <div className="url-col">
              <label>Category</label>
              <p className="url-val font-semibold">{url.category || "Uncategorized"}</p>
            </div>
          </div>
        </section>

        {/* Executive KPI Grid */}
        <section className="report-kpi-grid">
          <div className="report-kpi-card">
            <div className="kpi-icon-container purple">
              <FiActivity />
            </div>
            <div className="kpi-info">
              <span>Total Traffic</span>
              <h2>{metrics.totalClicks}</h2>
            </div>
          </div>

          <div className="report-kpi-card">
            <div className="kpi-icon-container cyan">
              <FiGrid />
            </div>
            <div className="kpi-info">
              <span>QR Code Scans</span>
              <h2>{metrics.qrClicks}</h2>
            </div>
          </div>

          <div className="report-kpi-card">
            <div className="kpi-icon-container emerald">
              <FiCheckCircle />
            </div>
            <div className="kpi-info">
              <span>Health Status</span>
              <h2>{metrics.healthStatus}</h2>
            </div>
          </div>

          <div className="report-kpi-card">
            <div className="kpi-icon-container amber">
              <FiGlobe />
            </div>
            <div className="kpi-info">
              <span>Global Rank</span>
              <h2>{metrics.ranking}</h2>
            </div>
          </div>
        </section>

        <div className="report-columns-grid">
          {/* Performance Score Dial */}
          <div className="report-card score-card">
            <h3>Performance Score</h3>
            <div className="score-dial-container">
              <div className="score-dial">
                <span className="score-num">{metrics.performanceScore}</span>
                <span className="score-max">/100</span>
              </div>
              <p className="score-status">{metrics.performanceLabel}</p>
            </div>
          </div>

          {/* Device Distribution */}
          <div className="report-card">
            <h3>Device Distribution</h3>
            {distributions.devices.length > 0 ? (
              <div className="device-distribution-wrapper">
                <ResponsiveContainer width="100%" height={150}>
                  <PieChart>
                    <Pie
                      data={distributions.devices}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={55}
                      innerRadius={35}
                      paddingAngle={3}
                    >
                      {distributions.devices.map((entry, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="report-legend">
                  {distributions.devices.map((entry, index) => (
                    <div key={index} className="legend-item">
                      <span className="dot" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                      <span>{entry.name}: {entry.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="no-data">No device records.</p>
            )}
          </div>
        </div>

        {/* Countries Bar Chart */}
        <section className="report-card chart-card">
          <h3>Geographic Reach (Top Countries)</h3>
          {distributions.countries.length > 0 ? (
            <div className="bar-chart-container">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={distributions.countries} margin={{ left: -20, right: 10, top: 10 }}>
                  <XAxis dataKey="name" stroke="#6b7280" fontSize={11} tickLine={false} />
                  <YAxis stroke="#6b7280" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: "rgba(229, 231, 235, 0.1)" }} />
                  <Bar dataKey="value" fill="#8B5CF6" radius={[4, 4, 0, 0]} barSize={35} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="no-data">No geolocation records.</p>
          )}
        </section>

        {/* Global Distribution Table */}
        <section className="report-card table-card">
          <h3>Visitor Breakdown</h3>
          {distributions.countries.length > 0 ? (
            <table className="report-table">
              <thead>
                <tr>
                  <th>Country</th>
                  <th>Clicks</th>
                  <th>Percentage</th>
                </tr>
              </thead>
              <tbody>
                {distributions.countries.map((item, index) => {
                  const pct = ((item.value / metrics.totalClicks) * 100).toFixed(1);
                  return (
                    <tr key={index}>
                      <td className="flag-cell">
                        <span className="flag-emoji">{getCountryFlag(item.name)}</span>
                        <span>{item.name}</span>
                      </td>
                      <td>{item.value}</td>
                      <td>{pct}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <p className="no-data">No traffic reports recorded.</p>
          )}
        </section>

        {/* Timeline Log */}
        <section className="report-card timeline-card">
          <h3>Recent Access History</h3>
          {metrics.recentVisits.length > 0 ? (
            <div className="report-timeline">
              {metrics.recentVisits.slice(0, 10).map((visit, index) => (
                <div key={index} className="timeline-row">
                  <span className="timestamp">{new Date(visit.visitedAt).toLocaleString()}</span>
                  <span className="meta">
                    {visit.browser} on {visit.device}
                  </span>
                  <span className="location">
                    {getCountryFlag(visit.country)} {visit.country}
                  </span>
                  <span className={`channel-badge ${visit.isQr ? "qr" : "web"}`}>
                    {visit.isQr ? "QR Scan" : "Web Link"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">No activity timeline recorded.</p>
          )}
        </section>

        <footer className="report-footer">
          <p>LinkForge Report System &copy; 2026. Confidential and Proprietary.</p>
          <p>Page 1 of 1</p>
        </footer>
      </div>
    </div>
  );
}

export default Report;
