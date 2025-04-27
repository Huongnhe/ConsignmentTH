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
    const navigate = useNavigate();
    const { deleteProductInConsignment } = useContext(ConsignContext);

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

    const handleUpdate = async (ProductId) => {
        showModal(
            "Confirm Update", 
            "Are you sure you want to update this information?",
            true,
            async () => {
                try {
                    const updatedData = await updateConsignment(consignmentDetail.Consignment_ID, ProductId);
                    if (updatedData) {
                        showModal("Success", "Update successful!");
                        setIsEditMode(false);
                        await fetchConsignmentDetail(id);
                    }
                } catch (err) {
                    showModal("Error", err.message || "Update failed.");
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
            ? "This is the last product. Deleting it will remove the entire consignment. Are you sure?"
            : "Are you sure you want to remove this product from the consignment?";

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
                            showModal("Success", "Consignment deleted as it contained no more products!");
                            navigate("/consigns");
                        } else {
                            showModal("Success", "Product removed successfully!");
                            await fetchConsignmentDetail(id);
                        }
                    } else {
                        showModal("Error", result.message || "Failed to remove product");
                    }
                } catch (err) {
                    showModal("Error", err.message || "Error removing product");
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
    if (!consignmentDetail) return <div className="text-center">No consignment details found</div>;

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
                                    <p><strong>Date Created:</strong> {new Date(consignmentDetail.Consignment_Create_Date).toLocaleDateString()}</p>
                                </div>
                                <div className="col-md-6">
                                    <p><strong>Customer Name:</strong> {consignmentDetail.Customer_Name}</p>
                                    <p><strong>Customer Email:</strong> {consignmentDetail.Customer_Email}</p>
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
                            <h4 className="mb-0 text-white">Products in Consignment</h4>
                        </div>
                        <div className="card-body p-4" style={{ backgroundColor: '#f9fafb' }}>
                            {isEditMode ? (
                                <div>
                                    <div className="table-responsive">
                                        <table className="table table-hover align-middle">
                                            <thead style={{ backgroundColor: '#ecfdf5' }}>
                                                <tr>
                                                    <th style={{ color: '#065f46' }}>Product Name</th>
                                                    <th style={{ color: '#065f46' }}>Brand</th>
                                                    <th style={{ color: '#065f46' }}>Type</th>
                                                    <th style={{ color: '#065f46' }}>Original Price</th>
                                                    <th style={{ color: '#065f46' }}>Consignment Price</th>
                                                    <th style={{ color: '#065f46' }}>Sale Price</th>
                                                    <th style={{ color: '#065f46' }}>Quantity</th>
                                                    <th style={{ color: '#065f46' }}>Status</th>
                                                    <th style={{ color: '#065f46' }}>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {updatedConsignmentDetail.Products?.map((product, index) => (
                                                    <tr key={index} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                                        <td>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                value={product.Product_Name || ""}
                                                                onChange={(e) => handleProductChange(index, "Product_Name", e.target.value)}
                                                                style={{ borderColor: '#d1d5db', backgroundColor: '#f3f4f6' }}
                                                            />
                                                        </td>
                                                        <td>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                value={product.Brand_Name || ""}
                                                                onChange={(e) => handleProductChange(index, "Brand_Name", e.target.value)}
                                                                style={{ borderColor: '#d1d5db', backgroundColor: '#f3f4f6' }}
                                                            />
                                                        </td>
                                                        <td>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                value={product.Product_Type_Name || ""}
                                                                onChange={(e) => handleProductChange(index, "Product_Type_Name", e.target.value)}
                                                                style={{ borderColor: '#d1d5db', backgroundColor: '#f3f4f6' }}
                                                            />
                                                        </td>
                                                        <td>
                                                            <input
                                                                type="number"
                                                                className="form-control"
                                                                value={product.Original_Price || ""}
                                                                onChange={(e) => handleProductChange(index, "Original_Price", e.target.value)}
                                                                style={{ borderColor: '#d1d5db', backgroundColor: '#f3f4f6' }}
                                                            />
                                                        </td>
                                                        <td>
                                                            <input
                                                                type="number"
                                                                className="form-control"
                                                                value={product.Consignment_Price || ""}
                                                                onChange={(e) => handleProductChange(index, "Consignment_Price", e.target.value)}
                                                                style={{ borderColor: '#d1d5db', backgroundColor: '#f3f4f6' }}
                                                            />
                                                        </td>
                                                        <td>
                                                            <input
                                                                type="number"
                                                                className="form-control"
                                                                value={product.Sale_Price || ""}
                                                                onChange={(e) => handleProductChange(index, "Sale_Price", e.target.value)}
                                                                style={{ borderColor: '#d1d5db', backgroundColor: '#f3f4f6' }}
                                                            />
                                                        </td>
                                                        <td>
                                                            <input
                                                                type="number"
                                                                className="form-control"
                                                                value={product.Quantity || ""}
                                                                onChange={(e) => handleProductChange(index, "Quantity", e.target.value)}
                                                                style={{ borderColor: '#d1d5db', backgroundColor: '#f3f4f6' }}
                                                            />
                                                        </td>
                                                        <td>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                value={product.Product_Status || ""}
                                                                onChange={(e) => handleProductChange(index, "Product_Status", e.target.value)}
                                                                style={{ borderColor: '#d1d5db', backgroundColor: '#f3f4f6' }}
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
                                                                Remove
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
                                            onClick={handleUpdate}
                                            className="btn px-4 py-2"
                                            style={{
                                                backgroundColor: '#d4a762',
                                                borderColor: '#b88c4a',
                                                color: '#ffffff'
                                            }}
                                        >
                                            <i className="bi bi-save me-2"></i>
                                            Save Changes
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <div className="table-responsive">
                                        <table className="table table-hover align-middle">
                                            <thead style={{ backgroundColor: '#ecfdf5' }}>
                                                <tr>
                                                    <th style={{ color: '#065f46' }}>Product Name</th>
                                                    <th style={{ color: '#065f46' }}>Brand</th>
                                                    <th style={{ color: '#065f46' }}>Type</th>
                                                    <th className="text-end" style={{ color: '#065f46' }}>Original Price</th>
                                                    <th className="text-end" style={{ color: '#065f46' }}>Consignment Price</th>
                                                    <th className="text-end" style={{ color: '#065f46' }}>Sale Price</th>
                                                    <th className="text-end" style={{ color: '#065f46' }}>Quantity</th>
                                                    <th style={{ color: '#065f46' }}>Status</th>
                                                    <th style={{ color: '#065f46' }}>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {consignmentDetail.Products?.map((product, index) => (
                                                    <tr key={index} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                                        <td className="fw-medium">{product.Product_Name}</td>
                                                        <td>{product.Brand_Name}</td>
                                                        <td>{product.Product_Type_Name}</td>
                                                        <td className="text-end">{product.Original_Price ? `${product.Original_Price.toLocaleString()} VND` : "-"}</td>
                                                        <td className="text-end">{product.Consignment_Price ? `${product.Consignment_Price.toLocaleString()} VND` : "-"}</td>
                                                        <td className="text-end">{product.Sale_Price ? `${product.Sale_Price.toLocaleString()} VND` : "-"}</td>
                                                        <td className="text-end">{product.Quantity}</td>
                                                        <td>{product.Product_Status}</td>
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
                                                                Remove
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
                                        OK
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

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

                <style jsx>{`
                    .bg-amber-50 { background-color: #fffbeb; }
                    .text-amber-900 { color: #78350f; }
                    .btn:hover {
                        opacity: 0.9;
                        transition: opacity 0.2s ease;
                    }
                    .form-control:focus, .form-select:focus {
                        border-color: #d4a762;
                        box-shadow: 0 0 0 0.25rem rgba(212, 167, 98, 0.25);
                    }
                    .table-hover tbody tr:hover {
                        background-color: #f0fdf4 !important;
                    }
                    .modal-content {
                        border: 2px solid;
                    }
                `}</style>
            </div>
        </ConsignProvider>
    );
};

export default ConsignmentDetailPage;