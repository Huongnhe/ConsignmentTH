import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const RegisterPage = () => {
    const { register, message } = useContext(AuthContext);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await register(formData);

        if (result && result.success) {
            setTimeout(() => {
                navigate("/login");
            }, 1500);
        }
    };

    useEffect(() => {
        if (message.includes("success")) {
            setTimeout(() => {
                navigate("/login");
            }, 1500);
        }
    }, [message, navigate]);

    return (
        <div 
            className="min-vh-100 d-flex align-items-center justify-content-center"
            style={{
                backgroundImage: "url('https://danviet.ex-cdn.com/files/f1/296231569849192448/2023/1/15/z403556587967736b20440c47ed11d16316bc354242f70-1673776858625-16737768587602017391246.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                position: "relative"
            }}
        >
            {/* Blur overlay giống trang đăng nhập */}
            <div
                className="position-absolute top-0 start-0 w-100 h-100"
                style={{
                    backgroundColor: "rgba(0, 0, 0, 0.4)",
                    backdropFilter: "blur(5px)"
                }}
            ></div>

            {/* Register card - giống với login về kích thước và style */}
            <div
                className="card p-4 border-0 shadow-lg position-relative"
                style={{
                    width: "100%",
                    maxWidth: "450px",
                    borderRadius: "15px",
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    overflow: "hidden"
                }}
            >
                {/* Luxury brand header giống trang đăng nhập */}
                <div className="text-center mb-4">
                    <h2 className="text-dark mb-1" style={{ fontFamily: "'Playfair Display', serif", fontWeight: "700" }}>
                        TH WORLD
                    </h2>
                    <p className="text-muted small" style={{ letterSpacing: "2px" }}>LUXURY COLLECTIONS</p>
                </div>

                {message && (
                    <div className={`alert ${message.includes("success") ? "alert-success" : "alert-danger"} text-center mb-3 py-2`}>
                        {message}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="username" className="form-label small text-uppercase text-muted">
                            Username
                        </label>
                        <input
                            type="text"
                            name="username"
                            id="username"
                            className="form-control border-0 border-bottom rounded-0 py-3 px-0"
                            placeholder="Enter your username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            style={{
                                backgroundColor: "rgba(255, 240, 220, 0.3)",
                                borderBottom: "1px solid #ddd !important"
                            }}
                        />
                    </div>

                    <div className="mb-3">
                        <label htmlFor="email" className="form-label small text-uppercase text-muted">
                            Email Address
                        </label>
                        <input
                            type="email"
                            name="email"
                            id="email"
                            className="form-control border-0 border-bottom rounded-0 py-3 px-0"
                            placeholder="your@email.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            style={{
                                backgroundColor: "rgba(255, 240, 220, 0.3)",
                                borderBottom: "1px solid #ddd !important"
                            }}
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="password" className="form-label small text-uppercase text-muted">
                            Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            id="password"
                            className="form-control border-0 border-bottom rounded-0 py-3 px-0"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            style={{
                                backgroundColor: "rgba(255, 240, 220, 0.3)",
                                borderBottom: "1px solid #ddd !important"
                            }}
                        />
                    </div>
                    
                    {/* Submit Button - giống style với nút đăng nhập */}
                    <button
                        type="submit"
                        className="btn btn-dark w-100 py-3 mb-3"
                        style={{
                            letterSpacing: "1px",
                            fontWeight: "500",
                            transition: "all 0.3s ease"
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = "#333"}
                        onMouseOut={(e) => e.target.style.backgroundColor = "#000"}
                    >
                        REGISTER NOW
                    </button>
                </form>

                {/* Divider giống trang đăng nhập */}
                <div className="position-relative my-4">
                    <hr className="my-0" />
                    <span
                        className="position-absolute top-50 start-50 translate-middle bg-white px-2 small text-muted"
                        style={{ width: "fit-content" }}
                    >
                        OR
                    </span>
                </div>

                {/* Back to Login Button - giống style với nút "CREATE AN ACCOUNT" */}
                <button
                    className="btn btn-outline-dark w-100 py-2"
                    onClick={() => navigate("/login")}
                    style={{
                        letterSpacing: "1px",
                        transition: "all 0.3s ease"
                    }}
                    onMouseOver={(e) => {
                        e.target.style.backgroundColor = "#f8f9fa";
                    }}
                    onMouseOut={(e) => {
                        e.target.style.backgroundColor = "transparent";
                    }}
                >
                    ALREADY HAVE AN ACCOUNT? SIGN IN
                </button>
            </div>
        </div>
    );
};

export default RegisterPage;