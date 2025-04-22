import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthProvider, AuthContext } from "../context/AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // const [account, setAccount] = useState("");
  const [error, setError] = useState("");
  const { login } = useContext(AuthContext);
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
        const data = await login(email, password);
        console.log("Phản hồi từ APIsssssss:", data); // Kiểm tra phản hồi API
        // localStorage.setItem("token", data.token);
        // localStorage.setItem("user", JSON.stringify(data.user)); 
        
        setError("");
        
        if (data && data.Account === "Manager") {
            // alert("Navigating to /admin...");
            navigate("/admin"); 
        } else if(data && data.Account === "Staff"){
            // alert("Navigating to /home...");
            navigate("/");
        }
        else if(data && data.Account === "Customer"){
          // alert("Navigating to /home...");
          navigate("/home");
      }
    } catch (error) {
      // const data = await login(email, password,account);
      // console.log("Dữ liệu gửi đi2:", { email, password,data }); // Kiểm tra dữ liệu gửi đi
      // console.log("Phản hồi từ APIsssssssaaaa:", data.user); // Kiểm tra phản hồi API
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
              autoComplete="current-password"
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
