import React from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const SidebarMenu = () => {
    return (
        <div
            className="bg-dark text-white p-4"
            style={{
                width: "250px",
                height: "100vh",
                position: "fixed",
                top: 0,
                left: 0,
                boxShadow: "4px 0 6px rgba(0, 0, 0, 0.1)",
            }}
        >
            <h3 className="text-center mb-4 fw-bold">Admin Dashboard</h3>
            <ul className="nav flex-column">
                <li className="nav-item mb-3">
                    <Link to="/admin/consignments" className="nav-link text-white d-flex align-items-center">
                        <i className="bi bi-box me-2"></i>
                        Ký Gửi
                    </Link>
                </li>
                <li className="nav-item mb-3">
                    <Link to="/admin/orders" className="nav-link text-white d-flex align-items-center">
                        <i className="bi bi-speedometer2 me-2"></i>
                        Đơn Hàng
                    </Link>
                </li>
                <li className="nav-item mb-3">
                    <Link to="/admin/categories" className="nav-link text-white d-flex align-items-center">
                        <i className="bi bi-tags me-2"></i>
                        Danh Mục
                    </Link>
                </li>
                <li className="nav-item mb-3">
                    <button
                        className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center"
                        onClick={() => window.location.href = "/login"}
                    >
                        <i className="bi bi-box-arrow-right me-2"></i>
                        Đăng Xuất
                    </button>
                </li>
            </ul>
        </div>
    );
};

export default SidebarMenu;
