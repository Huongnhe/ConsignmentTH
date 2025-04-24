import React, { useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom"; 
import SidebarMenu from "../pages/MenuAdmin";

const HomePageAdmin = () => {
    const { user } = useContext(AuthContext);

    useEffect(() => {
        if (!user || user.Account !== "Manager") {
            window.location.href = "/home";
        }
    }, [user]);

    return (
        <div className="d-flex">
            {/* Sidebar */}
            <SidebarMenu />

            {/* Main Content */}
            <div
                className="container mt-5"
                style={{
                    marginLeft: "250px",
                    flex: 1,
                    padding: "20px",
                }}
            >
                <h2 className="text-center text-primary mb-4">Trang Quản Trị</h2>
                <div className="row">
                    {/* Quản lý Ký Gửi */}
                    <div className="col-md-4 mb-4">
                        <div className="card text-center p-4 shadow rounded-lg">
                            <h4 className="font-weight-bold">Quản lý Ký Gửi</h4>
                            <p className="text-muted">Theo dõi và duyệt các phiếu ký gửi</p>
                            <Link to="/admin/consignments" className="btn btn-outline-primary w-100">
                                Xem chi tiết
                            </Link>
                        </div>
                    </div>
                    {/* Quản lý Đơn Hàng */}
                    <div className="col-md-4 mb-4">
                        <div className="card text-center p-4 shadow rounded-lg">
                            <h4 className="font-weight-bold">Quản lý Đơn Hàng</h4>
                            <p className="text-muted">Kiểm tra và xử lý đơn hàng</p>
                            <Link to="/admin/orders" className="btn btn-outline-primary w-100">
                                Xem chi tiết
                            </Link>
                        </div>
                    </div>
                    {/* Quản lý Danh Mục */}
                    <div className="col-md-4 mb-4">
                        <div className="card text-center p-4 shadow rounded-lg">
                            <h4 className="font-weight-bold">Quản lý Danh Mục</h4>
                            <p className="text-muted">Thêm, sửa, xóa thương hiệu và loại sản phẩm</p>
                            <Link to="/admin/categories" className="btn btn-outline-primary w-100">
                                Xem chi tiết
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePageAdmin;
