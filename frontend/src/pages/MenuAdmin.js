import React from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaSignOutAlt, FaTachometerAlt, FaBox, FaTags } from "react-icons/fa"; // Import icon cho giao diện đẹp hơn

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
            <h3 className="text-center mb-4 font-weight-bold">Admin Dashboard</h3>
            <ul className="nav flex-column">
                <li className="nav-item mb-3">
                    <Link to="/admin/consignments" className="nav-link text-white d-flex align-items-center">
                        <FaBox className="mr-2" />
                        Ký Gửi
                    </Link>
                </li>
                <li className="nav-item mb-3">
                    <Link to="/admin/orders" className="nav-link text-white d-flex align-items-center">
                        <FaTachometerAlt className="mr-2" />
                        Đơn Hàng
                    </Link>
                </li>
                <li className="nav-item mb-3">
                    <Link to="/admin/categories" className="nav-link text-white d-flex align-items-center">
                        <FaTags className="mr-2" />
                        Danh Mục
                    </Link>
                </li>
                <li className="nav-item mb-3">
                    <button
                        className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center"
                        style={{ color: "#fff" }}
                        onClick={() => window.location.href = "/login"}
                    >
                        <FaSignOutAlt className="mr-2" />
                        Đăng Xuất
                    </button>
                </li>
            </ul>
        </div>
    );
};

export default SidebarMenu;
