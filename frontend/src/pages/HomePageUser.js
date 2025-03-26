import React, { useState } from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const HomePage = () => {
  const [showHero, setShowHero] = useState(true);

  return (
    <div>
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
        <div className="container">
          <Link className="navbar-brand" to="/">Ký Gửi Hàng Hiệu</Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <Link className="nav-link" to="/">Trang Chủ</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/consign">Ký Gửi</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/status">Trạng Thái Đơn</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/contact">Liên Hệ</Link>
              </li>
              <li className="nav-item">
                {/* <Link to="/login" id="homeLoginButton" className="btn btn-outline-primary me-2">
                  Đăng nhập
                </Link> */}
                <Link id="homeLoginButton" className="nav-link btn btn-outline-primary me-2" to="/login">Đăng Xuất</Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      {showHero && (
        <div
          className="d-flex justify-content-center align-items-center vh-100"
          style={{
            backgroundImage: "url('https://source.unsplash.com/featured/?fashion,luxury')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div
            className="card text-center shadow-lg p-4"
            style={{
              width: "500px",
              backdropFilter: "blur(10px)",
              background: "rgba(255, 255, 255, 0.8)",
              borderRadius: "15px",
            }}
          >
            <h1 className="text-primary">Chào mừng bạn!</h1>
            <p className="lead">Quản lý đơn ký gửi của bạn dễ dàng.</p>
            <div className="mt-3">
              <Link to="/consign" className="btn btn-primary me-2">Ký Gửi Ngay</Link>
              <button className="btn btn-secondary" onClick={() => setShowHero(false)}>Thoát</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;