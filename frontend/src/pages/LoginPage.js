import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../api/api";
import "bootstrap/dist/css/bootstrap.min.css";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate(); 

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Vui lòng nhập email và mật khẩu.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Email không hợp lệ.");
      return;
    }

    try {
      const data = await loginUser(email, password);
      console.log("Đăng nhập thành công:", data);
      localStorage.setItem("token", data.token);
      setError("");

      navigate("/home");
    } catch (error) {
      setError("Đăng nhập thất bại. Kiểm tra lại email/mật khẩu.");
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card p-4 shadow" style={{ width: "400px" }}>
        <h2 className="text-center text-primary">Đăng nhập</h2>
        <form onSubmit={handleLogin} className="mt-3">
          <div className="mb-3">
            <input
              type="email"
              id = "email"
              className="form-control"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <input
              type="password"
              id = "password"
              className="form-control"
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" id = "loginButton" className="btn btn-primary w-100">
            Đăng nhập
          </button>
        </form>
        {error && <p className="text-danger text-center mt-2">{error}</p>}

        {/* Nút chuyển sang trang đăng ký */}
        <button
          className="btn btn-link text-center w-100 mt-2"
          onClick={() => navigate("/register")}
        >
          Chưa có tài khoản? Đăng ký ngay
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
