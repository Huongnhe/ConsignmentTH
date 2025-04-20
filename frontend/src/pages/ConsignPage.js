import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { getUserProducts } from "../api/api";
import "bootstrap/dist/css/bootstrap.min.css";
import Navbar from "./MenuUser.js";

const ConsignmentPage = () => {
    const { user } = useContext(AuthContext);
    console.log("User từ AuthContext:", user);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        console.log("useEffect chạy với user:", user);
        if (user) {
            fetchUserProducts();
        }
    }, [user]);

    const fetchUserProducts = async () => {
        const token = localStorage.getItem("token");
        console.log("Token từ localStorage:", token); // Kiểm tra token
        if (!token) {
            setError("Người dùng chưa đăng nhập");
            return;
        }
    
        setLoading(true);
        setError(null);
        try {
            const data = await getUserProducts(token);
            console.log("Dữ liệu API trả về nhe:", data); // Kiểm tra dữ liệu trả về
            setProducts(data);
        } catch (error) {
            console.error("Lỗi khi lấy sản phẩm:", error);
            setError("Không thể tải danh sách sản phẩm");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <Navbar />
            <div className="container mt-5">
                <h2 className="text-center text-primary">Danh Sách Sản Phẩm Ký Gửi</h2>

                {loading ? (
                    <p className="text-center text-warning">Đang tải...</p>
                ) : error ? (
                    <p className="text-center text-danger">{error}</p>
                ) : (
                    <table className="table table-bordered">
                        <thead className="table-dark">
                            <tr>
                                <th>Mã hóa đơn</th>
                                <th>Thương Hiệu</th>
                                <th>Loại</th>
                                <th>Tên Sản Phẩm</th>
                                <th>Số Lượng</th>
                                <th>Giá Bán</th>
                                <th>Trạng Thái</th>
                                <th>Chi Tiết</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.length > 0 ? (
                                products.map((p, index) => (
                                    <tr key={index}>
                                        <td>{p.ID}</td>
                                        <td>{p.Brand_name}</td>
                                        <td>{p.Product_type_name}</td>
                                        <td>{p.Product_name}</td>
                                        <td>{p.Quantity}</td>
                                        <td>{p.Sale_price} VNĐ</td>
                                        <td>
                                            <span
                                                className={`badge ${p.Status === "Consigned" ? "bg-info" :
                                                        p.Status === "Received" ? "bg-warning" :
                                                            "bg-success"
                                                    }`}
                                            >
                                                {p.Status}
                                            </span>
                                        </td>
                                        <td>
                                            {/* Nút chi tiết cho mỗi sản phẩm */}
                                            <Link to={`/detailConsign/${p.ID}`} className="btn btn-info btn-sm">
                                                Chi Tiết
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="text-center text-muted">Chưa có sản phẩm nào.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default ConsignmentPage;
