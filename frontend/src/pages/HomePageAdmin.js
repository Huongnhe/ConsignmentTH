import React, { useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";

const HomePageAdmin = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user || user.role !== "manage") {
            navigate("/home"); // Chuyển hướng đến trang User nếu không phải admin
        }
    }, [user, navigate]);

    return (
        <div>
            {/* Navbar */}
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
                <div className="container">
                    <Link className="navbar-brand" to="/admin">Admin Dashboard</Link>
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
                                <Link className="nav-link" to="/admin/consignments">Quản lý Ký Gửi</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to="/admin/orders">Quản lý Đơn Hàng</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to="/admin/categories">Quản lý Danh Mục</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link btn btn-outline-primary me-2" to="/login">Đăng Xuất</Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>

            {/* Dashboard Overview */}
            <div className="container mt-5">
                <h2 className="text-center text-primary">Trang Quản Trị</h2>
                <div className="row mt-4">
                    <div className="col-md-4">
                        <div className="card text-center p-4 shadow">
                            <h4>Quản lý Ký Gửi</h4>
                            <p>Theo dõi và duyệt các phiếu ký gửi</p>
                            <Link to="/admin/consignments" className="btn btn-primary">Xem chi tiết</Link>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card text-center p-4 shadow">
                            <h4>Quản lý Đơn Hàng</h4>
                            <p>Kiểm tra và xử lý đơn hàng</p>
                            <Link to="/admin/orders" className="btn btn-primary">Xem chi tiết</Link>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card text-center p-4 shadow">
                            <h4>Quản lý Danh Mục</h4>
                            <p>Thêm, sửa, xóa thương hiệu và loại sản phẩm</p>
                            <Link to="/admin/categories" className="btn btn-primary">Xem chi tiết</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePageAdmin;
