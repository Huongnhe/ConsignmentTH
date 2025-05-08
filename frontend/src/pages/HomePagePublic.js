import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import NavbarUser from "../pages/MenuUser"; 

const HomePagePublic = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (user.Account === "Manager") {
        navigate("/admin");
      } else {
        navigate("/home");
      }
    }
  }, [user, navigate]);

  return (
    <>
      <NavbarUser />
      <div className="container text-center mt-5">
        <h1 className="mb-4">Chào mừng bạn đến với hệ thống ký gửi</h1>
        <p className="lead mb-4">Bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.</p>
        <button
          onClick={() => navigate("/login")}
          className="btn btn-primary btn-lg"
        >
          Hãy đăng nhập
        </button>
      </div>
    </>
  );
};

export default HomePagePublic;
