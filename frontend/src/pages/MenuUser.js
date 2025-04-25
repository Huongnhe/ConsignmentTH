import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";

const NavbarUser = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark" style={{ 
      backgroundColor: "#1a1a1a",
      borderBottom: "1px solid rgba(212, 180, 131, 0.3)"
    }}>
      <div className="container">
        {/* Luxury Logo & Brand */}
        <Link className="navbar-brand d-flex align-items-center" to="/" style={{ 
          fontFamily: "'Montserrat', sans-serif",
          fontWeight: "700",
          letterSpacing: "1.5px"
        }}>
          <div style={{
            width: "42px",
            height: "42px",
            backgroundColor: "#d4af37",
            color: "#1a1a1a",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginRight: "12px",
            fontSize: "1.3rem",
            fontWeight: "800",
            boxShadow: "0 2px 8px rgba(212, 175, 131, 0.4)"
          }}>
            TH
          </div>
          <span style={{ 
            color: "#ffffff",
            fontSize: "1.2rem",
            textTransform: "uppercase"
          }}>TH WORLD</span>
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          style={{ borderColor: "#d4af37" }}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-lg-center">
            <li className="nav-item mx-2">
              <Link 
                className="nav-link px-3" 
                to="/home"
                style={{
                  color: "#ffffff",
                  fontWeight: "600",
                  letterSpacing: "1px",
                  fontSize: "0.95rem",
                  textTransform: "uppercase",
                  transition: "all 0.3s ease",
                  position: "relative",
                  padding: "8px 0"
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = "#f8e6c3";
                  e.target.style.textShadow = "0 0 8px rgba(248, 230, 195, 0.6)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = "#ffffff";
                  e.target.style.textShadow = "none";
                }}
              >
                Home
                <span style={{
                  position: "absolute",
                  bottom: "0",
                  left: "0",
                  width: "0%",
                  height: "2px",
                  backgroundColor: "#d4af37",
                  transition: "width 0.3s ease"
                }}></span>
              </Link>
            </li>
            
            <li className="nav-item mx-2">
              <Link 
                className="nav-link px-3" 
                to="/consigns"
                style={{
                  color: "#ffffff",
                  fontWeight: "600",
                  letterSpacing: "1px",
                  fontSize: "0.95rem",
                  textTransform: "uppercase",
                  transition: "all 0.3s ease",
                  position: "relative",
                  padding: "8px 0"
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = "#f8e6c3";
                  e.target.style.textShadow = "0 0 8px rgba(248, 230, 195, 0.6)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = "#ffffff";
                  e.target.style.textShadow = "none";
                }}
              >
                My Consignments
              </Link>
            </li>
            
            <li className="nav-item mx-2">
              <Link 
                className="nav-link px-3" 
                to="/CreateConsign"
                style={{
                  color: "#ffffff",
                  fontWeight: "600",
                  letterSpacing: "1px",
                  fontSize: "0.95rem",
                  textTransform: "uppercase",
                  transition: "all 0.3s ease",
                  position: "relative",
                  padding: "8px 0"
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = "#f8e6c3";
                  e.target.style.textShadow = "0 0 8px rgba(248, 230, 195, 0.6)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = "#ffffff";
                  e.target.style.textShadow = "none";
                }}
              >
                New Consignment
              </Link>
            </li>
            
            <li className="nav-item mx-2">
              <Link 
                className="nav-link px-3" 
                to="/contact"
                style={{
                  color: "#ffffff",
                  fontWeight: "600",
                  letterSpacing: "1px",
                  fontSize: "0.95rem",
                  textTransform: "uppercase",
                  transition: "all 0.3s ease",
                  position: "relative",
                  padding: "8px 0"
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = "#f8e6c3";
                  e.target.style.textShadow = "0 0 8px rgba(248, 230, 195, 0.6)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = "#ffffff";
                  e.target.style.textShadow = "none";
                }}
              >
                Contact
              </Link>
            </li>
            
            <li className="nav-item ms-lg-3 mt-3 mt-lg-0">
              <button 
                className="btn px-4 py-2" 
                onClick={handleLogout}
                style={{
                  backgroundColor: "transparent",
                  color: "#d4af37",
                  border: "2px solid #d4af37",
                  fontWeight: "600",
                  letterSpacing: "1px",
                  fontSize: "0.95rem",
                  textTransform: "uppercase",
                  transition: "all 0.3s ease",
                  boxShadow: "0 2px 8px rgba(212, 175, 131, 0.2)"
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "rgba(212, 175, 131, 0.15)";
                  e.target.style.color = "#f8e6c3";
                  e.target.style.borderColor = "#f8e6c3";
                  e.target.style.boxShadow = "0 2px 12px rgba(248, 230, 195, 0.3)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "transparent";
                  e.target.style.color = "#d4af37";
                  e.target.style.borderColor = "#d4af37";
                  e.target.style.boxShadow = "0 2px 8px rgba(212, 175, 131, 0.2)";
                }}
              >
                Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default NavbarUser;