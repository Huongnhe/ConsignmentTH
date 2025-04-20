import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";  // Sử dụng useNavigate thay cho useHistory
import { useAuthDetail } from "../context/AuthDetail";
import "bootstrap/dist/css/bootstrap.min.css";
import Navbar from "./MenuUser"; // Giả sử bạn đã có Navbar

const ProductDetailPage = () => {
    const { id } = useParams(); // Lấy ID từ URL
    const prevIdRef = useRef(null); // Đảm bảo prevIdRef khởi tạo đúng
    const { consignmentDetail, fetchConsignmentDetail, loading, error } = useAuthDetail();
    const [isEditMode, setIsEditMode] = useState(false);
    const [updatedConsignmentDetail, setUpdatedConsignmentDetail] = useState({});
    const navigate = useNavigate();  // Sử dụng useNavigate thay cho useHistory

    useEffect(() => {
        // Chỉ gọi lại API khi id thay đổi và id mới khác id cũ
        if (id !== prevIdRef.current) {
            console.log("ID thay đổi, gọi lại fetchConsignmentDetail");
            fetchConsignmentDetail(id);
            prevIdRef.current = id;  // Cập nhật prevIdRef sau khi gọi API
        }
    }, [id, fetchConsignmentDetail]);

    // Hàm cập nhật chi tiết đơn ký gửi
    const handleUpdate = () => {
        // Giả sử có một API để cập nhật dữ liệu
        console.log("Cập nhật chi tiết đơn ký gửi:", updatedConsignmentDetail);
        // TODO: Gọi API để cập nhật dữ liệu
        setIsEditMode(false); // Chuyển lại chế độ xem sau khi cập nhật
    };

    // Hàm xóa đơn ký gửi
    const handleDelete = () => {
        console.log("Xóa đơn ký gửi với ID:", consignmentDetail.Consignment_ID);
        // TODO: Gọi API để xóa đơn ký gửi
        navigate("/consignment"); // Điều hướng về trang danh sách sau khi xóa
    };

    if (loading) {
        return <div className="text-center">Đang tải...</div>;
    }

    if (error) {
        return <div className="text-center text-danger">{error}</div>;
    }

    if (!consignmentDetail) {
        return <div className="text-center">Không có chi tiết đơn ký gửi</div>;
    }

    return (
        <div>
            <Navbar /> {/* Thêm Navbar vào trang chi tiết */}
            <div className="container mt-5">
                <h2 className="text-center text-primary">Chi Tiết Đơn Ký Gửi</h2>
                <div className="card">
                    <div className="card-body">
                        {isEditMode ? (
                            <div>
                                <h5>Chỉnh sửa thông tin</h5>
                                <div className="form-group">
                                    <label>Tên sản phẩm</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={updatedConsignmentDetail.Product_Name || consignmentDetail.Product_Name}
                                        onChange={(e) => setUpdatedConsignmentDetail({ ...updatedConsignmentDetail, Product_Name: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Thương hiệu</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={updatedConsignmentDetail.Brand_Name || consignmentDetail.Brand_Name}
                                        onChange={(e) => setUpdatedConsignmentDetail({ ...updatedConsignmentDetail, Brand_Name: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Giá bán</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={updatedConsignmentDetail.Sale_Price || consignmentDetail.Sale_Price}
                                        onChange={(e) => setUpdatedConsignmentDetail({ ...updatedConsignmentDetail, Sale_Price: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Tình trạng</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={updatedConsignmentDetail.Consignment_Status || consignmentDetail.Consignment_Status}
                                        onChange={(e) => setUpdatedConsignmentDetail({ ...updatedConsignmentDetail, Consignment_Status: e.target.value })}
                                    />
                                </div>
                                <button onClick={handleUpdate} className="btn btn-primary">Cập nhật</button>
                                <button onClick={() => setIsEditMode(false)} className="btn btn-secondary ml-2">Hủy</button>
                            </div>
                        ) : (
                            <div>
                                <p><strong>Tên sản phẩm:</strong> {consignmentDetail.Product_Name || "Không có tên sản phẩm"}</p>
                                <p><strong>Thương hiệu:</strong> {consignmentDetail.Brand_Name || "Không có thương hiệu"}</p>
                                <p><strong>Loại sản phẩm:</strong> {consignmentDetail.Product_Type_Name || "Không có loại sản phẩm"}</p>
                                <p><strong>Giá bán:</strong> {consignmentDetail.Sale_Price ? `${consignmentDetail.Sale_Price} VNĐ` : "Không có giá"}</p>
                                <p><strong>Ngày tạo đơn:</strong> {new Date(consignmentDetail.Consignment_Create_Date).toLocaleDateString()}</p>
                                <p><strong>Tình trạng đơn:</strong> {consignmentDetail.Consignment_Status || "Chưa có tình trạng"}</p>
                                <p><strong>Email khách hàng:</strong> {consignmentDetail.Customer_Email || "Không có email"}</p>
                                <button onClick={() => setIsEditMode(true)} className="btn btn-warning mr-2">Chỉnh sửa</button>
                                <button onClick={handleDelete} className="btn btn-danger">Xóa</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailPage;
