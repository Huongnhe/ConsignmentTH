import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Please enter email and password.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Invalid email format.");
      return;
    }

    try {
      const data = await login(email, password);
      setError("");

      if (data && data.Account === "Manager") {
        navigate("/admin");
      } else if (data && data.Account === "Staff") {
        navigate("/");
      } else if (data && data.Account === "Customer") {
        navigate("/home");
      }
    } catch (error) {
      setError("Login failed. Please check your credentials.");
    }
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{
        backgroundImage: "url('https://danviet.ex-cdn.com/files/f1/296231569849192448/2023/1/15/z403556587967736b20440c47ed11d16316bc354242f70-1673776858625-16737768587602017391246.jpg  ')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        position: "relative"
      }}
    >
      {/* Blur overlay */}
      <div
        className="position-absolute top-0 start-0 w-100 h-100"
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.4)",
          backdropFilter: "blur(5px)"
        }}
      ></div>

      {/* Login card */}
      <div
        className="card p-4 border-0 shadow-lg position-relative"
        style={{
          width: "100%",
          maxWidth: "450px",
          borderRadius: "15px",
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          overflow: "hidden"
        }}
      >
        {/* Luxury brand header */}
        <div className="text-center mb-4">
          <h2 className="text-dark mb-1" style={{ fontFamily: "'Playfair Display', serif", fontWeight: "700" }}>
            TH WORLD
          </h2>
          <p className="text-muted small" style={{ letterSpacing: "2px" }}>LUXURY COLLECTIONS</p>
        </div>

        {/* Login form */}
        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label small text-uppercase text-muted">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              className="form-control border-0 border-bottom rounded-0 py-3 px-0"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                backgroundColor: "rgba(255, 240, 220, 0.3)",
                borderBottom: "1px solid #ddd !important"
              }}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="form-label small text-uppercase text-muted">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="form-control border-0 border-bottom rounded-0 py-3 px-0"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              style={{
                backgroundColor: "rgba(255, 240, 220, 0.3)",
                borderBottom: "1px solid #ddd !important"
              }}
            />
          </div>

          <button
            type="submit"
            id="loginButton"
            className="btn btn-dark w-100 py-3 mb-3"
            style={{
              letterSpacing: "1px",
              fontWeight: "500",
              transition: "all 0.3s ease"
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = "#333"}
            onMouseOut={(e) => e.target.style.backgroundColor = "#000"}
          >
            SIGN IN
          </button>

          {error && (
            <div className="alert alert-danger text-center mb-3 py-2">
              {error}
            </div>
          )}

          <div className="text-center mt-3">
            <a
              href="#!"
              className="text-decoration-none text-muted small"
              onClick={(e) => {
                e.preventDefault();
                navigate("/forgot-password");
              }}
            >
              Forgot password?
            </a>
          </div>
        </form>

        <div className="position-relative my-4">
          <hr className="my-0" />
          <span
            className="position-absolute top-50 start-50 translate-middle bg-white px-2 small text-muted"
            style={{ width: "fit-content" }}
          >
            OR
          </span>
        </div>

        <button
          className="btn btn-outline-dark w-100 py-2"
          onClick={() => navigate("/register")}
          style={{
            letterSpacing: "1px",
            transition: "all 0.3s ease"
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = "#f8f9fa";
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = "transparent";
          }}
        >
          CREATE AN ACCOUNT
        </button>
      </div>
    </div>
  );
};

export default LoginPage;