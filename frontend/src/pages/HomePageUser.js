import React, { useState } from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import Navbar from "./MenuUser.js";
const HomePage = () => {
  const [showHero, setShowHero] = useState(true);

  return (
    <div>
     <Navbar /> {/* Gọi Navbar ở đây */}
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