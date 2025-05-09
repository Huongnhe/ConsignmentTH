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
import HomePagePublic from "./pages/HomePagePublic";
import OrderPage from "./pages/OrderStatusPage";
import InvoiceDetailPage from './pages/InvoiceDetailPage';
import Footer from "./pages/Footer";

import { AuthProvider, AuthContext } from "./context/AuthContext";
import { ConsignProvider } from "./context/AuthConsign";
import { AuthDetailProvider } from "./context/AuthDetail";
import { AdminConsignmentProvider } from "./context/AuthAdminConsign";
import { ProductSearchProvider } from "./context/AuthOrder";

const PrivateRoute = ({ element, requiredRole }) => {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.Account !== requiredRole) {
    return <Navigate to={user.Account === "Manager" ? "/admin" : "/home"} replace />;
  }

  return element;
};

const AppContent = () => {
  const [initialLoading, setInitialLoading] = useState(true);
  const location = useLocation();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  if (initialLoading) {
    return <div className="app-loading">Loading...</div>;
  }

  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <>
      <Routes>
        <Route path="/" element={<HomePagePublic />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* User Routes */}
        <Route path="/home" element={<PrivateRoute element={<HomePageUser />} />} />
        <Route path="/consigns" element={<PrivateRoute element={<ConsignPage />} />} />
        <Route path="/CreateConsign" element={<PrivateRoute element={<CreateConsign />} />} />
        <Route path="/detailConsign/:id" element={<PrivateRoute element={<ConsignDetailPage />} />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<PrivateRoute element={<HomePageAdmin />} requiredRole="Manager" />} />
        <Route
          path="/admin/orders"
          element={
            <PrivateRoute 
              element={
                <ProductSearchProvider>
                  <OrderPage />
                </ProductSearchProvider>
              } 
              requiredRole="Manager" 
            />
          }
        />
        <Route path="/admin/orders/:orderId" element={<InvoiceDetailPage />} />
        <Route 
          path="/admin/consignments" 
          element={
            <PrivateRoute 
              element={<AdminConsign />} 
              requiredRole="Manager" 
            />
          } 
        />
      </Routes>

      {!isAdminRoute && <Footer />}
    </>
  );
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <ConsignProvider>
          <AuthDetailProvider>
            <AdminConsignmentProvider>
              <AppContent />
            </AdminConsignmentProvider>
          </AuthDetailProvider>
        </ConsignProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;