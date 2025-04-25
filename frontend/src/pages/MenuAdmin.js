import React from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const SidebarMenu = () => {
    const handleLogout = () => {
        sessionStorage.removeItem('hasSeenHero');
        window.location.href = "/login";
    };

    return (
        <div
            className="p-4"
            style={{
                width: "250px",
                height: "100vh",
                position: "fixed",
                top: 0,
                left: 0,
                background: "#121212",
                borderRight: "1px solid #2a2a2a",
                boxShadow: "8px 0 15px rgba(0, 0, 0, 0.2)"
            }}
        >
            <h3 className="text-center mb-5 mt-3 fw-bold" style={{
                color: "#ffffff",
                letterSpacing: "2px",
                textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                fontSize: "1.3rem"
            }}>
                <i className="bi bi-speedometer2 me-2"></i>
                ADMIN DASHBOARD
            </h3>

            <ul className="nav flex-column px-2">
                <li className="nav-item mb-3">
                    <Link
                        to="/admin/consignments"
                        className="nav-link d-flex align-items-center"
                        style={{
                            color: "#ffffff",
                            borderRadius: "6px",
                            padding: "12px 15px",
                            transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
                            background: "rgba(255,255,255,0.05)"
                        }}
                    >
                        <i className="bi bi-box me-3" style={{ fontSize: "1.1rem" }}></i>
                        <span style={{ fontWeight: "500" }}>Consignments</span>
                    </Link>
                </li>

                <li className="nav-item mb-3">
                    <Link
                        to="/admin/orders"
                        className="nav-link d-flex align-items-center"
                        style={{
                            color: "#ffffff",
                            borderRadius: "6px",
                            padding: "12px 15px",
                            transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
                            background: "rgba(255,255,255,0.05)"
                        }}
                    >
                        <i className="bi bi-cart-check me-3" style={{ fontSize: "1.1rem" }}></i>
                        <span style={{ fontWeight: "500" }}>Orders</span>
                    </Link>
                </li>

                <li className="nav-item mb-3">
                    <Link
                        to="/admin/categories"
                        className="nav-link d-flex align-items-center"
                        style={{
                            color: "#ffffff",
                            borderRadius: "6px",
                            padding: "12px 15px",
                            transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
                            background: "rgba(255,255,255,0.05)"
                        }}
                    >
                        <i className="bi bi-tags me-3" style={{ fontSize: "1.1rem" }}></i>
                        <span style={{ fontWeight: "500" }}>Categories</span>
                    </Link>
                </li>

                <li className="nav-item mt-5 pt-3" style={{ borderTop: "1px solid #333" }}>
                    <button
                        onClick={handleLogout}
                        style={{
                            background: "linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%)",
                            color: "#ffffff",
                            border: "none",
                            padding: "12px",
                            borderRadius: "6px",
                            width: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: "500",
                            transition: "all 0.3s ease",
                            boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                            position: "relative",
                            overflow: "hidden"
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.3)";
                            e.currentTarget.style.transform = "translateY(-2px)";
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.boxShadow = "0 2px 5px rgba(0,0,0,0.2)";
                            e.currentTarget.style.transform = "translateY(0)";
                        }}
                    >
                        <i className="bi bi-box-arrow-right me-3"></i>
                        LOGOUT
                        <span style={{
                            position: "absolute",
                            background: "rgba(255,255,255,0.2)",
                            width: "100%",
                            height: "40px",
                            left: "-100%",
                            top: 0,
                            transition: "all 0.4s ease",
                            transform: "skewX(-20deg)"
                        }}></span>
                    </button>
                </li>
            </ul>

            <style>{`
                .nav-link:hover {
                    background: rgba(255,255,255,0.1) !important;
                    transform: translateX(5px);
                    box-shadow: 0 3px 10px rgba(0,0,0,0.2);
                }
                .nav-link.active {
                    background: rgba(255,255,255,0.15) !important;
                    color: #fff !important;
                    font-weight: 600;
                }
                button:hover span {
                    left: 120%;
                }
            `}</style>
        </div>
    );
};

export default SidebarMenu;