import React, { useState, useEffect, useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import HomePageUser from "./pages/HomePageUser";
import RegisterPage from "./pages/RegisterPage";
import HomePageAdmin from "./pages/HomePageAdmin";
import ConsignPage from "./pages/ConsignPage";
import CreateConsign from "./pages/CreateConsign";
import ConsignDetailPage from "./pages/ConsignDetailPage";
import AdminConsign from "./pages/AdminConsign";
import Footer from "./pages/Footer";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import { ConsignProvider } from "./context/AuthConsign";
import { AuthDetailProvider } from "./context/AuthDetail";
import { AdminConsignmentProvider } from "./context/AuthAdminConsign";

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

const AppContent = () => {
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, []);

  const isAdminRoute = location.pathname.startsWith("/admin") && user?.Account === "Manager";

  return (
    <>
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
        <Route path="/detailConsign/:id" element={<ConsignDetailPage />} />
        <Route path="/admin/consignments" element={<PrivateRoute element={<AdminConsign />} account="Manager" />} />
      </Routes>

      {/* Chỉ hiển thị Footer nếu không phải trang admin */}
      {!isAdminRoute && <Footer />}
    </>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AuthDetailProvider>
        <AdminConsignmentProvider>
          <Router>
            <AppContent />
          </Router>
        </AdminConsignmentProvider>
      </AuthDetailProvider>
    </AuthProvider>
  );
};

export default App;
