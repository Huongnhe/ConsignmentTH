import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext"; // Import context
import "bootstrap/dist/css/bootstrap.min.css";

const NavbarUser = () => {
  const { logout } = useContext(AuthContext); // Lấy hàm logout từ AuthContext
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
      <div className="container">
        <a className="navbar-brand fw-bold text-uppercase" to="/">
          Ký Gửi Hàng Hiệu
        </a>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link className="nav-link fw-semibold px-3" to="/">
                Trang Chủ
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link fw-semibold px-3" to="/consigns">
                Trạng Thái Đơn
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link fw-semibold px-3" to="/CreateConsign">
                Ký Gửi
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link fw-semibold px-3" to="/contact">
                Liên Hệ
              </Link>
            </li>
            <li className="nav-item">
              <button className="btn btn-outline-light fw-semibold px-4" onClick={handleLogout}>
                Đăng Xuất
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default NavbarUser;
