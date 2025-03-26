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
        if (message.includes("thành công")) {
            setTimeout(() => {
                navigate("/login");
            }, 1500);
        }
    }, [message, navigate]);

    return (
        <div className="container d-flex justify-content-center align-items-center vh-100">
            <div className="card p-4 shadow-lg" style={{ width: "400px" }}>
                <h2 className="text-center mb-3">Đăng ký</h2>
                {message && (
                    <div
                        className={`alert ${
                            message.includes("thành công") ? "alert-success" : "alert-danger"
                        }`}
                    >
                        {message}
                    </div>
                )}
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Tên đăng nhập</label>
                        <input
                            type="text"
                            name="username"
                            className="form-control"
                            placeholder="Nhập tên đăng nhập"
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            name="email"
                            className="form-control"
                            placeholder="Nhập email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Mật khẩu</label>
                        <input
                            type="password"
                            name="password"
                            className="form-control"
                            placeholder="Nhập mật khẩu"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                  
                    <button type="submit" className="btn btn-primary w-100">
                        Đăng ký
                    </button>
                </form>
            </div>
        </div>
    );
};

export default RegisterPage;
