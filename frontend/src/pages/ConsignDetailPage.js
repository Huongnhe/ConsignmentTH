import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthDetail } from "../context/AuthDetail";
import "bootstrap/dist/css/bootstrap.min.css";
import Navbar from "./MenuUser";

const ProductDetailPage = () => {
    const { id } = useParams();
    const prevIdRef = useRef(null);
    const { consignmentDetail, fetchConsignmentDetail, loading, error } = useAuthDetail();
    const [isEditMode, setIsEditMode] = useState(false);
    const [updatedConsignmentDetail, setUpdatedConsignmentDetail] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        if (id !== prevIdRef.current) {
            fetchConsignmentDetail(id);
            prevIdRef.current = id;
        }
    }, [id, fetchConsignmentDetail]);

    const handleUpdate = () => {
        console.log("Cập nhật chi tiết đơn ký gửi:", updatedConsignmentDetail);
        // TODO: Gọi API cập nhật dữ liệu backend
        setIsEditMode(false);
    };

    const handleDelete = () => {
        console.log("Xóa đơn ký gửi với ID:", consignmentDetail.Consignment_ID);
        // TODO: Gọi API xóa
        navigate("/consignment");
    };

    if (loading) return <div className="text-center">Đang tải...</div>;
    if (error) return <div className="text-center text-danger">{error}</div>;
    if (!consignmentDetail) return <div className="text-center">Không có chi tiết đơn ký gửi</div>;

    return (
        <div>
            <Navbar />
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
                                    <label>Giá bán ký gửi</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={updatedConsignmentDetail.Consignment_Price || consignmentDetail.Consignment_Price}
                                        onChange={(e) => setUpdatedConsignmentDetail({ ...updatedConsignmentDetail, Consignment_Price: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Số lượng</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={updatedConsignmentDetail.Quantity || consignmentDetail.Quantity}
                                        onChange={(e) => setUpdatedConsignmentDetail({ ...updatedConsignmentDetail, Quantity: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Tình trạng đơn ký gửi</label>
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
                                <p><strong>Giá gốc:</strong> {consignmentDetail.Original_Price ? `${consignmentDetail.Original_Price} VNĐ` : "Không có"}</p>
                                <p><strong>Giá bán ký gửi:</strong> {consignmentDetail.Consignment_Price ? `${consignmentDetail.Consignment_Price} VNĐ` : "Không có"}</p>
                                <p><strong>Số lượng:</strong> {consignmentDetail.Quantity || "Không có"}</p>
                                <p><strong>Tình trạng sản phẩm:</strong> {consignmentDetail.Product_Status || "Không có"}</p>
                                <p><strong>Tình trạng đơn:</strong> {consignmentDetail.Consignment_Status || "Không có"}</p>
                                <p><strong>Ngày tạo đơn:</strong> {new Date(consignmentDetail.Consignment_Create_Date).toLocaleDateString()}</p>
                                <p><strong>Tên khách hàng:</strong> {consignmentDetail.Customer_Name || "Không có"}</p>
                                <p><strong>Email khách hàng:</strong> {consignmentDetail.Customer_Email || "Không có"}</p>

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
