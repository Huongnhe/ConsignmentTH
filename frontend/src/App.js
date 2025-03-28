import React, { useContext } from "react";
// import React,  from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import HomePageUser from "./pages/HomePageUser";
import RegisterPage from "./pages/RegisterPage";
import HomePageAdmin from "./pages/HomePageAdmin";
import ConsignPage from "./pages/ConsignPage";
import OrderStatusPage from "./pages/OrderStatusPage";
import { AuthProvider, AuthContext } from "./context/AuthContext"; // Import AuthProvider


const PrivateRoute = ({ element, account  }) => {
  const { user } = useContext(AuthContext);
  if (!user) {
    return <Navigate to="/login" />;
  }

  if (account && user.Account  !== account) {
    return <Navigate to="/home" />;
  }

  return element;
};

const App = () => {
  return (
    <AuthProvider> {/* Bọc toàn bộ ứng dụng */}
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin" element={<PrivateRoute element={<HomePageAdmin />} account="Manager" />} />
          <Route path="/home" element={<HomePageUser />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/consign" element={<ConsignPage />} />
          <Route path="/status" element={<OrderStatusPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
