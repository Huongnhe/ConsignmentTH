import React, { useContext, useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import HomePageUser from "./pages/HomePageUser";
import RegisterPage from "./pages/RegisterPage";
import HomePageAdmin from "./pages/HomePageAdmin";
import ConsignPage from "./pages/ConsignPage";
import OrderStatusPage from "./pages/OrderStatusPage";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import { ConsignProvider } from "./context/AuthConsign";
import CreateConsign from "./pages/CreateConsign";
import ConsignDetailPage from "./pages/ConsignDetailPage";  // Thêm trang chi tiết đơn ký gửi
import { AuthDetailProvider } from "./context/AuthDetail"; // Import AuthDetailProvider

// PrivateRoute kiểm tra quyền truy cập
const PrivateRoute = ({ element, account }) => {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (account && user.Account !== account) {
    return <Navigate to="/home" />;
  }

  return element;
};

const App = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, []);

  return (
    <AuthProvider>
      <AuthDetailProvider>  {/* Bao quanh tất cả các routes với AuthDetailProvider */}
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin" element={<PrivateRoute element={<HomePageAdmin />} account="Manager" />} />
            <Route path="/home" element={<HomePageUser />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/CreateConsign" element={<CreateConsign />} />
            <Route
              path="/consigns"
              element={
                loading ? (
                  <div>Loading...</div>
                ) : (
                  <ConsignProvider>
                    <ConsignPage />
                  </ConsignProvider>
                )
              }
            />
            {/* Thêm route cho chi tiết đơn ký gửi */}
            <Route path="/detailConsign/:id" element={<ConsignDetailPage />} />
          </Routes>
        </Router>
      </AuthDetailProvider>
    </AuthProvider>
  );
};

export default App;
