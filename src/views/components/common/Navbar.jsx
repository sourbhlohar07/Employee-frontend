import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { authService } from "../../../services/authService";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = authService.isAuthenticated();
  const admin = authService.getAdminProfile();

  const handleLogout = () => {
    authService.logout();
    navigate("/admin/login");
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">📋</span>
          <span className="brand-text">Employee Enquiry</span>
        </Link>

        <nav className="navbar-nav">
          <Link
            to="/"
            className={`nav-link ${location.pathname === "/" ? "active" : ""}`}
          >
            Submit Enquiry
          </Link>

          {isAuthenticated ? (
            <div className="navbar-auth">
              <Link
                to="/admin/dashboard"
                className={`nav-link ${
                  location.pathname === "/admin/dashboard" ? "active" : ""
                }`}
              >
                Active Enquiries
              </Link>
              <div className="admin-badge">
                <span className="admin-avatar">👤</span>
                <span className="admin-info">
                  {admin?.name || admin?.email || "Admin"}
                </span>
              </div>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              to="/admin/login"
              className={`nav-link admin-login-btn ${
                location.pathname === "/admin/login" ? "active" : ""
              }`}
            >
              Admin Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
