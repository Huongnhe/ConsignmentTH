import React, { useContext } from "react";
// import React,  from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import HomePageUser from "./pages/HomePageUser";
import RegisterPage from "./pages/RegisterPage";
import { AuthProvider, AuthContext } from "./context/AuthContext"; // Import AuthProvider
import HomePageAdmin from "./pages/HomePageAdmin";
// import { AuthProvider, AuthContext } from "./context/AuthContext";

const PrivateRoute = ({ element, account  }) => {
  const { user } = useContext(AuthContext);
  console.log("User:", user); // Kiểm tra giá trị user
  console.log("User account:", user?.Account ); // Kiểm tra account
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
          <Route
            path="/"
            element={
              <AuthContext.Consumer>
                {({ user }) => {
                  if (!user) return <Navigate to="/login" replace />;
                  return user.Account === "Manager" ? <Navigate to="/admin" replace /> : <Navigate to="/home" replace />;

                }}
              </AuthContext.Consumer>
            }
          />

          <Route path="/login" element={<LoginPage />} />

          <Route path="/admin" element={<PrivateRoute element={<HomePageAdmin />} account="Manager" />} />
          <Route path="/home" element={<HomePageUser />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
