import React, { useEffect, useRef, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthDetail } from "../context/AuthDetail";
import { ConsignContext, ConsignProvider } from "../context/AuthConsign";
import "bootstrap/dist/css/bootstrap.min.css";
import Navbar from "./MenuUser";

const ConsignmentDetailPage = () => {
    const { id } = useParams();
    const prevIdRef = useRef(null);
    const { consignmentDetail, fetchConsignmentDetail, loading, error } = useAuthDetail();
    const [isEditMode, setIsEditMode] = useState(false);
    const [updatedConsignmentDetail, setUpdatedConsignmentDetail] = useState({});
    const navigate = useNavigate();
    const { deleteProductInConsignment } = useContext(ConsignContext);
    console.log("Delete function exists:", typeof deleteProductInConsignment === 'function');

    useEffect(() => {
        if (id !== prevIdRef.current) {
            fetchConsignmentDetail(id);
            prevIdRef.current = id;
        }
    }, [id, fetchConsignmentDetail]);

    useEffect(() => {
        if (consignmentDetail) {
            setUpdatedConsignmentDetail({ ...consignmentDetail });
        }
    }, [consignmentDetail]);

    const handleUpdate = () => {
        console.log("Cập nhật chi tiết đơn ký gửi:", updatedConsignmentDetail);
        setIsEditMode(false);
    };

    const handleDelete = () => {
        const confirmDelete = window.confirm("Bạn có chắc chắn muốn xóa đơn ký gửi này?");
        if (confirmDelete) {
            console.log("Xóa đơn ký gửi với ID:", consignmentDetail.Consignment_ID);
            navigate("/consigns");
        }
    };

   
    const handleDeleteProduct = async (productId) => {
        if (!consignmentDetail?.Consignment_ID || !productId) {
            alert("Thiếu thông tin đơn ký gửi hoặc sản phẩm");
            return;
        }

        const isLastProduct = consignmentDetail.Products?.length === 1;

        const confirmMessage = isLastProduct
            ? "Sản phẩm này là sản phẩm cuối cùng. Nếu bạn xóa, đơn ký gửi sẽ bị xóa hoàn toàn. Bạn có chắc chắn muốn tiếp tục?"
            : "Bạn có chắc chắn muốn xóa sản phẩm này khỏi đơn?";

        const confirmDelete = window.confirm(confirmMessage);

        if (!confirmDelete) return;

        try {
            const result = await deleteProductInConsignment(
                consignmentDetail.Consignment_ID,
                productId
            );

            if (!result) {
                throw new Error("Không nhận được phản hồi từ server");
            }

            console.log("Kết quả xóa:", result);

            if (result.success) {
                if (result.ticketDeleted) {
                    alert("Đơn ký gửi đã bị xóa do không còn sản phẩm!");
                    navigate("/consigns");
                } else {
                    alert("Xóa sản phẩm thành công!");
                    await fetchConsignmentDetail(id);
                }
            } else {
                alert(result.message || "Xóa sản phẩm không thành công");
            }
        } catch (err) {
            console.error("Lỗi chi tiết:", err);
            alert(err.message || "Lỗi khi xóa sản phẩm");
        }
    };

    const handleProductChange = (index, field, value) => {
        const updatedProducts = [...updatedConsignmentDetail.Products];
        updatedProducts[index][field] = value;
        setUpdatedConsignmentDetail({
            ...updatedConsignmentDetail,
            Products: updatedProducts
        });
    };

    const getStatusColorClass = (status) => {
        switch (status.toLowerCase()) {
            case "pending":
                return "badge bg-warning text-dark";
            case "approved":
                return "badge bg-success";
            case "rejected":
                return "badge bg-danger";
            default:
                return "badge bg-secondary";
        }
    };

    if (loading) return <div className="text-center">Đang tải...</div>;
    if (error) return <div className="text-center text-danger">{error}</div>;
    if (!consignmentDetail) return <div className="text-center">Không có chi tiết đơn ký gửi</div>;

    return (
        <ConsignProvider>
        <div>
            <Navbar />
            <div className="container mt-5">
                <h2 className="text-center text-primary">Chi Tiết Đơn Ký Gửi</h2>

                <div className="card mb-4">
                    <div className="card-body">
                        <h4>Thông tin đơn ký gửi</h4>
                        <p><strong>Mã đơn:</strong> {consignmentDetail.Consignment_ID}</p>
                        <p><strong>Ngày tạo đơn:</strong> {new Date(consignmentDetail.Consignment_Create_Date).toLocaleDateString()}</p>
                        <p><strong>Tên khách hàng:</strong> {consignmentDetail.Customer_Name}</p>
                        <p><strong>Email khách hàng:</strong> {consignmentDetail.Customer_Email}</p>
                        <p>
                            <strong>Tình trạng đơn:</strong>{" "}
                            <span className={getStatusColorClass(consignmentDetail.Consignment_Status)}>
                                {consignmentDetail.Consignment_Status}
                            </span>
                        </p>
                    </div>
                </div>

                <div className="card">
                    <div className="card-body">
                        <h4>Danh sách sản phẩm trong đơn</h4>

                        {isEditMode ? (
                            <div>
                                <table className="table table-bordered">
                                    <thead>
                                        <tr>
                                            <th>Tên sản phẩm</th>
                                            <th>Thương hiệu</th>
                                            <th>Loại sản phẩm</th>
                                            <th>Giá góc</th>
                                            <th>Giá ký gửi</th>
                                            <th>Số lượng</th>
                                            <th>Tình trạng sản phẩm</th>
                                            <th>Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {updatedConsignmentDetail.Products?.map((product, index) => (
                                            <tr key={index}>
                                                <td>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        value={product.Product_Name || ""}
                                                        onChange={(e) => handleProductChange(index, "Product_Name", e.target.value)}
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        value={product.Brand_Name || ""}
                                                        onChange={(e) => handleProductChange(index, "Brand_Name", e.target.value)}
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        value={product.Product_Type_Name || ""}
                                                        onChange={(e) => handleProductChange(index, "Product_Type_Name", e.target.value)}
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        type="number"
                                                        className="form-control"
                                                        value={product.Original_Price || ""}
                                                        onChange={(e) => handleProductChange(index, "Original_Price", e.target.value)}
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        type="number"
                                                        className="form-control"
                                                        value={product.Consignment_Price || ""}
                                                        onChange={(e) => handleProductChange(index, "Consignment_Price", e.target.value)}
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        type="number"
                                                        className="form-control"
                                                        value={product.Quantity || ""}
                                                        onChange={(e) => handleProductChange(index, "Quantity", e.target.value)}
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        value={product.Product_Status || ""}
                                                        onChange={(e) => handleProductChange(index, "Product_Status", e.target.value)}
                                                    />
                                                </td>
                                                <td>
                                                    <button
                                                        className="btn btn-sm btn-danger"
                                                        onClick={() => handleDeleteProduct(product.Product_ID)}
                                                    >
                                                        Xóa
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <button onClick={handleUpdate} className="btn btn-primary">Cập nhật</button>
                                <button onClick={() => setIsEditMode(false)} className="btn btn-secondary ml-2">Hủy</button>
                            </div>
                        ) : (
                            <div>
                                <table className="table table-bordered">
                                    <thead>
                                        <tr>
                                            <th>Tên sản phẩm</th>
                                            <th>Thương hiệu</th>
                                            <th>Loại sản phẩm</th>
                                            <th>Giá góc</th>
                                            <th>Giá ký gửi</th>
                                            <th>Số lượng</th>
                                            <th>Tình trạng sản phẩm</th>
                                            <th>Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {consignmentDetail.Products?.map((product, index) => (
                                            <tr key={index}>
                                                <td>{product.Product_Name}</td>
                                                <td>{product.Brand_Name}</td>
                                                <td>{product.Product_Type_Name}</td>
                                                <td>{product.Original_Price ? `${product.Original_Price} VNĐ` : "Không có"}</td>
                                                <td>{product.Consignment_Price ? `${product.Consignment_Price} VNĐ` : "Không có"}</td>
                                                <td>{product.Quantity || "Không có"}</td>
                                                <td>{product.Product_Status || "Không có"}</td>
                                                <td>
                                                    <button
                                                        className="btn btn-sm btn-danger"
                                                        onClick={() => handleDeleteProduct(product.Product_ID)}
                                                    >
                                                        Xóa
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <button onClick={() => setIsEditMode(true)} className="btn btn-warning mr-2">Chỉnh sửa đơn</button>
                                <button onClick={handleDelete} className="btn btn-danger">Xóa đơn</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div></ConsignProvider>
    );
};

export default ConsignmentDetailPage;
