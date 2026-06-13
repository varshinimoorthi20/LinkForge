import { useEffect, useState } from "react";
import API from "../api/axios";
import "./Profile.css";
import { useNavigate } from "react-router-dom";
import { 
  FiGrid, FiUser, FiLogOut, FiCalendar, FiShield, 
  FiMail, FiKey, FiCopy, FiCheckCircle 
} from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";

function Profile() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        const userRes = await API.get("/auth/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(userRes.data.user);

        const statsRes = await API.get("/analytics/overview", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setStats(statsRes.data.data.summary);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);

  const copyUserId = () => {
    if (user?._id) {
      navigator.clipboard.writeText(user._id);
      toast.success("User ID Copied");
    }
  };

  if (!user) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner"></div>
        <p>Loading Profile...</p>
      </div>
    );
  }

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
              className="menu-item"
              onClick={() => navigate("/dashboard")}
            >
              <FiGrid className="menu-icon" />
              <span>Dashboard</span>
            </div>

            <div 
              className="menu-item active"
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
        <header className="dashboard-header">
          <h1>Account Settings</h1>
          <p>Manage your account settings, credentials, and profile achievements.</p>
        </header>

        <section className="profile-settings-layout">
          {/* Avatar and overview card */}
          <div className="profile-overview-card">
            <div className="profile-avatar-large">
              {user.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            
            <div className="profile-overview-info">
              <h2>{user.name}</h2>
              <p>{user.email}</p>
              
              <div className="plan-badge">
                <FiShield className="badge-icon" /> Developer Account
              </div>
            </div>
          </div>

          {/* Account information details */}
          <div className="profile-settings-details">
            <div className="settings-card">
              <h3>Personal Details</h3>
              <p className="settings-subtitle">Your basic personal identification details.</p>

              <div className="settings-form">
                <div className="settings-field">
                  <label>Full Name</label>
                  <input type="text" value={user.name} readOnly disabled />
                </div>

                <div className="settings-field">
                  <label>Email Address</label>
                  <div className="field-with-icon">
                    <FiMail className="field-icon" />
                    <input type="text" value={user.email} readOnly disabled />
                  </div>
                </div>
              </div>
            </div>

            {/* Achievements Section */}
            <div className="settings-card achievements-card">
              <h3>Gamified Achievements</h3>
              <p className="settings-subtitle">Track your performance milestones and unlock badges as your links gain popularity.</p>
              
              <div className="achievements-grid">
                <div className={`achievement-item ${stats?.totalUrls > 0 ? "unlocked" : "locked"}`}>
                  <div className="achievement-icon">🌱</div>
                  <div className="achievement-info">
                    <h4>First Link Created</h4>
                    <p>{stats?.totalUrls > 0 ? "Unlocked!" : "Create your first short link to unlock."}</p>
                  </div>
                </div>

                <div className={`achievement-item ${stats?.totalClicks >= 10 ? "unlocked" : "locked"}`}>
                  <div className="achievement-icon">🔥</div>
                  <div className="achievement-info">
                    <h4>10 Clicks Milestone</h4>
                    <p>{stats?.totalClicks >= 10 ? "Unlocked!" : "Accumulate 10 total link clicks."}</p>
                  </div>
                </div>

                <div className={`achievement-item ${stats?.totalClicks >= 50 ? "unlocked" : "locked"}`}>
                  <div className="achievement-icon">👑</div>
                  <div className="achievement-info">
                    <h4>50 Clicks Supernova</h4>
                    <p>{stats?.totalClicks >= 50 ? "Unlocked!" : "Accumulate 50 total link clicks."}</p>
                  </div>
                </div>

                <div className={`achievement-item ${(stats?.mostActiveLink && stats?.mostActiveLink?.clickCount > 0) ? "unlocked" : "locked"}`}>
                  <div className="achievement-icon">🚀</div>
                  <div className="achievement-info">
                    <h4>Top Link Achiever</h4>
                    <p>{(stats?.mostActiveLink && stats?.mostActiveLink?.clickCount > 0) ? `Unlocked! (Top: /${stats.mostActiveLink.shortCode})` : "Get clicks on a link to unlock."}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="settings-card">
              <h3>Developer & Security</h3>
              <p className="settings-subtitle">Access controls, user keys, and timestamps.</p>

              <div className="settings-form">
                <div className="settings-field">
                  <label>User ID</label>
                  <div className="field-action-wrapper">
                    <div className="field-with-icon id-field">
                      <FiKey className="field-icon" />
                      <input type="text" value={user._id} readOnly disabled />
                    </div>
                    <button className="field-action-btn" onClick={copyUserId} title="Copy User ID">
                      <FiCopy />
                    </button>
                  </div>
                </div>

                <div className="settings-field">
                  <label>Account Created</label>
                  <div className="field-with-icon">
                    <FiCalendar className="field-icon" />
                    <input 
                      type="text" 
                      value={new Date(user.createdAt).toLocaleString()} 
                      readOnly 
                      disabled 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Profile;