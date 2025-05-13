import React, { useEffect, useRef, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthDetail } from "../context/AuthDetail";
import { ConsignContext, ConsignProvider } from "../context/AuthConsign";
import "bootstrap/dist/css/bootstrap.min.css";
import Navbar from "./MenuUser";

const ConsignmentDetailPage = () => {
    const { id } = useParams();
    const prevIdRef = useRef(null);
    const { consignmentDetail, fetchConsignmentDetail, deleteConsignment, updateConsignment, loading, error } = useAuthDetail(); 
    const [isEditMode, setIsEditMode] = useState(false);
    const [updatedConsignmentDetail, setUpdatedConsignmentDetail] = useState({});
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [modalContent, setModalContent] = useState({});
    const [isUpdating, setIsUpdating] = useState(false);
    const navigate = useNavigate();
    const { deleteProductInConsignment } = useContext(ConsignContext);
    const brandOptions = ["Nike", "Adidas", "Reebok", "Puma","Under Armour"];
    const typeOptions = ["Shoes", "Clothing", "Accessories", "Bags","Sports Equipment"];
    
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

    const showModal = (title, message, isConfirm = false, onConfirm = null) => {
        setModalContent({
            title,
            message,
            onConfirm
        });
        isConfirm ? setShowConfirmModal(true) : setShowSuccessModal(true);
    };

    const shouldShowConsignmentPrice = () => {
        return consignmentDetail?.Consignment_Status?.toLowerCase() === "approved";
    };

   const handleUpdate = async () => {
    // Validate all products before updating
        for (const product of updatedConsignmentDetail.Products) {
            const updatedData = {
                Product_name: (product.Product_Name || "").trim(),
                Brand_name: (product.Brand_Name || "").trim(), // Sửa thành Brand_Name
                Product_Type_Name: (product.Product_Type_Name || "").trim(),
                Original_price: Number(product.Original_Price),
                Sale_price: Number(product.Sale_Price),
                Quantity: Number(product.Quantity),
                Image: product.Product_Image || "../Images/default.png"
            };

            console.log("Product update data:", updatedData); // Thêm log này

            // Validate required fields
            if (!updatedData.Product_name) {
                showModal("Lỗi", `Tên sản phẩm không được để trống`);
                return;
            }
            if (!updatedData.Brand_name) {
                showModal("Lỗi", `Vui lòng chọn thương hiệu cho sản phẩm "${updatedData.Product_name}"`);
                return;
            }
            if (!updatedData.Product_Type_Name) {
                showModal("Lỗi", `Vui lòng chọn loại sản phẩm cho "${updatedData.Product_name}"`);
                return;
            }
            if (isNaN(updatedData.Original_price)) {
                showModal("Lỗi", `Giá gốc không hợp lệ cho "${updatedData.Product_name}" (Brand: ${updatedData.Brand_name}, Type: ${updatedData.Product_Type_Name})`);
                return;
            }
            if (isNaN(updatedData.Sale_price)) {
                showModal("Lỗi", `Giá bán không hợp lệ cho "${updatedData.Product_name}" (Brand: ${updatedData.Brand_name}, Type: ${updatedData.Product_Type_Name})`);
                return;
            }
            if (isNaN(updatedData.Quantity)) {
                showModal("Lỗi", `Số lượng không hợp lệ cho "${updatedData.Product_name}" (Brand: ${updatedData.Brand_name}, Type: ${updatedData.Product_Type_Name})`);
                return;
            }
        }

        showModal(
            "Xác nhận",
            "Bạn chắc chắn muốn cập nhật tất cả sản phẩm?",
            true,
            async () => {
                setIsUpdating(true);
                try {
                    // Update all products
                    const updatePromises = updatedConsignmentDetail.Products.map(product => {
                        const updatedData = {
                            Product_name: (product.Product_Name || "").trim(),
                            Brand_name: (product.Brand_Name || "").trim(),
                            Product_Type_Name: (product.Product_Type_Name || "").trim(),
                            Original_price: Number(product.Original_Price),
                            Sale_price: Number(product.Sale_Price),
                            Quantity: Number(product.Quantity),
                            Image: product.Product_Image || "../Images/default.png"
                        };
                        
                        console.log("Updating product with data:", updatedData);
                        return updateConsignment(
                            consignmentDetail.Consignment_ID,
                            product.Product_ID,
                            updatedData
                        );
                    });

                    const results = await Promise.all(updatePromises);
                    
                    // Check if all updates were successful
                    const allSuccess = results.every(result => result && result.success);
                    
                    if (allSuccess) {
                        showModal("Thành công", "Cập nhật tất cả sản phẩm thành công!");
                        await fetchConsignmentDetail(id);
                        setIsEditMode(false);
                    } else {
                        const errorMessages = results
                            .filter(result => !result.success)
                            .map(result => result.message)
                            .join("\n");
                        
                        showModal("Lỗi", errorMessages || "Cập nhật một số sản phẩm thất bại");
                    }
                } catch (error) {
                    console.error("Update error:", error);
                    showModal(
                        "Lỗi", 
                        error.response?.data?.error || 
                        error.message || 
                        "Có lỗi xảy ra khi cập nhật sản phẩm"
                    );
                } finally {
                    setIsUpdating(false);
                }
            }
        );
    };

    const handleDelete = async () => {
        showModal(
            "Xác nhận xóa",
            "Bạn có chắc chắn muốn xóa đơn ký gửi này?",
            true,
            async () => {
                try {
                    const result = await deleteConsignment(consignmentDetail.Consignment_ID);
                    if (result) {
                        navigate("/consigns");
                    }
                } catch (err) {
                    showModal("Lỗi", err.message || "Xóa đơn ký gửi không thành công");
                }
            }
        );
    };

    const handleDeleteProduct = async (productId) => {
        if (!consignmentDetail?.Consignment_ID || !productId) {
            showModal("Lỗi", "Thiếu thông tin đơn ký gửi hoặc sản phẩm");
            return;
        }

        const isLastProduct = consignmentDetail.Products?.length === 1;
        const message = isLastProduct
            ? "Đây là sản phẩm cuối cùng. Xóa nó sẽ xóa luôn đơn ký gửi. Bạn có chắc chắn?"
            : "Bạn có chắc chắn muốn xóa sản phẩm này khỏi đơn ký gửi?";

        showModal(
            "Xác nhận xóa",
            message,
            true,
            async () => {
                try {
                    const result = await deleteProductInConsignment(
                        consignmentDetail.Consignment_ID,
                        productId
                    );

                    if (!result) {
                        throw new Error("Không nhận được phản hồi từ server");
                    }

                    if (result.success) {
                        if (result.ticketDeleted) {
                            showModal("Thành công", "Đơn ký gửi đã được xóa do không còn sản phẩm!");
                            navigate("/consigns");
                        } else {
                            showModal("Thành công", "Xóa sản phẩm thành công!");
                            await fetchConsignmentDetail(id);
                        }
                    } else {
                        showModal("Lỗi", result.message || "Xóa sản phẩm không thành công");
                    }
                } catch (err) {
                    showModal("Lỗi", err.message || "Lỗi khi xóa sản phẩm");
                }
            }
        );
    };

    const handleProductChange = (index, field, value) => {
        const updatedProducts = [...updatedConsignmentDetail.Products];
        // Đổi tên trường cho phù hợp
        const apiFieldName = field === "Brand_Name" ? "Brand_name" : 
                            field === "Product_Type_Name" ? "Product_Type_Name" : field;
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
    if (!consignmentDetail) return <div className="text-center">Không tìm thấy thông tin đơn ký gửi</div>;

    return (
        <ConsignProvider>
            <div className="bg-amber-50 min-vh-100">
                <Navbar />
                <div className="container py-5">
                    <div className="card border-0 shadow-sm rounded-lg overflow-hidden mb-4" style={{ borderColor: '#e5e7eb' }}>
                        <div className="card-header py-3" style={{ backgroundColor: '#d4a762', borderBottom: '1px solid #e5e7eb' }}>
                            <h3 className="text-center mb-0 text-white">
                                <i className="bi bi-box-seam me-2"></i>
                                Chi tiết đơn ký gửi
                            </h3>
                        </div>
                        <div className="card-body p-4" style={{ backgroundColor: '#f9fafb' }}>
                            <h4 className="mb-4" style={{ color: '#78350f' }}>Thông tin đơn ký gửi</h4>
                            <div className="row">
                                <div className="col-md-6">
                                    <p><strong>Mã đơn:</strong> {consignmentDetail.Consignment_ID}</p>
                                    <p><strong>Ngày tạo:</strong> {new Date(consignmentDetail.Consignment_Create_Date).toLocaleDateString()}</p>
                                </div>
                                <div className="col-md-6">
                                    <p><strong>Tên khách hàng:</strong> {consignmentDetail.Customer_Name}</p>
                                    <p><strong>Email:</strong> {consignmentDetail.Customer_Email}</p>
                                </div>
                            </div>
                            <p className="mt-3">
                                <strong>Trạng thái:</strong>{" "}
                                <span className={getStatusColorClass(consignmentDetail.Consignment_Status)}>
                                    {consignmentDetail.Consignment_Status}
                                </span>
                            </p>
                        </div>
                    </div>

                    <div className="card border-0 shadow-sm rounded-lg overflow-hidden">
                        <div className="card-header py-3" style={{ backgroundColor: '#d4a762', borderBottom: '1px solid #e5e7eb' }}>
                            <h4 className="mb-0 text-white">Danh sách sản phẩm</h4>
                        </div>
                        <div className="card-body p-4" style={{ backgroundColor: '#f9fafb' }}>
                            {isEditMode ? (
                                <div>
                                    <div className="table-responsive">
                                        <table className="table table-hover align-middle">
                                            <thead style={{ backgroundColor: '#ecfdf5' }}>
                                                <tr>
                                                    <th style={{ color: '#065f46' }}>Ảnh</th>
                                                    <th style={{ color: '#065f46' }}>Tên sản phẩm</th>
                                                    <th style={{ color: '#065f46' }}>Thương hiệu</th>
                                                    <th style={{ color: '#065f46' }}>Loại</th>
                                                    <th style={{ color: '#065f46' }}>Giá gốc</th>
                                                    {shouldShowConsignmentPrice() && (
                                                        <th style={{ color: '#065f46' }}>Giá ký gửi</th>
                                                    )}
                                                    <th style={{ color: '#065f46' }}>Giá bán</th>
                                                    <th style={{ color: '#065f46' }}>Số lượng</th>
                                                    <th style={{ color: '#065f46' }}>Thao tác</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {updatedConsignmentDetail.Products?.map((product, index) => (
                                                    <tr key={index} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                                        <td>
                                                            {product.Product_Image && (
                                                                <img 
                                                                    src={product.Product_Image} 
                                                                    alt={product.Product_Name} 
                                                                    style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                                                                />
                                                            )}
                                                        </td>
                                                        <td>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                value={product.Product_Name || ""}
                                                                onChange={(e) => handleProductChange(index, "Product_Name", e.target.value)}
                                                            />
                                                        </td>
                                                        <td>
                                                            <select
                                                                className="form-control"
                                                                value={product.Brand_Name || ""}
                                                                onChange={(e) => handleProductChange(index, "Brand_Name", e.target.value)}
                                                            >
                                                                <option value="">Chọn thương hiệu</option>
                                                                {brandOptions.map((brand) => (
                                                                    <option key={brand} value={brand}>{brand}</option>
                                                                ))}
                                                            </select>
                                                        </td>
                                                        <td>
                                                            <select
                                                                className="form-control"
                                                                value={product.Product_Type_Name || ""}
                                                                onChange={(e) => handleProductChange(index, "Product_Type_Name", e.target.value)}
                                                            >
                                                                <option value="">Chọn loại</option>
                                                                {typeOptions.map((type) => (
                                                                    <option key={type} value={type}>{type}</option>
                                                                ))}
                                                            </select>
                                                        </td>
                                                        <td>
                                                            <input
                                                                type="number"
                                                                className="form-control"
                                                                value={product.Original_Price || ""}
                                                                onChange={(e) => handleProductChange(index, "Original_Price", e.target.value)}
                                                                min="1"
                                                            />
                                                        </td>
                                                        {shouldShowConsignmentPrice() && (
                                                            <td>
                                                                <input
                                                                    type="number"
                                                                    className="form-control"
                                                                    value={product.Consignment_Price || ""}
                                                                    onChange={(e) => handleProductChange(index, "Consignment_Price", e.target.value)}
                                                                    min="1"
                                                                />
                                                            </td>
                                                        )}
                                                        <td>
                                                            <input
                                                                type="number"
                                                                className="form-control"
                                                                value={product.Sale_Price || ""}
                                                                onChange={(e) => handleProductChange(index, "Sale_Price", e.target.value)}
                                                                min="1"
                                                            />
                                                        </td>
                                                        <td>
                                                            <input
                                                                type="number"
                                                                className="form-control"
                                                                value={product.Quantity || ""}
                                                                onChange={(e) => handleProductChange(index, "Quantity", e.target.value)}
                                                                min="1"
                                                            />
                                                        </td>
                                                        <td>
                                                            <button
                                                                className="btn btn-sm px-3 py-1"
                                                                onClick={() => handleDeleteProduct(product.Product_ID)}
                                                                style={{
                                                                    backgroundColor: '#fee2e2',
                                                                    borderColor: '#fca5a5',
                                                                    color: '#b91c1c'
                                                                }}
                                                            >
                                                                <i className="bi bi-trash me-1"></i>
                                                                Xóa
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="d-flex justify-content-end mt-3">
                                        <button
                                            onClick={() => setIsEditMode(false)}
                                            className="btn px-4 py-2 me-2"
                                            style={{
                                                backgroundColor: '#e5e7eb',
                                                borderColor: '#d1d5db',
                                                color: '#4b5563'
                                            }}
                                        >
                                            Hủy
                                        </button>
                                        <button 
                                            className="btn px-4 py-2"
                                            disabled={isUpdating}
                                            style={{
                                                backgroundColor: '#d4a762',
                                                borderColor: '#b88c4a',
                                                color: '#ffffff'
                                            }}
                                            onClick={handleUpdate}>
                                            {isUpdating ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                                    Đang lưu...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="bi bi-save me-2"></i>
                                                    Lưu thay đổi
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <div className="table-responsive">
                                        <table className="table table-hover align-middle">
                                            <thead style={{ backgroundColor: '#ecfdf5' }}>
                                                <tr>
                                                    <th style={{ color: '#065f46' }}>Ảnh</th>
                                                    <th style={{ color: '#065f46' }}>Tên sản phẩm</th>
                                                    <th style={{ color: '#065f46' }}>Thương hiệu</th>
                                                    <th style={{ color: '#065f46' }}>Loại</th>
                                                    <th className="text-end" style={{ color: '#065f46' }}>Giá gốc</th>
                                                    {shouldShowConsignmentPrice() && (
                                                        <th className="text-end" style={{ color: '#065f46' }}>Giá ký gửi</th>
                                                    )}
                                                    <th className="text-end" style={{ color: '#065f46' }}>Giá bán</th>
                                                    <th className="text-end" style={{ color: '#065f46' }}>Số lượng</th>
                                                    <th style={{ color: '#065f46' }}>Trạng thái</th>
                                                    <th style={{ color: '#065f46' }}>Thao tác</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {consignmentDetail.Products?.map((product, index) => (
                                                    <tr key={index} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                                        <td>
                                                            {product.Product_Image && (
                                                                <img 
                                                                    src={product.Product_Image} 
                                                                    alt={product.Product_Name} 
                                                                    style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                                                                />
                                                            )}
                                                        </td>
                                                        <td className="fw-medium">{product.Product_Name}</td>
                                                        <td>{product.Brand_Name}</td>
                                                        <td>{product.Product_Type_Name}</td>
                                                        <td className="text-end">{product.Original_Price ? `${product.Original_Price.toLocaleString()} VND` : "-"}</td>
                                                        {shouldShowConsignmentPrice() && (
                                                            <td className="text-end">{product.Consignment_Price ? `${product.Consignment_Price.toLocaleString()} VND` : "-"}</td>
                                                        )}
                                                        <td className="text-end">{product.Sale_Price ? `${product.Sale_Price.toLocaleString()} VND` : "-"}</td>
                                                        <td className="text-end">{product.Quantity}</td>
                                                        <td>
                                                            <span className={getStatusColorClass(product.Product_Status)}>
                                                                {product.Product_Status}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <button
                                                                className="btn btn-sm px-3 py-1 me-2"
                                                                onClick={() => setIsEditMode(true)}
                                                                style={{
                                                                    backgroundColor: '#dbeafe',
                                                                    borderColor: '#93c5fd',
                                                                    color: '#1e40af'
                                                                }}
                                                            >
                                                                <i className="bi bi-pencil me-1"></i>
                                                                Sửa
                                                            </button>
                                                            <button
                                                                className="btn btn-sm px-3 py-1"
                                                                onClick={() => handleDeleteProduct(product.Product_ID)}
                                                                style={{
                                                                    backgroundColor: '#fee2e2',
                                                                    borderColor: '#fca5a5',
                                                                    color: '#b91c1c'
                                                                }}
                                                            >
                                                                <i className="bi bi-trash me-1"></i>
                                                                Xóa
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="d-flex justify-content-end mt-3">
                                        <button
                                            onClick={handleDelete}
                                            className="btn px-4 py-2"
                                            style={{
                                                backgroundColor: '#fee2e2',
                                                borderColor: '#fca5a5',
                                                color: '#b91c1c'
                                            }}
                                        >
                                            <i className="bi bi-trash me-2"></i>
                                            Xóa đơn ký gửi
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Success Modal */}
                {showSuccessModal && (
                    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content border-0 shadow" style={{ 
                                backgroundColor: '#fefce8',
                                borderColor: '#d4a762'
                            }}>
                                <div className="modal-header border-0" style={{ backgroundColor: '#d4a762' }}>
                                    <h5 className="modal-title text-white">
                                        <i className="bi bi-check-circle-fill me-2"></i>
                                        {modalContent.title}
                                    </h5>
                                    <button 
                                        type="button" 
                                        className="btn-close btn-close-white" 
                                        onClick={() => setShowSuccessModal(false)}
                                    ></button>
                                </div>
                                <div className="modal-body py-4">
                                    <div className="d-flex align-items-center">
                                        <i className="bi bi-check-circle-fill text-success fs-3 me-3"></i>
                                        <p className="mb-0 text-amber-900">{modalContent.message}</p>
                                    </div>
                                </div>
                                <div className="modal-footer border-0">
                                    <button
                                        type="button"
                                        className="btn px-4 py-2"
                                        onClick={() => setShowSuccessModal(false)}
                                        style={{
                                            backgroundColor: '#d4a762',
                                            borderColor: '#b88c4a',
                                            color: '#ffffff'
                                        }}
                                    >
                                        Đóng
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Confirm Modal */}
                {showConfirmModal && (
                    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content border-0 shadow" style={{ 
                                backgroundColor: '#fefce8',
                                borderColor: '#d4a762'
                            }}>
                                <div className="modal-header border-0" style={{ backgroundColor: '#d4a762' }}>
                                    <h5 className="modal-title text-white">
                                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                        {modalContent.title}
                                    </h5>
                                    <button 
                                        type="button" 
                                        className="btn-close btn-close-white" 
                                        onClick={() => setShowConfirmModal(false)}
                                    ></button>
                                </div>
                                <div className="modal-body py-4">
                                    <div className="d-flex align-items-center">
                                        <i className="bi bi-question-circle-fill text-warning fs-3 me-3"></i>
                                        <p className="mb-0 text-amber-900">{modalContent.message}</p>
                                    </div>
                                </div>
                                <div className="modal-footer border-0">
                                    <button
                                        type="button"
                                        className="btn px-4 py-2 me-2"
                                        onClick={() => setShowConfirmModal(false)}
                                        style={{
                                            backgroundColor: '#e5e7eb',
                                            borderColor: '#d1d5db',
                                            color: '#4b5563'
                                        }}
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        type="button"
                                        className="btn px-4 py-2"
                                        onClick={() => {
                                            modalContent.onConfirm();
                                            setShowConfirmModal(false);
                                        }}
                                        style={{
                                            backgroundColor: '#d4a762',
                                            borderColor: '#b88c4a',
                                            color: '#ffffff'
                                        }}
                                    >
                                        Xác nhận
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ConsignProvider>
    );
};

export default ConsignmentDetailPage;