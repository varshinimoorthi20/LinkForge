import { useState } from "react";
import API from "../api/axios";
import "./Login.css";
import { useNavigate, Link } from "react-router-dom";
import { FiUser, FiMail, FiLock, FiArrowRight } from "react-icons/fi";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      await API.post("/auth/register", {
        name,
        email,
        password,
      });

      alert("Registration Successful");

      navigate("/login");

    } catch (error) {

      alert(
        error.response?.data?.message ||
        "Registration Failed"
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
          <h2>Create an account</h2>
          <p className="auth-subtitle">
            Get started with your free developer account today
          </p>

          <form onSubmit={handleRegister}>
            <div className="input-group">
              <label>Full Name</label>
              <div className="input-field-wrapper">
                <FiUser className="input-icon" />
                <input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  required
                />
              </div>
            </div>

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
              <label>Password</label>
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
              Create Account <FiArrowRight />
            </button>
          </form>

          <p className="auth-footer-link">
            Already have an account?{" "}
            <Link to="/login">
              Sign in
            </Link>
          </p>
        </div>

        <p className="auth-legal-text">
          By signing up, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}

export default Register;