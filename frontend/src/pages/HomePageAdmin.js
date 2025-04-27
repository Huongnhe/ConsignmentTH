import React, { useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom"; 
import SidebarMenu from "../pages/MenuAdmin";

const HomePageAdmin = () => {
    const { user } = useContext(AuthContext);

    useEffect(() => {
        if (!user || user.Account !== "Manager") {
            window.location.href = "/home";
        }
    }, [user]);

    return (
        <div className="d-flex min-vh-100 bg-light">
            {/* Sidebar */}
            <SidebarMenu />

            {/* Main Content */}
            <div
                className="container-fluid py-5"
                style={{
                    marginLeft: "250px",
                    flex: 1,
                    padding: "40px",
                }}
            >
                <div className="row mb-5">
                    <div className="col-12">
                        <h2 className="text-dark mb-3">Admin Dashboard</h2>
                        <p className="text-muted">Manage your store operations</p>
                    </div>
                </div>

                <div className="row">
                    {/* Consignment Management */}
                    <div className="col-lg-4 col-md-6 mb-4">
                        <div className="card border-0 shadow-sm h-100 transition-all hover-shadow">
                            <div className="card-body p-4 d-flex flex-column">
                                <div className="mb-4">
                                    <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex p-3 mb-3">
                                        <i className="bi bi-box-seam text-primary fs-4"></i>
                                    </div>
                                    <h5 className="text-dark">Consignment Management</h5>
                                    <p className="text-muted mb-0">
                                        Review and approve consignment requests from sellers
                                    </p>
                                </div>
                                <Link 
                                    to="/admin/consignments" 
                                    className="btn btn-outline-primary mt-auto align-self-start"
                                >
                                    View Details
                                    <i className="bi bi-arrow-right ms-2"></i>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Order Management */}
                    <div className="col-lg-4 col-md-6 mb-4">
                        <div className="card border-0 shadow-sm h-100 transition-all hover-shadow">
                            <div className="card-body p-4 d-flex flex-column">
                                <div className="mb-4">
                                    <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex p-3 mb-3">
                                        <i className="bi bi-cart-check text-success fs-4"></i>
                                    </div>
                                    <h5 className="text-dark">Order Management</h5>
                                    <p className="text-muted mb-0">
                                        Process and track customer orders and shipments
                                    </p>
                                </div>
                                <Link 
                                    to="/admin/orders" 
                                    className="btn btn-outline-success mt-auto align-self-start"
                                >
                                    View Details
                                    <i className="bi bi-arrow-right ms-2"></i>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Category Management */}
                    <div className="col-lg-4 col-md-6 mb-4">
                        <div className="card border-0 shadow-sm h-100 transition-all hover-shadow">
                            <div className="card-body p-4 d-flex flex-column">
                                <div className="mb-4">
                                    <div className="bg-info bg-opacity-10 rounded-circle d-inline-flex p-3 mb-3">
                                        <i className="bi bi-tags text-info fs-4"></i>
                                    </div>
                                    <h5 className="text-dark">Category Management</h5>
                                    <p className="text-muted mb-0">
                                        Manage product brands, categories and specifications
                                    </p>
                                </div>
                                <Link 
                                    to="/admin/categories" 
                                    className="btn btn-outline-info mt-auto align-self-start"
                                >
                                    View Details
                                    <i className="bi bi-arrow-right ms-2"></i>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .transition-all {
                    transition: all 0.3s ease;
                }
                .hover-shadow:hover {
                    box-shadow: 0 0.5rem 1.5rem rgba(0, 0, 0, 0.1) !important;
                    transform: translateY(-2px);
                }
                .card {
                    border-radius: 12px;
                }
            `}</style>
        </div>
    );
};

export default HomePageAdmin;