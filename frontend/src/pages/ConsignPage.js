import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { getUserProducts } from "../api/api";
import "bootstrap/dist/css/bootstrap.min.css";
import Navbar from "./MenuUser.js";

const ConsignmentPage = () => {
    const { user } = useContext(AuthContext);
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (user) {
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
            setTickets(data);
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
                <h2 className="text-center text-primary">Danh Sách Đơn Ký Gửi</h2>

                {loading ? (
                    <p className="text-center text-warning">Đang tải...</p>
                ) : error ? (
                    <p className="text-center text-danger">{error}</p>
                ) : (
                    tickets.length > 0 ? (
                        tickets.map((ticket, index) => (
                            <div key={index} className="mb-5">
                                <h5>
                                    <span className="badge bg-secondary">Mã đơn: {ticket.TicketID}</span> &nbsp;
                                    <span
                                        className={`badge ${
                                            ticket.Status === "Approved" ? "bg-success" :  // Màu xanh lá cho "Approved"
                                            ticket.Status === "Rejected" ? "bg-danger" :  // Màu đỏ cho "Rejected"
                                            "bg-warning"  // Màu vàng cho "Pending"
                                        }`}
                                    >
                                        {ticket.Status}
                                    </span>
                                </h5>
                                <table className="table table-bordered mt-2">
                                    <thead className="table-dark">
                                        <tr>
                                            <th>Thương Hiệu</th>
                                            <th>Loại</th>
                                            <th>Tên Sản Phẩm</th>
                                            <th>Số Lượng</th>
                                            <th>Giá Bán</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {ticket.products.map((product, idx) => (
                                            <tr key={idx}>
                                                <td>{product.Brand_name}</td>
                                                <td>{product.Product_type_name}</td>
                                                <td>{product.Product_name}</td>
                                                <td>{product.Quantity}</td>
                                                <td>{product.Sale_price} VNĐ</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <div className="text-end">
                                    <Link to={`/detailConsign/${ticket.TicketID}`} className="btn btn-info btn-sm">
                                        Chi Tiết Đơn
                                    </Link>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-muted">Chưa có đơn ký gửi nào.</p>
                    )
                )}
            </div>
        </div>
    );
};

export default ConsignmentPage;
