import { useState } from "react";
import API from "../api/axios";
import "./Login.css";
import { useNavigate, Link } from "react-router-dom";
import { FiMail, FiLock, FiArrowRight } from "react-icons/fi";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await API.post("/auth/login", {
        email,
        password,
      });

      localStorage.setItem(
        "token",
        res.data.token
      );

      navigate("/dashboard");

    } catch (error) {
      alert(
        error.response?.data?.message ||
        "Login Failed"
      );
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-glow-sphere"></div>
      
      <div className="auth-card-wrapper">
        <div className="auth-brand" onClick={() => navigate("/")}>
          🚀 LinkForge
        </div>
        
        <div className="auth-card">
          <h2>Welcome back</h2>
          <p className="auth-subtitle">
            Enter your credentials to manage your links
          </p>

          <form onSubmit={handleLogin}>
            <div className="input-group">
              <label>Email Address</label>
              <div className="input-field-wrapper">
                <FiMail className="input-icon" />
                <input
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <div className="label-row">
                <label>Password</label>
              </div>
              <div className="input-field-wrapper">
                <FiLock className="input-icon" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  required
                />
              </div>
            </div>

            <button type="submit" className="auth-submit-btn">
              Login to Dashboard <FiArrowRight />
            </button>
          </form>

          <p className="auth-footer-link">
            Don't have an account?{" "}
            <Link to="/register">
              Sign up for free
            </Link>
          </p>
        </div>

        <p className="auth-legal-text">
          Protected by industry standard encryption. By continuing, you agree to our Terms of Service.
        </p>
      </div>
    </div>
  );
}

export default Login;