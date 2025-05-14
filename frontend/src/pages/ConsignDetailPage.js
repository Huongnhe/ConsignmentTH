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
            // Chuyển đổi dữ liệu từ Product_Image sang Image nếu cần
            const convertedData = {
                ...consignmentDetail,
                Products: consignmentDetail.Products?.map(product => ({
                    ...product,
                    Image: product.Product_Image || product.Image || '' // Giữ lại cả 2 trường để tương thích
                }))
            };
            setUpdatedConsignmentDetail(convertedData);
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

   const handleImageChange = (index, file) => {
        const updatedProducts = [...updatedConsignmentDetail.Products];
        if (file) {
            updatedProducts[index].Image = file.name;
            updatedProducts[index].ImageFile = file;
            updatedProducts[index].Product_Image = file.name; 
        } else {
            // Thay đổi ở đây: set thành null thay vì chuỗi rỗng
            updatedProducts[index].Image = null;
            updatedProducts[index].ImageFile = null;
            updatedProducts[index].Product_Image = null;
        }
        setUpdatedConsignmentDetail({
            ...updatedConsignmentDetail,
            Products: updatedProducts
        });
    };

    const handleUpdate = async () => {
        for (const product of updatedConsignmentDetail.Products) {
            const updatedData = {
                Product_name: (product.Product_Name || "").trim(),
                Brand_name: (product.Brand_Name || "").trim(),
                Product_Type_Name: (product.Product_Type_Name || "").trim(),
                Original_price: Number(product.Original_Price),
                Sale_price: Number(product.Sale_Price),
                Quantity: Number(product.Quantity),
                Product_Image: product.Product_Image || null
            };

            if (!updatedData.Product_name) {
                showModal("Error", `Product name cannot be empty`);
                return;
            }
            if (!updatedData.Brand_name) {
                showModal("Error", `Please select brand for product "${updatedData.Product_name}"`);
                return;
            }
            if (!updatedData.Product_Type_Name) {
                showModal("Error", `Please select product type for "${updatedData.Product_name}"`);
                return;
            }
            if (isNaN(updatedData.Original_price) || updatedData.Original_price <= 0) {
                showModal("Error", `Invalid original price for "${updatedData.Product_name}"`);
                return;
            }
            if (isNaN(updatedData.Sale_price) || updatedData.Sale_price <= 0) {
                showModal("Error", `Invalid sale price for "${updatedData.Product_name}"`);
                return;
            }
            if (updatedData.Sale_price <= updatedData.Original_price) {
                showModal("Error", `Sale price must be higher than original price for "${updatedData.Product_name}"`);
                return;
            }
            if (isNaN(updatedData.Quantity) || updatedData.Quantity <= 0) {
                showModal("Error", `Invalid quantity for "${updatedData.Product_name}"`);
                return;
            }
        }

        showModal(
            "Confirmation",
            "Are you sure you want to update all products?",
            true,
            async () => {
                setIsUpdating(true);
                try {
                    const updatePromises = updatedConsignmentDetail.Products.map(product => {
                        const updatedData = {
                            Product_name: (product.Product_Name || "").trim(),
                            Brand_name: (product.Brand_Name || "").trim(),
                            Product_Type_Name: (product.Product_Type_Name || "").trim(),
                            Original_price: Number(product.Original_Price),
                            Sale_price: Number(product.Sale_Price),
                            Quantity: Number(product.Quantity),
                            Product_Image: product.Product_Image || product.Image || '' // Chỉ lấy tên file
                        };

                        return updateConsignment(
                            consignmentDetail.Consignment_ID,
                            product.Product_ID,
                            updatedData
                        );
                    });

                    const results = await Promise.all(updatePromises);
                    const allSuccess = results.every(result => result && result.success);
                    
                    if (allSuccess) {
                        showModal("Success", "All products updated successfully!");
                        await fetchConsignmentDetail(id);
                        setIsEditMode(false);
                    } else {
                        const errorMessages = results
                            .filter(result => !result.success)
                            .map(result => result.message)
                            .join("\n");
                        showModal("Error", errorMessages || "Failed to update some products");
                    }
                } catch (error) {
                    console.error("Update error:", error);
                    showModal(
                        "Error", 
                        error.response?.data?.error || 
                        error.message || 
                        "An error occurred while updating products"
                    );
                } finally {
                    setIsUpdating(false);
                }
            }
        );
    };
    const handleDelete = async () => {
        showModal(
            "Confirm Delete",
            "Are you sure you want to delete this consignment?",
            true,
            async () => {
                try {
                    const result = await deleteConsignment(consignmentDetail.Consignment_ID);
                    if (result) {
                        navigate("/consigns");
                    }
                } catch (err) {
                    showModal("Error", err.message || "Failed to delete consignment");
                }
            }
        );
    };

    const handleDeleteProduct = async (productId) => {
        if (!consignmentDetail?.Consignment_ID || !productId) {
            showModal("Error", "Missing consignment or product information");
            return;
        }

        const isLastProduct = consignmentDetail.Products?.length === 1;
        const message = isLastProduct
            ? "This is the last product. Deleting it will also delete the consignment. Are you sure?"
            : "Are you sure you want to delete this product from the consignment?";

        showModal(
            "Confirm Delete",
            message,
            true,
            async () => {
                try {
                    const result = await deleteProductInConsignment(
                        consignmentDetail.Consignment_ID,
                        productId
                    );

                    if (!result) {
                        throw new Error("No response from server");
                    }

                    if (result.success) {
                        if (result.ticketDeleted) {
                            showModal("Success", "Consignment has been deleted as it contains no products!");
                            navigate("/consigns");
                        } else {
                            showModal("Success", "Product deleted successfully!");
                            await fetchConsignmentDetail(id);
                        }
                    } else {
                        showModal("Error", result.message || "Failed to delete product");
                    }
                } catch (err) {
                    showModal("Error", err.message || "Error deleting product");
                }
            }
        );
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

    if (loading) return <div className="text-center">Loading...</div>;
    if (error) return <div className="text-center text-danger">{error}</div>;
    if (!consignmentDetail) return <div className="text-center">Consignment not found</div>;

    return (
        <ConsignProvider>
            <div className="bg-amber-50 min-vh-100">
                <Navbar />
                <div className="container py-5">
                    <div className="card border-0 shadow-sm rounded-lg overflow-hidden mb-4" style={{ borderColor: '#e5e7eb' }}>
                        <div className="card-header py-3" style={{ backgroundColor: '#d4a762', borderBottom: '1px solid #e5e7eb' }}>
                            <h3 className="text-center mb-0 text-white">
                                <i className="bi bi-box-seam me-2"></i>
                                Consignment Details
                            </h3>
                        </div>
                        <div className="card-body p-4" style={{ backgroundColor: '#f9fafb' }}>
                            <h4 className="mb-4" style={{ color: '#78350f' }}>Consignment Information</h4>
                            <div className="row">
                                <div className="col-md-6">
                                    <p><strong>Consignment ID:</strong> {consignmentDetail.Consignment_ID}</p>
                                    <p><strong>Created Date:</strong> {new Date(consignmentDetail.Consignment_Create_Date).toLocaleDateString()}</p>
                                </div>
                                <div className="col-md-6">
                                    <p><strong>Customer Name:</strong> {consignmentDetail.Customer_Name}</p>
                                    <p><strong>Email:</strong> {consignmentDetail.Customer_Email}</p>
                                </div>
                            </div>
                            <p className="mt-3">
                                <strong>Status:</strong>{" "}
                                <span className={getStatusColorClass(consignmentDetail.Consignment_Status)}>
                                    {consignmentDetail.Consignment_Status}
                                </span>
                            </p>
                        </div>
                    </div>

                    <div className="card border-0 shadow-sm rounded-lg overflow-hidden">
                        <div className="card-header py-3" style={{ backgroundColor: '#d4a762', borderBottom: '1px solid #e5e7eb' }}>
                            <h4 className="mb-0 text-white">Product List</h4>
                        </div>
                        <div className="card-body p-4" style={{ backgroundColor: '#f9fafb' }}>
                            {isEditMode ? (
                                <div>
                                    <div className="table-responsive">
                                        <table className="table table-hover align-middle">
                                            <thead style={{ backgroundColor: '#ecfdf5' }}>
                                                <tr>
                                                    <th style={{ color: '#065f46' }}>Image</th>
                                                    <th style={{ color: '#065f46' }}>Product Name</th>
                                                    <th style={{ color: '#065f46' }}>Brand</th>
                                                    <th style={{ color: '#065f46' }}>Type</th>
                                                    <th style={{ color: '#065f46' }}>Original Price</th>
                                                    <th style={{ color: '#065f46' }}>Sale Price</th>
                                                    <th style={{ color: '#065f46' }}>Quantity</th>
                                                    <th style={{ color: '#065f46' }}>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {updatedConsignmentDetail.Products?.map((product, index) => (
                                                    <tr key={index} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                                        <td>
                                                            <div className="d-flex flex-column align-items-center">
                                                                {(product.Image || product.Product_Image) && (
                                                                    <img 
                                                                        src={`../Images/${product.Image || product.Product_Image}`} 
                                                                        alt={product.Product_Name} 
                                                                        style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                                                                    />
                                                                )}
                                                                <input
                                                                    type="file"
                                                                    id={`image-upload-${index}`}
                                                                    className="d-none"
                                                                    accept="image/*"
                                                                    onChange={(e) => handleImageChange(index, e.target.files[0])}
                                                                />
                                                                <label 
                                                                    htmlFor={`image-upload-${index}`}
                                                                    className="btn btn-sm btn-outline-secondary"
                                                                    style={{ fontSize: '0.75rem' }}
                                                                >
                                                                    <i className="bi bi-upload me-1"></i>
                                                                    {product.Product_Image || product.ImageFile ? 'Change' : 'Upload'}
                                                                </label>
                                                                {(product.Product_Image || product.ImageFile) && (
                                                                    <button 
                                                                        className="btn btn-sm btn-outline-danger mt-1"
                                                                        style={{ fontSize: '0.75rem' }}
                                                                        onClick={() => handleImageChange(index, null)}
                                                                    >
                                                                        <i className="bi bi-trash me-1"></i>
                                                                        Remove
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                value={product.Product_Name || ""}
                                                                onChange={(e) => handleProductChange(index, "Product_Name", e.target.value)}
                                                                required
                                                            />
                                                        </td>
                                                        <td>
                                                            <select
                                                                className="form-control"
                                                                value={product.Brand_Name || ""}
                                                                onChange={(e) => handleProductChange(index, "Brand_Name", e.target.value)}
                                                                required
                                                            >
                                                                <option value="">Select Brand</option>
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
                                                                required
                                                            >
                                                                <option value="">Select Type</option>
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
                                                                required
                                                            />
                                                        </td>
                                                        <td>
                                                            <input
                                                                type="number"
                                                                className="form-control"
                                                                value={product.Sale_Price || ""}
                                                                onChange={(e) => handleProductChange(index, "Sale_Price", e.target.value)}
                                                                min="1"
                                                                required
                                                            />
                                                        </td>
                                                        <td>
                                                            <input
                                                                type="number"
                                                                className="form-control"
                                                                value={product.Quantity || ""}
                                                                onChange={(e) => handleProductChange(index, "Quantity", e.target.value)}
                                                                min="1"
                                                                required
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
                                                                Delete
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
                                            Cancel
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
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="bi bi-save me-2"></i>
                                                    Save Changes
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
                                                    <th style={{ color: '#065f46' }}>Image</th>
                                                    <th style={{ color: '#065f46' }}>Product Name</th>
                                                    <th style={{ color: '#065f46' }}>Brand</th>
                                                    <th style={{ color: '#065f46' }}>Type</th>
                                                    <th className="text-end" style={{ color: '#065f46' }}>Original Price</th>
                                                    {shouldShowConsignmentPrice() && (
                                                        <th className="text-end" style={{ color: '#065f46' }}>Consignment Price</th>
                                                    )}
                                                    <th className="text-end" style={{ color: '#065f46' }}>Sale Price</th>
                                                    <th className="text-end" style={{ color: '#065f46' }}>Quantity</th>
                                                    <th style={{ color: '#065f46' }}>Status</th>
                                                    <th style={{ color: '#065f46' }}>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {consignmentDetail.Products?.map((product, index) => (
                                                    <tr key={index} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                                        <td>
                                                            {product.Product_Image && (
                                                                <img 
                                                                    src={`../Images/${product.Product_Image}`} 
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
                                                                Edit
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
                                                                Delete
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
                                            Delete Consignment
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
                                        Close
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
                                        Cancel
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
                                        Confirm
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