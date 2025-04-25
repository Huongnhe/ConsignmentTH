import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { getUserProducts } from "../api/api";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
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
            setError("User not logged in");
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const data = await getUserProducts(token);
            setTickets(data);
        } catch (error) {
            console.error("Error fetching products:", error);
            setError("Failed to load product list");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-light min-vh-100">
            <Navbar />
            <div className="container py-4">
                <div className="text-center mb-5">
                    <h2 className="fw-bold text-primary mb-3" style={{ letterSpacing: '1px' }}>
                        <i className="bi bi-box-seam me-2"></i>
                        My Consignment
                    </h2>
                    <div className="mx-auto" style={{ height: '3px', width: '80px', background: 'linear-gradient(to right, #4e73df, #224abe)' }}></div>
                </div>

                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-3 text-muted fs-5">Processing your consignments...</p>
                    </div>
                ) : error ? (
                    <div className="alert alert-danger alert-dismissible fade show mx-auto text-center" style={{ maxWidth: '600px' }}>
                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                        {error}
                        <button type="button" className="btn-close" onClick={() => setError(null)}></button>
                    </div>
                ) : (
                    tickets.length > 0 ? (
                        <div className="row g-4">
                            {tickets.map((ticket, index) => (
                                <div key={index} className="col-12">
                                    <div className="card border-0 shadow-sm h-100 hover-effect">
                                        <div className="card-header bg-white border-0">
                                            <div className="d-flex justify-content-between align-items-center">
                                                <h5 className="mb-0">
                                                    <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2">
                                                        <i className="bi bi-tag-fill me-2"></i>
                                                        Ticket #{ticket.TicketID.toString().padStart(4, '0')}
                                                    </span>
                                                </h5>
                                                <span
                                                    className={`badge px-3 py-2 ${
                                                        ticket.Status === "Approved" ? "bg-success bg-opacity-10 text-success" :
                                                        ticket.Status === "Rejected" ? "bg-danger bg-opacity-10 text-danger" :
                                                        "bg-warning bg-opacity-10 text-warning"
                                                    }`}
                                                >
                                                    {ticket.Status}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="card-body">
                                            <div className="table-responsive">
                                                <table className="table table-hover align-middle mb-0">
                                                    <thead className="bg-light">
                                                        <tr>
                                                            <th className="text-nowrap text-uppercase small fw-bold">Brand</th>
                                                            <th className="text-nowrap text-uppercase small fw-bold">Category</th>
                                                            <th className="text-nowrap text-uppercase small fw-bold">Product</th>
                                                            <th className="text-nowrap text-uppercase small fw-bold text-end">Quantity</th>
                                                            <th className="text-nowrap text-uppercase small fw-bold text-end">Price</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {ticket.products.map((product, idx) => (
                                                            <tr key={idx}>
                                                                <td className="fw-medium">{product.Brand_name}</td>
                                                                <td>{product.Product_type_name}</td>
                                                                <td>
                                                                    <span className="d-inline-block text-truncate" style={{ maxWidth: '150px' }}>
                                                                        {product.Product_name}
                                                                    </span>
                                                                </td>
                                                                <td className="text-end">{product.Quantity}</td>
                                                                <td className="text-end fw-bold text-success">{product.Sale_price.toLocaleString()} VND</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                        <div className="card-footer bg-white border-0 text-end">
                                            <Link 
                                                to={`/detailConsign/${ticket.TicketID}`} 
                                                className="btn btn-primary btn-sm px-4"
                                            >
                                                <i className="bi bi-eye-fill me-2"></i>
                                                View Details
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-5 bg-white rounded-3 shadow-sm">
                            <div className="bg-primary bg-opacity-10 d-inline-block p-4 rounded-circle mb-3">
                                <i className="bi bi-box-seam text-primary" style={{ fontSize: '2.5rem' }}></i>
                            </div>
                            <h4 className="text-dark mb-3">No Consignment Found</h4>
                            <p className="text-muted mb-4">You haven't submitted any consignment yet</p>
                            <Link to="/createConsign" className="btn btn-primary px-4 py-2">
                                <i className="bi bi-plus-circle me-2"></i>
                                Start New Consignment
                            </Link>
                        </div>
                    )
                )}
            </div>

            <style>{`
                .hover-effect {
                    transition: all 0.3s ease;
                    border-radius: 10px;
                }
                .hover-effect:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.1) !important;
                }
                .table-hover tbody tr:hover {
                    background-color: rgba(78, 115, 223, 0.05) !important;
                }
                .card {
                    border-radius: 10px !important;
                    overflow: hidden;
                }
            `}</style>
        </div>
    );
};

export default ConsignmentPage;