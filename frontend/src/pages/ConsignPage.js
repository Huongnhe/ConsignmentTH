    import React, { useState, useEffect, useContext } from "react";
    import { Link } from "react-router-dom";
    import { AuthContext } from "../context/AuthContext";
    import { getUserProducts } from "../api/api";
    import "bootstrap/dist/css/bootstrap.min.css";
    import Navbar from "./MenuUser.js";

    const ConsignmentPage = () => {
        const { user } = useContext(AuthContext); 
        const [products, setProducts] = useState([]);
        const [loading, setLoading] = useState(false);
        const [error, setError] = useState(null);
        
        useEffect(() => {
            if (user && user.token) {
                fetchUserProducts();
            }
        }, [user]);

        const fetchUserProducts = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                setError("Người dùng chưa đăng nhập");
                return;
            }

            setLoading(true);
            setError(null);
            try {
                const data = await getUserProducts(token);
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
                                    <th>#</th>
                                    <th>Tên Sản Phẩm</th>
                                    <th>Giá Bán</th>
                                    <th>Thương Hiệu</th>
                                    <th>Loại</th>
                                    <th>Trạng Thái</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.length > 0 ? (
                                    products.map((p, index) => (
                                        <tr key={index}>
                                            <td>{index + 1}</td>
                                            <td>{p.Product_name}</td>
                                            <td>{p.Sale_price} VNĐ</td>
                                            <td>{p.Brand_name}</td>
                                            <td>{p.Product_type_name}</td>
                                            <td>
                                                <span 
                                                    className={`badge ${
                                                        p.Status === "Consigned" ? "bg-info" :
                                                        p.Status === "Received" ? "bg-warning" :
                                                        "bg-success"
                                                    }`}
                                                >
                                                    {p.Status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="text-center text-muted">Chưa có sản phẩm nào.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}

                    <div className="text-center mt-4">
                        <Link to="/" className="btn btn-secondary">Quay lại Trang Chủ</Link>
                    </div>
                </div>
            </div>
        );
    };

    export default ConsignmentPage;
