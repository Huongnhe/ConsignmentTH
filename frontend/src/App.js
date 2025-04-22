import React, { useState, useEffect, useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import HomePageUser from "./pages/HomePageUser";
import RegisterPage from "./pages/RegisterPage";
import HomePageAdmin from "./pages/HomePageAdmin";
import ConsignPage from "./pages/ConsignPage";
import CreateConsign from "./pages/CreateConsign";
import ConsignDetailPage from "./pages/ConsignDetailPage"; 
import AdminConsign from "./pages/AdminConsign"; 
import { AuthProvider, AuthContext } from "./context/AuthContext";
import { ConsignProvider } from "./context/AuthConsign";
import { AuthDetailProvider } from "./context/AuthDetail";
import { AdminConsignmentProvider } from "./context/AuthAdminConsign";

// PrivateRoute kiểm tra quyền truy cập
const PrivateRoute = ({ element, account }) => {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <Navigate to="/login" />; // Nếu không có user, điều hướng tới login
  }

  if (account && user.Account !== account) {
    return <Navigate to="/home" />; // Kiểm tra nếu tài khoản không khớp với yêu cầu, điều hướng tới trang home
  }

  return element; // Nếu điều kiện đúng, hiển thị element
};

const App = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Giả lập thời gian tải dữ liệu, có thể thay thế bằng API call
    setTimeout(() => {
      setLoading(false);
    }, 500); // Tạm dừng 500ms để giả lập việc tải dữ liệu
  }, []);

  return (
    <AuthProvider>
      <AuthDetailProvider>  {/* Bao quanh tất cả các routes với AuthDetailProvider */}
        <AdminConsignmentProvider> {/* Bao quanh các route liên quan đến AdminConsignmentProvider */}
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
                    <div>Loading...</div> // Hiển thị Loading khi hệ thống đang tải
                  ) : (
                    <ConsignProvider>
                      <ConsignPage />
                    </ConsignProvider>
                  )
                }
              />
              <Route path="/detailConsign/:id" element={<ConsignDetailPage />} />
              <Route path="/admin/consignments" element={<PrivateRoute element={<AdminConsign />} account="Manager" />} />
            </Routes>
          </Router>
        </AdminConsignmentProvider>
      </AuthDetailProvider>
    </AuthProvider>
  );
};

export default App;
